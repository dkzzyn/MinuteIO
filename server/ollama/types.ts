/**
 * Tipos de entrada e saída para cada modo do Ollama.
 * Usados pelo backend e podem ser espelhados no front para type-safety.
 */

/** Resultado do Ollama por minuto de reunião (bloco 1 em 1 minuto) */
export interface MinuteInsight {
  minute: number;
  summary: string;
  decisions: string[];
  tasks: { text: string; done: boolean }[];
  key_points: string[];
  sentiment: "positive" | "neutral" | "negative";
}

/** Entrada para analisar um minuto (envio ao Ollama) */
export interface MeetingMinuteInput {
  meetingContext: string;
  clientContext?: string;
  minuteNumber: number;
  transcriptChunk: string;
}

/** Coleção de insights por reunião (persistida no backend) */
export interface MeetingInsights {
  meetingId: string;
  title: string;
  minuteInsights: MinuteInsight[];
}

/** Visão agregada para a UI "Insights da Reunião" */
export interface MeetingInsightsView {
  title: string;
  realtimeSummary: string;
  mainDecisions: string[];
  tasks: { text: string; done: boolean }[];
  keyPoints: string[];
  minuteInsights: MinuteInsight[];
}

/** Modo 2: Simulador de vendas */
export interface SalesSimulatorInput {
  scenario: string;
  conversationHistory: { role: "user" | "assistant"; content: string }[];
  lastSalesMessage: string;
}

export interface SuggestionItem {
  strategy: string;
  text: string;
}

export interface SalesSimulatorOutput {
  client_message: string;
  suggestions: SuggestionItem[];
  coach_feedback: string;
}

/** Modo 3: Treino de objeções */
export interface ObjectionEvaluationInput {
  objection: string;
  salesRepResponse: string;
}

export interface ObjectionEvaluationOutput {
  score: number;
  analysis: string;
  suggestions: SuggestionItem[];
}

/** Modo 4: Resumo do dashboard de treinamentos */
export interface TrainingDashboardInput {
  scoresByModule: { moduleName: string; averageScore: number; completionRate: number }[];
  recentFeedback: string[];
  simulationHistory: { scenario: string; score: number; date: string }[];
}

export interface TrainingDashboardOutput {
  summary: string;
  strengths: string[];
  opportunities: string[];
}
