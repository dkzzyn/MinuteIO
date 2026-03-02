import { apiRequest } from "../infrastructure/http/api";

const AUTH_STORAGE_KEY = "minuteio_auth_token";
export const SELECTED_AGENT_STORAGE_KEY = "minuteio_selected_agent_id";

function tokenOrThrow(): string {
  const token = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!token) throw new Error("Usuário não autenticado.");
  return token;
}

export type Agent = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  config?: AgentConfig;
};

export type AgentConfig = {
  id: string;
  agentId: string;
  sentimentTone: "positivo" | "neutro" | "negativo";
  salesAggressiveness: "baixo" | "moderado" | "alto";
  objectionTips: Record<string, string> | null;
  extraConfig: PromptConfig | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PromptConfig = {
  transcription: {
    enabled: boolean;
    language: string;
    meetingType: "interna" | "cliente" | "suporte" | "venda" | "outro";
    detailLevel: "resumo_curto" | "topicos" | "completa";
  };
  sentiment: {
    enabled: boolean;
    mode: "simple" | "score";
    showOverall: boolean;
    showPerParticipant: boolean;
    showIntensity: boolean;
  };
};

export const DEFAULT_PROMPT_CONFIG: PromptConfig = {
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

export async function listAgents(): Promise<Agent[]> {
  return apiRequest<Agent[]>("/api/agents", { token: tokenOrThrow() });
}

export async function createAgent(body: { name: string; slug?: string; isActive?: boolean }): Promise<Agent> {
  return apiRequest<Agent>("/api/agents", {
    method: "POST",
    token: tokenOrThrow(),
    body,
  });
}

export async function updateAgent(agentId: string, body: { name?: string; slug?: string; isActive?: boolean }): Promise<Agent> {
  return apiRequest<Agent>(`/api/agents/${agentId}`, {
    method: "PATCH",
    token: tokenOrThrow(),
    body,
  });
}

export async function getAgentConfig(agentId: string): Promise<AgentConfig> {
  return apiRequest<AgentConfig>(`/api/agents/${agentId}/config`, { token: tokenOrThrow() });
}

export async function updateAgentConfig(
  agentId: string,
  body: {
    sentimentTone: AgentConfig["sentimentTone"];
    salesAggressiveness: AgentConfig["salesAggressiveness"];
    objectionTips: Record<string, string>;
    extraConfig?: PromptConfig;
    isActive: boolean;
  }
): Promise<AgentConfig> {
  return apiRequest<AgentConfig>(`/api/agents/${agentId}/config`, {
    method: "PUT",
    token: tokenOrThrow(),
    body,
  });
}
