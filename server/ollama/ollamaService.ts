/**
 * LLM backend: Ollama nativo (/api/chat) OU proxy OpenAI-compat (ex.: llama-swap).
 * Se OPENAI_BASE_URL estiver definido (ex.: http://localhost:8080/v1), usa Chat Completions.
 * Caso contrário, usa OLLAMA_URL + /api/chat.
 */

import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { LlamaSwapOpenAIClient } from "../src/infrastructure/llm/LlamaSwapOpenAIClient.js";
import {
  PROMPT_MEETING_ANALYSIS,
  PROMPT_SALES_SIMULATOR,
  PROMPT_OBJECTION_TRAINING,
  PROMPT_TRAINING_DASHBOARD_SUMMARY,
} from "./prompts";
import type {
  MeetingMinuteInput,
  MinuteInsight,
  SalesSimulatorInput,
  SalesSimulatorOutput,
  ObjectionEvaluationInput,
  ObjectionEvaluationOutput,
  TrainingDashboardInput,
  TrainingDashboardOutput,
  AgentPromptProfile,
} from "./types";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL ?? "llama3.2";

function useOpenAICompat(): boolean {
  return Boolean(process.env.OPENAI_BASE_URL?.trim());
}

/** Collapse multiple system messages into one (OpenAI-style APIs expect a single system). */
function toOpenAIChatMessages(messages: OllamaChatMessage[]): ChatCompletionMessageParam[] {
  const systemParts: string[] = [];
  const out: ChatCompletionMessageParam[] = [];
  for (const m of messages) {
    if (m.role === "system") {
      systemParts.push(m.content);
    } else {
      out.push({ role: m.role, content: m.content });
    }
  }
  if (systemParts.length > 0) {
    out.unshift({ role: "system", content: systemParts.join("\n\n") });
  }
  return out;
}

let openAICompatClient: LlamaSwapOpenAIClient | null = null;

function getOpenAICompatClient(): LlamaSwapOpenAIClient {
  if (!openAICompatClient) {
    let baseUrl = process.env.OPENAI_BASE_URL!.trim().replace(/\/$/, "");
    if (!baseUrl.endsWith("/v1")) {
      baseUrl = `${baseUrl}/v1`;
    }
    openAICompatClient = new LlamaSwapOpenAIClient({
      baseUrl,
      apiKey: process.env.OPENAI_API_KEY ?? "sk-local-no-key",
      defaultModel: DEFAULT_MODEL,
    });
  }
  return openAICompatClient;
}

export interface OllamaChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OllamaChatResponse {
  message: { role: string; content: string };
  done: boolean;
}

/**
 * Chamada genérica ao Ollama POST /api/chat.
 * stream: false para receber a resposta completa e parsear JSON.
 */
