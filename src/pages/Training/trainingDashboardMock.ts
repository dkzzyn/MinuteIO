/**
 * Mock para o dashboard de treinamentos (só métricas de treino).
 * Integrar com: GET /api/training/dashboard
 */

export type TrainingKPI = {
  moduleId: string;
  moduleName: string;
  completionRate: number;
  averageScore: number;
  hoursTrained: number;
  completedCount: number;
  totalCount: number;
};

export type TrainingTrendPoint = {
  period: string;
  productScore: number;
  simulatorScore: number;
  objectionsScore: number;
  overallScore: number;
};

export type ManagerHighlight = {
  id: string;
  type: "top_sellers" | "delayed_module" | "correlation";
  title: string;
  description: string;
  value?: string;
  items?: { name: string; value: string }[];
};

export const MOCK_TRAINING_KPIS: TrainingKPI[] = [
  { moduleId: "product", moduleName: "Como usar o MinuteIO", completionRate: 72, averageScore: 8.2, hoursTrained: 4.5, completedCount: 18, totalCount: 25 },
  { moduleId: "simulator", moduleName: "Simulador de vendas (IA)", completionRate: 85, averageScore: 7.8, hoursTrained: 6.2, completedCount: 17, totalCount: 20 },
  { moduleId: "objections", moduleName: "Treinamento de objeções", completionRate: 55, averageScore: 6.5, hoursTrained: 2.8, completedCount: 11, totalCount: 20 },
];

export const MOCK_TRAINING_TREND: TrainingTrendPoint[] = [
  { period: "Out", productScore: 7.2, simulatorScore: 7.0, objectionsScore: 5.8, overallScore: 6.7 },
  { period: "Nov", productScore: 7.5, simulatorScore: 7.3, objectionsScore: 6.0, overallScore: 6.9 },
  { period: "Dez", productScore: 7.8, simulatorScore: 7.5, objectionsScore: 6.2, overallScore: 7.2 },
  { period: "Jan", productScore: 8.0, simulatorScore: 7.6, objectionsScore: 6.4, overallScore: 7.3 },
  { period: "Fev", productScore: 8.2, simulatorScore: 7.8, objectionsScore: 6.5, overallScore: 7.5 },
];

export const MOCK_MANAGER_HIGHLIGHTS: ManagerHighlight[] = [
  {
    id: "1",
    type: "top_sellers",
    title: "Top 3 vendedores por nota de treinamento",
    description: "Maior engajamento nos treinamentos no último mês.",
    items: [
      { name: "Ana Silva", value: "9.2" },
      { name: "Bruno Costa", value: "8.8" },
      { name: "Carla Mendes", value: "8.5" },
    ],
  },
  {
    id: "2",
    type: "delayed_module",
    title: "Módulo mais atrasado do time",
    description: "Foco em coaching ou reforço de conteúdo.",
    value: "Treinamento de objeções",
  },
  {
    id: "3",
    type: "correlation",
    title: "Quem treina mais tem melhor taxa de fechamento",
    description: "Vendedores que completaram 80%+ dos módulos têm taxa de win ~12 p.p. maior.",
    value: "+12 p.p. win rate",
  },
];
