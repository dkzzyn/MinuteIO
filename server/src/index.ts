/**
 * Backend MinuteIO – expõe APIs que chamam o Ollama.
 * Variáveis em server/.env (PORT, OLLAMA_URL, OLLAMA_MODEL).
 * Front chama: http://localhost:3001/api/...
 */
import "dotenv/config";

import express from "express";
import cors from "cors";
import multer from "multer";
import {
  analyzeMeetingMinute,
  runSalesSimulatorTurn,
  evaluateObjectionAnswer,
  generateTrainingDashboardSummary,
} from "../ollama/ollamaService";
import type {
  MeetingMinuteInput,
  SalesSimulatorInput,
  ObjectionEvaluationInput,
  TrainingDashboardInput,
  MinuteInsight,
  AgentPromptProfile,
  PromptConfig,
} from "../ollama/types";
import {
  saveMinuteInsight,
  getMeetingInsightsView,
  setTaskDone,
} from "../meetingInsightsService";
import { handleAudioChunk, getAudioUploadConfig } from "../transcription/audioChunkHandler";
import { buildApiRouter } from "./presentation/http/routes";
import { authMiddleware } from "./presentation/http/middlewares/authMiddleware";
import { prisma } from "./infrastructure/database/prisma/client";

const app = express();
const PORT = process.env.PORT ?? 3001;
/** URL do Vite / frontend (para link na raiz do servidor). */
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

app.use(cors());
app.use(express.json());

/** Evita "Cannot GET /" ao abrir http://localhost:3001/ no navegador. */
app.get("/", (_req, res) => {
  const wantsJson = _req.headers.accept?.includes("application/json");
  if (wantsJson) {
    res.json({
      name: "MinuteIO API",
      hint: "Este é o backend. Abra o frontend no navegador.",
      frontendUrl: FRONTEND_URL,
      try: ["/api/health", "/api/healthz"],
    });
    return;
  }
  res.type("html").send(`<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>MinuteIO API</title></head>
<body style="font-family:system-ui,sans-serif;max-width:40rem;margin:2rem auto;padding:0 1rem">
  <h1>MinuteIO — API</h1>
  <p>Você está no <strong>servidor backend</strong> (porta ${PORT}). A interface web roda em outra porta.</p>
  <p><a href="${FRONTEND_URL}">Abrir o app (frontend)</a></p>
  <p>Links úteis:</p>
  <ul>
    <li><a href="/api/health"><code>GET /api/health</code></a></li>
    <li><a href="/api/healthz"><code>GET /api/healthz</code></a></li>
  </ul>
</body>
</html>`);
});

const audioUpload = multer(getAudioUploadConfig());

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
  return {
    transcription: {
      enabled: typeof transcription.enabled === "boolean" ? transcription.enabled : DEFAULT_PROMPT_CONFIG.transcription.enabled,
      language: typeof transcription.language === "string" ? transcription.language : DEFAULT_PROMPT_CONFIG.transcription.language,
      meetingType:
        transcription.meetingType === "interna" ||
        transcription.meetingType === "cliente" ||
        transcription.meetingType === "suporte" ||
        transcription.meetingType === "venda" ||
        transcription.meetingType === "outro"
          ? transcription.meetingType
          : DEFAULT_PROMPT_CONFIG.transcription.meetingType,
      detailLevel:
        transcription.detailLevel === "resumo_curto" ||
        transcription.detailLevel === "topicos" ||
        transcription.detailLevel === "completa"
          ? transcription.detailLevel
          : DEFAULT_PROMPT_CONFIG.transcription.detailLevel,
    },
    sentiment: {
      enabled: typeof sentiment.enabled === "boolean" ? sentiment.enabled : DEFAULT_PROMPT_CONFIG.sentiment.enabled,
      mode: sentiment.mode === "score" ? "score" : "simple",
      showOverall: typeof sentiment.showOverall === "boolean" ? sentiment.showOverall : DEFAULT_PROMPT_CONFIG.sentiment.showOverall,
      showPerParticipant:
        typeof sentiment.showPerParticipant === "boolean"
          ? sentiment.showPerParticipant
          : DEFAULT_PROMPT_CONFIG.sentiment.showPerParticipant,
      showIntensity:
        typeof sentiment.showIntensity === "boolean" ? sentiment.showIntensity : DEFAULT_PROMPT_CONFIG.sentiment.showIntensity,
    },
  };
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
    promptConfig: normalizePromptConfig(agent.config?.extraConfig),
  };
}

