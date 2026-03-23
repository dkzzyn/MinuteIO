import { apiRequest } from "../infrastructure/http/api";

const AUTH_STORAGE_KEY = "minuteio_auth_token";

function getToken(): string | null {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY);
  } catch {
    return null;
  }
}

export type ReportsKpis = {
  totalMeetings: number;
  totalMeetingsDelta: number;
  avgDurationMinutes: number;
  avgDurationDelta: number;
  positiveSentiment: number;
  winRate: number;
  winRateDelta?: number;
};

export async function fetchReportsKpis(): Promise<ReportsKpis | null> {
  const token = getToken();
  if (!token) return null;
  try {
    return await apiRequest<ReportsKpis>("/api/reports/kpis", { token });
  } catch {
    return null;
  }
}

export async function fetchMeetingsByDay(): Promise<
  { label: string; count: number; date: string }[] | null
> {
  const token = getToken();
  if (!token) return null;
  try {
    return await apiRequest<{ label: string; count: number; date: string }[]>("/api/reports/meetings-by-day", {
      token,
    });
  } catch {
    return null;
  }
}

export async function fetchOutcomeDistribution(): Promise<
  { name: string; value: number; fill: string }[] | null
> {
  const token = getToken();
  if (!token) return null;
  try {
    return await apiRequest<{ name: string; value: number; fill: string }[]>("/api/reports/outcome-distribution", {
      token,
    });
  } catch {
    return null;
  }
}

export async function fetchSentimentOverTime(): Promise<{ label: string; value: number }[] | null> {
  const token = getToken();
  if (!token) return null;
  try {
    return await apiRequest<{ label: string; value: number }[]>("/api/reports/sentiment-over-time", { token });
  } catch {
    return null;
  }
}

export async function fetchTalkToListen(): Promise<
  { type: string; sellerPct: number; clientPct: number }[] | null
> {
  const token = getToken();
  if (!token) return null;
  try {
    return await apiRequest<{ type: string; sellerPct: number; clientPct: number }[]>("/api/reports/talk-to-listen", {
      token,
    });
  } catch {
    return null;
  }
}

export type HistoryApiRow = {
  id: string;
  clientName: string;
  title: string;
  date: string;
  durationMinutes: number;
  outcome?: string;
  meetingType?: string;
};

export async function fetchMeetingsHistory(limit?: number): Promise<HistoryApiRow[] | null> {
  const token = getToken();
  if (!token) return null;
  const q = limit != null ? `?limit=${limit}` : "";
  try {
    return await apiRequest<HistoryApiRow[]>(`/api/reports/history${q}`, { token });
  } catch {
    return null;
  }
}
