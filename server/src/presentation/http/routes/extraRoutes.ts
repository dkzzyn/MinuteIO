import type { Request, Response, NextFunction } from "express";
import type { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../../infrastructure/database/prisma/client";
import { authMiddleware } from "../middlewares/authMiddleware";
import { JwtTokenService } from "../../../infrastructure/security/JwtTokenService";
import { BcryptPasswordHasher } from "../../../infrastructure/security/BcryptPasswordHasher";
import {
  issueRefreshToken,
  revokeRefreshToken,
  validateRefreshToken,
  hashToken,
  randomToken,
} from "../utils/authTokens";
import { runSalesSimulatorTurn } from "../../../../ollama/ollamaService";
import type { AgentPromptProfile, SalesSimulatorInput } from "../../../../ollama/types";

const tokenService = new JwtTokenService();
const passwordHasher = new BcryptPasswordHasher();

function slugifyAgentName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

function canManagePrompts(role: string): boolean {
  const n = role.toLowerCase();
  return n === "admin" || n === "supervisor";
}

async function getAgentPromptProfile(userId: string, agentId?: string): Promise<AgentPromptProfile | undefined> {
  if (!agentId?.trim()) return undefined;
  const agent = await prisma.agent.findFirst({
    where: { id: agentId.trim(), userId },
    include: { config: true },
  });
  if (!agent) return undefined;
  return {
    agentName: agent.name,
    sentimentTone: (agent.config?.sentimentTone as AgentPromptProfile["sentimentTone"]) ?? "neutro",
    salesAggressiveness: (agent.config?.salesAggressiveness as AgentPromptProfile["salesAggressiveness"]) ?? "moderado",
    objectionTips: (agent.config?.objectionTips as AgentPromptProfile["objectionTips"]) ?? {},
    promptConfig:
      (agent.config?.extraConfig as AgentPromptProfile["promptConfig"]) ??
      ({
        transcription: {
          enabled: true,
          language: "pt-BR",
          meetingType: "cliente",
          detailLevel: "topicos",
        },
        sentiment: {
          enabled: true,
          mode: "simple",
          showOverall: true,
          showPerParticipant: false,
          showIntensity: true,
        },
      } as AgentPromptProfile["promptConfig"]),
  };
}

async function ensureBilling(userId: string) {
  let b = await prisma.userBilling.findUnique({ where: { userId } });
  if (!b) {
    const cycleEnd = new Date();
    cycleEnd.setMonth(cycleEnd.getMonth() + 1);
    b = await prisma.userBilling.create({
      data: {
        userId,
        cycleEnd,
        planName: "MinuteIO Pro",
        tokensTotalPerCycle: 20000,
        tokensUsed: 0,
        usageEntries: [],
        overagePricePer1000: 50,
      },
    });
  }
  return b;
}

function clientRowToApi(row: { id: string; data: unknown }) {
  const d =
    typeof row.data === "object" && row.data !== null && !Array.isArray(row.data)
      ? { ...(row.data as Record<string, unknown>) }
      : {};
  d.id = row.id;
  return d;
}

async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const uid = req.userId;
    if (!uid) {
      res.status(401).json({ error: "Não autenticado." });
      return;
    }
    const u = await prisma.user.findUnique({ where: { id: uid } });
    if (!u || u.role.toLowerCase() !== "admin") {
      res.status(403).json({ error: "Apenas administradores." });
      return;
    }
    next();
  } catch (e) {
    next(e instanceof Error ? e : new Error(String(e)));
  }
}

