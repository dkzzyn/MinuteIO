/**
 * Cliente para a API do backend MinuteIO que usa Ollama.
 * Configure VITE_OLLAMA_API_URL (ex.: http://localhost:3001) no .env.
 * Se o backend não estiver disponível, as páginas podem continuar com mock.
 */

const BASE_URL = import.meta.env.VITE_OLLAMA_API_URL ?? "http://localhost:3001";
const AUTH_STORAGE_KEY = "minuteio_auth_token";

function tokenOrThrow(): string {
  const token = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!token) throw new Error("Usuário não autenticado.");
  return token;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const token = tokenOrThrow();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/** Payload para análise de 1 minuto de reunião */
export interface MeetingMinuteInput {
  meetingContext: string;
  clientContext?: string;
  minuteNumber: number;
  transcriptChunk: string;
  agentId?: string;
}

/** Resultado por minuto (Ollama) – ver meetingInsightsApi para visão agregada. */
export interface MinuteInsightOutput {
  minute: number;
  summary: string;
  decisions: string[];
  tasks: { text: string; done: boolean }[];
  key_points: string[];
  sentiment: "positive" | "neutral" | "negative";
}

/** Chama o backend para analisar um minuto de transcrição (Ollama). Retorna MinuteInsight; não persiste. */
export function analyzeMeetingMinute(body: MeetingMinuteInput): Promise<MinuteInsightOutput> {
  return post("/api/meetings/analyze-minute", body);
}

/** Payload para um turno do simulador de vendas */
export interface SalesSimulatorTurnInput {
  scenario: string;
  conversationHistory?: { role: "user" | "assistant"; content: string }[];
  lastSalesMessage: string;
  agentId?: string;
}

export interface SuggestionItem {
  strategy: string;
  text: string;
}

export interface SalesSimulatorTurnOutput {
  client_message: string;
  suggestions: SuggestionItem[];
  coach_feedback: string;
}

/** Chama o backend para um turno do simulador (cliente IA). */
export function runSalesSimulatorTurn(body: SalesSimulatorTurnInput): Promise<SalesSimulatorTurnOutput> {
  return post("/api/training/simulator/turn", body);
}

/** Payload para avaliar resposta a uma objeção */
export interface ObjectionEvaluateInput {
  objection: string;
  salesRepResponse: string;
  agentId?: string;
}

export interface ObjectionEvaluateOutput {
  score: number;
  analysis: string;
  suggestions: SuggestionItem[];
}

/** Chama o backend para avaliar a resposta do vendedor à objeção. */
export function evaluateObjectionAnswer(body: ObjectionEvaluateInput): Promise<ObjectionEvaluateOutput> {
  return post("/api/training/objections/evaluate", body);
}

/** Payload para resumo do dashboard de treinamentos */
export interface TrainingDashboardSummaryInput {
  scoresByModule?: { moduleName: string; averageScore: number; completionRate: number }[];
  recentFeedback?: string[];
  simulationHistory?: { scenario: string; score: number; date: string }[];
}

export interface TrainingDashboardSummaryOutput {
  summary: string;
  strengths: string[];
  opportunities: string[];
}

/** Chama o backend para gerar resumo do dashboard (Ollama). */
export function generateTrainingDashboardSummary(body: TrainingDashboardSummaryInput): Promise<TrainingDashboardSummaryOutput> {
  return post("/api/training/dashboard/summary", body);
}

/** Verifica se o backend está no ar. */
export function healthCheck(): Promise<{ ok: boolean }> {
  return fetch(`${BASE_URL}/api/health`).then((r) => r.json());
}
