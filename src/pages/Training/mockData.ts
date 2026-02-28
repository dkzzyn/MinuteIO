/**
 * Dados mock para a área de Treinamentos.
 * Substituir por chamadas à API do MinuteIO quando disponível:
 * - GET /api/training/scores
 * - GET /api/training/feedbacks
 * - GET /api/training/simulations/history
 * - POST /api/training/simulations (enviar mensagem e receber resposta + feedback)
 * - POST /api/training/objections/evaluate (enviar resposta e receber feedback)
 */

import type {
  TrainingScore,
  TrainingFeedback,
  SimulationHistory,
  TrainingModule,
  ProductLesson,
  SalesScenario,
  Objection,
} from "./types";

export const MOCK_TRAINING_SCORES: TrainingScore[] = [
  { moduleId: "overall", moduleName: "Geral", averageScore: 7.2, completionPercentage: 65 },
  { moduleId: "simulator", moduleName: "Simulador de vendas (IA)", averageScore: 7.8, completionPercentage: 80 },
  { moduleId: "objections", moduleName: "Treinamento de objeções", averageScore: 6.5, completionPercentage: 50 },
];

/** Texto de destaque (pode vir da API como resumo de desempenho) */
export const MOCK_HIGHLIGHT_TEXT =
  "Você está indo bem em rapport, mas ainda pode evoluir em contorno de objeções de preço.";

export const MOCK_FEEDBACKS: TrainingFeedback[] = [
  { id: "1", type: "strength", message: "Você explora bem as dores do cliente, continue assim.", createdAt: "2025-02-14T10:00:00Z" },
  { id: "2", type: "opportunity", message: "Precisa fazer mais perguntas abertas antes de falar de preço.", createdAt: "2025-02-14T09:30:00Z" },
  { id: "3", type: "strength", message: "Bom uso de prova social ao mencionar casos de sucesso.", createdAt: "2025-02-13T16:00:00Z" },
  { id: "4", type: "opportunity", message: "Na objeção de preço, tente ancorar no ROI antes de oferecer desconto.", createdAt: "2025-02-13T15:00:00Z" },
  { id: "5", type: "strength", message: "Tom empático e profissional na negociação.", createdAt: "2025-02-12T11:00:00Z" },
  { id: "6", type: "opportunity", message: "Explore melhor o prazo de decisão do cliente antes de fechar.", createdAt: "2025-02-12T10:00:00Z" },
];

export const MOCK_SIMULATION_HISTORY: SimulationHistory[] = [
  { id: "1", type: "simulator", scenario: "Negociação de preço", date: "2025-02-14T14:30:00Z", score: 8 },
  { id: "2", type: "objection", scenario: "Concorrente mais barato", date: "2025-02-14T11:00:00Z", score: 6 },
  { id: "3", type: "simulator", scenario: "Prospecção fria", date: "2025-02-13T16:00:00Z", score: 7 },
  { id: "4", type: "objection", scenario: "Desconto alto", date: "2025-02-13T14:00:00Z", score: 7 },
  { id: "5", type: "simulator", scenario: "Fechamento", date: "2025-02-12T17:00:00Z", score: 9 },
];

export const MOCK_MODULES: TrainingModule[] = [
  { id: "product", name: "Como usar o MinuteIO", description: "Passo a passo guiado, vídeos curtos, checklists e quizzes para o time aprender o produto.", route: "/training/product" },
  { id: "simulator", name: "Simulador de vendas (IA)", description: "Cenários completos de call com IA como cliente. Pratique fechamento e negociação.", route: "/training/simulator" },
  { id: "objections", name: "Treinamento de objeções", description: "Treine objeções comuns (preço, tempo, concorrente) com simulações e respostas fortes.", route: "/training/objections" },
];

export const MOCK_PRODUCT_LESSONS: ProductLesson[] = [
  { id: "1", title: "Visão geral do painel", status: "completed", durationMinutes: 3, type: "video" },
  { id: "2", title: "Configuração de reuniões", status: "completed", durationMinutes: 5, type: "video" },
  { id: "3", title: "Relatórios e insights", status: "in_progress", durationMinutes: 4, type: "text" },
  { id: "4", title: "Tokens e planos", status: "not_started", durationMinutes: 3, type: "text" },
  { id: "5", title: "Checklist: melhores práticas", status: "not_started", durationMinutes: 2, type: "quiz" },
];

