import { useMemo, useState } from "react";
import { IconX } from "../icons";
import type {
  Client,
  ClientPayment,
  PaymentStatus,
  PaymentMethod,
  ClientSubscription,
  ClientTokenUsage,
  TokenConsumptionEventType
} from "../../types/client";
import { registerPayment } from "../../data/clientsStore";

const statusLabels: Record<PaymentStatus, string> = {
  pago: "Pago",
  em_aberto: "Em aberto",
  atrasado: "Atrasado"
};

const statusStyles: Record<PaymentStatus, string> = {
  pago: "bg-[var(--chart-positive)]/20 text-[var(--chart-positive)]",
  em_aberto: "bg-[var(--accent-gold)]/20 text-[var(--accent-gold)]",
  atrasado: "bg-[var(--chart-negative)]/20 text-[var(--chart-negative)]"
};

const methodLabels: Record<PaymentMethod, string> = {
  cartao: "Cartão",
  pix: "PIX",
  boleto: "Boleto",
  transferencia: "Transferência"
};

const actionLabels: Record<string, string> = {
  criada: "Cobrança criada",
  enviada: "Enviada ao cliente",
  lembrete_enviado: "Lembrete enviado",
  paga: "Pagamento registrado",
  atualizada: "Atualizada"
};

const subscriptionStatusLabels: Record<ClientSubscription["status"], string> = {
  ativo: "Ativo",
  em_teste: "Em teste",
  cancelado: "Cancelado"
};

const periodLabels: Record<ClientSubscription["period"], string> = {
  mensal: "Mensal",
  anual: "Anual"
};

const tokenEventTypeLabels: Record<TokenConsumptionEventType, string> = {
  resumo_reuniao: "Resumo de reunião",
  analise_email: "Análise de e-mail",
  geracao_ata: "Geração de ata",
  insight_vendas: "Insights de vendas",
  outro: "Outro"
};