/** Analisa 1 minuto via Ollama (retorna MinuteInsight; não persiste). */
app.post("/api/meetings/analyze-minute", authMiddleware, async (req, res) => {
  try {
    const body = req.body as MeetingMinuteInput;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });
    if (!body.meetingContext || body.minuteNumber == null || !body.transcriptChunk) {
      return res.status(400).json({ error: "meetingContext, minuteNumber e transcriptChunk são obrigatórios" });
    }
    const agentProfile = await getAgentPromptProfile(userId, (req.body as { agentId?: string }).agentId);
    const result = await analyzeMeetingMinute({
      meetingContext: body.meetingContext,
      clientContext: body.clientContext ?? "",
      minuteNumber: Number(body.minuteNumber),
      transcriptChunk: body.transcriptChunk,
    }, undefined, { agentProfile });
    res.json(result);
  } catch (err) {
    console.error("analyze-minute", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Erro ao analisar minuto" });
  }
});

/** GET Insights da Reunião: visão agregada + timeline (minuteInsights). */
app.get("/api/meetings/:id/insights/view", authMiddleware, async (req, res) => {
  try {
    const meetingId = req.params.id;
    const title = (req.query.title as string) || undefined;
    const sinceQuery = (req.query.since as string) || "";
    const since = sinceQuery ? new Date(sinceQuery) : undefined;
    const view = await getMeetingInsightsView(
      meetingId,
      title,
      since && !Number.isNaN(since.getTime()) ? since : undefined
    );
    res.json(view);
  } catch (err) {
    console.error("get insights", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Erro ao buscar insights" });
  }
});

/** POST Adiciona um minuto já analisado (ex.: front recebeu do /analyze-minute e envia aqui). */
app.post("/api/meetings/:id/insights/view/minutes", authMiddleware, async (req, res) => {
  try {
    const meetingId = req.params.id;
    const insight = req.body as MinuteInsight;
    const title = (req.body.title as string) || undefined;
    if (insight.minute == null || !insight.summary) {
      return res.status(400).json({ error: "minute e summary são obrigatórios" });
    }
    await saveMinuteInsight(meetingId, insight, title, req.userId);
    const view = await getMeetingInsightsView(meetingId, title);
    res.json(view);
  } catch (err) {
    console.error("save minute insight", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Erro ao salvar minuto" });
  }
});

/** POST Analisa 1 minuto com Ollama e persiste no meeting (fluxo completo). */
app.post("/api/meetings/:id/insights/view/analyze-minute", authMiddleware, async (req, res) => {
  try {
    const meetingId = req.params.id;
    const body = req.body as {
      meetingContext: string;
      transcriptChunk: string;
      minuteNumber: number;
      title?: string;
      agentId?: string;
    };
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });
    if (!body.meetingContext || body.minuteNumber == null || !body.transcriptChunk) {
      return res.status(400).json({ error: "meetingContext, minuteNumber e transcriptChunk são obrigatórios" });
    }
    const agentProfile = await getAgentPromptProfile(userId, body.agentId);
    const insight = await analyzeMeetingMinute({
      meetingContext: body.meetingContext,
      minuteNumber: Number(body.minuteNumber),
      transcriptChunk: body.transcriptChunk,
    }, undefined, { agentProfile });
    await saveMinuteInsight(meetingId, insight, body.title, req.userId, body.transcriptChunk);
    const view = await getMeetingInsightsView(meetingId, body.title);
    res.json(view);
  } catch (err) {
    console.error("analyze-minute (persist)", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Erro ao analisar minuto" });
  }
});

/** PATCH Marca tarefa como feita/não feita. */
app.patch("/api/meetings/:id/insights/view/tasks", authMiddleware, async (req, res) => {
  try {
    const meetingId = req.params.id;
    const { taskText, done } = req.body as { taskText: string; done: boolean };
    if (taskText == null || done === undefined) {
      return res.status(400).json({ error: "taskText e done são obrigatórios" });
    }
    await setTaskDone(meetingId, taskText, !!done);
    const view = await getMeetingInsightsView(meetingId);
    res.json(view);
  } catch (err) {
    console.error("set task done", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Erro ao atualizar tarefa" });
  }
});

/**
 * POST /api/meetings/:id/audio-chunk
 * Recebe chunk de áudio (multipart), transcreve com Whisper e gera insights com Ollama.
 * Form-data: audio (file), meetingContext (string), minuteNumber (number), title (string)
 */
app.post("/api/meetings/:id/audio-chunk", authMiddleware, audioUpload.single("audio"), handleAudioChunk);

/** Modo 2: Um turno do simulador de vendas */
app.post("/api/training/simulator/turn", authMiddleware, async (req, res) => {
  try {
    const body = req.body as SalesSimulatorInput;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });
    if (!body.scenario || !body.lastSalesMessage) {
      return res.status(400).json({ error: "scenario e lastSalesMessage são obrigatórios" });
    }
    const agentProfile = await getAgentPromptProfile(userId, (req.body as { agentId?: string }).agentId);
    const result = await runSalesSimulatorTurn({
      scenario: body.scenario,
      conversationHistory: body.conversationHistory ?? [],
      lastSalesMessage: body.lastSalesMessage,
    }, undefined, { agentProfile });
    res.json(result);
  } catch (err) {
    console.error("simulator/turn", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Erro no simulador" });
  }
});

/** Modo 3: Avaliar resposta a uma objeção */
app.post("/api/training/objections/evaluate", authMiddleware, async (req, res) => {
  try {
    const body = req.body as ObjectionEvaluationInput;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });
    if (!body.objection || !body.salesRepResponse) {
      return res.status(400).json({ error: "objection e salesRepResponse são obrigatórios" });
    }
    const agentProfile = await getAgentPromptProfile(userId, (req.body as { agentId?: string }).agentId);
    const result = await evaluateObjectionAnswer({
      objection: body.objection,
      salesRepResponse: body.salesRepResponse,
    }, undefined, { agentProfile });
    res.json(result);
  } catch (err) {
    console.error("objections/evaluate", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Erro ao avaliar objeção" });
  }
});

