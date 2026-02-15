import type { Client, ClientPayment } from "../types/client";
import type { SupportMaterial } from "../types/supportMaterial";

function iso(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

function addDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function payment(id: string, description: string, value: number, dueDaysAgo: number, status: ClientPayment["status"], paidDate?: string, paymentMethod?: ClientPayment["paymentMethod"]): ClientPayment {
  const due = iso(dueDaysAgo);
  return {
    id,
    description,
    value,
    dueDate: due,
    paidDate,
    status,
    paymentMethod,
    history: [
      { date: due, action: "criada" },
      ...(paidDate ? [{ date: paidDate, action: "paga" as const }] : [])
    ]
  };
}

const initialClients: Client[] = [
  {
    id: "c1",
    name: "Loja Alpha",
    cnpjCpf: "12.345.678/0001-90",
    contactName: "Carlos Silva",
    phone: "(11) 98765-4321",
    email: "carlos@lojaalpha.com.br",
    status: "em_negociacao",
    funnelStage: "proposta",
    lastActivity: iso(3),
    lastActivityLabel: "Última reunião há 3 dias",
    tags: { segmento: "Varejo", tamanho: "Médio", origemLead: "Site" },
    color: "#22c55e",
    materials: [
      { id: "m1", name: "Apresentação comercial", type: "ppt", category: "pre-venda", date: iso(5), url: "#" },
      { id: "m2", name: "Proposta v2", type: "pdf", category: "proposta", date: iso(2), url: "#" }
    ],
    supportMaterials: [],
    timeline: [
      { id: "t1", type: "reuniao", title: "Reunião de diagnóstico", date: iso(3), description: "Discovery com foco em integração." },
      { id: "t2", type: "documento", title: "Envio de proposta", date: iso(2) },
      { id: "t3", type: "email", title: "Follow-up pós-reunião", date: iso(1) }
    ],
    generalData: {
      endereco: "Av. Paulista, 1000 – São Paulo, SP",
      tamanhoEmpresa: "50–100 funcionários",
      areaAtuacao: "Varejo / E-commerce",
      responsaveisInternos: ["Carlos Silva (Compras)", "Ana Costa (TI)"],
      ticketMedio: "R$ 15.000/mês"
    },
    tasks: [
      { id: "tk1", title: "Enviar follow-up até 16/02", done: false, dueDate: iso(-2) },
      { id: "tk2", title: "Preparar apresentação técnica", done: true }
    ],
    customFields: { Ferramenta_atual: "Planilhas", Concorrentes: "Concorrente X" },
    payments: [
      payment("pay1", "Mensalidade Janeiro 2026", 5000, -15, "pago", iso(-12), "pix"),
      payment("pay2", "Setup inicial", 8000, -5, "pago", iso(-4), "transferencia"),
      payment("pay3", "Mensalidade Fevereiro 2026", 5000, 5, "em_aberto"),
      payment("pay4", "Taxa de integração", 1200, -3, "atrasado")
    ],
    subscription: {
      planName: "MinuteIO Pro – 5 usuários",
      period: "mensal",
      startDate: iso(30),
      renewalDate: addDays(15),
      status: "ativo",
      maxUsers: 5
    },
    tokenUsage: {
      tokensAvailable: 10000,
      tokensUsedThisCycle: 3250,
      cycleRenewalDate: "2026-03-01",
      quotaPerMonth: 20000,
      overagePricePer1000: 50,
      consumptionEvents: [
        { id: "te1", date: iso(0), type: "resumo_reuniao", description: "Resumo de reunião", tokens: 500, userName: "Carlos Silva" },
        { id: "te2", date: iso(1), type: "geracao_ata", description: "Geração de ata de reunião", tokens: 800, userName: "Ana Costa" },
        { id: "te3", date: iso(2), type: "insight_vendas", description: "Insights de vendas", tokens: 1200, userName: "Carlos Silva" },
        { id: "te4", date: iso(3), type: "analise_email", description: "Análise de e-mail", tokens: 100, userName: "Ana Costa" }
      ]
    },
    billingSettings: { overageAutoCharge: false, warnAtPercent: 90 }
  },
  {
    id: "c2",
    name: "SaaS Beta",
    cnpjCpf: "98.765.432/0001-10",
    contactName: "Maria Santos",
    phone: "(21) 91234-5678",
    email: "maria@saasbeta.com",
    status: "ativo",
    funnelStage: "negociacao",
    lastActivity: iso(1),
    lastActivityLabel: "Última reunião há 1 dia",
    tags: { segmento: "SaaS", tamanho: "Startup", origemLead: "Indicação" },
    color: "#3b82f6",
    materials: [],
    supportMaterials: [],
    timeline: [
      { id: "t4", type: "reuniao", title: "Demo funcional", date: iso(1) }
    ],
    generalData: { tamanhoEmpresa: "10–50", areaAtuacao: "Tecnologia" },
    tasks: [{ id: "tk3", title: "Enviar contrato revisado", done: false }],
    customFields: {},
    payments: [
      payment("pay5", "Mensalidade Janeiro 2026", 3000, -8, "pago", iso(-7), "cartao"),
      payment("pay6", "Mensalidade Fevereiro 2026", 3000, 12, "em_aberto")
    ],
    subscription: {
      planName: "MinuteIO Pro – 3 usuários",
      period: "anual",
      startDate: iso(60),
      renewalDate: addDays(300),
      status: "em_teste",
      maxUsers: 3
    },
    tokenUsage: {
      tokensAvailable: 15000,
      tokensUsedThisCycle: 2100,
      cycleRenewalDate: "2026-03-15",
      quotaPerMonth: 15000,
      overagePricePer1000: 60,
      consumptionEvents: [
        { id: "te5", date: iso(0), type: "resumo_reuniao", description: "Resumo de reunião", tokens: 500, userName: "Maria Santos" },
        { id: "te6", date: iso(1), type: "geracao_ata", description: "Geração de ata", tokens: 800, userName: "Maria Santos" }
      ]
    },
    billingSettings: { overageAutoCharge: true, warnAtPercent: 85 }
  }
];

let clients: Client[] = [...initialClients];

export function getClients(): Client[] {
  return [...clients];
}

export function getClientById(id: string): Client | undefined {
  return clients.find((c) => c.id === id);
}

export function addClient(client: Omit<Client, "id">): Client {
  const id = `c-${Date.now()}`;
  const newClient: Client = { ...client, id };
  clients.push(newClient);
  return newClient;
}

export function updateClient(id: string, data: Partial<Client>): void {
  const i = clients.findIndex((c) => c.id === id);
  if (i >= 0) clients[i] = { ...clients[i], ...data };
}

export function addMaterial(clientId: string, material: Omit<import("../types/client").ClientMaterial, "id">): void {
  const c = clients.find((x) => x.id === clientId);
  if (!c) return;
  const id = `m-${Date.now()}`;
  c.materials.push({ ...material, id });
}

export function addTimelineActivity(clientId: string, activity: Omit<import("../types/client").TimelineActivity, "id">): void {
  const c = clients.find((x) => x.id === clientId);
  if (!c) return;
  const id = `t-${Date.now()}`;
  c.timeline.unshift({ ...activity, id });
}

export function registerPayment(clientId: string, paymentId: string, data: { paidDate: string; paymentMethod: ClientPayment["paymentMethod"]; notes?: string }): void {
  const c = clients.find((x) => x.id === clientId);
  if (!c) return;
  const p = c.payments.find((x) => x.id === paymentId);
  if (!p) return;
  p.status = "pago";
  p.paidDate = data.paidDate;
  p.paymentMethod = data.paymentMethod;
  p.notes = data.notes;
  p.history.push({ date: data.paidDate, action: "paga" });
}

export function addPayment(clientId: string, data: Omit<ClientPayment, "id" | "history">): void {
  const c = clients.find((x) => x.id === clientId);
  if (!c) return;
  const id = `pay-${Date.now()}`;
  const status = data.status ?? "em_aberto";
  const due = data.dueDate;
  c.payments.push({
    ...data,
    id,
    status,
    history: [{ date: new Date().toISOString(), action: "criada" }]
  });
}

export function addSupportMaterial(clientId: string, material: Omit<SupportMaterial, "id" | "clientId" | "uploadedAt" | "uploadedByUserId">): SupportMaterial {
  const c = clients.find((x) => x.id === clientId);
  if (!c) throw new Error("Cliente não encontrado");
  if (!c.supportMaterials) c.supportMaterials = [];
  const id = `sm-${Date.now()}`;
  const now = new Date().toISOString();
  const newMaterial: SupportMaterial = {
    ...material,
    id,
    clientId,
    uploadedAt: now,
    uploadedByUserId: "u1"
  };
  c.supportMaterials.push(newMaterial);
  return newMaterial;
}
