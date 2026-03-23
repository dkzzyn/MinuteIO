/**
 * Machine-readable list of HTTP APIs exposed by this server (for UI / docs).
 * Keep in sync when adding routes in index.ts or routes/index.ts.
 */

import type { ApiEndpointDef } from "./apiEndpointTypes";
import { EXTRA_API_CATALOG } from "./extraApiCatalog";

export type { ApiEndpointDef };

const BASE_API_CATALOG: ApiEndpointDef[] = [
  // —— Legacy / extra routes registered on app in src/index.ts (before router) ——
  {
    method: "POST",
    path: "/api/meetings/analyze-minute",
    auth: true,
    category: "Reuniões & IA",
    description: "Analisa 1 minuto de transcrição (Ollama / llama-swap); não persiste.",
  },
  {
    method: "GET",
    path: "/api/meetings/:id/insights/view",
    auth: true,
    category: "Reuniões & IA",
    description: "Visão agregada de insights da reunião (query: title, since).",
  },
  {
    method: "POST",
    path: "/api/meetings/:id/insights/view/minutes",
    auth: true,
    category: "Reuniões & IA",
    description: "Persiste um MinuteInsight já analisado.",
  },
  {
    method: "POST",
    path: "/api/meetings/:id/insights/view/analyze-minute",
    auth: true,
    category: "Reuniões & IA",
    description: "Analisa minuto com IA e persiste no meeting.",
  },
  {
    method: "PATCH",
    path: "/api/meetings/:id/insights/view/tasks",
    auth: true,
    category: "Reuniões & IA",
    description: "Marca tarefa como feita (taskText, done).",
  },
  {
    method: "POST",
    path: "/api/meetings/:id/audio-chunk",
    auth: true,
    category: "Reuniões & IA",
    description: "Upload multipart: áudio → Whisper → insights (form-data: audio, meetingContext, minuteNumber, title).",
  },
  {
    method: "POST",
    path: "/api/training/simulator/turn",
    auth: true,
    category: "Treinamentos",
    description: "Um turno do simulador de vendas (IA cliente).",
  },
  {
    method: "POST",
    path: "/api/training/objections/evaluate",
    auth: true,
    category: "Treinamentos",
    description: "Avalia resposta do vendedor a uma objeção.",
  },
  {
    method: "POST",
    path: "/api/training/dashboard/summary",
    auth: false,
    category: "Treinamentos",
    description: "Resumo agregado para dashboard de treinamento.",
  },

  // —— Router /api (buildApiRouter) ——
  { method: "POST", path: "/api/auth/register", auth: false, category: "Auth", description: "Registro de usuário." },
  { method: "POST", path: "/api/auth/login", auth: false, category: "Auth", description: "Login JWT + refreshToken." },
  { method: "GET", path: "/api/me", auth: true, category: "Auth", description: "Perfil do usuário logado." },
  { method: "PUT", path: "/api/me", auth: true, category: "Auth", description: "Atualiza nome / avatarUrl." },

  { method: "GET", path: "/api/posts", auth: true, category: "Posts", description: "Lista posts do usuário." },
  { method: "POST", path: "/api/posts", auth: true, category: "Posts", description: "Cria post." },
  { method: "PUT", path: "/api/posts/:id", auth: true, category: "Posts", description: "Atualiza post." },
  { method: "DELETE", path: "/api/posts/:id", auth: true, category: "Posts", description: "Remove post." },

  { method: "GET", path: "/api/prompts", auth: true, category: "Prompts", description: "Lista prompts (filtros: slug, isActive, modelHint)." },
  { method: "GET", path: "/api/prompts/:slug/latest", auth: true, category: "Prompts", description: "Prompt ativo mais recente por slug." },
  { method: "POST", path: "/api/prompts", auth: true, category: "Prompts", description: "Cria prompt (admin/supervisor)." },
  { method: "POST", path: "/api/prompts/:id/versions", auth: true, category: "Prompts", description: "Nova versão do prompt." },

  { method: "GET", path: "/api/agents", auth: true, category: "Agentes", description: "Lista agentes do usuário." },
  { method: "POST", path: "/api/agents", auth: true, category: "Agentes", description: "Cria agente." },
  { method: "PATCH", path: "/api/agents/:id", auth: true, category: "Agentes", description: "Atualiza agente." },
  { method: "GET", path: "/api/agents/:id/config", auth: true, category: "Agentes", description: "Lê config do agente." },
  { method: "PUT", path: "/api/agents/:id/config", auth: true, category: "Agentes", description: "Grava config do agente." },

  { method: "GET", path: "/api/teams", auth: true, category: "Times", description: "Times que você gerencia (owner)." },
  { method: "POST", path: "/api/teams", auth: true, category: "Times", description: "Cria time (admin/supervisor)." },
  { method: "POST", path: "/api/teams/:id/invites", auth: true, category: "Times", description: "Convite por e-mail." },
  { method: "GET", path: "/api/invites/me", auth: true, category: "Times", description: "Seus convites de time." },
  { method: "PUT", path: "/api/invites/:id/accept", auth: true, category: "Times", description: "Aceita convite." },
  { method: "PUT", path: "/api/invites/:id/reject", auth: true, category: "Times", description: "Recusa convite." },

  { method: "POST", path: "/api/meetings", auth: true, category: "Reuniões (CRUD)", description: "Cria reunião." },
  { method: "GET", path: "/api/meetings", auth: true, category: "Reuniões (CRUD)", description: "Lista reuniões do usuário." },
  { method: "GET", path: "/api/meetings/:id", auth: true, category: "Reuniões (CRUD)", description: "Detalhe da reunião." },
  { method: "GET", path: "/api/meetings/:id/clips", auth: true, category: "Reuniões (CRUD)", description: "Clipes / transcrições por trecho." },
  { method: "POST", path: "/api/meetings/:id/clips", auth: true, category: "Reuniões (CRUD)", description: "Upsert de clipe." },
  { method: "GET", path: "/api/meetings/:id/insights", auth: true, category: "Reuniões (CRUD)", description: "Insights persistidos." },
  { method: "POST", path: "/api/meetings/:id/insights", auth: true, category: "Reuniões (CRUD)", description: "Cria registro de insight." },
  { method: "GET", path: "/api/meetings/:id/analyses", auth: true, category: "Reuniões (CRUD)", description: "Análises ligadas a prompts." },
  { method: "POST", path: "/api/meetings/:id/analyses", auth: true, category: "Reuniões (CRUD)", description: "Registra análise (promptId, modelUsed)." },
  { method: "POST", path: "/api/meetings/:id/chunks", auth: true, category: "Reuniões (CRUD)", description: "Trechos de análise (chunk pipeline)." },
  { method: "GET", path: "/api/meetings/:id/chunks", auth: true, category: "Reuniões (CRUD)", description: "Lista chunks da reunião." },
  { method: "DELETE", path: "/api/meetings/:id/chunks", auth: true, category: "Reuniões (CRUD)", description: "Remove chunks da reunião." },

  { method: "GET", path: "/api/health", auth: false, category: "Sistema", description: "Saúde do backend + modo LLM (ollama vs openai_compat)." },
  { method: "GET", path: "/api/healthz", auth: false, category: "Sistema", description: "Health check simples do router." },
  { method: "GET", path: "/api/catalog", auth: false, category: "Sistema", description: "Lista de endpoints (público; usado pela UI /apis)." },
  { method: "GET", path: "/api", auth: false, category: "Sistema", description: "Índice JSON da API (links úteis)." },
];

export const API_CATALOG: ApiEndpointDef[] = [...BASE_API_CATALOG, ...EXTRA_API_CATALOG];
