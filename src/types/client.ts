export type ClientStatus = "ativo" | "em_negociacao" | "perdido" | "ganho" | "inativo";

export type FunnelStage = "prospeccao" | "qualificacao" | "proposta" | "negociacao" | "fechamento";

export type MaterialCategory = "pre-venda" | "proposta" | "pos-venda";

export type ClientMaterial = {
  id: string;
  name: string;
  type: "pdf" | "ppt" | "link" | "doc";
  category: MaterialCategory;
  date: string; // ISO
  url?: string;
};

export type TimelineActivityType = "reuniao" | "nota" | "ligacao" | "email" | "documento" | "outro";

export type TimelineActivity = {
  id: string;
  type: TimelineActivityType;
  title: string;
  date: string; // ISO
  description?: string;
};

export type ClientTask = {
  id: string;
  title: string;
  done: boolean;
  dueDate?: string; // ISO
};

export type PaymentStatus = "pago" | "em_aberto" | "atrasado";

export type PaymentMethod = "cartao" | "pix" | "boleto" | "transferencia";

export type PaymentHistoryEvent = {
  date: string; // ISO
  action: "criada" | "enviada" | "lembrete_enviado" | "paga" | "atualizada";
  description?: string;
};

export type ClientPayment = {
  id: string;
  description: string;
  value: number;
  dueDate: string; // ISO
  paidDate?: string; // ISO
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  history: PaymentHistoryEvent[];
  notes?: string;
};

export type SubscriptionStatus = "ativo" | "em_teste" | "cancelado";

export type PlanPeriod = "mensal" | "anual";

export type ClientSubscription = {
  planName: string;
  period: PlanPeriod;
  startDate: string; // ISO
  renewalDate: string; // ISO
  status: SubscriptionStatus;
  maxUsers?: number;
};

export type TokenUsageBadge = "dentro_franquia" | "proximo_limite" | "acima_franquia";

export type TokenConsumptionEventType = "resumo_reuniao" | "analise_email" | "geracao_ata" | "insight_vendas" | "outro";

export type TokenConsumptionEvent = {
  id: string;
  date: string; // ISO
  type: TokenConsumptionEventType;
  description: string;
  tokens: number;
  userName: string;
};

export type ClientTokenUsage = {
  tokensAvailable: number;
  tokensUsedThisCycle: number;
  cycleRenewalDate: string; // ISO
  quotaPerMonth: number;
  overagePricePer1000: number; // R$
  consumptionEvents: TokenConsumptionEvent[];
};

export type ClientBillingSettings = {
  overageAutoCharge: boolean;
  warnAtPercent: number; // ex: 90
};

export type Client = {
  id: string;
  name: string;
  cnpjCpf?: string;
  contactName: string;
  phone?: string;
  email: string;
  status: ClientStatus;
  funnelStage?: FunnelStage;
  lastActivity?: string; // ISO - última atividade
  lastActivityLabel?: string; // ex: "Última reunião há 3 dias"
  tags: {
    segmento?: string;
    tamanho?: string;
    origemLead?: string;
  };
  color: string;
  materials: ClientMaterial[];
  timeline: TimelineActivity[];
  generalData: {
    endereco?: string;
    tamanhoEmpresa?: string;
    areaAtuacao?: string;
    responsaveisInternos?: string[];
    ticketMedio?: string;
  };
  tasks: ClientTask[];
  customFields: Record<string, string>;
  payments: ClientPayment[];
  subscription?: ClientSubscription;
  tokenUsage?: ClientTokenUsage;
  billingSettings?: ClientBillingSettings;
};