/** Modo 4: Resumo para o dashboard de Treinamentos */
app.post("/api/training/dashboard/summary", async (req, res) => {
  try {
    const body = req.body as TrainingDashboardInput;
    const result = await generateTrainingDashboardSummary({
      scoresByModule: body.scoresByModule ?? [],
      recentFeedback: body.recentFeedback ?? [],
      simulationHistory: body.simulationHistory ?? [],
    });
    res.json(result);
  } catch (err) {
    console.error("dashboard/summary", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Erro ao gerar resumo" });
  }
});

app.use("/api", buildApiRouter());

app.get("/api/health", (_req, res) => {
  const openaiBase = process.env.OPENAI_BASE_URL?.trim();
  res.json({
    ok: true,
    llmMode: openaiBase ? "openai_compat" : "ollama_native",
    openaiBaseUrl: openaiBase || null,
    ollamaUrl: process.env.OLLAMA_URL ?? "http://localhost:11434",
    defaultModel: process.env.OLLAMA_MODEL ?? "llama3.2",
  });
});

app.listen(PORT, () => {
  console.log(`MinuteIO server running at http://localhost:${PORT}`);
  console.log(
    "Endpoints: POST /api/auth/register, POST /api/auth/login, GET/POST/PUT/DELETE /api/posts, POST /api/meetings/analyze-minute, /api/training/simulator/turn, /api/training/objections/evaluate, /api/training/dashboard/summary"
  );
});