/** Registra rotas estendidas no router /api. */
export function registerExtraRoutes(router: Router): void {
  router.post("/auth/refresh", async (req, res) => {
    try {
      const { refreshToken } = req.body as { refreshToken?: string };
      if (!refreshToken?.trim()) return res.status(400).json({ error: "refreshToken é obrigatório." });
      const v = await validateRefreshToken(refreshToken.trim());
      if (!v) return res.status(401).json({ error: "Refresh inválido ou expirado." });
      const user = await prisma.user.findUnique({ where: { id: v.userId } });
      if (!user || !user.isActive) return res.status(401).json({ error: "Usuário inválido." });
      const token = tokenService.sign({ sub: user.id, email: user.email });
      return res.json({ token, refreshToken: refreshToken.trim() });
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro ao renovar sessão." });
    }
  });

  router.post("/auth/logout", async (req, res) => {
    try {
      const { refreshToken } = req.body as { refreshToken?: string };
      if (refreshToken?.trim()) await revokeRefreshToken(refreshToken.trim());
      res.status(204).send();
    } catch {
      res.status(204).send();
    }
  });

  router.post("/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body as { email?: string };
      const em = email?.trim().toLowerCase();
      if (em) {
        const user = await prisma.user.findUnique({ where: { email: em } });
        if (user) {
          const raw = randomToken();
          const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
          await prisma.passwordResetToken.create({
            data: { userId: user.id, tokenHash: hashToken(raw), expiresAt },
          });
          const base = process.env.FRONTEND_URL ?? "http://localhost:5173";
          console.info(`[MinuteIO] Password reset link: ${base}/reset-password?token=${raw}`);
        }
      }
      return res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.post("/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body as { token?: string; newPassword?: string };
      if (!token?.trim() || !newPassword?.trim() || newPassword.length < 6) {
        return res.status(400).json({ error: "token e newPassword (mín. 6) são obrigatórios." });
      }
      const row = await prisma.passwordResetToken.findFirst({
        where: { tokenHash: hashToken(token.trim()), usedAt: null, expiresAt: { gt: new Date() } },
      });
      if (!row) return res.status(400).json({ error: "Token inválido ou expirado." });
      const passwordHash = await passwordHasher.hash(newPassword.trim());
      await prisma.$transaction([
        prisma.user.update({ where: { id: row.userId }, data: { passwordHash } }),
        prisma.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
        prisma.refreshToken.deleteMany({ where: { userId: row.userId } }),
      ]);
      return res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.patch("/me", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const body = req.body as { name?: string; avatarUrl?: string | null; preferences?: Record<string, unknown> };
      const data: Prisma.UserUpdateInput = {};
      if (typeof body.name === "string") {
        const t = body.name.trim();
        if (!t) return res.status(400).json({ error: "name não pode ser vazio." });
        data.name = t;
      }
      if (body.avatarUrl !== undefined) {
        data.avatarUrl = typeof body.avatarUrl === "string" ? body.avatarUrl.trim() || null : null;
      }
      if (body.preferences !== undefined && typeof body.preferences === "object" && body.preferences !== null) {
        const cur = await prisma.user.findUnique({ where: { id: userId }, select: { preferences: true } });
        const prev =
          cur?.preferences && typeof cur.preferences === "object" && !Array.isArray(cur.preferences)
            ? (cur.preferences as Record<string, unknown>)
            : {};
        data.preferences = { ...prev, ...body.preferences } as Prisma.InputJsonValue;
      }
      if (Object.keys(data).length === 0) return res.status(400).json({ error: "Nada para atualizar." });
      const updated = await prisma.user.update({
        where: { id: userId },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          isActive: true,
          preferences: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return res.json(updated);
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.get("/me/preferences", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const u = await prisma.user.findUnique({ where: { id: userId }, select: { preferences: true } });
      return res.json({ preferences: u?.preferences ?? {} });
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.put("/me/preferences", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const body = req.body as { preferences?: Record<string, unknown> };
      if (!body.preferences || typeof body.preferences !== "object") {
        return res.status(400).json({ error: "preferences (objeto) é obrigatório." });
      }
      const cur = await prisma.user.findUnique({ where: { id: userId }, select: { preferences: true } });
      const prev =
        cur?.preferences && typeof cur.preferences === "object" && !Array.isArray(cur.preferences)
          ? (cur.preferences as Record<string, unknown>)
          : {};
      const merged = { ...prev, ...body.preferences } as Prisma.InputJsonValue;
      await prisma.user.update({ where: { id: userId }, data: { preferences: merged } });
      return res.json({ preferences: merged });
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.put("/me/password", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
      if (!currentPassword || !newPassword?.trim() || newPassword.length < 6) {
        return res.status(400).json({ error: "currentPassword e newPassword (mín. 6) são obrigatórios." });
      }
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(404).json({ error: "Usuário não encontrado." });
      const ok = await passwordHasher.compare(currentPassword, user.passwordHash);
      if (!ok) return res.status(403).json({ error: "Senha atual incorreta." });
      const passwordHash = await passwordHasher.hash(newPassword.trim());
      await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
      await prisma.refreshToken.deleteMany({ where: { userId } });
      return res.status(204).send();
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.get("/clients", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const rows = await prisma.crmClient.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
      return res.json(rows.map(clientRowToApi));
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.post("/clients", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const body = req.body as Record<string, unknown>;
      if (!body || typeof body !== "object") return res.status(400).json({ error: "Body inválido." });
      const { id: _drop, ...rest } = body;
      const row = await prisma.crmClient.create({
        data: { userId, data: rest as Prisma.InputJsonValue },
      });
      return res.status(201).json(clientRowToApi(row));
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.get("/clients/:id", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const row = await prisma.crmClient.findFirst({ where: { id: req.params.id, userId } });
      if (!row) return res.status(404).json({ error: "Cliente não encontrado." });
      return res.json(clientRowToApi(row));
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.patch("/clients/:id", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const row = await prisma.crmClient.findFirst({ where: { id: req.params.id, userId } });
      if (!row) return res.status(404).json({ error: "Cliente não encontrado." });
      const cur =
        typeof row.data === "object" && row.data !== null && !Array.isArray(row.data)
          ? (row.data as Record<string, unknown>)
          : {};
      const patch = req.body as Record<string, unknown>;
      const next = { ...cur, ...patch, id: row.id };
      const updated = await prisma.crmClient.update({
        where: { id: row.id },
        data: { data: next as Prisma.InputJsonValue },
      });
      return res.json(clientRowToApi(updated));
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.delete("/clients/:id", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const r = await prisma.crmClient.deleteMany({ where: { id: req.params.id, userId } });
      if (r.count === 0) return res.status(404).json({ error: "Cliente não encontrado." });
      return res.status(204).send();
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.get("/clients/:id/meetings", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const client = await prisma.crmClient.findFirst({ where: { id: req.params.id, userId } });
      if (!client) return res.status(404).json({ error: "Cliente não encontrado." });
      const q = (req.query.q as string)?.trim().toLowerCase() ?? "";
      const meetings = await prisma.meeting.findMany({
        where: { userId },
        orderBy: { datetimeStart: "desc" },
        take: 100,
      });
      const filtered = q
        ? meetings.filter(
            (m) =>
              m.title.toLowerCase().includes(q) ||
              m.participants.some((p) => p.toLowerCase().includes(q))
          )
        : meetings;
      return res.json(filtered);
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.patch("/meetings/:id", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const meetingId = req.params.id;
      const existing = await prisma.meeting.findFirst({ where: { id: meetingId, userId } });
      if (!existing) return res.status(404).json({ error: "Reunião não encontrada." });
      const b = req.body as Record<string, unknown>;
      const data: Prisma.MeetingUpdateInput = {};
      const str = (k: string) => (typeof b[k] === "string" ? (b[k] as string) : undefined);
      const num = (k: string) => (typeof b[k] === "number" ? (b[k] as number) : undefined);
      if (str("title")) data.title = str("title")!.trim();
      if (b.description !== undefined) data.description = b.description === null ? null : String(b.description);
      if (str("datetimeStart")) data.datetimeStart = new Date(str("datetimeStart")!);
      if (b.datetimeEnd !== undefined)
        data.datetimeEnd = b.datetimeEnd === null ? null : new Date(String(b.datetimeEnd));
      if (str("status")) data.status = str("status")!.trim();
      if (str("type")) data.type = str("type")!.trim();
      if (num("durationMinutes") != null) data.durationMinutes = num("durationMinutes");
      if (str("language")) data.language = str("language")!.trim();
      if (str("pipelineStage")) data.pipelineStage = str("pipelineStage")!.trim();
      if (str("result")) data.result = str("result")!.trim();
      if (Array.isArray(b.participants)) data.participants = b.participants as string[];
      if (typeof b.winProbability === "number") data.winProbability = b.winProbability;
      if (Array.isArray(b.objectionTypes)) data.objectionTypes = b.objectionTypes as string[];
      if (typeof b.summary === "string") data.summary = b.summary;
      if (b.postId !== undefined) {
        data.post =
          b.postId === null ? { disconnect: true } : { connect: { id: String(b.postId) } };
      }
      if (b.recordingUrl !== undefined) data.recordingUrl = b.recordingUrl === null ? null : String(b.recordingUrl);
      const updated = await prisma.meeting.update({ where: { id: meetingId }, data });
      return res.json(updated);
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.delete("/meetings/:id", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const r = await prisma.meeting.deleteMany({ where: { id: req.params.id, userId } });
      if (r.count === 0) return res.status(404).json({ error: "Reunião não encontrada." });
      return res.status(204).send();
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.post("/meetings/:id/duplicate", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const src = await prisma.meeting.findFirst({ where: { id: req.params.id, userId } });
      if (!src) return res.status(404).json({ error: "Reunião não encontrada." });
      const copy = await prisma.meeting.create({
        data: {
          userId,
          postId: src.postId,
          type: src.type,
          title: `${src.title} (cópia)`,
          description: src.description,
          durationMinutes: src.durationMinutes,
          language: src.language,
          pipelineStage: src.pipelineStage,
          result: "Em andamento",
          participants: [...src.participants],
          winProbability: src.winProbability,
          objectionTypes: [...src.objectionTypes],
          summary: "",
          datetimeStart: new Date(),
          datetimeEnd: null,
          status: "scheduled",
          recordingUrl: null,
        },
      });
      return res.status(201).json(copy);
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.get("/teams/:id", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const team = await prisma.team.findFirst({ where: { id: req.params.id, ownerId: userId } });
      if (!team) return res.status(404).json({ error: "Time não encontrado." });
      return res.json(team);
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.patch("/teams/:id", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const team = await prisma.team.findFirst({ where: { id: req.params.id, ownerId: userId } });
      if (!team) return res.status(404).json({ error: "Time não encontrado." });
      const name = (req.body as { name?: string }).name?.trim();
      if (!name) return res.status(400).json({ error: "name é obrigatório." });
      const updated = await prisma.team.update({ where: { id: team.id }, data: { name } });
      return res.json(updated);
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.delete("/teams/:id", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const team = await prisma.team.findFirst({ where: { id: req.params.id, ownerId: userId } });
      if (!team) return res.status(404).json({ error: "Time não encontrado." });
      await prisma.teamInvitation.deleteMany({ where: { teamId: team.id } });
      await prisma.team.delete({ where: { id: team.id } });
      return res.status(204).send();
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.get("/teams/:id/invites", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const team = await prisma.team.findFirst({ where: { id: req.params.id, ownerId: userId } });
      if (!team) return res.status(404).json({ error: "Time não encontrado." });
      const invites = await prisma.teamInvitation.findMany({
        where: { teamId: team.id, status: "pending" },
        include: { invitedUser: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      });
      return res.json(invites);
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.delete("/invites/:id", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const inv = await prisma.teamInvitation.findUnique({ where: { id: req.params.id } });
      if (!inv) return res.status(404).json({ error: "Convite não encontrado." });
      if (inv.invitedById !== userId) return res.status(403).json({ error: "Sem permissão." });
      if (inv.status !== "pending") return res.status(400).json({ error: "Convite já processado." });
      await prisma.teamInvitation.delete({ where: { id: inv.id } });
      return res.status(204).send();
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.get("/reports/kpis", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const meetings = await prisma.meeting.findMany({ where: { userId } });
      const n = meetings.length;
      const avgDuration = n ? Math.round(meetings.reduce((a, m) => a + m.durationMinutes, 0) / n) : 0;
      const won = meetings.filter((m) => m.result === "Won").length;
      const winRate = n ? Math.round((won / n) * 100) : 0;
      return res.json({
        totalMeetings: n,
        totalMeetingsDelta: 0,
        avgDurationMinutes: avgDuration,
        avgDurationDelta: 0,
        positiveSentiment: 65,
        winRate,
        winRateDelta: 0,
      });
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.get("/reports/meetings-by-day", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const meetings = await prisma.meeting.findMany({ where: { userId } });
      const byDay = new Map<string, number>();
      meetings.forEach((m) => {
        const key = new Date(m.datetimeStart).toISOString().slice(0, 10);
        byDay.set(key, (byDay.get(key) ?? 0) + 1);
      });
      const points = Array.from(byDay.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({
          date,
          count,
          label: new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
        }));
      return res.json(points);
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.get("/reports/history", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
      const meetings = await prisma.meeting.findMany({
        where: { userId },
        orderBy: { datetimeStart: "desc" },
        take: limit,
      });
      const items = meetings.map((m) => ({
        id: m.id,
        clientName: m.participants[0]?.split("(")[0]?.trim() || "Cliente",
        title: m.title,
        date: m.datetimeStart.toISOString(),
        durationMinutes: m.durationMinutes,
        outcome: m.result,
        meetingType: m.pipelineStage,
      }));
      return res.json(items);
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.get("/reports/outcome-distribution", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const meetings = await prisma.meeting.findMany({ where: { userId } });
      const counts = {
        Ganha: meetings.filter((m) => m.result === "Won").length,
        Perdida: meetings.filter((m) => m.result === "Lost").length,
        "Em andamento": meetings.filter((m) => m.result === "Em andamento").length,
        "Sem decisão": meetings.filter((m) => m.result === "Sem decisão").length,
      };
      return res.json([
        { name: "Ganha", value: counts.Ganha, fill: "var(--chart-positive)" },
        { name: "Perdida", value: counts.Perdida, fill: "var(--chart-negative)" },
        { name: "Em andamento", value: counts["Em andamento"], fill: "var(--accent-gold)" },
        { name: "Sem decisão", value: counts["Sem decisão"], fill: "var(--text-secondary)" },
      ]);
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.get("/reports/sentiment-over-time", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const meetings = await prisma.meeting.findMany({
        where: { userId },
        orderBy: { datetimeStart: "desc" },
        take: 12,
      });
      const points: { label: string; value: number }[] = [];
      for (const m of meetings) {
        const ins = await prisma.meetingInsight.findFirst({
          where: { meetingId: m.id, type: "minute_insight" },
          orderBy: { createdAt: "desc" },
        });
        let score = 70;
        if (ins?.content) {
          try {
            const j = JSON.parse(ins.content) as { score?: number };
            if (typeof j.score === "number") score = Math.round(j.score * 10);
          } catch {
            /* ignore */
          }
        }
        points.push({
          label: new Date(m.datetimeStart).toLocaleDateString("pt-BR", { weekday: "short" }),
          value: score,
        });
      }
      return res.json(points.reverse());
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.get("/reports/talk-to-listen", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const meetings = await prisma.meeting.findMany({ where: { userId } });
      const grouped = new Map<string, number>();
      meetings.forEach((m) => grouped.set(m.pipelineStage, (grouped.get(m.pipelineStage) ?? 0) + 1));
      const bars = Array.from(grouped.entries()).map(([type, count]) => ({
        type: type ? type[0].toUpperCase() + type.slice(1) : "Outro",
        sellerPct: 50,
        clientPct: 50,
        _count: count,
      }));
      return res.json(bars);
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.get("/billing/plan", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const b = await ensureBilling(userId);
      return res.json({
        planName: b.planName,
        tokensTotalPerCycle: b.tokensTotalPerCycle,
        tokensUsed: b.tokensUsed,
        cycleEnd: b.cycleEnd.toISOString(),
        overagePricePer1000: b.overagePricePer1000,
      });
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.get("/billing/usage", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const u = await prisma.user.findUnique({ where: { id: userId } });
      const b = await ensureBilling(userId);
      const cycleStart = new Date(b.cycleEnd);
      cycleStart.setMonth(cycleStart.getMonth() - 1);
      return res.json({
        companyId: userId,
        companyName: u?.name ?? "Conta",
        planName: b.planName,
        tokensTotalPerCycle: b.tokensTotalPerCycle,
        tokensUsed: b.tokensUsed,
        cycleStart: cycleStart.toISOString().slice(0, 10),
        cycleEnd: b.cycleEnd.toISOString().slice(0, 10),
        renewalDate: b.cycleEnd.toISOString().slice(0, 10),
        overagePricePer1000: b.overagePricePer1000,
        usageByDay: [],
      });
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.get("/billing/usage/entries", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const b = await ensureBilling(userId);
      const entries = Array.isArray(b.usageEntries) ? b.usageEntries : [];
      return res.json(entries);
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.post("/billing/checkout", authMiddleware, async (_req, res) => {
    return res.json({
      checkoutUrl: null,
      message: "Configure integração Stripe (STRIPE_SECRET_KEY) para checkout ao vivo.",
    });
  });

  router.post("/billing/webhooks/stripe", async (_req, res) => {
    return res.status(202).json({ received: true, note: "Stub — validar assinatura Stripe em produção." });
  });

  router.get("/training/product/progress", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const rows = await prisma.trainingProgress.findMany({ where: { userId }, select: { lessonId: true } });
      return res.json({ completedLessonIds: rows.map((r) => r.lessonId), totalLessons: 5 });
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.post("/training/lessons/:lessonId/complete", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const lessonId = req.params.lessonId.trim();
      if (!lessonId) return res.status(400).json({ error: "lessonId inválido." });
      await prisma.trainingProgress.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        create: { userId, lessonId },
        update: {},
      });
      return res.status(201).json({ ok: true, lessonId });
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.get("/training/dashboards/me", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const progress = await prisma.trainingProgress.count({ where: { userId } });
      return res.json({
        kpis: [
          {
            moduleId: "product",
            moduleName: "Como usar o MinuteIO",
            completionRate: Math.min(100, progress * 20),
            averageScore: 8,
            hoursTrained: 4,
            completedCount: progress,
            totalCount: 5,
          },
        ],
        completedLessons: progress,
        totalLessons: 5,
      });
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.post("/training/simulations/message", authMiddleware, async (req, res) => {
    try {
      const body = req.body as SalesSimulatorInput & { agentId?: string };
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      if (!body.scenario || !body.lastSalesMessage) {
        return res.status(400).json({ error: "scenario e lastSalesMessage são obrigatórios." });
      }
      const agentProfile = await getAgentPromptProfile(userId, body.agentId);
      const result = await runSalesSimulatorTurn(
        {
          scenario: body.scenario,
          conversationHistory: body.conversationHistory ?? [],
          lastSalesMessage: body.lastSalesMessage,
        },
        undefined,
        { agentProfile }
      );
      return res.json(result);
    } catch (e) {
      console.error("training/simulations/message", e);
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro no simulador." });
    }
  });

  router.delete("/agents/:id", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const agent = await prisma.agent.findFirst({ where: { id: req.params.id, userId } });
      if (!agent) return res.status(404).json({ error: "Agente não encontrado." });
      await prisma.agent.delete({ where: { id: agent.id } });
      return res.status(204).send();
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.post("/agents/:id/duplicate", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Não autenticado." });
      const src = await prisma.agent.findFirst({
        where: { id: req.params.id, userId },
        include: { config: true },
      });
      if (!src) return res.status(404).json({ error: "Agente não encontrado." });
      const baseSlug = `${src.slug}-copy`.slice(0, 50);
      const slug = slugifyAgentName(`${baseSlug}-${Date.now()}`);
      const agent = await prisma.agent.create({
        data: {
          userId,
          name: `${src.name} (cópia)`,
          slug,
          isActive: src.isActive,
        },
      });
      if (src.config) {
        await prisma.agentConfig.create({
          data: {
            agentId: agent.id,
            sentimentTone: src.config.sentimentTone,
            salesAggressiveness: src.config.salesAggressiveness,
            objectionTips: src.config.objectionTips ?? Prisma.JsonNull,
            extraConfig: (src.config.extraConfig as Prisma.InputJsonValue) ?? Prisma.JsonNull,
            isActive: src.config.isActive,
          },
        });
      } else {
        await prisma.agentConfig.create({
          data: { agentId: agent.id },
        });
      }
      const full = await prisma.agent.findFirst({ where: { id: agent.id }, include: { config: true } });
      return res.status(201).json(full);
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.get("/prompts/detail/:id", authMiddleware, async (req, res) => {
    try {
      const p = await prisma.prompt.findUnique({ where: { id: req.params.id } });
      if (!p) return res.status(404).json({ error: "Prompt não encontrado." });
      return res.json(p);
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.patch("/prompts/:id", authMiddleware, async (req, res) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.userId } });
      if (!user) return res.status(401).json({ error: "Não autenticado." });
      if (!canManagePrompts(user.role)) return res.status(403).json({ error: "Sem permissão." });
      const prompt = await prisma.prompt.findUnique({ where: { id: req.params.id } });
      if (!prompt) return res.status(404).json({ error: "Prompt não encontrado." });
      const b = req.body as { title?: string; description?: string | null; isActive?: boolean; modelHint?: string | null };
      const data: Prisma.PromptUpdateInput = {};
      if (typeof b.title === "string") data.title = b.title.trim();
      if (b.description !== undefined) data.description = b.description?.trim() || null;
      if (typeof b.isActive === "boolean") data.isActive = b.isActive;
      if (b.modelHint !== undefined) data.modelHint = b.modelHint?.trim() || null;
      const updated = await prisma.prompt.update({ where: { id: prompt.id }, data });
      return res.json(updated);
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.get("/admin/users", authMiddleware, requireAdmin, async (_req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return res.json(users);
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.patch("/admin/users/:id", authMiddleware, requireAdmin, async (req, res) => {
    try {
      const b = req.body as { role?: string; isActive?: boolean };
      const data: Prisma.UserUpdateInput = {};
      if (typeof b.role === "string") data.role = b.role.trim();
      if (typeof b.isActive === "boolean") data.isActive = b.isActive;
      if (Object.keys(data).length === 0) return res.status(400).json({ error: "role ou isActive." });
      const updated = await prisma.user.update({
        where: { id: req.params.id },
        data,
        select: { id: true, name: true, email: true, role: true, isActive: true },
      });
      return res.json(updated);
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Erro." });
    }
  });

  router.get("/version", (_req, res) => {
    res.json({
      name: "minuteio-api",
      version: process.env.npm_package_version ?? "dev",
      node: process.version,
    });
  });

  router.get("/openapi.json", (_req, res) => {
    res.json({
      openapi: "3.0.0",
      info: { title: "MinuteIO API", version: "1.0.0" },
      paths: {
        "/api/health": { get: { summary: "Health" } },
        "/api/auth/login": { post: { summary: "Login" } },
        "/api/auth/refresh": { post: { summary: "Refresh token" } },
      },
    });
  });
}
