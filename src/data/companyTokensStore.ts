import type { CompanyTokens, TokenUsageEntry } from "../types/companyTokens";

function iso(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

function dateStr(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

/** Mock: dados de tokens da empresa (conta Arctures) */
export const companyTokens: CompanyTokens = {
  companyId: "co1",
  companyName: "Arctures",
  planName: "MinuteIO Pro",
  tokensTotalPerCycle: 10000,
  tokensUsed: 2500,
  cycleStart: "2026-02-01",
  cycleEnd: "2026-02-28",
  renewalDate: "2026-03-01",
  overagePricePer1000: 50,
  usageByDay: [
    { date: dateStr(14), tokens: 0 },
    { date: dateStr(13), tokens: 320 },
    { date: dateStr(12), tokens: 180 },
    { date: dateStr(11), tokens: 500 },
    { date: dateStr(10), tokens: 0 },
    { date: dateStr(9), tokens: 450 },
    { date: dateStr(8), tokens: 220 },
    { date: dateStr(7), tokens: 0 },
    { date: dateStr(6), tokens: 330 },
    { date: dateStr(5), tokens: 0 },
    { date: dateStr(4), tokens: 0 },
    { date: dateStr(3), tokens: 800 },
    { date: dateStr(2), tokens: 0 },
    { date: dateStr(1), tokens: 0 },
    { date: dateStr(0), tokens: 0 }
  ]
};

/** Mock: relatório de consumo por reunião/insight */
export const tokenUsageEntries: TokenUsageEntry[] = [
  { id: "te1", companyId: "co1", userId: "u1", userName: "João", clientId: "c1", clientName: "Loja Alpha", meetingTitle: "Onboarding Cliente X", type: "MEETING_SUMMARY", tokens: 850, createdAt: iso(0) },
  { id: "te2", companyId: "co1", userId: "u1", userName: "João", clientId: "c1", clientName: "Loja Alpha", meetingTitle: "Discovery de Integração", type: "INSIGHT", tokens: 500, createdAt: iso(1) },
  { id: "te3", companyId: "co1", userId: "u2", userName: "Maria", clientId: "c2", clientName: "SaaS Beta", meetingTitle: "Demo funcional", type: "MEETING_SUMMARY", tokens: 620, createdAt: iso(1) },
  { id: "te4", companyId: "co1", userId: "u1", userName: "João", clientId: "c1", clientName: "Loja Alpha", type: "EMAIL_FOLLOWUP", tokens: 180, createdAt: iso(2) },
  { id: "te5", companyId: "co1", userId: "u2", userName: "Maria", clientId: "c2", clientName: "SaaS Beta", meetingTitle: "Reunião de diagnóstico", type: "GERACAO_ATA", tokens: 800, createdAt: iso(3) },
  { id: "te6", companyId: "co1", userId: "u1", userName: "João", clientId: "c1", clientName: "Loja Alpha", type: "INSIGHT", tokens: 1200, createdAt: iso(5) },
  { id: "te7", companyId: "co1", userId: "u3", userName: "Carlos", clientId: "c1", clientName: "Loja Alpha", meetingTitle: "Follow-up proposta", type: "MEETING_SUMMARY", tokens: 550, createdAt: iso(6) },
  { id: "te8", companyId: "co1", userId: "u2", userName: "Maria", type: "ANALISE_EMAIL", tokens: 100, createdAt: iso(8) }
];

const typeLabels: Record<TokenUsageEntry["type"], string> = {
  MEETING_SUMMARY: "Reunião resumida",
  INSIGHT: "Insight gerado",
  EMAIL_FOLLOWUP: "Follow-up automático",
  GERACAO_ATA: "Geração de ata",
  ANALISE_EMAIL: "Análise de e-mail",
  OUTRO: "Outro"
};

export function getTypeLabel(type: TokenUsageEntry["type"]): string {
  return typeLabels[type] ?? type;
}

export function getCompanyTokens(): CompanyTokens {
  return { ...companyTokens };
}

export function getTokenUsageEntries(): TokenUsageEntry[] {
  return [...tokenUsageEntries];
}
