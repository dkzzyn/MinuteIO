/**
 * Tipos da área de Treinamentos – MinuteIO.
 * Onde integrar API real: scores e completion vêm de GET /api/training/scores (ou similar).
 */

export type TrainingScore = {
  moduleId: string;
  moduleName: string;
  averageScore: number; // 0–10
  completionPercentage: number; // 0–100
};

/**
 * Feedbacks da IA – GET /api/training/feedbacks
 */
export type TrainingFeedback = {
  id: string;
  type: "strength" | "opportunity";
  message: string;
  createdAt: string; // ISO date
};

/**
 * Histórico de simulados – GET /api/training/simulations/history
 */
export type SimulationHistory = {
  id: string;
  type: "simulator" | "objection";
  scenario: string;
  date: string; // ISO date
  score: number; // 0–10
};

/**
 * Módulo de treinamento (lista no hub)
 */
export type TrainingModule = {
  id: string;
  name: string;
  description: string;
  route: string;
};

/**
 * Mensagem do chat (simulador)
 */
export type Message = {
  id: string;
  sender: "client" | "employee";
  text: string;
  timestamp: string; // ISO ou "HH:mm"
};

/**
 * Sugestão da IA – cada uma com estratégia
 */
export type Suggestion = {
  id: string;
  text: string;
  strategyType: "explore_context" | "reinforce_value" | "offer_option" | "social_proof";
};

/**
 * Objeção para o treino
 */
export type Objection = {
  id: string;
  title: string;
  description?: string;
};

/**
 * Lição do módulo produto
 */
export type LessonStatus = "completed" | "in_progress" | "not_started";

export type ProductLesson = {
  id: string;
  title: string;
  status: LessonStatus;
  durationMinutes: number;
  type: "video" | "text" | "quiz";
};

/**
 * Cenário do simulador de vendas
 */
export type SalesScenario = {
  id: string;
  name: string;
  description?: string;
};
