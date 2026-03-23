import type { ApiEndpointDef, ApiEndpointDocDetail } from "./apiEndpointTypes";

const JSON_HDR = { name: "Content-Type", value: "application/json", required: true } as const;
const AUTH_HDR = {
  name: "Authorization",
  value: "Bearer <access_token>",
  required: true,
} as const;

const EX_MINUTE_INSIGHT = {
  minute: 1,
  summary: "Cliente pediu demo na próxima semana.",
  decisions: ["Agendar demonstração"],
  tasks: [{ text: "Enviar convite de calendário", done: false }],
  key_points: ["Interesse em integração API"],
  sentiment: "positive" as const,
  score: 0.82,
  emotions: ["confiante"],
  topics: ["produto", "prazo"],
};

const EX_MEETING = {
  id: "clmeet_example",
  userId: "cluser_example",
  postId: null,
  type: "online",
  title: "Demo com cliente",
  description: null,
  datetimeStart: "2026-02-20T15:00:00.000Z",
  datetimeEnd: null,
  status: "scheduled",
  recordingUrl: null,
  durationMinutes: 30,
  language: "pt-BR",
  pipelineStage: "discovery",
  result: "Em andamento",
  participants: ["Cliente", "Vendedor"],
  winProbability: 0.5,
  objectionTypes: [] as string[],
  summary: "",
  createdAt: "2026-02-15T10:00:00.000Z",
  updatedAt: "2026-02-15T10:00:00.000Z",
};

const EX_POST = {
  id: "clpost_example",
  userId: "cluser_example",
  content: "Nota rápida sobre o cliente.",
  createdAt: "2026-02-15T10:00:00.000Z",
  updatedAt: "2026-02-15T10:00:00.000Z",
};

const EX_PROMPT = {
  id: "clprompt_example",
  slug: "meeting-summary",
  title: "Resumo de reunião",
  description: "Gera resumo executivo",
  promptText: "Tu és um assistente…",
  modelHint: "llama3.2",
  isActive: true,
  version: 1,
  createdAt: "2026-02-15T10:00:00.000Z",
  updatedAt: "2026-02-15T10:00:00.000Z",
};

const EX_AGENT = {
  id: "clagent_example",
  userId: "cluser_example",
  name: "Vendedor PT",
  slug: "vendedor-pt",
  isActive: true,
  createdAt: "2026-02-15T10:00:00.000Z",
  updatedAt: "2026-02-15T10:00:00.000Z",
  config: {
    id: "clcfg_example",
    agentId: "clagent_example",
    sentimentTone: "neutro",
    salesAggressiveness: "moderado",
    objectionTips: {},
    extraConfig: {
      transcription: { enabled: true, language: "pt-BR", meetingType: "cliente", detailLevel: "topicos" },
      sentiment: { enabled: true, mode: "simple", showOverall: true, showPerParticipant: false, showIntensity: true },
    },
    isActive: true,
    createdAt: "2026-02-15T10:00:00.000Z",
    updatedAt: "2026-02-15T10:00:00.000Z",
  },
};

const EX_MEETING_CLIP = {
  id: "clclip_example",
  meetingId: "clmeet_example",
  index: 0,
  startTime: 0,
  endTime: 60,
  transcript: "Trecho transcrito…",
  processedByAi: false,
  createdAt: "2026-02-15T10:00:00.000Z",
  updatedAt: "2026-02-15T10:00:00.000Z",
};

const EX_MEETING_INSIGHT_ROW = {
  id: "clins_example",
  meetingId: "clmeet_example",
  clipId: null,
  type: "note",
  content: "Insight manual",
  createdAt: "2026-02-15T10:00:00.000Z",
};

const EX_MEETING_ANALYSIS = {
  id: "clanal_example",
  meetingId: "clmeet_example",
  promptId: "clprompt_example",
  createdById: "cluser_example",
  modelUsed: "llama3.2",
  inputTextHash: null,
  outputText: "Resultado da análise…",
  createdAt: "2026-02-15T10:00:00.000Z",
  prompt: {
    id: "clprompt_example",
    slug: "meeting-summary",
    title: "Resumo de reunião",
    version: 1,
    modelHint: "llama3.2",
  },
};

