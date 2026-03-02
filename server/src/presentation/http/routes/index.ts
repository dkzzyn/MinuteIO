import { Router } from "express";
import { Prisma } from "@prisma/client";
import { analyzeMeetingMinute } from "../../../../ollama/ollamaService";
import type { AgentPromptProfile } from "../../../../ollama/types";
import { listMeetingChunkAnalyses, saveMinuteInsight } from "../../../../meetingInsightsService";
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

  const SENTIMENT_TONES = new Set(["positivo", "neutro", "negativo"]);
  const SALES_AGGRESSIVENESS = new Set(["baixo", "moderado", "alto"]);
  const PROMPT_CONFIG_LANGUAGES = new Set(["pt-BR", "en-US", "es-ES"]);
  const PROMPT_CONFIG_MEETING_TYPES = new Set(["interna", "cliente", "suporte", "venda", "outro"]);
  const PROMPT_CONFIG_DETAIL_LEVELS = new Set(["resumo_curto", "topicos", "completa"]);
  const PROMPT_CONFIG_SENTIMENT_MODES = new Set(["simple", "score"]);

  type PromptConfig = {
    transcription: {
      enabled: boolean;
      language: string;
      meetingType: "interna" | "cliente" | "suporte" | "venda" | "outro";
      detailLevel: "resumo_curto" | "topicos" | "completa";
    };
    sentiment: {
      enabled: boolean;
      mode: "simple" | "score";
      showOverall: boolean;
      showPerParticipant: boolean;
      showIntensity: boolean;
    };
  };

  const DEFAULT_PROMPT_CONFIG: PromptConfig = {
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
  };

  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  function normalizePromptConfig(input: unknown): PromptConfig {
    if (!isRecord(input)) return DEFAULT_PROMPT_CONFIG;

    const transcription = isRecord(input.transcription) ? input.transcription : {};
    const sentiment = isRecord(input.sentiment) ? input.sentiment : {};
    const language = typeof transcription.language === "string" ? transcription.language : DEFAULT_PROMPT_CONFIG.transcription.language;
    const meetingType =
      typeof transcription.meetingType === "string" && PROMPT_CONFIG_MEETING_TYPES.has(transcription.meetingType)
        ? (transcription.meetingType as PromptConfig["transcription"]["meetingType"])
        : DEFAULT_PROMPT_CONFIG.transcription.meetingType;
    const detailLevel =
      typeof transcription.detailLevel === "string" && PROMPT_CONFIG_DETAIL_LEVELS.has(transcription.detailLevel)
        ? (transcription.detailLevel as PromptConfig["transcription"]["detailLevel"])
        : DEFAULT_PROMPT_CONFIG.transcription.detailLevel;
    const sentimentMode =
      typeof sentiment.mode === "string" && PROMPT_CONFIG_SENTIMENT_MODES.has(sentiment.mode)
        ? (sentiment.mode as PromptConfig["sentiment"]["mode"])
        : DEFAULT_PROMPT_CONFIG.sentiment.mode;

    return {
      transcription: {
        enabled:
          typeof transcription.enabled === "boolean"
            ? transcription.enabled
            : DEFAULT_PROMPT_CONFIG.transcription.enabled,
        language: PROMPT_CONFIG_LANGUAGES.has(language) ? language : DEFAULT_PROMPT_CONFIG.transcription.language,
        meetingType,
        detailLevel,
      },
      sentiment: {
        enabled:
          typeof sentiment.enabled === "boolean" ? sentiment.enabled : DEFAULT_PROMPT_CONFIG.sentiment.enabled,
        mode: sentimentMode,
        showOverall:
          typeof sentiment.showOverall === "boolean"
            ? sentiment.showOverall
            : DEFAULT_PROMPT_CONFIG.sentiment.showOverall,
        showPerParticipant:
          typeof sentiment.showPerParticipant === "boolean"
            ? sentiment.showPerParticipant
            : DEFAULT_PROMPT_CONFIG.sentiment.showPerParticipant,
        showIntensity:
          typeof sentiment.showIntensity === "boolean"
            ? sentiment.showIntensity
            : DEFAULT_PROMPT_CONFIG.sentiment.showIntensity,
      },
    };
  }

  function slugifyAgentName(value: string): string {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .slice(0, 60);
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
      sentimentTone: agent.config?.sentimentTone ?? "neutro",
      salesAggressiveness: agent.config?.salesAggressiveness ?? "moderado",
      objectionTips: agent.config?.objectionTips ?? {},
      promptConfig: (agent.config?.extraConfig as AgentPromptProfile["promptConfig"]) ?? {
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
      },
    };
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

  router.get("/agents", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });

      const agents = await prisma.agent.findMany({
        where: { userId },
        include: {
          config: true,
        },
        orderBy: [{ isActive: "desc" }, { name: "asc" }],
      });
      return res.json(agents);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao listar agentes.";
      return res.status(500).json({ error: msg });
    }
  });

  router.post("/agents", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });

      const body = req.body as { name?: string; slug?: string; isActive?: boolean };
      const name = body.name?.trim();
      if (!name) return res.status(400).json({ error: "name é obrigatório." });

      const generatedSlug = slugifyAgentName(name);
      const slug = slugifyAgentName(body.slug?.trim() || generatedSlug);
      if (!slug) {
        return res.status(400).json({ error: "slug inválido. Use letras, números e hífen." });
      }

      const agent = await prisma.agent.create({
        data: {
          userId,
          name,
          slug,
          isActive: body.isActive ?? true,
        },
      });

      const config = await prisma.agentConfig.create({
        data: {
          agentId: agent.id,
          extraConfig: DEFAULT_PROMPT_CONFIG as unknown as Prisma.InputJsonValue,
        },
      });

      return res.status(201).json({
        ...agent,
        config: { ...config, extraConfig: normalizePromptConfig(config.extraConfig) },
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao criar agente.";
      const status = msg.includes("Unique constraint") ? 409 : 500;
      return res.status(status).json({ error: msg });
    }
  });

  router.patch("/agents/:id", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });

      const agentId = req.params.id;
      const existing = await prisma.agent.findFirst({ where: { id: agentId, userId } });
      if (!existing) return res.status(404).json({ error: "Agente não encontrado." });

      const body = req.body as { name?: string; slug?: string; isActive?: boolean };
      const data: { name?: string; slug?: string; isActive?: boolean } = {};

      if (typeof body.name === "string") {
        const name = body.name.trim();
        if (!name) return res.status(400).json({ error: "name não pode ser vazio." });
        data.name = name;
      }
      if (typeof body.slug === "string") {
        const slug = slugifyAgentName(body.slug);
        if (!slug) return res.status(400).json({ error: "slug inválido." });
        data.slug = slug;
      }
      if (typeof body.isActive === "boolean") {
        data.isActive = body.isActive;
      }

      const updated = await prisma.agent.update({
        where: { id: agentId },
        data,
      });
      return res.json(updated);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao atualizar agente.";
      const status = msg.includes("Unique constraint") ? 409 : 500;
      return res.status(status).json({ error: msg });
    }
  });

  router.get("/agents/:id/config", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });

      const agent = await prisma.agent.findFirst({
        where: { id: req.params.id, userId },
      });
      if (!agent) return res.status(404).json({ error: "Agente não encontrado." });

      const config = await prisma.agentConfig.upsert({
        where: { agentId: agent.id },
        update: {},
        create: {
          agentId: agent.id,
          extraConfig: DEFAULT_PROMPT_CONFIG as unknown as Prisma.InputJsonValue,
        },
      });

      return res.json({ ...config, extraConfig: normalizePromptConfig(config.extraConfig) });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao buscar configurações do agente.";
      return res.status(500).json({ error: msg });
    }
  });

  router.put("/agents/:id/config", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });

      const agent = await prisma.agent.findFirst({
        where: { id: req.params.id, userId },
      });
      if (!agent) return res.status(404).json({ error: "Agente não encontrado." });

      const body = req.body as {
        sentimentTone?: string;
        salesAggressiveness?: string;
        objectionTips?: unknown;
        extraConfig?: unknown;
        isActive?: boolean;
      };

      const sentimentTone = body.sentimentTone?.trim().toLowerCase() || "neutro";
      const salesAggressiveness = body.salesAggressiveness?.trim().toLowerCase() || "moderado";
      if (!SENTIMENT_TONES.has(sentimentTone)) {
        return res.status(400).json({ error: "sentimentTone inválido. Use: positivo, neutro ou negativo." });
      }
      if (!SALES_AGGRESSIVENESS.has(salesAggressiveness)) {
        return res.status(400).json({ error: "salesAggressiveness inválido. Use: baixo, moderado ou alto." });
      }

      const objectionTips =
        body.objectionTips === undefined ? undefined : (body.objectionTips as Prisma.InputJsonValue);
      const existingConfig = await prisma.agentConfig.findUnique({ where: { agentId: agent.id } });
      const normalizedPromptConfig = normalizePromptConfig(
        body.extraConfig === undefined ? existingConfig?.extraConfig : body.extraConfig
      );
      const extraConfig = normalizedPromptConfig as unknown as Prisma.InputJsonValue;

      const config = await prisma.agentConfig.upsert({
        where: { agentId: agent.id },
        update: {
          sentimentTone,
          salesAggressiveness,
          objectionTips,
          extraConfig,
          isActive: body.isActive ?? true,
        },
        create: {
          agentId: agent.id,
          sentimentTone,
          salesAggressiveness,
          objectionTips: objectionTips ?? Prisma.JsonNull,
          extraConfig,
          isActive: body.isActive ?? true,
        },
      });

      return res.json({ ...config, extraConfig: normalizePromptConfig(config.extraConfig) });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao atualizar configuração do agente.";
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

  router.post("/meetings/:id/chunks", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });
      const meetingId = req.params.id;

      let meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
      if (!meeting) {
        meeting = await prisma.meeting.create({
          data: {
            id: meetingId,
            userId,
            postId: null,
            type: "online",
            title: "Reunião ao vivo",
            description: null,
            durationMinutes: 30,
            language: "pt-BR",
            pipelineStage: "discovery",
            result: "Em andamento",
            participants: ["Cliente", "Vendedor"],
            winProbability: 0.5,
            objectionTypes: [],
            summary: "",
            datetimeStart: new Date(),
            datetimeEnd: null,
            status: "running",
            recordingUrl: null,
          },
        });
      }

      const body = req.body as {
        chunkIndex?: number;
        transcript?: string;
        meetingContext?: string;
        title?: string;
        agentId?: string;
      };
      const chunkIndex = Number(body.chunkIndex);
      const transcript = body.transcript?.trim() ?? "";
      if (!Number.isFinite(chunkIndex) || chunkIndex <= 0 || !transcript) {
        return res.status(400).json({ error: "chunkIndex (>0) e transcript são obrigatórios." });
      }

      const agentProfile = await getAgentPromptProfile(userId, body.agentId);
      const analysis = await analyzeMeetingMinute(
        {
          meetingContext: body.meetingContext?.trim() || meeting.title,
          minuteNumber: chunkIndex,
          transcriptChunk: transcript,
        },
        undefined,
        { agentProfile }
      );

      await saveMinuteInsight(meetingId, analysis, body.title || meeting.title, userId, transcript);
      return res.status(201).json(analysis);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao analisar chunk da reunião.";
      return res.status(500).json({ error: msg });
    }
  });

  router.get("/meetings/:id/chunks", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });
      const meetingId = req.params.id;
      const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
      if (!meeting) return res.status(404).json({ error: "Reunião não encontrada." });

      const chunks = await listMeetingChunkAnalyses(meetingId);
      return res.json(chunks);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao listar chunks da reunião.";
      return res.status(500).json({ error: msg });
    }
  });

  router.delete("/meetings/:id/chunks", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });
      const meetingId = req.params.id;
      const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
      if (!meeting) return res.status(404).json({ error: "Reunião não encontrada." });

      await prisma.meetingInsight.deleteMany({
        where: { meetingId, type: "minute_insight" },
      });

      return res.status(204).send();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao limpar chunks da reunião.";
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
