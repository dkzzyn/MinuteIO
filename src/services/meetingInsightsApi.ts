/**
 * API de Insights da Reunião (blocos 1 em 1 minuto vindos do Ollama).
 * Base URL: VITE_OLLAMA_API_URL (ex.: http://localhost:3001).
 */

const BASE = import.meta.env.VITE_OLLAMA_API_URL ?? "http://localhost:3001";
const AUTH_STORAGE_KEY = "minuteio_auth_token";

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem(AUTH_STORAGE_KEY) : null;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export interface MinuteInsight {
  minute: number;
  summary: string;
  decisions: string[];
  tasks: { text: string; done: boolean }[];
  key_points: string[];
  sentiment: "positive" | "neutral" | "negative";
  score: number;
  emotions: string[];
  topics: string[];
  raw_text?: string;
}

export interface MeetingChunkAnalysis {
  meetingId: string;
  chunkIndex: number;
  transcript: string;
  analysis: MinuteInsight;
  createdAt: string;
}

export interface MeetingInsightsView {
  title: string;
  realtimeSummary: string;
  mainDecisions: string[];
  tasks: { text: string; done: boolean }[];
  keyPoints: string[];
  minuteInsights: MinuteInsight[];
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    let msg = text;
    try {
      const json = JSON.parse(text) as { error?: string };
      if (typeof json.error === "string") msg = json.error;
    } catch (_) {}
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

async function patch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json() as Promise<T>;
}

async function del(path: string): Promise<void> {
  const res = await fetch(`${BASE}${path}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
}

/** GET Insights da Reunião (visão agregada + timeline). */
export function getMeetingInsights(meetingId: string, title?: string, since?: string): Promise<MeetingInsightsView> {
  const params = new URLSearchParams();
  if (title) params.set("title", title);
  if (since) params.set("since", since);
  const query = params.toString();
  return get(`/api/meetings/${meetingId}/insights/view${query ? `?${query}` : ""}`);
}

/** POST Analisa 1 minuto com Ollama e persiste; retorna a visão atualizada. */
export function analyzeAndSaveMinute(
  meetingId: string,
  params: { meetingContext: string; minuteNumber: number; transcriptChunk: string; title?: string; agentId?: string }
): Promise<MeetingInsightsView> {
  return post(`/api/meetings/${meetingId}/insights/view/analyze-minute`, params);
}

export function analyzeMeetingChunk(
  meetingId: string,
  params: {
    chunkIndex: number;
    transcript: string;
    meetingContext?: string;
    title?: string;
    agentId?: string;
  }
): Promise<MinuteInsight> {
  return post(`/api/meetings/${meetingId}/chunks`, params);
}

export function listMeetingChunks(meetingId: string): Promise<MeetingChunkAnalysis[]> {
  return get(`/api/meetings/${meetingId}/chunks`);
}

export function clearMeetingChunks(meetingId: string): Promise<void> {
  return del(`/api/meetings/${meetingId}/chunks`);
}

/** POST Adiciona um MinuteInsight já analisado. */
export function saveMinuteInsight(
  meetingId: string,
  insight: MinuteInsight,
  title?: string
): Promise<MeetingInsightsView> {
  return post(`/api/meetings/${meetingId}/insights/view/minutes`, { ...insight, title });
}

/** PATCH Marca tarefa como feita/não feita. */
export function setTaskDone(meetingId: string, taskText: string, done: boolean): Promise<MeetingInsightsView> {
  return patch(`/api/meetings/${meetingId}/insights/view/tasks`, { taskText, done });
}

/** POST Envia chunk de áudio para transcrição e análise. */
export async function sendAudioChunk(
  meetingId: string,
  audioBlob: Blob,
  params: { meetingContext: string; minuteNumber: number; title?: string }
): Promise<{
  meetingId: string;
  minuteNumber: number;
  transcription: string;
  insight: MinuteInsight | null;
  insightsView: MeetingInsightsView;
}> {
  const formData = new FormData();
  formData.append("audio", audioBlob, `chunk-${params.minuteNumber}.webm`);
  formData.append("meetingContext", params.meetingContext);
  formData.append("minuteNumber", String(params.minuteNumber));
  if (params.title) formData.append("title", params.title);

  const res = await fetch(`${BASE}/api/meetings/${meetingId}/audio-chunk`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    let msg = text;
    try {
      const json = JSON.parse(text) as { error?: string };
      if (typeof json.error === "string") msg = json.error;
    } catch {}
    throw new Error(msg);
  }

  return res.json();
}
