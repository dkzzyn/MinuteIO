import { Router } from "express";
import { RegisterUserUseCase } from "../../../application/use-cases/auth/RegisterUser";
import { LoginUserUseCase } from "../../../application/use-cases/auth/LoginUser";
import { ListUserPostsUseCase } from "../../../application/use-cases/posts/ListUserPosts";
import { CreatePostUseCase } from "../../../application/use-cases/posts/CreatePost";
import { UpdatePostUseCase } from "../../../application/use-cases/posts/UpdatePost";
import { DeletePostUseCase } from "../../../application/use-cases/posts/DeletePost";
import { PrismaUserRepository } from "../../../infrastructure/database/prisma/repositories/PrismaUserRepository";
import { PrismaPostRepository } from "../../../infrastructure/database/prisma/repositories/PrismaPostRepository";
import { BcryptPasswordHasher } from "../../../infrastructure/security/BcryptPasswordHasher";
import { JwtTokenService } from "../../../infrastructure/security/JwtTokenService";
import { prisma } from "../../../infrastructure/database/prisma/client";
import { authMiddleware } from "../middlewares/authMiddleware";

/**
 * Router base da camada de apresentação (Clean Architecture).
 * Nesta etapa já expõe auth/posts sem alterar os endpoints atuais
 * de Ollama/insights que continuam em src/index.ts.
 */