export async function callOllamaChat(
  model: string,
  messages: OllamaChatMessage[],
  options?: { stream?: boolean }
): Promise<OllamaChatResponse> {
  if (options?.stream) {
    throw new Error("stream=true is not supported in callOllamaChat; use Ollama direto ou implemente stream separado.");
  }

  if (useOpenAICompat()) {
    const client = getOpenAICompatClient();
    const content = await client.chat({
      model,
      messages: toOpenAIChatMessages(messages),
      temperature: 0.2,
    });
    return {
      message: { role: "assistant", content },
      done: true,
    };
  }

  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ollama error ${res.status}: ${text}`);
  }

  return res.json() as Promise<OllamaChatResponse>;
}

/**
 * Extrai JSON do texto de resposta (pode vir com markdown ou texto em volta).
 */
function extractJson<T>(content: string): T {
  const trimmed = content.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}") + 1;
  if (start === -1 || end <= start) throw new Error("No JSON found in response: " + trimmed.slice(0, 200));
  const jsonStr = trimmed.slice(start, end);
  return JSON.parse(jsonStr) as T;
}

function normalizeMinuteInsight(input: Partial<MinuteInsight>, minuteFallback: number, rawText: string): MinuteInsight {
  const sentiment = input.sentiment === "positive" || input.sentiment === "negative" ? input.sentiment : "neutral";
  const score =
    typeof input.score === "number" && Number.isFinite(input.score)
      ? Math.max(-5, Math.min(5, input.score))
      : sentiment === "positive"
        ? 2
        : sentiment === "negative"
          ? -2
          : 0;

  return {
    minute: typeof input.minute === "number" && input.minute > 0 ? Math.floor(input.minute) : minuteFallback,
    summary: typeof input.summary === "string" ? input.summary : "",
    decisions: Array.isArray(input.decisions) ? input.decisions.map(String) : [],
    tasks: Array.isArray(input.tasks)
      ? input.tasks
          .filter((task) => typeof task?.text === "string")
          .map((task) => ({ text: String(task.text), done: Boolean(task.done) }))
      : [],
    key_points: Array.isArray(input.key_points) ? input.key_points.map(String) : [],
    sentiment,
    score,
    emotions: Array.isArray(input.emotions) ? input.emotions.map(String) : [],
    topics: Array.isArray(input.topics) ? input.topics.map(String) : [],
    raw_text: typeof input.raw_text === "string" ? input.raw_text : rawText,
  };
}

function buildAgentPromptInstruction(agentProfile?: AgentPromptProfile): string {
  const agentName = agentProfile?.agentName?.trim() || "Agente padrão";
  const sentimentTone = agentProfile?.sentimentTone?.trim() || "neutro";
  const salesAggressiveness = agentProfile?.salesAggressiveness?.trim() || "moderado";
  const objectionTips = agentProfile?.objectionTips ?? {};
  const promptConfig = agentProfile?.promptConfig ?? {
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

  return `\n\nContexto do agente (aplicar como diretriz de comportamento):
- Agente: ${agentName}
- Tom/sentimento: ${sentimentTone}
- Agressividade de vendas: ${salesAggressiveness}
- Dicas de objeções (JSON): ${JSON.stringify(objectionTips)}
- Configuração de transcrição/sentimento (JSON): ${JSON.stringify(promptConfig)}`;
}

/** Modo 1: Análise da reunião de 1 em 1 minuto → MinuteInsight */
export async function analyzeMeetingMinute(
  input: MeetingMinuteInput,
  model: string = DEFAULT_MODEL,
  options?: { agentProfile?: AgentPromptProfile }
): Promise<MinuteInsight> {
  const userContent = `Reunião: ${input.meetingContext}
Minuto: ${input.minuteNumber}
Transcrição do minuto ${input.minuteNumber}:

${input.transcriptChunk}`;

  const res = await callOllamaChat(
    model,
    [
      { role: "system", content: PROMPT_MEETING_ANALYSIS },
      { role: "system", content: buildAgentPromptInstruction(options?.agentProfile) },
      { role: "user", content: userContent },
    ],
    { stream: false }
  );

  const content = res.message?.content ?? "";
  const parsed = extractJson<Partial<MinuteInsight>>(content);
  return normalizeMinuteInsight(parsed, input.minuteNumber, input.transcriptChunk);
}

/** Modo 2: Um turno do simulador de vendas (cliente IA) */
export async function runSalesSimulatorTurn(
  input: SalesSimulatorInput,
  model: string = DEFAULT_MODEL,
  options?: { agentProfile?: AgentPromptProfile }
): Promise<SalesSimulatorOutput> {
  const historyText = input.conversationHistory
    .map((m) => `${m.role === "user" ? "Vendedor" : "Cliente"}: ${m.content}`)
    .join("\n");

  const userContent = `Cenário: ${input.scenario}

${historyText ? `Histórico da conversa:\n${historyText}\n\n` : ""}Última mensagem do vendedor: "${input.lastSalesMessage}"

Continue a conversa como cliente e gere as sugestões e feedback.`;

  const res = await callOllamaChat(
    model,
    [
      { role: "system", content: PROMPT_SALES_SIMULATOR },
      { role: "system", content: buildAgentPromptInstruction(options?.agentProfile) },
      { role: "user", content: userContent },
    ],
    { stream: false }
  );

  const content = res.message?.content ?? "";
  return extractJson<SalesSimulatorOutput>(content);
}

/** Modo 3: Avaliar resposta do vendedor a uma objeção */
export async function evaluateObjectionAnswer(
  input: ObjectionEvaluationInput,
  model: string = DEFAULT_MODEL,
  options?: { agentProfile?: AgentPromptProfile }
): Promise<ObjectionEvaluationOutput> {
  const userContent = `Objeção: "${input.objection}"
Resposta do vendedor: "${input.salesRepResponse}"`;

  const res = await callOllamaChat(
    model,
    [
      { role: "system", content: PROMPT_OBJECTION_TRAINING },
      { role: "system", content: buildAgentPromptInstruction(options?.agentProfile) },
      { role: "user", content: userContent },
    ],
    { stream: false }
  );

  const content = res.message?.content ?? "";
  return extractJson<ObjectionEvaluationOutput>(content);
}

/** Modo 4: Resumo para o dashboard de Treinamentos */
export async function generateTrainingDashboardSummary(
  input: TrainingDashboardInput,
  model: string = DEFAULT_MODEL
): Promise<TrainingDashboardOutput> {
  const userContent = `Dados do vendedor/time em JSON:

${JSON.stringify(input, null, 2)}

Gere o resumo geral, 3 pontos fortes e 3 oportunidades de melhoria em JSON.`;

  const res = await callOllamaChat(
    model,
    [
      { role: "system", content: PROMPT_TRAINING_DASHBOARD_SUMMARY },
      { role: "user", content: userContent },
    ],
    { stream: false }
  );

  const content = res.message?.content ?? "";
  return extractJson<TrainingDashboardOutput>(content);
}
