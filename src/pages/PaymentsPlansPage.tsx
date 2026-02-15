import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getCompanyTokens,
  getTokenUsageEntries,
  getTypeLabel
} from "../data/companyTokensStore";
import type { TokenUsageEntry, TokenUsageType } from "../types/companyTokens";
import BuyTokensModal from "../components/modals/BuyTokensModal";
import ChangePlanModal, { type PlanId } from "../components/modals/ChangePlanModal";

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function planNameToId(planName: string): PlanId {
  if (planName.toLowerCase().includes("starter")) return "starter";
  if (planName.toLowerCase().includes("scale")) return "scale";
  return "pro";
}

export default function PaymentsPlansPage() {
  const [reportFilterPeriod, setReportFilterPeriod] = useState("");
  const [reportFilterUser, setReportFilterUser] = useState("");
  const [reportFilterClient, setReportFilterClient] = useState("");
  const [reportFilterType, setReportFilterType] = useState<TokenUsageType | "">("");
  const [buyTokensOpen, setBuyTokensOpen] = useState(false);
  const [changePlanOpen, setChangePlanOpen] = useState(false);

  const company = getCompanyTokens();
  const currentPlanId = planNameToId(company.planName);
  const entries = getTokenUsageEntries();

  const usagePercent = company.tokensTotalPerCycle
    ? Math.round((company.tokensUsed / company.tokensTotalPerCycle) * 100)
    : 0;
  const showAlert80 = usagePercent >= 80 && usagePercent < 100;
  const showAlert100 = usagePercent >= 100;

  const filteredEntries = useMemo(() => {
    let list = [...entries];
    if (reportFilterPeriod) {
      const [y, m] = reportFilterPeriod.split("-").map(Number);
      list = list.filter((e) => {
        const d = new Date(e.createdAt);
        return d.getFullYear() === y && d.getMonth() + 1 === m;
      });
    }
    if (reportFilterUser) list = list.filter((e) => e.userName.toLowerCase().includes(reportFilterUser.toLowerCase()));
    if (reportFilterClient) list = list.filter((e) => e.clientName?.toLowerCase().includes(reportFilterClient.toLowerCase()));
    if (reportFilterType) list = list.filter((e) => e.type === reportFilterType);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [entries, reportFilterPeriod, reportFilterUser, reportFilterClient, reportFilterType]);

  const byUser = useMemo(() => {
    const map: Record<string, number> = {};
    filteredEntries.forEach((e) => {
      map[e.userName] = (map[e.userName] ?? 0) + e.tokens;
    });
    return Object.entries(map)
      .map(([name, tokens]) => ({ name, tokens }))
      .sort((a, b) => b.tokens - a.tokens);
  }, [filteredEntries]);

  const totalFiltered = filteredEntries.reduce((s, e) => s + e.tokens, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Pagamentos e planos</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          Visão geral dos recebimentos e planos da sua conta.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl bg-[var(--bg-elevated)] border p-5" style={{ borderColor: "var(--border-subtle)" }}>
          <p className="text-sm text-[var(--text-secondary)]">Recebimentos este mês</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">R$ 0,00</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Resumo de todos os clientes</p>
        </div>
        <div className="rounded-xl bg-[var(--bg-elevated)] border p-5" style={{ borderColor: "var(--border-subtle)" }}>
          <p className="text-sm text-[var(--text-secondary)]">Em aberto</p>
          <p className="text-2xl font-bold text-[var(--accent-gold)] mt-1">R$ 0,00</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">A receber</p>
        </div>
        <div className="rounded-xl bg-[var(--bg-elevated)] border p-5" style={{ borderColor: "var(--border-subtle)" }}>
          <p className="text-sm text-[var(--text-secondary)]">Plano atual</p>
          <p className="text-xl font-bold text-[var(--text-primary)] mt-1">MinuteIO Pro</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Gestão de reuniões e CRM</p>
        </div>
      </div>

      {/* ---------- Créditos de IA (tokens) - visão empresa ---------- */}
      <section className="rounded-xl bg-[var(--bg-elevated)] border overflow-hidden" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="p-5 border-b" style={{ borderColor: "var(--border-subtle)" }}>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Créditos de IA (tokens)</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Sua empresa possui um saldo de tokens para usar recursos de IA, como resumos de reuniões e insights automáticos. Cada ação consome uma parte desse saldo.
          </p>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Acompanhe abaixo o consumo por período, por usuário e por reunião, e veja quantos tokens sua empresa ainda tem disponíveis neste ciclo.
          </p>
        </div>

        <div className="p-5 space-y-6">
          {/* Saldo atual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Tokens disponíveis</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {(company.tokensTotalPerCycle - company.tokensUsed).toLocaleString("pt-BR")} de {company.tokensTotalPerCycle.toLocaleString("pt-BR")} neste ciclo
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Renovação</p>
              <p className="text-lg font-semibold text-[var(--text-primary)]">Renova em {new Date(company.renewalDate).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>

          {/* Consumo no período + barra */}
          <div>
            <p className="text-sm text-[var(--text-secondary)] mb-1">Tokens usados neste mês</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">{company.tokensUsed.toLocaleString("pt-BR")}</p>
            <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-1 mb-1">
              <span>Uso do ciclo</span>
              <span>{usagePercent}%</span>
            </div>
            <div className="h-3 rounded-full bg-[var(--bg-muted)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, usagePercent)}%`,
                  backgroundColor: usagePercent >= 100 ? "var(--chart-negative)" : usagePercent >= 80 ? "var(--accent-gold)" : "var(--chart-positive)"
                }}
              />
            </div>
            {/* Mini gráfico uso por dia */}
            <div className="mt-3 flex items-end gap-0.5 h-12">
              {company.usageByDay.slice().reverse().map((d) => {
                const max = Math.max(...company.usageByDay.map((x) => x.tokens), 1);
                const h = (d.tokens / max) * 100;
                return (
                  <div
                    key={d.date}
                    className="flex-1 min-w-0 rounded-t bg-[var(--accent-green)]/60 hover:bg-[var(--accent-green)]"
                    style={{ height: `${Math.max(4, h)}%` }}
                    title={`${d.date}: ${d.tokens} tokens`}
                  />
                );
              })}
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Uso ao longo dos dias do mês</p>
          </div>

          {/* Alertas */}
          {showAlert80 && (
            <div className="rounded-lg border p-4 bg-[var(--accent-gold)]/10" style={{ borderColor: "var(--accent-gold)" }}>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Você usou {usagePercent}% dos tokens deste ciclo. Considere comprar mais créditos ou fazer upgrade de plano.
              </p>
            </div>
          )}
          {showAlert100 && (
            <div className="rounded-lg border p-4 bg-[var(--chart-negative)]/10" style={{ borderColor: "var(--chart-negative)" }}>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Você atingiu o limite de tokens deste ciclo. Adquira tokens adicionais para continuar usando recursos de IA.
              </p>
            </div>
          )}

          {/* Botões */}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setBuyTokensOpen(true)} className="px-4 py-2 rounded-lg bg-[var(--accent-green)] hover:opacity-90 text-white font-medium text-sm">
              Adquirir tokens adicionais
            </button>
            <button type="button" onClick={() => setChangePlanOpen(true)} className="px-4 py-2 rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--nav-hover)] text-[var(--text-primary)] font-medium text-sm">
              Alterar plano
            </button>
          </div>

          {/* Regras do plano */}
          <div className="rounded-lg bg-[var(--bg-muted)]/50 p-4">
            <p className="text-sm font-medium text-[var(--text-primary)]">Plano {company.planName} – {company.tokensTotalPerCycle.toLocaleString("pt-BR")} tokens por mês incluídos.</p>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              Tokens excedentes serão cobrados a {formatMoney(company.overagePricePer1000)} por 1.000 tokens.
            </p>
          </div>

          {/* Consumo por usuário */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-3">Consumo por usuário</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-3">Quem mais consumiu tokens no período (com filtros aplicados).</p>
            {byUser.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">Nenhum registro no período.</p>
            ) : (
              <ul className="space-y-2">
                {byUser.map((u) => {
                  const pct = totalFiltered ? Math.round((u.tokens / totalFiltered) * 100) : 0;
                  return (
                    <li key={u.name} className="flex items-center gap-3">
                      <span className="font-medium text-[var(--text-primary)] w-24">{u.name}</span>
                      <span className="text-[var(--text-secondary)]">{u.tokens.toLocaleString("pt-BR")} tokens</span>
                      <span className="text-xs text-[var(--text-secondary)]">({pct}% do total)</span>
                      <div className="flex-1 max-w-[120px] h-2 rounded-full bg-[var(--bg-muted)] overflow-hidden">
                        <div className="h-full rounded-full bg-[var(--accent-green)]" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Relatório de consumo por reunião / insight */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-3">Relatório de consumo por reunião / insight</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-3">Cada reunião e insight consome tokens do saldo da empresa.</p>
            <div className="flex flex-wrap gap-2 mb-3">
              <input
                type="month"
                value={reportFilterPeriod}
                onChange={(e) => setReportFilterPeriod(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[var(--input-bg)] border text-sm text-[var(--text-primary)]"
                style={{ borderColor: "var(--input-border)" }}
              />
              <input
                type="text"
                value={reportFilterUser}
                onChange={(e) => setReportFilterUser(e.target.value)}
                placeholder="Usuário"
                className="px-3 py-2 rounded-lg bg-[var(--input-bg)] border text-sm text-[var(--text-primary)] w-32"
                style={{ borderColor: "var(--input-border)" }}
              />
              <input
                type="text"
                value={reportFilterClient}
                onChange={(e) => setReportFilterClient(e.target.value)}
                placeholder="Cliente"
                className="px-3 py-2 rounded-lg bg-[var(--input-bg)] border text-sm text-[var(--text-primary)] w-36"
                style={{ borderColor: "var(--input-border)" }}
              />
              <select
                value={reportFilterType}
                onChange={(e) => setReportFilterType(e.target.value as TokenUsageType | "")}
                className="px-3 py-2 rounded-lg bg-[var(--input-bg)] border text-sm text-[var(--text-primary)]"
                style={{ borderColor: "var(--input-border)" }}
              >
                <option value="">Tipo de uso</option>
                <option value="MEETING_SUMMARY">Reunião resumida</option>
                <option value="INSIGHT">Insight gerado</option>
                <option value="EMAIL_FOLLOWUP">Follow-up automático</option>
                <option value="GERACAO_ATA">Geração de ata</option>
                <option value="ANALISE_EMAIL">Análise de e-mail</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>
            <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--border-subtle)" }}>
              <table className="w-full text-sm">
                <thead className="bg-[var(--bg-muted)] text-[var(--text-secondary)] text-left">
                  <tr>
                    <th className="p-3">Data/hora</th>
                    <th className="p-3">Tipo de uso</th>
                    <th className="p-3">Usuário</th>
                    <th className="p-3">Cliente / Reunião</th>
                    <th className="p-3 text-right">Tokens</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.length === 0 ? (
                    <tr><td colSpan={5} className="p-4 text-center text-[var(--text-secondary)]">Nenhum registro encontrado.</td></tr>
                  ) : (
                    filteredEntries.map((e) => (
                      <tr key={e.id} className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                        <td className="p-3 text-[var(--text-secondary)]">{new Date(e.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</td>
                        <td className="p-3 text-[var(--text-primary)]">{getTypeLabel(e.type)}</td>
                        <td className="p-3 text-[var(--text-primary)]">{e.userName}</td>
                        <td className="p-3 text-[var(--text-secondary)]">
                          {e.clientName ?? "—"}
                          {e.meetingTitle && <span className="block text-xs mt-0.5">&quot;{e.meetingTitle}&quot;</span>}
                        </td>
                        <td className="p-3 text-right font-medium text-[var(--text-primary)]">{e.tokens.toLocaleString("pt-BR")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <div className="rounded-xl bg-[var(--bg-elevated)] border p-5" style={{ borderColor: "var(--border-subtle)" }}>
        <h2 className="font-semibold text-[var(--text-primary)] mb-3">Acesso rápido</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Os pagamentos por cliente ficam no dossiê de cada um. Abra um cliente e use a aba &quot;Pagamentos&quot; para registrar cobranças, ver consumo de tokens e detalhes do plano.
        </p>
        <Link
          to="/project"
          className="inline-flex px-4 py-2 rounded-lg bg-[var(--accent-green)] hover:opacity-90 text-white font-medium text-sm"
        >
          Ver clientes
        </Link>
      </div>

      <BuyTokensModal
        open={buyTokensOpen}
        onClose={() => setBuyTokensOpen(false)}
        company={company}
        onSuccess={() => {}}
      />
      <ChangePlanModal
        open={changePlanOpen}
        onClose={() => setChangePlanOpen(false)}
        company={company}
        currentPlanId={currentPlanId}
        onSuccess={() => {}}
      />
    </div>
  );
}