const tokenBadgeLabels: Record<string, string> = {
  dentro_franquia: "Dentro da franquia",
  proximo_limite: "Próximo do limite",
  acima_franquia: "Acima da franquia"
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function RegisterPaymentModal({
  open,
  onClose,
  payment,
  clientId,
  onSuccess
}: {
  open: boolean;
  onClose: () => void;
  payment: ClientPayment | null;
  clientId: string;
  onSuccess: () => void;
}) {
  const [paidDate, setPaidDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [notes, setNotes] = useState("");

  if (!open || !payment) return null;

  function submit() {
    registerPayment(clientId, payment.id, { paidDate, paymentMethod, notes });
    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50" onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-[var(--bg-elevated)] border shadow-xl p-5" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Registrar pagamento</h3>
            <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--nav-hover)]">
              <IconX className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-3">{payment.description}</p>
          <p className="text-lg font-bold text-[var(--text-primary)] mb-4">{formatMoney(payment.value)}</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Data do pagamento *</label>
              <input
                type="date"
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] border text-[var(--text-primary)]"
                style={{ borderColor: "var(--input-border)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Forma de pagamento</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] border text-[var(--text-primary)]"
                style={{ borderColor: "var(--input-border)" }}
              >
                {(Object.entries(methodLabels) as [PaymentMethod, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Observações</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] border text-[var(--text-primary)]"
                style={{ borderColor: "var(--input-border)" }}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-5 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--nav-hover)] text-[var(--text-primary)]">Cancelar</button>
            <button type="button" onClick={submit} className="px-4 py-2 rounded-lg bg-[var(--accent-green)] hover:opacity-90 text-white font-medium">Registrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentDetailModal({
  open,
  onClose,
  payment
}: {
  open: boolean;
  onClose: () => void;
  payment: ClientPayment | null;
}) {
  if (!open || !payment) return null;

  return (
    <div className="fixed inset-0 z-50" onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden />
      <div className="absolute inset-0 flex items-center justify-center px-4 overflow-y-auto py-8">
        <div className="w-full max-w-lg rounded-2xl bg-[var(--bg-elevated)] border shadow-xl p-5 my-auto" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Detalhe da cobrança</h3>
            <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--nav-hover)]">
              <IconX className="w-4 h-4" />
            </button>
          </div>
          <dl className="space-y-2 text-sm mb-4">
            <div><dt className="text-[var(--text-secondary)]">Descrição</dt><dd className="font-medium text-[var(--text-primary)]">{payment.description}</dd></div>
            <div><dt className="text-[var(--text-secondary)]">Valor</dt><dd className="font-medium text-[var(--text-primary)]">{formatMoney(payment.value)}</dd></div>
            <div><dt className="text-[var(--text-secondary)]">Vencimento</dt><dd>{new Date(payment.dueDate).toLocaleDateString("pt-BR")}</dd></div>
            {payment.paidDate && <div><dt className="text-[var(--text-secondary)]">Data de pagamento</dt><dd>{new Date(payment.paidDate).toLocaleDateString("pt-BR")}</dd></div>}
            <div><dt className="text-[var(--text-secondary)]">Status</dt><dd><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[payment.status]}`}>{statusLabels[payment.status]}</span></dd></div>
            {payment.paymentMethod && <div><dt className="text-[var(--text-secondary)]">Forma de pagamento</dt><dd>{methodLabels[payment.paymentMethod]}</dd></div>}
          </dl>
          <div className="border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
            <h4 className="text-xs font-semibold text-[var(--text-secondary)] mb-2">Histórico</h4>
            <ul className="space-y-1.5 text-sm">
              {payment.history.map((h, i) => (
                <li key={i} className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">{actionLabels[h.action] ?? h.action}</span>
                  <span className="text-[var(--text-primary)]">{new Date(h.date).toLocaleDateString("pt-BR", { dateStyle: "short" })}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="button" className="px-4 py-2 rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--nav-hover)] text-[var(--text-primary)] text-sm font-medium">
              Baixar PDF / Comprovante
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanDetailModal({
  open,
  onClose,
  subscription,
  tokenUsage
}: {
  open: boolean;
  onClose: () => void;
  subscription: ClientSubscription | undefined;
  tokenUsage: ClientTokenUsage | undefined;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden />
      <div className="absolute inset-0 flex items-center justify-center px-4 overflow-y-auto py-8">
        <div className="w-full max-w-lg rounded-2xl bg-[var(--bg-elevated)] border shadow-xl p-5 my-auto" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Detalhes do plano</h3>
            <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--nav-hover)]">
              <IconX className="w-4 h-4" />
            </button>
          </div>
          {subscription ? (
            <dl className="space-y-2 text-sm mb-4">
              <div><dt className="text-[var(--text-secondary)]">Plano</dt><dd className="font-medium text-[var(--text-primary)]">{subscription.planName}</dd></div>
              <div><dt className="text-[var(--text-secondary)]">Período</dt><dd>{periodLabels[subscription.period]}</dd></div>
              <div><dt className="text-[var(--text-secondary)]">Início</dt><dd>{new Date(subscription.startDate).toLocaleDateString("pt-BR")}</dd></div>
              <div><dt className="text-[var(--text-secondary)]">Renovação</dt><dd>{new Date(subscription.renewalDate).toLocaleDateString("pt-BR")}</dd></div>
              <div><dt className="text-[var(--text-secondary)]">Status</dt><dd><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--chart-positive)]/20 text-[var(--chart-positive)]">{subscriptionStatusLabels[subscription.status]}</span></dd></div>
              {subscription.maxUsers != null && <div><dt className="text-[var(--text-secondary)]">Usuários incluídos</dt><dd>{subscription.maxUsers}</dd></div>}
            </dl>
          ) : (
            <p className="text-sm text-[var(--text-secondary)] mb-4">Nenhum plano ativo.</p>
          )}
          {tokenUsage && (
            <div className="border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
              <h4 className="text-xs font-semibold text-[var(--text-secondary)] mb-2">Tokens e uso</h4>
              <p className="text-sm text-[var(--text-primary)]">Franquia: {tokenUsage.quotaPerMonth.toLocaleString("pt-BR")} tokens/mês.</p>
              <p className="text-sm text-[var(--text-primary)]">Excedente: {formatMoney(tokenUsage.overagePricePer1000)} por 1.000 tokens.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type Props = { client: Client; onRefresh: () => void };

export default function ClientPaymentsTab({ client, onRefresh }: Props) {
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | "">("");
  const [filterMethod, setFilterMethod] = useState<PaymentMethod | "">("");
  const [filterMonth, setFilterMonth] = useState("");
  const [registerModalPayment, setRegisterModalPayment] = useState<ClientPayment | null>(null);
  const [detailPayment, setDetailPayment] = useState<ClientPayment | null>(null);
  const [showNewCharge, setShowNewCharge] = useState(false);
  const [showPlanDetail, setShowPlanDetail] = useState(false);
  const [tokenFilterPeriod, setTokenFilterPeriod] = useState("");
  const [tokenFilterUser, setTokenFilterUser] = useState("");

  const totals = useMemo(() => {
    const ps = client.payments ?? [];
    const totalContratado = ps.reduce((s, p) => s + p.value, 0);
    const totalPago = ps.filter((p) => p.status === "pago").reduce((s, p) => s + p.value, 0);
    const emAberto = ps.filter((p) => p.status === "em_aberto").reduce((s, p) => s + p.value, 0);
    const emAtraso = ps.filter((p) => p.status === "atrasado").reduce((s, p) => s + p.value, 0);
    return { totalContratado, totalPago, emAberto, emAtraso };
  }, [client.payments]);

  const filtered = useMemo(() => {
    let list = [...(client.payments ?? [])];
    if (filterStatus) list = list.filter((p) => p.status === filterStatus);
    if (filterMethod) list = list.filter((p) => p.paymentMethod === filterMethod);
    if (filterMonth) {
      const [y, m] = filterMonth.split("-").map(Number);
      list = list.filter((p) => {
        const d = new Date(p.dueDate);
        return d.getFullYear() === y && d.getMonth() + 1 === m;
      });
    }
    return list.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }, [client.payments, filterStatus, filterMethod, filterMonth]);

  const cards = [
    { label: "Total contratado", value: totals.totalContratado },
    { label: "Total pago", value: totals.totalPago },
    { label: "Em aberto", value: totals.emAberto },
    { label: "Em atraso", value: totals.emAtraso }
  ];

  const sub = client.subscription;
  const tokens = client.tokenUsage;
  const billing = client.billingSettings ?? { warnAtPercent: 90, overageAutoCharge: false };
  const usagePercent = tokens ? Math.round((tokens.tokensUsedThisCycle / tokens.quotaPerMonth) * 100) : 0;
  const tokenBadge: keyof typeof tokenBadgeLabels =
    usagePercent >= 100 ? "acima_franquia" : usagePercent >= billing.warnAtPercent ? "proximo_limite" : "dentro_franquia";
  const showUsageWarning = tokens && usagePercent >= billing.warnAtPercent && usagePercent < 100;

  const filteredTokenEvents = useMemo(() => {
    if (!tokens?.consumptionEvents?.length) return [];
    let list = [...tokens.consumptionEvents];
    if (tokenFilterPeriod) {
      const [y, m] = tokenFilterPeriod.split("-").map(Number);
      list = list.filter((e) => {
        const d = new Date(e.date);
        return d.getFullYear() === y && d.getMonth() + 1 === m;
      });
    }
    if (tokenFilterUser) list = list.filter((e) => e.userName.toLowerCase().includes(tokenFilterUser.toLowerCase()));
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [tokens?.consumptionEvents, tokenFilterPeriod, tokenFilterUser]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho da aba */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Pagamentos</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Acompanhe todos os recebimentos deste cliente em um só lugar.</p>
          <p className="text-sm text-[var(--text-secondary)] mt-2">Aqui você vê quanto este cliente já consumiu de IA neste ciclo e quanto ainda pode usar dentro do plano contratado. Ao ultrapassar o limite de tokens do plano, você pode cobrar excedentes ou sugerir um upgrade.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setShowNewCharge(true)} className="px-4 py-2 rounded-lg bg-[var(--accent-green)] hover:opacity-90 text-white font-medium text-sm">
            Registrar pagamento / Nova cobrança
          </button>
          <button type="button" className="px-4 py-2 rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--nav-hover)] text-[var(--text-primary)] font-medium text-sm">
            Adicionar créditos
          </button>
          <button type="button" className="px-4 py-2 rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--nav-hover)] text-[var(--text-primary)] font-medium text-sm">
            Alterar plano
          </button>
          <button type="button" onClick={() => setShowPlanDetail(true)} className="px-4 py-2 rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--nav-hover)] text-[var(--text-primary)] font-medium text-sm">
            Ver detalhes do plano
          </button>
        </div>
      </div>

      {/* Saldo financeiro - Cards resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl bg-[var(--bg-elevated)] border p-4" style={{ borderColor: "var(--border-subtle)" }}>
            <p className="text-xs font-medium text-[var(--text-secondary)]">{c.label}</p>
            <p className="text-xl font-bold text-[var(--text-primary)] mt-1">{formatMoney(c.value)}</p>
          </div>
        ))}
      </div>

      {/* Status de assinatura / plano */}
      {sub && (
        <div className="rounded-xl bg-[var(--bg-elevated)] border p-5" style={{ borderColor: "var(--border-subtle)" }}>
          <h3 className="font-semibold text-[var(--text-primary)] mb-3">Status de assinatura / plano</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-[var(--text-secondary)]">Plano</p>
              <p className="font-medium text-[var(--text-primary)]">{sub.planName}</p>
            </div>
            <div>
              <p className="text-[var(--text-secondary)]">Período</p>
              <p className="font-medium text-[var(--text-primary)]">{periodLabels[sub.period]}</p>
            </div>
            <div>
              <p className="text-[var(--text-secondary)]">Início · Renovação</p>
              <p className="font-medium text-[var(--text-primary)]">{new Date(sub.startDate).toLocaleDateString("pt-BR")} · {new Date(sub.renewalDate).toLocaleDateString("pt-BR")}</p>
            </div>
            <div>
              <p className="text-[var(--text-secondary)]">Situação</p>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                sub.status === "ativo" ? "bg-[var(--chart-positive)]/20 text-[var(--chart-positive)]" :
                sub.status === "em_teste" ? "bg-[var(--accent-gold)]/20 text-[var(--accent-gold)]" :
                "bg-[var(--text-secondary)]/20 text-[var(--text-secondary)]"
              }`}>{subscriptionStatusLabels[sub.status]}</span>
            </div>
          </div>
        </div>
      )}

      {/* Consumo de tokens */}
      {tokens && (
        <div className="rounded-xl bg-[var(--bg-elevated)] border overflow-hidden" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="p-5 border-b" style={{ borderColor: "var(--border-subtle)" }}>
            <h3 className="font-semibold text-[var(--text-primary)]">Consumo de tokens deste cliente</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">Aqui você vê quanto este cliente já consumiu de IA neste ciclo e quanto ainda pode usar dentro do plano contratado.</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div><p className="text-xs text-[var(--text-secondary)]">Tokens disponíveis</p><p className="text-lg font-bold text-[var(--text-primary)]">{tokens.tokensAvailable.toLocaleString("pt-BR")}</p></div>
              <div><p className="text-xs text-[var(--text-secondary)]">Usados neste ciclo</p><p className="text-lg font-bold text-[var(--text-primary)]">{tokens.tokensUsedThisCycle.toLocaleString("pt-BR")}</p></div>
              <div><p className="text-xs text-[var(--text-secondary)]">Renova em</p><p className="text-lg font-bold text-[var(--text-primary)]">{new Date(tokens.cycleRenewalDate).toLocaleDateString("pt-BR")}</p></div>
              <div><p className="text-xs text-[var(--text-secondary)]">Status</p><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                tokenBadge === "dentro_franquia" ? "bg-[var(--chart-positive)]/20 text-[var(--chart-positive)]" :
                tokenBadge === "proximo_limite" ? "bg-[var(--accent-gold)]/20 text-[var(--accent-gold)]" :
                "bg-[var(--chart-negative)]/20 text-[var(--chart-negative)]"
              }`}>{tokenBadgeLabels[tokenBadge]}</span></div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1"><span>Uso do ciclo</span><span>{usagePercent}%</span></div>
              <div className="h-2 rounded-full bg-[var(--bg-muted)] overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, usagePercent)}%`, backgroundColor: usagePercent >= 100 ? "var(--chart-negative)" : usagePercent >= billing.warnAtPercent ? "var(--accent-gold)" : "var(--chart-positive)" }} />
              </div>
            </div>
            <div className="text-sm text-[var(--text-secondary)]">
              <p className="font-medium text-[var(--text-primary)] mb-1">O que é contado como token</p>
              <p className="mb-1">1 reunião resumida = 500 tokens · 1 análise de e-mail = 100 tokens · Geração de ata = 800 tokens · Insights de vendas = 1.200 tokens.</p>
              <p className="text-xs">Tokens representam o consumo de recursos de IA, permitindo cobrar por uso sem travar o cliente em um plano rígido.</p>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)] mb-2">Regras do plano vs tokens</p>
              <p className="text-sm text-[var(--text-secondary)]">Este plano inclui {tokens.quotaPerMonth.toLocaleString("pt-BR")} tokens por mês. Ao ultrapassar, cobraremos {formatMoney(tokens.overagePricePer1000)} por 1.000 tokens extras.</p>
              <label className="flex items-center gap-2 mt-2 text-sm text-[var(--text-secondary)]">
                <input type="checkbox" checked={billing.overageAutoCharge} readOnly className="rounded" />
                Cobrança automática de excedente
              </label>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)] mb-2">Detalhamento de consumo</p>
              <div className="flex flex-wrap gap-2 mb-2">
                <input type="month" value={tokenFilterPeriod} onChange={(e) => setTokenFilterPeriod(e.target.value)} className="px-2 py-1.5 rounded-lg bg-[var(--input-bg)] border text-sm" style={{ borderColor: "var(--input-border)" }} />
                <input type="text" value={tokenFilterUser} onChange={(e) => setTokenFilterUser(e.target.value)} placeholder="Filtrar por usuário" className="px-2 py-1.5 rounded-lg bg-[var(--input-bg)] border text-sm w-40" style={{ borderColor: "var(--input-border)" }} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-[var(--text-secondary)] bg-[var(--bg-muted)]">
                    <tr><th className="p-2 text-left">Data</th><th className="p-2 text-left">Tipo</th><th className="p-2 text-left">Tokens</th><th className="p-2 text-left">Usuário</th></tr>
                  </thead>
                  <tbody>
                    {filteredTokenEvents.length === 0 ? (
                      <tr><td colSpan={4} className="p-3 text-[var(--text-secondary)]">Nenhum consumo no período.</td></tr>
                    ) : (
                      filteredTokenEvents.map((e) => (
                        <tr key={e.id} className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                          <td className="p-2">{new Date(e.date).toLocaleDateString("pt-BR")}</td>
                          <td className="p-2">{tokenEventTypeLabels[e.type] ?? e.description}</td>
                          <td className="p-2 font-medium">{e.tokens.toLocaleString("pt-BR")}</td>
                          <td className="p-2">{e.userName}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Aviso consumo próximo do limite */}
      {showUsageWarning && tokens && (
        <div className="rounded-xl border p-4 bg-[var(--accent-gold)]/10" style={{ borderColor: "var(--accent-gold)" }}>
          <p className="text-sm font-medium text-[var(--text-primary)]">Este cliente já usou {usagePercent}% dos tokens deste ciclo. Considere oferecer um upgrade de plano ou adicionar créditos.</p>
        </div>
      )}

      {/* Histórico de cobranças */}
      <h3 className="font-semibold text-[var(--text-primary)]">Histórico de cobranças</h3>
      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as PaymentStatus | "")}
          className="px-3 py-2 rounded-lg bg-[var(--input-bg)] border text-sm text-[var(--text-primary)]"
          style={{ borderColor: "var(--input-border)" }}
        >
          <option value="">Todos os status</option>
          {(Object.entries(statusLabels) as [PaymentStatus, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={filterMethod}
          onChange={(e) => setFilterMethod(e.target.value as PaymentMethod | "")}
          className="px-3 py-2 rounded-lg bg-[var(--input-bg)] border text-sm text-[var(--text-primary)]"
          style={{ borderColor: "var(--input-border)" }}
        >
          <option value="">Todas as formas</option>
          {(Object.entries(methodLabels) as [PaymentMethod, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[var(--input-bg)] border text-sm text-[var(--text-primary)]"
          style={{ borderColor: "var(--input-border)" }}
        />
      </div>

      {/* Tabela */}
      <div className="rounded-xl bg-[var(--bg-elevated)] border overflow-hidden" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-muted)] text-[var(--text-secondary)] text-left">
              <tr>
                <th className="p-3">Descrição</th>
                <th className="p-3">Valor</th>
                <th className="p-3">Vencimento</th>
                <th className="p-3">Data pagamento</th>
                <th className="p-3">Status</th>
                <th className="p-3">Forma</th>
                <th className="p-3 w-28">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-6 text-center text-[var(--text-secondary)]">Nenhuma cobrança encontrada.</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className={`border-t ${p.status === "atrasado" ? "bg-[var(--chart-negative)]/5" : ""}`}
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    <td className="p-3 font-medium text-[var(--text-primary)]">{p.description}</td>
                    <td className="p-3 text-[var(--text-primary)]">{formatMoney(p.value)}</td>
                    <td className="p-3 text-[var(--text-secondary)]">{new Date(p.dueDate).toLocaleDateString("pt-BR")}</td>
                    <td className="p-3 text-[var(--text-secondary)]">{p.paidDate ? new Date(p.paidDate).toLocaleDateString("pt-BR") : "—"}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[p.status]} ${p.status === "atrasado" ? "text-[var(--chart-negative)]" : ""}`}>
                        {statusLabels[p.status]}
                      </span>
                    </td>
                    <td className="p-3 text-[var(--text-secondary)]">{p.paymentMethod ? methodLabels[p.paymentMethod] : "—"}</td>
                    <td className="p-3">
                      <div className="flex gap-1 flex-wrap">
                        {(p.status === "em_aberto" || p.status === "atrasado") && (
                          <button type="button" onClick={() => setRegisterModalPayment(p)} className="px-2 py-1 rounded bg-[var(--accent-green)]/20 text-[var(--accent-green)] hover:bg-[var(--accent-green)]/30 text-xs font-medium" title="Registrar pagamento">Pagar</button>
                        )}
                        <button type="button" onClick={() => setDetailPayment(p)} className="px-2 py-1 rounded bg-[var(--bg-muted)] hover:bg-[var(--nav-hover)] text-[var(--text-secondary)] text-xs" title="Ver detalhes">Detalhes</button>
                        <button type="button" className="px-2 py-1 rounded bg-[var(--bg-muted)] hover:bg-[var(--nav-hover)] text-[var(--text-secondary)] text-xs" title="Enviar lembrete">Lembrete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RegisterPaymentModal open={!!registerModalPayment} payment={registerModalPayment} clientId={client.id} onClose={() => setRegisterModalPayment(null)} onSuccess={onRefresh} />
      <PaymentDetailModal open={!!detailPayment} payment={detailPayment} onClose={() => setDetailPayment(null)} />
      <PlanDetailModal open={showPlanDetail} onClose={() => setShowPlanDetail(false)} subscription={client.subscription} tokenUsage={client.tokenUsage} />
      {showNewCharge && (
        <div className="rounded-xl bg-[var(--bg-muted)]/50 border p-4 text-center text-sm text-[var(--text-secondary)]" style={{ borderColor: "var(--border-subtle)" }}>
          Nova cobrança: em breve você poderá criar faturas por aqui. (Integração com Stripe/PagSeguro preparada.)
          <button type="button" onClick={() => setShowNewCharge(false)} className="block mx-auto mt-2 text-[var(--accent-green)] hover:underline">Fechar</button>
        </div>
      )}
    </div>
  );
}
