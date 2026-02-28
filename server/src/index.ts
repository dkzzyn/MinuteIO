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
} from "../ollama/types";
import {
  saveMinuteInsight,
  getMeetingInsightsView,
  setTaskDone,
} from "../meetingInsightsService";
import { handleAudioChunk, getAudioUploadConfig } from "../transcription/audioChunkHandler";
import { buildApiRouter } from "./presentation/http/routes";
import { authMiddleware } from "./presentation/http/middlewares/authMiddleware";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

const audioUpload = multer(getAudioUploadConfig());

/** Analisa 1 minuto via Ollama (retorna MinuteInsight; não persiste). */
app.post("/api/meetings/analyze-minute", async (req, res) => {
  try {
    const body = req.body as MeetingMinuteInput;
    if (!body.meetingContext || body.minuteNumber == null || !body.transcriptChunk) {
      return res.status(400).json({ error: "meetingContext, minuteNumber e transcriptChunk são obrigatórios" });
    }
    const result = await analyzeMeetingMinute({
      meetingContext: body.meetingContext,
      clientContext: body.clientContext ?? "",
      minuteNumber: Number(body.minuteNumber),
      transcriptChunk: body.transcriptChunk,
    });
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
    const view = await getMeetingInsightsView(meetingId, title);
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
    const body = req.body as { meetingContext: string; transcriptChunk: string; minuteNumber: number; title?: string };
    if (!body.meetingContext || body.minuteNumber == null || !body.transcriptChunk) {
      return res.status(400).json({ error: "meetingContext, minuteNumber e transcriptChunk são obrigatórios" });
    }
    const insight = await analyzeMeetingMinute({
      meetingContext: body.meetingContext,
      minuteNumber: Number(body.minuteNumber),
      transcriptChunk: body.transcriptChunk,
    });
    await saveMinuteInsight(meetingId, insight, body.title, req.userId);
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
app.post("/api/training/simulator/turn", async (req, res) => {
  try {
    const body = req.body as SalesSimulatorInput;
    if (!body.scenario || !body.lastSalesMessage) {
      return res.status(400).json({ error: "scenario e lastSalesMessage são obrigatórios" });
    }
    const result = await runSalesSimulatorTurn({
      scenario: body.scenario,
      conversationHistory: body.conversationHistory ?? [],
      lastSalesMessage: body.lastSalesMessage,
    });
    res.json(result);
  } catch (err) {
    console.error("simulator/turn", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Erro no simulador" });
  }
});

/** Modo 3: Avaliar resposta a uma objeção */
app.post("/api/training/objections/evaluate", async (req, res) => {
  try {
    const body = req.body as ObjectionEvaluationInput;
    if (!body.objection || !body.salesRepResponse) {
      return res.status(400).json({ error: "objection e salesRepResponse são obrigatórios" });
    }
    const result = await evaluateObjectionAnswer({
      objection: body.objection,
      salesRepResponse: body.salesRepResponse,
    });
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
  res.json({ ok: true, ollama: "backend expects Ollama at " + (process.env.OLLAMA_URL ?? "http://localhost:11434") });
});

app.listen(PORT, () => {
  console.log(`MinuteIO server running at http://localhost:${PORT}`);
  console.log(
    "Endpoints: POST /api/auth/register, POST /api/auth/login, GET/POST/PUT/DELETE /api/posts, POST /api/meetings/analyze-minute, /api/training/simulator/turn, /api/training/objections/evaluate, /api/training/dashboard/summary"
  );
});
