/**
 * Uso de tokens no nível da empresa (ex.: Arctures).
 * Cada reunião/insight consome um pedaço do saldo da empresa.
 */

export type TokenUsageType =
  | "MEETING_SUMMARY"
  | "INSIGHT"
  | "EMAIL_FOLLOWUP"
  | "GERACAO_ATA"
  | "ANALISE_EMAIL"
  | "OUTRO";

export type TokenUsageEntry = {
  id: string;
  companyId: string;
  userId: string;
  userName: string;
  clientId?: string;
  clientName?: string;
  /** Título da reunião ou descrição do insight */
  meetingTitle?: string;
  type: TokenUsageType;
  tokens: number;
  createdAt: string; // ISO
};

export type CompanyTokens = {
  companyId: string;
  companyName: string;
  planName: string;
  tokensTotalPerCycle: number;
  tokensUsed: number;
  cycleStart: string; // ISO date
  cycleEnd: string;   // ISO date
  renewalDate: string; // ISO date
  overagePricePer1000: number;
  /** Uso por dia no ciclo atual (para gráfico) */
  usageByDay: { date: string; tokens: number }[];
};
