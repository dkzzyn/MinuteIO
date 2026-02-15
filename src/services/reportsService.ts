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

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

// Onde plugar dados reais: trocar mocks por chamadas HTTP aqui
export async function getReportsKpis(): Promise<Kpis> {
  await delay(200);
  return {
    totalMeetings: 12,
    totalMeetingsDelta: 12,
    avgDurationMinutes: 32,
    avgDurationDelta: -5,
    positiveSentiment: 68,
    winRate: 42,
    winRateDelta: 8
  };
}

// IDs alinhados com mock de detalhes (m1..m5) para navegação /meetings/:id
export async function getMeetingsHistory(): Promise<MeetingHistoryItem[]> {
  await delay(250);
  const now = Date.now();
  const iso = (offsetDays: number) => new Date(now - offsetDays * 86400000).toISOString();
  return [
    { id: "m1", clientName: "Loja Alpha", title: "Discovery de Integração", date: iso(1), durationMinutes: 30, sentimentScore: 72, outcome: "Em andamento", nextStepDefined: true, meetingType: "discovery", talkTimePct: 45, clientTimePct: 55 },
    { id: "m2", clientName: "SaaS Beta", title: "Demo Funcional", date: iso(2), durationMinutes: 45, sentimentScore: 65, outcome: "Won", nextStepDefined: true, meetingType: "demo", talkTimePct: 58, clientTimePct: 42 },
    { id: "m3", clientName: "Retail MX", title: "Propuesta Comercial", date: iso(3), durationMinutes: 28, sentimentScore: 48, outcome: "Lost", nextStepDefined: false, meetingType: "closing", talkTimePct: 62, clientTimePct: 38 },
    { id: "m4", clientName: "Startup Gamma", title: "Closing Call", date: iso(4), durationMinutes: 35, sentimentScore: 80, outcome: "Won", nextStepDefined: true, meetingType: "closing", talkTimePct: 42, clientTimePct: 58 },
    { id: "m5", clientName: "Agência Delta", title: "Discovery Onboarding", date: iso(5), durationMinutes: 40, sentimentScore: 55, outcome: "Sem decisão", nextStepDefined: true, meetingType: "discovery", talkTimePct: 50, clientTimePct: 50 }
  ];
}

// Dados para gráfico de evolução de reuniões (por dia/semana)
export type MeetingsByDayPoint = { label: string; count: number; date: string };

export async function getMeetingsByDay(): Promise<MeetingsByDayPoint[]> {
  await delay(150);
  const now = new Date();
  const fmt = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  return [
    { label: fmt(new Date(now.getTime() - 6 * 86400000)), count: 2, date: "" },
    { label: fmt(new Date(now.getTime() - 5 * 86400000)), count: 1, date: "" },
    { label: fmt(new Date(now.getTime() - 4 * 86400000)), count: 3, date: "" },
    { label: fmt(new Date(now.getTime() - 3 * 86400000)), count: 2, date: "" },
    { label: fmt(new Date(now.getTime() - 2 * 86400000)), count: 4, date: "" },
    { label: fmt(new Date(now.getTime() - 1 * 86400000)), count: 2, date: "" },
    { label: "Hoje", count: 1, date: "" }
  ];
}

// Resultado das reuniões para pizza/donut
export type OutcomeSlice = { name: string; value: number; fill: string };

export async function getOutcomeDistribution(): Promise<OutcomeSlice[]> {
  await delay(150);
  return [
    { name: "Ganha", value: 5, fill: "var(--chart-positive)" },
    { name: "Perdida", value: 2, fill: "var(--chart-negative)" },
    { name: "Em andamento", value: 3, fill: "var(--accent-gold)" },
    { name: "Sem decisão", value: 2, fill: "var(--text-secondary)" }
  ];
}

// Sentimento ao longo do tempo (por reunião ou dia)
export type SentimentOverTimePoint = { label: string; value: number };

export async function getSentimentOverTime(): Promise<SentimentOverTimePoint[]> {
  await delay(150);
  return [
    { label: "Seg", value: 62 },
    { label: "Ter", value: 58 },
    { label: "Qua", value: 71 },
    { label: "Qui", value: 65 },
    { label: "Sex", value: 78 },
    { label: "Sáb", value: 55 },
    { label: "Dom", value: 68 }
  ];
}

// Talk-to-listen ratio por tipo de reunião (ideal 40–60%)
export type TalkToListenBar = { type: string; sellerPct: number; clientPct: number };

export async function getTalkToListenByType(): Promise<TalkToListenBar[]> {
  await delay(150);
  return [
    { type: "Discovery", sellerPct: 42, clientPct: 58 },
    { type: "Demo", sellerPct: 58, clientPct: 42 },
    { type: "Closing", sellerPct: 52, clientPct: 48 }
  ];
}

export type { Kpis, MeetingHistoryItem };
