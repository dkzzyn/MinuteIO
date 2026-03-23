import { getMeetingDetails, listMeetings } from "./api";
import {
  fetchReportsKpis,
  fetchMeetingsByDay,
  fetchOutcomeDistribution,
  fetchSentimentOverTime,
  fetchTalkToListen,
  fetchMeetingsHistory,
} from "./reportsApi";

export type MeetingOutcome = "Won" | "Lost" | "Em andamento" | "Sem decisão";

type Kpis = {
  totalMeetings: number;
  totalMeetingsDelta: number; // porcentagem, positiva/negativa
  avgDurationMinutes: number;
  avgDurationDelta: number; // porcentagem
  positiveSentiment: number; // 0-100
  winRate: number; // 0-100
  winRateDelta?: number;
};

type MeetingHistoryItem = {
  id: string;
  clientName: string;
  title: string;
  date: string; // ISO string
  durationMinutes: number;
  sentimentScore?: number; // 0-100
  outcome?: MeetingOutcome;
  nextStepDefined?: boolean;
  meetingType?: "discovery" | "demo" | "closing" | "outro";
  talkTimePct?: number; // % tempo vendedor
  clientTimePct?: number; // % tempo cliente
};

export async function getReportsKpis(): Promise<Kpis> {
  const fromApi = await fetchReportsKpis();
  if (fromApi) return fromApi;
  const meetings = await listMeetings();
  const totalMeetings = meetings.length;
  const avgDurationMinutes = totalMeetings
    ? Math.round(meetings.reduce((acc, m) => acc + (m.durationMinutes ?? 0), 0) / totalMeetings)
    : 0;
  const wonCount = meetings.filter((m) => m.result === "Won").length;
  const winRate = totalMeetings ? Math.round((wonCount / totalMeetings) * 100) : 0;
  const positiveSentiment = 65;

  return {
    totalMeetings,
    totalMeetingsDelta: 0,
    avgDurationMinutes,
    avgDurationDelta: 0,
    positiveSentiment,
    winRate,
    winRateDelta: 0,
  };
}

export async function getMeetingsHistory(): Promise<MeetingHistoryItem[]> {
  const apiRows = await fetchMeetingsHistory(100);
  if (apiRows?.length) {
    return apiRows.map((r) => ({
      id: r.id,
      clientName: r.clientName,
      title: r.title,
      date: r.date,
      durationMinutes: r.durationMinutes,
      outcome: (r.outcome as MeetingHistoryItem["outcome"]) ?? undefined,
      meetingType: (r.meetingType as MeetingHistoryItem["meetingType"]) ?? "outro",
    }));
  }
  const meetings = await listMeetings();
  const details = await Promise.all(meetings.slice(0, 20).map((m) => getMeetingDetails(m.id)));
  const detailsMap = new Map(details.filter(Boolean).map((d) => [d!.id, d!]));

  return meetings.map((m) => {
    const d = detailsMap.get(m.id);
    return {
      id: m.id,
      clientName: m.participants[0]?.split("(")[0]?.trim() || "Cliente",
      title: m.title,
      date: m.datetime,
      durationMinutes: m.durationMinutes,
      sentimentScore: d?.sentimentAverage ?? undefined,
      outcome: m.result,
      nextStepDefined: Boolean(d?.nextStepSuggested),
      meetingType: (m.pipeline_stage as MeetingHistoryItem["meetingType"]) ?? "outro",
      talkTimePct: d?.talkTimePct,
      clientTimePct: d?.clientTimePct,
    };
  });
}

// Dados para gráfico de evolução de reuniões (por dia/semana)
export type MeetingsByDayPoint = { label: string; count: number; date: string };

export async function getMeetingsByDay(): Promise<MeetingsByDayPoint[]> {
  const fromApi = await fetchMeetingsByDay();
  if (fromApi) return fromApi;
  const meetings = await listMeetings();
  const byDay = new Map<string, number>();
  meetings.forEach((m) => {
    const d = new Date(m.datetime);
    const key = d.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  });
  return Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({
      date,
      count,
      label: new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
    }));
}

// Resultado das reuniões para pizza/donut
export type OutcomeSlice = { name: string; value: number; fill: string };

export async function getOutcomeDistribution(): Promise<OutcomeSlice[]> {
  const fromApi = await fetchOutcomeDistribution();
  if (fromApi) return fromApi;
  const meetings = await listMeetings();
  const counts = {
    "Ganha": meetings.filter((m) => m.result === "Won").length,
    "Perdida": meetings.filter((m) => m.result === "Lost").length,
    "Em andamento": meetings.filter((m) => m.result === "Em andamento").length,
    "Sem decisão": meetings.filter((m) => m.result === "Sem decisão").length,
  };
  return [
    { name: "Ganha", value: counts["Ganha"], fill: "var(--chart-positive)" },
    { name: "Perdida", value: counts["Perdida"], fill: "var(--chart-negative)" },
    { name: "Em andamento", value: counts["Em andamento"], fill: "var(--accent-gold)" },
    { name: "Sem decisão", value: counts["Sem decisão"], fill: "var(--text-secondary)" },
  ];
}

// Sentimento ao longo do tempo (por reunião ou dia)
export type SentimentOverTimePoint = { label: string; value: number };

export async function getSentimentOverTime(): Promise<SentimentOverTimePoint[]> {
  const fromApi = await fetchSentimentOverTime();
  if (fromApi?.length) return fromApi;
  const meetings = await listMeetings();
  const details = await Promise.all(meetings.slice(0, 12).map((m) => getMeetingDetails(m.id)));
  return details
    .filter(Boolean)
    .map((d) => ({
      label: new Date(d!.datetime).toLocaleDateString("pt-BR", { weekday: "short" }),
      value: d!.sentimentAverage,
    }));
}

// Talk-to-listen ratio por tipo de reunião (ideal 40–60%)
export type TalkToListenBar = { type: string; sellerPct: number; clientPct: number };

export async function getTalkToListenByType(): Promise<TalkToListenBar[]> {
  const fromApi = await fetchTalkToListen();
  if (fromApi?.length) {
    return fromApi.map(({ type, sellerPct, clientPct }) => ({ type, sellerPct, clientPct }));
  }
  const meetings = await listMeetings();
  const details = await Promise.all(meetings.map((m) => getMeetingDetails(m.id)));
  const grouped = new Map<string, { seller: number; client: number; count: number }>();
  meetings.forEach((m) => {
    const d = details.find((x) => x?.id === m.id);
    const key = m.pipeline_stage;
    const current = grouped.get(key) ?? { seller: 0, client: 0, count: 0 };
    grouped.set(key, {
      seller: current.seller + (d?.talkTimePct ?? 50),
      client: current.client + (d?.clientTimePct ?? 50),
      count: current.count + 1,
    });
  });
  return Array.from(grouped.entries()).map(([type, acc]) => ({
    type: type[0].toUpperCase() + type.slice(1),
    sellerPct: Math.round(acc.seller / Math.max(1, acc.count)),
    clientPct: Math.round(acc.client / Math.max(1, acc.count)),
  }));
}

export type { Kpis, MeetingHistoryItem };