export const MOCK_SALES_SCENARIOS: SalesScenario[] = [
  { id: "cold", name: "Prospecção fria", description: "Primeiro contato com lead que ainda não conhece o produto." },
  { id: "discovery", name: "Descoberta de necessidades", description: "Call de descoberta para entender dores e prioridades." },
  { id: "price", name: "Negociação de preço", description: "Cliente pede desconto ou questiona o valor." },
  { id: "close", name: "Fechamento", description: "Momento de fechar o acordo e próximos passos." },
  { id: "renewal", name: "Renovação / pós-venda", description: "Renovação ou expansão com cliente atual." },
];

/** Sugestões por estratégia (simulador) – em produção viriam da API após cada mensagem */
export const MOCK_SIMULATOR_SUGGESTIONS = [
  { id: "s1", text: "O que seria mais importante para vocês no curto prazo?", strategyType: "explore_context" as const },
  { id: "s2", text: "O MinuteIO já ajudou outras equipes a reduzir em 40% o tempo em follow-up. Posso te mostrar um caso parecido?", strategyType: "reinforce_value" as const },
  { id: "s3", text: "Podemos começar com um piloto de 2 semanas sem compromisso. O que acha?", strategyType: "offer_option" as const },
  { id: "s4", text: "A [Empresa X], do mesmo setor, usa e conseguiu fechar 3x mais reuniões produtivas. Quer que eu envie o case?", strategyType: "social_proof" as const },
];

/** Respostas mock do cliente (IA) – em produção: POST /api/training/simulations/message */
export const MOCK_CLIENT_REPLIES: Record<string, string> = {
  default: "Interessante. Me conta um pouco mais sobre como vocês trabalham hoje com reuniões e follow-up.",
};

/** Feedback rápido da IA após última mensagem do vendedor – em produção: retornado junto com a resposta do cliente */
export const MOCK_LAST_MESSAGE_FEEDBACK =
  "Você respondeu rápido, mas poderia explorar melhor a dor antes de dar desconto.";

export const MOCK_OBJECTIONS: Objection[] = [
  { id: "expensive", title: "Está muito caro", description: "Cliente acha o investimento alto." },
  { id: "think", title: "Vou pensar e te retorno", description: "Cliente adia a decisão." },
  { id: "competitor", title: "Uso outra ferramenta e estou satisfeito", description: "Cliente já tem solução." },
  { id: "no_time", title: "Não tenho tempo agora", description: "Cliente prioriza outras demandas." },
];

/** Sugestões de resposta por objeção – em produção: GET /api/training/objections/:id/suggestions */
export const MOCK_OBJECTION_SUGGESTIONS: Record<string, { text: string }[]> = {
  expensive: [
    { text: "Entendo. O que vocês gastam hoje com tempo da equipe em reuniões que não viram resultado? Às vezes o custo da inação é maior." },
    { text: "Podemos começar com um plano menor ou trial. Assim vocês validam o ROI antes de escalar." },
    { text: "O retorno que outros clientes tiveram foi X horas economizadas por mês. Posso te enviar um cálculo rápido?" },
    { text: "Comparado a uma reunião perdida ou um follow-up que não aconteceu, o investimento se paga em poucos fechamentos." },
  ],
  think: [
    { text: "Claro. O que especificamente você quer avaliar? Posso te mandar um resumo por e-mail para facilitar." },
    { text: "Que prazo faz sentido para vocês? Posso agendar um retorno para a próxima semana?" },
    { text: "Alguma dúvida que eu possa esclarecer agora para ajudar na decisão?" },
    { text: "Perfeito. Enquanto isso, posso enviar um caso de sucesso do seu setor para você compartilhar internamente?" },
  ],
  competitor: [
    { text: "Que bom que já têm algo. O que mais funciona bem e o que vocês sentem que ainda falta?" },
    { text: "O diferencial do MinuteIO é o insight em tempo real na reunião e o resumo automático. Vale um compare rápido." },
    { text: "Muitos clientes usam as duas em fases diferentes. Posso te mostrar como integrar com o que vocês já usam?" },
    { text: "Entendo. Se um dia quiserem testar só o módulo de reuniões, podemos fazer um piloto sem compromisso." },
  ],
  no_time: [
    { text: "Entendo. Quanto tempo por semana a equipe gasta hoje em reuniões que não viram resultado? Às vezes 30 min de setup economizam horas." },
    { text: "Podemos fazer uma única demonstração de 15 min. Se fizer sentido, aí vocês avaliam com mais calma." },
    { text: "O que está consumindo mais tempo agora? Às vezes o MinuteIO resolve exatamente isso em paralelo." },
    { text: "Sem problema. Posso te enviar um vídeo curto para assistir quando der? Leva 3 minutos." },
  ],
};