export function buildApiRouter(): Router {
  const router = Router();
  const userRepository = new PrismaUserRepository();
  const postRepository = new PrismaPostRepository();
  const passwordHasher = new BcryptPasswordHasher();
  const tokenService = new JwtTokenService();

  const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordHasher);
  const loginUserUseCase = new LoginUserUseCase(userRepository, passwordHasher, tokenService);
  const listUserPostsUseCase = new ListUserPostsUseCase(postRepository);
  const createPostUseCase = new CreatePostUseCase(postRepository);
  const updatePostUseCase = new UpdatePostUseCase(postRepository);
  const deletePostUseCase = new DeletePostUseCase(postRepository);

  async function getCurrentUser(userId?: string) {
    if (!userId) return null;
    return prisma.user.findUnique({ where: { id: userId } });
  }

  function canManagePrompts(role: string) {
    const normalized = role.toLowerCase();
    return normalized === "admin" || normalized === "supervisor";
  }

  router.post("/auth/register", async (req, res) => {
    try {
      const { name, email, password } = req.body as {
        name?: string;
        email?: string;
        password?: string;
      };

      if (!name?.trim() || !email?.trim() || !password?.trim()) {
        return res.status(400).json({ error: "name, email e password são obrigatórios." });
      }

      if (password.trim().length < 6) {
        return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres." });
      }

      const user = await registerUserUseCase.execute({
        name,
        email,
        password,
      });

      return res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao registrar usuário.";
      const status = msg.includes("em uso") ? 409 : 500;
      return res.status(status).json({ error: msg });
    }
  });

  router.post("/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body as {
        email?: string;
        password?: string;
      };

      if (!email?.trim() || !password?.trim()) {
        return res.status(400).json({ error: "email e password são obrigatórios." });
      }

      const output = await loginUserUseCase.execute({
        email,
        password,
      });

      return res.json(output);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao autenticar.";
      const status = msg.includes("Credenciais inválidas") ? 401 : 500;
      return res.status(status).json({ error: msg });
    }
  });

  router.get("/me", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) return res.status(404).json({ error: "Usuário não encontrado." });
      return res.json(user);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao buscar perfil.";
      return res.status(500).json({ error: msg });
    }
  });

  router.put("/me", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });

      const body = req.body as { name?: string; avatarUrl?: string | null };

      const data: { name?: string; avatarUrl?: string | null } = {};
      if (typeof body.name === "string") {
        const trimmed = body.name.trim();
        if (!trimmed) return res.status(400).json({ error: "name não pode ser vazio." });
        data.name = trimmed;
      }

      if (body.avatarUrl !== undefined) {
        const value = typeof body.avatarUrl === "string" ? body.avatarUrl.trim() : "";
        data.avatarUrl = value || null;
      }

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
          createdAt: true,
          updatedAt: true,
        },
      });

      return res.json(updated);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao atualizar perfil.";
      return res.status(500).json({ error: msg });
    }
  });

  router.get("/posts", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado." });
      }

      const posts = await listUserPostsUseCase.execute(userId);
      return res.json(posts);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao listar posts.";
      return res.status(500).json({ error: msg });
    }
  });

  router.post("/posts", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const { content } = req.body as { content?: string };
      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado." });
      }
      if (!content) {
        return res.status(400).json({ error: "content é obrigatório." });
      }

      const post = await createPostUseCase.execute({ userId, content });
      return res.status(201).json(post);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao criar post.";
      const status = msg.includes("obrigatório") ? 400 : 500;
      return res.status(status).json({ error: msg });
    }
  });

  router.put("/posts/:id", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const postId = req.params.id;
      const { content } = req.body as { content?: string };
      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado." });
      }
      if (!content) {
        return res.status(400).json({ error: "content é obrigatório." });
      }

      const post = await updatePostUseCase.execute({ postId, userId, content });
      return res.json(post);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao atualizar post.";
      const status = msg.includes("não encontrado")
        ? 404
        : msg.includes("Acesso negado")
          ? 403
          : msg.includes("obrigatório")
            ? 400
            : 500;
      return res.status(status).json({ error: msg });
    }
  });

  router.delete("/posts/:id", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const postId = req.params.id;
      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado." });
      }

      await deletePostUseCase.execute({ postId, userId });
      return res.status(204).send();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao remover post.";
      const status = msg.includes("não encontrado")
        ? 404
        : msg.includes("Acesso negado")
          ? 403
          : 500;
      return res.status(status).json({ error: msg });
    }
  });

  router.get("/prompts", authMiddleware, async (req, res) => {
    try {
      const user = await getCurrentUser(req.userId);
      if (!user) return res.status(401).json({ error: "Usuário não autenticado." });

      const query = req.query as { slug?: string; isActive?: string; modelHint?: string };
      const where: {
        slug?: string;
        isActive?: boolean;
        modelHint?: string;
      } = {};

      if (query.slug?.trim()) where.slug = query.slug.trim();
      if (query.modelHint?.trim()) where.modelHint = query.modelHint.trim();
      if (query.isActive != null) where.isActive = query.isActive === "true";

      const prompts = await prisma.prompt.findMany({
        where,
        orderBy: [{ slug: "asc" }, { version: "desc" }],
      });
      return res.json(prompts);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao listar prompts.";
      return res.status(500).json({ error: msg });
    }
  });

  router.get("/prompts/:slug/latest", authMiddleware, async (req, res) => {
    try {
      const user = await getCurrentUser(req.userId);
      if (!user) return res.status(401).json({ error: "Usuário não autenticado." });

      const slug = req.params.slug.trim();
      const prompt = await prisma.prompt.findFirst({
        where: { slug, isActive: true },
        orderBy: { version: "desc" },
      });

      if (!prompt) return res.status(404).json({ error: "Prompt ativo não encontrado para este slug." });
      return res.json(prompt);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao buscar prompt.";
      return res.status(500).json({ error: msg });
    }
  });

  router.post("/prompts", authMiddleware, async (req, res) => {
    try {
      const user = await getCurrentUser(req.userId);
      if (!user) return res.status(401).json({ error: "Usuário não autenticado." });
      if (!canManagePrompts(user.role)) {
        return res.status(403).json({ error: "Sem permissão para criar prompts." });
      }

      const body = req.body as {
        slug?: string;
        title?: string;
        description?: string | null;
        promptText?: string;
        modelHint?: string | null;
        isActive?: boolean;
      };

      const slug = body.slug?.trim().toLowerCase();
      const title = body.title?.trim();
      const promptText = body.promptText?.trim();
      if (!slug || !title || !promptText) {
        return res.status(400).json({ error: "slug, title e promptText são obrigatórios." });
      }

      const existing = await prisma.prompt.findFirst({
        where: { slug },
        orderBy: { version: "desc" },
      });

      const nextVersion = (existing?.version ?? 0) + 1;
      const created = await prisma.prompt.create({
        data: {
          slug,
          title,
          description: body.description?.trim() || null,
          promptText,
          modelHint: body.modelHint?.trim() || null,
          isActive: body.isActive ?? true,
          version: nextVersion,
          versions: {
            create: {
              version: nextVersion,
              promptText,
              description: body.description?.trim() || null,
              createdById: user.id,
            },
          },
        },
      });

      return res.status(201).json(created);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao criar prompt.";
      const status = msg.includes("Unique constraint") ? 409 : 500;
      return res.status(status).json({ error: msg });
    }
  });

  router.post("/prompts/:id/versions", authMiddleware, async (req, res) => {
    try {
      const user = await getCurrentUser(req.userId);
      if (!user) return res.status(401).json({ error: "Usuário não autenticado." });
      if (!canManagePrompts(user.role)) {
        return res.status(403).json({ error: "Sem permissão para versionar prompts." });
      }

      const promptId = req.params.id;
      const prompt = await prisma.prompt.findUnique({ where: { id: promptId } });
      if (!prompt) return res.status(404).json({ error: "Prompt não encontrado." });

      const body = req.body as {
        promptText?: string;
        description?: string | null;
        modelHint?: string | null;
        isActive?: boolean;
      };
      const promptText = body.promptText?.trim();
      if (!promptText) {
        return res.status(400).json({ error: "promptText é obrigatório." });
      }

      const nextVersion = prompt.version + 1;
      const updatedPrompt = await prisma.prompt.update({
        where: { id: promptId },
        data: {
          version: nextVersion,
          promptText,
          description: body.description?.trim() || prompt.description,
          modelHint: body.modelHint !== undefined ? body.modelHint?.trim() || null : prompt.modelHint,
          isActive: body.isActive ?? prompt.isActive,
          versions: {
            create: {
              version: nextVersion,
              promptText,
              description: body.description?.trim() || null,
              createdById: user.id,
            },
          },
        },
      });

      return res.status(201).json(updatedPrompt);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao criar versão do prompt.";
      return res.status(500).json({ error: msg });
    }
  });

  router.get("/meetings/:id/analyses", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const meetingId = req.params.id;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });

      const meeting = await prisma.meeting.findFirst({ where: { id: meetingId, userId } });
      if (!meeting) return res.status(404).json({ error: "Reunião não encontrada." });

      const analyses = await prisma.meetingAnalysis.findMany({
        where: { meetingId },
        include: {
          prompt: {
            select: { id: true, slug: true, title: true, version: true, modelHint: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return res.json(analyses);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao listar análises.";
      return res.status(500).json({ error: msg });
    }
  });

  router.post("/meetings/:id/analyses", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const meetingId = req.params.id;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });

      const meeting = await prisma.meeting.findFirst({ where: { id: meetingId, userId } });
      if (!meeting) return res.status(404).json({ error: "Reunião não encontrada." });

      const body = req.body as {
        promptId?: string;
        modelUsed?: string;
        inputTextHash?: string | null;
        outputText?: string | null;
      };
      if (!body.promptId?.trim() || !body.modelUsed?.trim()) {
        return res.status(400).json({ error: "promptId e modelUsed são obrigatórios." });
      }

      const prompt = await prisma.prompt.findUnique({ where: { id: body.promptId } });
      if (!prompt) return res.status(404).json({ error: "Prompt não encontrado." });

      const analysis = await prisma.meetingAnalysis.create({
        data: {
          meetingId,
          promptId: prompt.id,
          createdById: userId,
          modelUsed: body.modelUsed.trim(),
          inputTextHash: body.inputTextHash?.trim() || null,
          outputText: body.outputText?.trim() || null,
        },
      });

      return res.status(201).json(analysis);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao salvar análise.";
      return res.status(500).json({ error: msg });
    }
  });

  router.get("/teams", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });

      const teams = await prisma.team.findMany({
        where: { ownerId: userId },
        orderBy: { createdAt: "desc" },
      });
      return res.json(teams);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao listar times.";
      return res.status(500).json({ error: msg });
    }
  });

  router.post("/teams", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(404).json({ error: "Usuário não encontrado." });
      if (!["admin", "supervisor"].includes(user.role.toLowerCase())) {
        return res.status(403).json({ error: "Apenas admin/supervisor pode criar time." });
      }

      const body = req.body as { name?: string };
      if (!body.name?.trim()) return res.status(400).json({ error: "name é obrigatório." });

      const team = await prisma.team.create({
        data: {
          name: body.name.trim(),
          ownerId: userId,
        },
      });
      return res.status(201).json(team);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao criar time.";
      return res.status(500).json({ error: msg });
    }
  });

  router.post("/teams/:id/invites", authMiddleware, async (req, res) => {
    try {
      const invitedById = req.userId;
      if (!invitedById) return res.status(401).json({ error: "Usuário não autenticado." });

      const inviter = await prisma.user.findUnique({ where: { id: invitedById } });
      if (!inviter) return res.status(404).json({ error: "Usuário não encontrado." });
      if (!["admin", "supervisor"].includes(inviter.role.toLowerCase())) {
        return res.status(403).json({ error: "Apenas admin/supervisor pode convidar." });
      }

      const teamId = req.params.id;
      const team = await prisma.team.findUnique({ where: { id: teamId } });
      if (!team) return res.status(404).json({ error: "Time não encontrado." });
      if (team.ownerId !== invitedById && inviter.role.toLowerCase() !== "admin") {
        return res.status(403).json({ error: "Sem permissão para convidar neste time." });
      }

      const body = req.body as { email?: string };
      const email = body.email?.trim().toLowerCase();
      if (!email) return res.status(400).json({ error: "email é obrigatório." });

      const invitedUser = await prisma.user.findUnique({ where: { email } });
      if (!invitedUser) return res.status(404).json({ error: "Usuário convidado não encontrado." });
      if (invitedUser.id === invitedById) {
        return res.status(400).json({ error: "Você não pode convidar a si mesmo." });
      }

      const invitation = await prisma.teamInvitation.upsert({
        where: {
          teamId_invitedUserId: {
            teamId,
            invitedUserId: invitedUser.id,
          },
        },
        update: {
          invitedById,
          status: "pending",
        },
        create: {
          teamId,
          invitedUserId: invitedUser.id,
          invitedById,
          status: "pending",
        },
      });

      return res.status(201).json(invitation);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao enviar convite.";
      return res.status(500).json({ error: msg });
    }
  });

  router.get("/invites/me", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });

      const invites = await prisma.teamInvitation.findMany({
        where: { invitedUserId: userId },
        include: { team: true, invitedBy: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      });
      return res.json(invites);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao listar convites.";
      return res.status(500).json({ error: msg });
    }
  });

  router.put("/invites/:id/accept", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const inviteId = req.params.id;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });

      const invite = await prisma.teamInvitation.findUnique({ where: { id: inviteId } });
      if (!invite) return res.status(404).json({ error: "Convite não encontrado." });
      if (invite.invitedUserId !== userId) return res.status(403).json({ error: "Sem permissão." });

      const updated = await prisma.teamInvitation.update({
        where: { id: inviteId },
        data: { status: "accepted" },
      });
      return res.json(updated);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao aceitar convite.";
      return res.status(500).json({ error: msg });
    }
  });

  router.put("/invites/:id/reject", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const inviteId = req.params.id;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });

      const invite = await prisma.teamInvitation.findUnique({ where: { id: inviteId } });
      if (!invite) return res.status(404).json({ error: "Convite não encontrado." });
      if (invite.invitedUserId !== userId) return res.status(403).json({ error: "Sem permissão." });

      const updated = await prisma.teamInvitation.update({
        where: { id: inviteId },
        data: { status: "rejected" },
      });
      return res.json(updated);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao recusar convite.";
      return res.status(500).json({ error: msg });
    }
  });

  router.post("/meetings", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });

      const body = req.body as {
        postId?: string | null;
        type?: string;
        title?: string;
        description?: string | null;
        datetimeStart?: string;
        datetimeEnd?: string | null;
        status?: string;
        recordingUrl?: string | null;
        durationMinutes?: number;
        language?: string;
        pipelineStage?: string;
        result?: string;
        participants?: string[];
        winProbability?: number;
        objectionTypes?: string[];
        summary?: string;
      };

      if (!body.title?.trim()) {
        return res.status(400).json({ error: "title é obrigatório." });
      }

      const meeting = await prisma.meeting.create({
        data: {
          userId,
          postId: body.postId ?? null,
          type: body.type ?? "online",
          title: body.title.trim(),
          description: body.description ?? null,
          datetimeStart: body.datetimeStart ? new Date(body.datetimeStart) : new Date(),
          datetimeEnd: body.datetimeEnd ? new Date(body.datetimeEnd) : null,
          status: body.status ?? "scheduled",
          recordingUrl: body.recordingUrl ?? null,
          durationMinutes: body.durationMinutes ?? 30,
          language: body.language ?? "pt-BR",
          pipelineStage: body.pipelineStage ?? "discovery",
          result: body.result ?? "Em andamento",
          participants: body.participants ?? ["Cliente", "Vendedor"],
          winProbability: body.winProbability ?? 0.5,
          objectionTypes: body.objectionTypes ?? [],
          summary: body.summary ?? "",
        },
      });

      return res.status(201).json(meeting);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao criar reunião.";
      return res.status(500).json({ error: msg });
    }
  });

  router.get("/meetings", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });

      const meetings = await prisma.meeting.findMany({
        where: { userId },
        orderBy: { datetimeStart: "desc" },
      });
      return res.json(meetings);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao listar reuniões.";
      return res.status(500).json({ error: msg });
    }
  });

  router.get("/meetings/:id", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const meetingId = req.params.id;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });

      const meeting = await prisma.meeting.findFirst({
        where: { id: meetingId, userId },
      });
      if (!meeting) return res.status(404).json({ error: "Reunião não encontrada." });
      return res.json(meeting);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao buscar reunião.";
      return res.status(500).json({ error: msg });
    }
  });

  router.get("/meetings/:id/clips", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const meetingId = req.params.id;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });

      const meeting = await prisma.meeting.findFirst({ where: { id: meetingId, userId } });
      if (!meeting) return res.status(404).json({ error: "Reunião não encontrada." });

      const clips = await prisma.meetingClip.findMany({
        where: { meetingId },
        orderBy: { index: "asc" },
      });
      return res.json(clips);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao listar clipes.";
      return res.status(500).json({ error: msg });
    }
  });

  router.post("/meetings/:id/clips", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const meetingId = req.params.id;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });

      const meeting = await prisma.meeting.findFirst({ where: { id: meetingId, userId } });
      if (!meeting) return res.status(404).json({ error: "Reunião não encontrada." });

      const body = req.body as {
        index?: number;
        startTime?: number;
        endTime?: number;
        transcript?: string;
        processedByAi?: boolean;
      };
      if (body.index == null || body.startTime == null || body.endTime == null) {
        return res.status(400).json({ error: "index, startTime e endTime são obrigatórios." });
      }

      const clip = await prisma.meetingClip.upsert({
        where: { meetingId_index: { meetingId, index: Number(body.index) } },
        update: {
          startTime: Number(body.startTime),
          endTime: Number(body.endTime),
          transcript: body.transcript ?? "",
          processedByAi: !!body.processedByAi,
        },
        create: {
          meetingId,
          index: Number(body.index),
          startTime: Number(body.startTime),
          endTime: Number(body.endTime),
          transcript: body.transcript ?? "",
          processedByAi: !!body.processedByAi,
        },
      });
      return res.status(201).json(clip);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao salvar clipe.";
      return res.status(500).json({ error: msg });
    }
  });

  router.get("/meetings/:id/insights", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const meetingId = req.params.id;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });

      const meeting = await prisma.meeting.findFirst({ where: { id: meetingId, userId } });
      if (!meeting) return res.status(404).json({ error: "Reunião não encontrada." });

      const insights = await prisma.meetingInsight.findMany({
        where: { meetingId },
        orderBy: { createdAt: "asc" },
      });
      return res.json(insights);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao listar insights.";
      return res.status(500).json({ error: msg });
    }
  });

  router.post("/meetings/:id/insights", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const meetingId = req.params.id;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });

      const meeting = await prisma.meeting.findFirst({ where: { id: meetingId, userId } });
      if (!meeting) return res.status(404).json({ error: "Reunião não encontrada." });

      const body = req.body as { clipId?: string | null; type?: string; content?: string };
      if (!body.type?.trim() || !body.content?.trim()) {
        return res.status(400).json({ error: "type e content são obrigatórios." });
      }

      const insight = await prisma.meetingInsight.create({
        data: {
          meetingId,
          clipId: body.clipId ?? null,
          type: body.type.trim(),
          content: body.content.trim(),
        },
      });
      return res.status(201).json(insight);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao salvar insight.";
      return res.status(500).json({ error: msg });
    }
  });

  router.get("/healthz", (_req, res) => {
    res.json({ ok: true });
  });

  return router;
}