const EX_TEAM = {
  id: "clteam_example",
  name: "Equipe Comercial",
  ownerId: "cluser_example",
  createdAt: "2026-02-15T10:00:00.000Z",
  updatedAt: "2026-02-15T10:00:00.000Z",
};

const EX_TEAM_INVITE = {
  id: "clinv_example",
  teamId: "clteam_example",
  invitedUserId: "cluser_other",
  invitedById: "cluser_example",
  status: "pending",
  createdAt: "2026-02-15T10:00:00.000Z",
  team: EX_TEAM,
  invitedBy: { id: "cluser_example", name: "Admin", email: "admin@empresa.com" },
  invitedUser: { id: "cluser_other", name: "Convidado", email: "novo@empresa.com" },
};

const EX_INSIGHTS_VIEW = {
  title: "Reunião X",
  realtimeSummary: "Discussão focada em preço.",
  mainDecisions: ["Rever proposta"],
  tasks: [{ text: "Enviar PDF", done: false }],
  keyPoints: ["Budget Q2"],
  minuteInsights: [EX_MINUTE_INSIGHT],
};

/** Documentação por chave exata `METHOD path` (igual ao catálogo). */
const DOC_MAP: Record<string, ApiEndpointDocDetail> = {
  "POST /api/auth/register": {
    howTo:
      "Regista um utilizador. Corpo em JSON. Depois usa POST /api/auth/login para obter o JWT. " +
      "Em produção, use HTTPS e valide email no servidor.",
    headers: [JSON_HDR],
    requestExample: {
      name: "Maria Silva",
      email: "maria@empresa.com",
      password: "mínimo 6 caracteres",
    },
    responseExample: {
      id: "clxx_user",
      name: "Maria Silva",
      email: "maria@empresa.com",
      createdAt: "2026-02-15T12:00:00.000Z",
    },
    curlExample: `curl -s -X POST http://localhost:3001/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Maria","email":"maria@empresa.com","password":"secret12"}'`,
  },
  "POST /api/auth/login": {
    howTo:
      "Autenticação. Resposta inclui token (JWT) e refreshToken. Guarda o token no header Authorization: Bearer … " +
      "em todos os endpoints com auth: true. O refreshToken pode ser usado em POST /api/auth/refresh.",
    headers: [JSON_HDR],
    requestExample: { email: "maria@empresa.com", password: "secret12" },
    responseExample: {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…",
      refreshToken: "hex_longo…",
      user: {
        id: "clxx_user",
        name: "Maria Silva",
        email: "maria@empresa.com",
        createdAt: "2026-02-15T12:00:00.000Z",
        updatedAt: "2026-02-15T12:00:00.000Z",
      },
    },
    curlExample: `curl -s -X POST http://localhost:3001/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"maria@empresa.com","password":"secret12"}'`,
  },
  "POST /api/auth/refresh": {
    howTo: "Envia o refreshToken devolvido no login para obter um novo access token sem password.",
    headers: [JSON_HDR],
    requestExample: { refreshToken: "<refresh_token>" },
    responseExample: { token: "novo_jwt…", refreshToken: "<mesmo ou rotacionado>" },
    curlExample: `curl -s -X POST http://localhost:3001/api/auth/refresh \\
  -H "Content-Type: application/json" \\
  -d '{"refreshToken":"<seu_refresh>"}'`,
  },
  "POST /api/auth/logout": {
    howTo: "Opcional: envia refreshToken para revogar essa sessão no servidor. Resposta **204** sem corpo.",
    headers: [JSON_HDR],
    requestExample: { refreshToken: "<opcional>" },
    responseExample: { _httpStatus: 204, body: "(vazio)" },
  },
  "POST /api/auth/forgot-password": {
    howTo:
      "Em dev, o link de reset é impresso no console do servidor. Em produção ligar a serviço de email.",
    headers: [JSON_HDR],
    requestExample: { email: "user@empresa.com" },
    responseExample: { ok: true },
  },
  "POST /api/auth/reset-password": {
    howTo: "Usa o token recebido por email (query ?token= no front) + nova senha.",
    headers: [JSON_HDR],
    requestExample: { token: "token_do_email", newPassword: "novaSenhaSegura12" },
    responseExample: { ok: true },
  },
  "GET /api/me": {
    howTo: "Perfil do utilizador autenticado. Obrigatório header Authorization.",
    headers: [AUTH_HDR],
    responseExample: {
      id: "clxx_user",
      name: "Maria",
      email: "maria@empresa.com",
      role: "user",
      avatarUrl: null,
      isActive: true,
      preferences: {},
      createdAt: "2026-02-15T12:00:00.000Z",
      updatedAt: "2026-02-15T12:00:00.000Z",
    },
  },
  "PUT /api/me": {
    howTo: "Atualiza nome, avatarUrl e/ou preferences (objeto JSON fundido com o existente).",
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: { name: "Maria Santos", avatarUrl: "https://cdn.example/avatar.png", preferences: { theme: "dark" } },
    responseExample: {
      id: "clxx_user",
      name: "Maria Santos",
      email: "maria@empresa.com",
      role: "user",
      avatarUrl: "https://cdn.example/avatar.png",
      isActive: true,
      preferences: { theme: "dark" },
      createdAt: "2026-02-15T12:00:00.000Z",
      updatedAt: "2026-02-15T12:00:00.000Z",
    },
  },
  "PATCH /api/me": {
    howTo: "Atualização parcial (nome, avatarUrl, preferences).",
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: { preferences: { selectedAgentId: "clagent_example" } },
    responseExample: {
      id: "clxx_user",
      name: "Maria",
      email: "maria@empresa.com",
      role: "user",
      avatarUrl: null,
      isActive: true,
      preferences: { selectedAgentId: "clagent_example" },
      createdAt: "2026-02-15T12:00:00.000Z",
      updatedAt: "2026-02-15T12:00:00.000Z",
    },
  },
  "GET /api/me/preferences": {
    howTo: "Lê só o objeto preferences.",
    headers: [AUTH_HDR],
    responseExample: { preferences: { selectedAgentId: "clagent_example", theme: "dark" } },
  },
  "PUT /api/me/preferences": {
    howTo: "Faz merge shallow: { preferences: { chave: valor } }.",
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: { preferences: { selectedAgentId: "clxyz_agent" } },
    responseExample: { preferences: { selectedAgentId: "clxyz_agent", theme: "dark" } },
  },
  "PUT /api/me/password": {
    howTo: "Alterar senha estando autenticado. Invalida refresh tokens. Resposta **204** sem corpo em sucesso.",
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: { currentPassword: "antiga", newPassword: "novaMin6chars" },
    responseExample: { _httpStatus: 204, body: "(vazio)" },
  },
  "GET /api/catalog": {
    howTo: "Lista pública de endpoints (esta página). Sem JWT.",
    responseExample: {
      generatedAt: "2026-02-15T12:00:00.000Z",
      endpoints: [
        { method: "GET", path: "/api/health", auth: false, category: "Sistema", description: "Saúde do backend" },
      ],
    },
  },
  "GET /api/health": {
    howTo: "Estado do backend e modo LLM (ollama vs openai_compat).",
    responseExample: {
      ok: true,
      llmMode: "ollama_native",
      openaiBaseUrl: null,
      ollamaUrl: "http://localhost:11434",
      defaultModel: "llama3.2",
    },
  },
  "GET /api/healthz": {
    responseExample: { ok: true },
  },
  "GET /api": {
    howTo: "Índice JSON com links úteis ao abrir a raiz do prefixo /api.",
    responseExample: {
      service: "MinuteIO API",
      catalog: "/api/catalog",
      health: "/api/health",
    },
  },
  "GET /api/version": {
    responseExample: { name: "minuteio-api", version: "dev", node: "v20.x" },
  },
  "GET /api/openapi.json": {
    responseExample: {
      openapi: "3.0.0",
      info: { title: "MinuteIO API", version: "1.0.0" },
      paths: { "/api/health": { get: { summary: "Health" } } },
    },
  },

  "POST /api/meetings/analyze-minute": {
    howTo:
      "**Análise IA** de um minuto de transcrição (Ollama). Não persiste. Opcional: `agentId` para perfil do agente. " +
      "Campos obrigatórios: `meetingContext`, `minuteNumber`, `transcriptChunk`.",
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: {
      meetingContext: "Reunião comercial — produto X",
      clientContext: "Setor retail",
      minuteNumber: 3,
      transcriptChunk: "Cliente: qual o prazo de implementação? …",
      agentId: "clagent_example",
    },
    responseExample: EX_MINUTE_INSIGHT,
  },
  "GET /api/meetings/:id/insights/view": {
    howTo: "Visão agregada de insights. **Query opcional:** `title` (filtra série), `since` (ISO date).",
    headers: [AUTH_HDR],
    query: [
      { name: "title", description: "Título/sessão de insights", example: "Live" },
      { name: "since", description: "Só minutos após esta data (ISO 8601)", example: "2026-02-01T00:00:00.000Z" },
    ],
    responseExample: EX_INSIGHTS_VIEW,
  },
  "POST /api/meetings/:id/insights/view/minutes": {
    howTo: "Persiste um objeto **MinuteInsight** (ex.: vindo de POST /api/meetings/analyze-minute). `minute` e `summary` obrigatórios.",
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: { ...EX_MINUTE_INSIGHT, title: "Sessão ao vivo" },
    responseExample: EX_INSIGHTS_VIEW,
  },
  "POST /api/meetings/:id/insights/view/analyze-minute": {
    howTo: "Analisa com IA e **persiste** no meeting. Mesmos campos que analyze-minute global + `title` opcional.",
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: {
      meetingContext: "Demo produto",
      minuteNumber: 1,
      transcriptChunk: "…",
      title: "Live",
      agentId: "clagent_example",
    },
    responseExample: EX_INSIGHTS_VIEW,
  },
  "PATCH /api/meetings/:id/insights/view/tasks": {
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: { taskText: "Enviar proposta", done: true },
    responseExample: EX_INSIGHTS_VIEW,
  },
  "POST /api/meetings/:id/audio-chunk": {
    howTo:
      "**multipart/form-data** (não JSON). Campos: `audio` (ficheiro), `meetingContext` (texto), `minuteNumber` (número), `title` (texto). " +
      "Usa `curl -F` ou `FormData` no browser.",
    headers: [{ name: "Content-Type", value: "multipart/form-data; boundary=…", required: true }],
    requestExample: {
      _format: "multipart/form-data",
      fields: {
        audio: "(binary file)",
        meetingContext: "Contexto da reunião",
        minuteNumber: "2",
        title: "Gravação",
      },
    },
    responseExample: EX_INSIGHTS_VIEW,
  },

  "POST /api/training/simulator/turn": {
    howTo: "Um turno do simulador de vendas. `scenario` e `lastSalesMessage` obrigatórios. `conversationHistory` é array de mensagens.",
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: {
      scenario: "Cliente SMB hesitante no preço",
      conversationHistory: [
        { role: "assistant", content: "Bom dia, em que posso ajudar?" },
        { role: "user", content: "O vendedor ofereceu 10% desconto." },
      ],
      lastSalesMessage: "Posso incluir suporte premium no primeiro ano.",
      agentId: "clagent_example",
    },
    responseExample: {
      client_message: "Ainda acho caro comparado ao concorrente.",
      suggestions: [{ strategy: "ancoragem", text: "Reforçar valor vs preço." }],
      coach_feedback: "Boa empatia; fechar com próximo passo.",
    },
  },
  "POST /api/training/simulations/message": {
    howTo: "**Alias** do mesmo contrato que POST /api/training/simulator/turn.",
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: {
      scenario: "Objeção de tempo",
      conversationHistory: [],
      lastSalesMessage: "A implementação leva 2 semanas.",
    },
    responseExample: {
      client_message: "Não temos banda nesse mês.",
      suggestions: [],
      coach_feedback: "…",
    },
  },
  "POST /api/training/objections/evaluate": {
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: {
      objection: "O vosso preço é o dobro da concorrência.",
      salesRepResponse: "O valor inclui onboarding e SLA 24h.",
      agentId: "clagent_example",
    },
    responseExample: {
      score: 7.5,
      analysis: "Boa ligação valor-benefício.",
      suggestions: [{ strategy: "prova social", text: "Mencionar case similar." }],
    },
  },
  "POST /api/training/dashboard/summary": {
    howTo: "Público. Agrega métricas de módulos e histórico de simulação para texto de coaching.",
    headers: [JSON_HDR],
    requestExample: {
      scoresByModule: [{ moduleName: "Objeções", averageScore: 8, completionRate: 0.6 }],
      recentFeedback: ["Melhorar fecho"],
      simulationHistory: [{ scenario: "Preço", score: 7, date: "2026-02-10" }],
    },
    responseExample: {
      summary: "Progresso sólido em objeções.",
      strengths: ["Clareza"],
      opportunities: ["Fechar com CTA"],
    },
  },

  "GET /api/posts": {
    headers: [AUTH_HDR],
    responseExample: [EX_POST],
  },
  "POST /api/posts": {
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: { content: "Texto do post" },
    responseExample: EX_POST,
  },
  "PUT /api/posts/:id": {
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: { content: "Texto atualizado" },
    responseExample: EX_POST,
  },
  "DELETE /api/posts/:id": {
    headers: [AUTH_HDR],
    responseExample: { _httpStatus: 204, body: "(vazio)" },
  },

  "GET /api/prompts": {
    headers: [AUTH_HDR],
    query: [
      { name: "slug", description: "Filtrar por slug", example: "meeting-summary" },
      { name: "isActive", description: "true / false", example: "true" },
      { name: "modelHint", description: "Modelo sugerido", example: "llama3.2" },
    ],
    responseExample: [EX_PROMPT],
  },
  "GET /api/prompts/:slug/latest": {
    headers: [AUTH_HDR],
    responseExample: EX_PROMPT,
  },
  "GET /api/prompts/detail/:id": {
    headers: [AUTH_HDR],
    responseExample: EX_PROMPT,
  },
  "POST /api/prompts": {
    howTo: "Apenas **admin** ou **supervisor**. Cria prompt com nova versão.",
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: {
      slug: "meeting-summary",
      title: "Resumo de reunião",
      description: "Opcional",
      promptText: "Tu és…",
      modelHint: "llama3.2",
      isActive: true,
    },
    responseExample: EX_PROMPT,
  },
  "POST /api/prompts/:id/versions": {
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: {
      promptText: "Nova versão do texto…",
      description: "Notas da versão",
      modelHint: "llama3.2",
      isActive: true,
    },
    responseExample: { ...EX_PROMPT, version: 2 },
  },
  "PATCH /api/prompts/:id": {
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: { title: "Novo título", isActive: false },
    responseExample: EX_PROMPT,
  },

  "GET /api/agents": {
    headers: [AUTH_HDR],
    responseExample: [EX_AGENT],
  },
  "POST /api/agents": {
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: { name: "Meu agente", slug: "meu-agente", isActive: true },
    responseExample: EX_AGENT,
  },
  "PATCH /api/agents/:id": {
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: { name: "Nome novo", isActive: true },
    responseExample: { ...EX_AGENT, name: "Nome novo" },
  },
  "DELETE /api/agents/:id": {
    headers: [AUTH_HDR],
    responseExample: { _httpStatus: 204, body: "(vazio)" },
  },
  "POST /api/agents/:id/duplicate": {
    headers: [AUTH_HDR],
    responseExample: { ...EX_AGENT, id: "clagent_copy", name: "Vendedor PT (cópia)" },
  },
  "GET /api/agents/:id/config": {
    headers: [AUTH_HDR],
    responseExample: EX_AGENT.config,
  },
  "PUT /api/agents/:id/config": {
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: {
      sentimentTone: "positivo",
      salesAggressiveness: "moderado",
      objectionTips: { preco: "Focar ROI" },
      extraConfig: EX_AGENT.config.extraConfig,
    },
    responseExample: EX_AGENT.config,
  },

  "GET /api/teams": {
    headers: [AUTH_HDR],
    responseExample: [EX_TEAM],
  },
  "POST /api/teams": {
    howTo: "Apenas **admin** ou **supervisor**.",
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: { name: "Equipe Alpha" },
    responseExample: EX_TEAM,
  },
  "GET /api/teams/:id": {
    headers: [AUTH_HDR],
    responseExample: EX_TEAM,
  },
  "PATCH /api/teams/:id": {
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: { name: "Equipe Alpha Renomeada" },
    responseExample: { ...EX_TEAM, name: "Equipe Alpha Renomeada" },
  },
  "DELETE /api/teams/:id": {
    headers: [AUTH_HDR],
    responseExample: { _httpStatus: 204, body: "(vazio)" },
  },
  "POST /api/teams/:id/invites": {
    howTo: "Convida utilizador **já registado** pelo email.",
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: { email: "colega@empresa.com" },
    responseExample: EX_TEAM_INVITE,
  },
  "GET /api/teams/:id/invites": {
    headers: [AUTH_HDR],
    responseExample: [EX_TEAM_INVITE],
  },
  "GET /api/invites/me": {
    headers: [AUTH_HDR],
    responseExample: [EX_TEAM_INVITE],
  },
  "PUT /api/invites/:id/accept": {
    headers: [AUTH_HDR],
    responseExample: { ...EX_TEAM_INVITE, status: "accepted" },
  },
  "PUT /api/invites/:id/reject": {
    headers: [AUTH_HDR],
    responseExample: { ...EX_TEAM_INVITE, status: "rejected" },
  },
  "DELETE /api/invites/:id": {
    headers: [AUTH_HDR],
    responseExample: { _httpStatus: 204, body: "(vazio)" },
  },

  "POST /api/meetings": {
    howTo:
      "Cria reunião. Campos opcionais têm defaults no servidor. `datetimeStart` em ISO 8601. **Obrigatório:** `title`.",
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: {
      title: "Demo com cliente X",
      type: "online",
      datetimeStart: "2026-02-20T15:00:00.000Z",
      status: "scheduled",
      participants: ["Cliente", "Vendedor"],
      durationMinutes: 45,
      pipelineStage: "discovery",
      result: "Em andamento",
    },
    responseExample: EX_MEETING,
  },
  "GET /api/meetings": {
    headers: [AUTH_HDR],
    responseExample: [EX_MEETING],
  },
  "GET /api/meetings/:id": {
    headers: [AUTH_HDR],
    responseExample: EX_MEETING,
  },
  "PATCH /api/meetings/:id": {
    howTo: "Substitui `:id` pelo cuid da reunião. Envie só campos a alterar.",
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: { title: "Novo título", result: "Won", pipelineStage: "closing" },
    responseExample: { ...EX_MEETING, title: "Novo título", result: "Won" },
  },
  "DELETE /api/meetings/:id": {
    headers: [AUTH_HDR],
    responseExample: { _httpStatus: 204, body: "(vazio)" },
  },
  "POST /api/meetings/:id/duplicate": {
    headers: [AUTH_HDR],
    responseExample: { ...EX_MEETING, id: "clmeet_copy", title: "Demo com cliente X (cópia)" },
  },
  "GET /api/meetings/:id/clips": {
    headers: [AUTH_HDR],
    responseExample: [EX_MEETING_CLIP],
  },
  "POST /api/meetings/:id/clips": {
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: {
      index: 0,
      startTime: 0,
      endTime: 45.2,
      transcript: "Texto do trecho",
      processedByAi: true,
    },
    responseExample: EX_MEETING_CLIP,
  },
  "GET /api/meetings/:id/insights": {
    headers: [AUTH_HDR],
    responseExample: [EX_MEETING_INSIGHT_ROW],
  },
  "POST /api/meetings/:id/insights": {
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: { clipId: null, type: "note", content: "Ponto de atenção" },
    responseExample: EX_MEETING_INSIGHT_ROW,
  },
  "GET /api/meetings/:id/analyses": {
    headers: [AUTH_HDR],
    responseExample: [EX_MEETING_ANALYSIS],
  },
  "POST /api/meetings/:id/analyses": {
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: {
      promptId: "clprompt_example",
      modelUsed: "llama3.2",
      inputTextHash: null,
      outputText: "Saída da análise",
    },
    responseExample: EX_MEETING_ANALYSIS,
  },
  "POST /api/meetings/:id/chunks": {
    howTo: "Pipeline de análise por trecho: `chunkIndex` > 0 e `transcript` obrigatórios. Opcional: `meetingContext`, `title`, `agentId`.",
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: {
      chunkIndex: 1,
      transcript: "Trecho da transcrição deste minuto…",
      meetingContext: "Call de vendas",
      title: "Live",
      agentId: "clagent_example",
    },
    responseExample: EX_MINUTE_INSIGHT,
  },
  "GET /api/meetings/:id/chunks": {
    headers: [AUTH_HDR],
    responseExample: [EX_MINUTE_INSIGHT],
  },
  "DELETE /api/meetings/:id/chunks": {
    headers: [AUTH_HDR],
    responseExample: { _httpStatus: 204, body: "(vazio)" },
  },

  "GET /api/clients": {
    headers: [AUTH_HDR],
    responseExample: [
      {
        id: "clcrm_example",
        name: "Loja Alpha",
        email: "a@loja.com",
        status: "ativo",
      },
    ],
  },
  "POST /api/clients": {
    howTo:
      "CRM: cria cliente. O corpo é o objeto Cliente **sem** `id` (o servidor gera). Podes enviar qualquer estrutura JSON — é guardada em `data`.",
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: {
      name: "Loja Alpha",
      contactName: "Carlos",
      email: "c@loja.com",
      status: "em_negociacao",
      color: "#22c55e",
      tags: { segmento: "Varejo" },
      materials: [],
      timeline: [],
      generalData: {},
      tasks: [],
      customFields: {},
      payments: [],
    },
    responseExample: {
      id: "clcrm_example",
      name: "Loja Alpha",
      email: "c@loja.com",
      status: "em_negociacao",
    },
  },
  "GET /api/clients/:id": {
    headers: [AUTH_HDR],
    responseExample: { id: "clcrm_example", name: "Loja Alpha", tasks: [] },
  },
  "PATCH /api/clients/:id": {
    howTo: "Merge parcial no documento JSON do cliente (ex.: atualizar `tasks` ou `payments`).",
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: { lastActivityLabel: "Follow-up hoje", tasks: [{ id: "tk1", title: "Ligar", done: false }] },
    responseExample: { id: "clcrm_example", name: "Loja Alpha", lastActivityLabel: "Follow-up hoje", tasks: [{ id: "tk1", title: "Ligar", done: false }] },
  },
  "DELETE /api/clients/:id": {
    headers: [AUTH_HDR],
    responseExample: { _httpStatus: 204, body: "(vazio)" },
  },
  "GET /api/clients/:id/meetings": {
    headers: [AUTH_HDR],
    query: [{ name: "q", description: "Filtro por título ou participante (substring)", example: "demo" }],
    responseExample: [EX_MEETING],
  },

  "GET /api/reports/kpis": {
    headers: [AUTH_HDR],
    responseExample: {
      totalMeetings: 12,
      totalMeetingsDelta: 0,
      avgDurationMinutes: 32,
      avgDurationDelta: 0,
      positiveSentiment: 65,
      winRate: 25,
      winRateDelta: 0,
    },
  },
  "GET /api/reports/meetings-by-day": {
    headers: [AUTH_HDR],
    responseExample: [{ date: "2026-02-10", count: 2, label: "10 de fev." }],
  },
  "GET /api/reports/history": {
    headers: [AUTH_HDR],
    query: [{ name: "limit", description: "Máx. itens (1–100, default 20)", example: "20" }],
    responseExample: [
      {
        id: "clmeet_example",
        clientName: "Cliente",
        title: "Call",
        date: "2026-02-15T10:00:00.000Z",
        durationMinutes: 30,
        outcome: "Em andamento",
        meetingType: "discovery",
      },
    ],
  },
  "GET /api/reports/outcome-distribution": {
    headers: [AUTH_HDR],
    responseExample: [
      { name: "Ganha", value: 3, fill: "var(--chart-positive)" },
      { name: "Perdida", value: 1, fill: "var(--chart-negative)" },
    ],
  },
  "GET /api/reports/sentiment-over-time": {
    headers: [AUTH_HDR],
    responseExample: [{ label: "seg.", value: 72 }],
  },
  "GET /api/reports/talk-to-listen": {
    headers: [AUTH_HDR],
    responseExample: [{ type: "Discovery", sellerPct: 50, clientPct: 50, _count: 4 }],
  },

  "GET /api/billing/plan": {
    headers: [AUTH_HDR],
    responseExample: {
      planName: "MinuteIO Pro",
      tokensTotalPerCycle: 20000,
      tokensUsed: 1200,
      cycleEnd: "2026-03-15T00:00:00.000Z",
      overagePricePer1000: 50,
    },
  },
  "GET /api/billing/usage": {
    headers: [AUTH_HDR],
    responseExample: {
      companyId: "cluser_example",
      companyName: "Maria",
      planName: "MinuteIO Pro",
      tokensTotalPerCycle: 20000,
      tokensUsed: 1200,
      cycleStart: "2026-02-15",
      cycleEnd: "2026-03-15",
      renewalDate: "2026-03-15",
      overagePricePer1000: 50,
      usageByDay: [],
    },
  },
  "GET /api/billing/usage/entries": {
    headers: [AUTH_HDR],
    responseExample: [{ at: "2026-02-14T12:00:00.000Z", feature: "analyze", tokens: 120 }],
  },
  "POST /api/billing/checkout": {
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: {},
    responseExample: {
      checkoutUrl: null,
      message: "Configure integração Stripe (STRIPE_SECRET_KEY) para checkout ao vivo.",
    },
  },
  "POST /api/billing/webhooks/stripe": {
    headers: [JSON_HDR],
    requestExample: { type: "checkout.session.completed", data: { object: {} } },
    responseExample: { received: true, note: "Stub — validar assinatura Stripe em produção." },
  },

  "GET /api/training/product/progress": {
    headers: [AUTH_HDR],
    responseExample: { completedLessonIds: ["intro", "crm-basics"], totalLessons: 5 },
  },
  "POST /api/training/lessons/:lessonId/complete": {
    headers: [AUTH_HDR],
    responseExample: { ok: true, lessonId: "intro" },
  },
  "GET /api/training/dashboards/me": {
    headers: [AUTH_HDR],
    responseExample: {
      kpis: [
        {
          moduleId: "product",
          moduleName: "Como usar o MinuteIO",
          completionRate: 40,
          averageScore: 8,
          hoursTrained: 4,
          completedCount: 2,
          totalCount: 5,
        },
      ],
      completedLessons: 2,
      totalLessons: 5,
    },
  },

  "GET /api/admin/users": {
    howTo: "Apenas **role admin**.",
    headers: [AUTH_HDR],
    responseExample: [
      {
        id: "clxx_user",
        name: "Maria",
        email: "maria@empresa.com",
        role: "user",
        isActive: true,
        createdAt: "2026-02-15T12:00:00.000Z",
      },
    ],
  },
  "PATCH /api/admin/users/:id": {
    howTo: "Apenas **admin**. Envia `role` e/ou `isActive`.",
    headers: [AUTH_HDR, JSON_HDR],
    requestExample: { role: "supervisor", isActive: true },
    responseExample: {
      id: "clxx_user",
      name: "Maria",
      email: "maria@empresa.com",
      role: "supervisor",
      isActive: true,
    },
  },
};

