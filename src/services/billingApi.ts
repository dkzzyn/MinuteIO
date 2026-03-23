import { apiRequest } from "../infrastructure/http/api";
import type { CompanyTokens, TokenUsageEntry } from "../types/companyTokens";

const AUTH_STORAGE_KEY = "minuteio_auth_token";

function getToken(): string {
  const t = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!t) throw new Error("Usuário não autenticado.");
  return t;
}

type BillingUsageResponse = {
  companyId: string;
  companyName: string;
  planName: string;
  tokensTotalPerCycle: number;
  tokensUsed: number;
  cycleStart: string;
  cycleEnd: string;
  renewalDate: string;
  overagePricePer1000: number;
  usageByDay: { date: string; tokens: number }[];
};

export async function fetchBillingUsage(): Promise<CompanyTokens> {
  const data = await apiRequest<BillingUsageResponse>("/api/billing/usage", { token: getToken() });
  return {
    companyId: data.companyId,
    companyName: data.companyName,
    planName: data.planName,
    tokensTotalPerCycle: data.tokensTotalPerCycle,
    tokensUsed: data.tokensUsed,
    cycleStart: data.cycleStart,
    cycleEnd: data.cycleEnd,
    renewalDate: data.renewalDate,
    overagePricePer1000: data.overagePricePer1000,
    usageByDay: data.usageByDay?.length ? data.usageByDay : [],
  };
}

export async function fetchBillingUsageEntries(): Promise<TokenUsageEntry[]> {
  const raw = await apiRequest<unknown[]>("/api/billing/usage/entries", { token: getToken() });
  if (!Array.isArray(raw)) return [];
  return raw as TokenUsageEntry[];
}