function genericDoc(e: ApiEndpointDef): ApiEndpointDocDetail {
  const parts: string[] = [];
  if (e.auth) {
    parts.push(
      "**Autenticação:** envia o header `Authorization: Bearer <token>` (token devolvido em `POST /api/auth/login`)."
    );
  } else {
    parts.push("**Público:** não é necessário JWT.");
  }
  if (e.method === "GET" || e.method === "DELETE") {
    parts.push("**Corpo:** normalmente vazio.");
  } else {
    parts.push(
      "**Corpo:** JSON com `Content-Type: application/json` (estrutura depende do endpoint — vê exemplos abaixo), exceto uploads multipart."
    );
  }
  if (e.path.includes(":id") || e.path.includes(":slug") || e.path.includes(":lessonId")) {
    parts.push("**Path:** substitui `:id`, `:slug`, `:lessonId`, etc. por valores reais (cuid ou slug).");
  }
  parts.push(
    "**Front (dev):** com Vite, usa URLs relativas `/api/...` ou define `VITE_OLLAMA_API_URL=http://localhost:3001` (sem `/api` no fim)."
  );
  return { howTo: parts.join("\n\n") };
}

export function enrichCatalogEndpoints(endpoints: ApiEndpointDef[]): ApiEndpointDef[] {
  return endpoints.map((e) => {
    const key = `${e.method} ${e.path}`;
    const specific = DOC_MAP[key];
    if (specific) {
      return { ...e, doc: { ...genericDoc(e), ...specific } };
    }
    return { ...e, doc: genericDoc(e) };
  });
}
