import { useState } from "react";
import { IconX } from "../icons";
import type { CompanyTokens } from "../../types/companyTokens";

export type PlanId = "starter" | "pro" | "scale";

export type Plan = {
  id: PlanId;
  name: string;
  tokensPerMonth: number;
  priceMonthly: number;
  recommendedFor: string;
};

const PLANS: Plan[] = [
  { id: "starter", name: "MinuteIO Starter", tokensPerMonth: 3000, priceMonthly: 79, recommendedFor: "Profissional individual" },
  { id: "pro", name: "MinuteIO Pro", tokensPerMonth: 10000, priceMonthly: 199, recommendedFor: "Pequenas e médias equipes" },
  { id: "scale", name: "MinuteIO Scale", tokensPerMonth: 30000, priceMonthly: 499, recommendedFor: "Times de vendas com alto volume" }
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

type Props = {
  open: boolean;
  onClose: () => void;
  company: CompanyTokens;
  currentPlanId?: PlanId;
  onSuccess?: () => void;
};

export default function ChangePlanModal({ open, onClose, company, currentPlanId = "pro", onSuccess }: Props) {
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>(currentPlanId);
  const [applyImmediately, setApplyImmediately] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!open) return null;

  const tokensAvailable = company.tokensTotalPerCycle - company.tokensUsed;
  const renewalFormatted = new Date(company.renewalDate).toLocaleDateString("pt-BR");
  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId);
  const currentPlan = PLANS.find((p) => p.id === currentPlanId);
  const isChanging = selectedPlanId !== currentPlanId;

  function handleConfirmClick() {
    if (isChanging) {
      setShowConfirm(true);
    } else {
      onClose();
    }
  }

  function handleFinalConfirm() {
    onSuccess?.();
    onClose();
    setShowConfirm(false);
  }

  return (
    <div className="fixed inset-0 z-50" onKeyDown={(e) => e.key === "Escape" && !showConfirm && onClose()}>
      <div className="absolute inset-0 bg-black/60" onClick={() => !showConfirm && onClose()} aria-hidden />
      <div className="absolute inset-0 flex items-center justify-center px-4 overflow-y-auto py-8">
        <div className="w-full max-w-3xl rounded-2xl bg-[var(--bg-elevated)] border shadow-xl my-auto" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border-subtle)" }}>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Alterar plano</h2>
            <button type="button" onClick={() => !showConfirm && onClose()} className="p-2 rounded-lg hover:bg-[var(--nav-hover)]" aria-label="Fechar">
              <IconX className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            <p className="text-sm text-[var(--text-secondary)]">
              Escolha um novo plano para sua empresa. A mudança afetará o próximo ciclo de cobrança. Tokens adicionais adquiridos continuam valendo até o fim do ciclo atual.
            </p>

            {/* Plano atual */}
            <div className="rounded-xl bg-[var(--bg-muted)]/70 p-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Plano atual</h3>
              <p className="text-[var(--text-primary)]"><strong>Plano atual:</strong> {currentPlan?.name ?? company.planName}</p>
              <p className="text-sm text-[var(--text-secondary)]"><strong>Inclui:</strong> {(currentPlan?.tokensPerMonth ?? company.tokensTotalPerCycle).toLocaleString("pt-BR")} tokens por mês.</p>
              <p className="text-sm text-[var(--text-secondary)]"><strong>Renovação:</strong> {renewalFormatted}.</p>
              <p className="text-sm text-[var(--text-secondary)]"><strong>Tokens disponíveis hoje:</strong> {tokensAvailable.toLocaleString("pt-BR")}.</p>
            </div>

            {/* Tabela de planos */}
            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--border-subtle)" }}>
              <table className="w-full text-sm">
                <thead className="bg-[var(--bg-muted)] text-[var(--text-secondary)]">
                  <tr>
                    <th className="p-3 text-left">Plano</th>
                    <th className="p-3 text-left">Tokens / mês</th>
                    <th className="p-3 text-left">Indicado para</th>
                    <th className="p-3 text-left">Preço mensal*</th>
                    <th className="p-3 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {PLANS.map((p) => (
                    <tr key={p.id} className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                      <td className="p-3 font-medium text-[var(--text-primary)]">{p.name}</td>
                      <td className="p-3 text-[var(--text-secondary)]">{p.tokensPerMonth.toLocaleString("pt-BR")}</td>
                      <td className="p-3 text-[var(--text-secondary)]">{p.recommendedFor}</td>
                      <td className="p-3 text-[var(--text-primary)]">{formatMoney(p.priceMonthly)}</td>
                      <td className="p-3">
                        {selectedPlanId === p.id ? (
                          <span className="px-2 py-1 rounded bg-[var(--accent-green)]/20 text-[var(--accent-green)] text-xs font-medium">Selecionado</span>
                        ) : (
                          <button type="button" onClick={() => setSelectedPlanId(p.id)} className="px-2 py-1 rounded bg-[var(--bg-muted)] hover:bg-[var(--nav-hover)] text-[var(--text-primary)] text-xs font-medium">
                            Selecionar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-[var(--text-secondary)] p-2">*Valores de exemplo, você ajusta conforme seu pricing.</p>
            </div>

            {/* Resumo ao selecionar outro plano */}
            {isChanging && selectedPlan && currentPlan && (
              <div className="rounded-xl border p-4 bg-[var(--accent-green)]/5" style={{ borderColor: "var(--accent-green)" }}>
                <p className="text-sm font-medium text-[var(--text-primary)]">Você está alterando de {currentPlan.name} para {selectedPlan.name}.</p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Nova cobrança mensal: {formatMoney(selectedPlan.priceMonthly)} a partir de {renewalFormatted}.</p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Seu saldo de tokens deste ciclo continua o mesmo, apenas o limite mensal muda no próximo ciclo.</p>
              </div>
            )}

            {/* Aplicar imediatamente */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={applyImmediately} onChange={(e) => setApplyImmediately(e.target.checked)} className="rounded" style={{ accentColor: "var(--accent-green)" }} />
              <span className="text-sm text-[var(--text-primary)]">Aplicar mudança imediatamente</span>
            </label>
          </div>

          <div className="p-5 border-t flex justify-end gap-2" style={{ borderColor: "var(--border-subtle)" }}>
            {!showConfirm ? (
              <>
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--nav-hover)] text-[var(--text-primary)]">
                  Cancelar
                </button>
                <button type="button" onClick={handleConfirmClick} className="px-4 py-2 rounded-lg bg-[var(--accent-green)] hover:opacity-90 text-white font-medium">
                  Confirmar alteração de plano
                </button>
              </>
            ) : (
              <div className="w-full space-y-3">
                <p className="text-sm text-[var(--text-primary)]">
                  Tem certeza que deseja alterar o plano para {selectedPlan?.name}? A mudança passará a valer a partir de {renewalFormatted}.
                </p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowConfirm(false)} className="px-4 py-2 rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--nav-hover)] text-[var(--text-primary)]">
                    Voltar
                  </button>
                  <button type="button" onClick={handleFinalConfirm} className="px-4 py-2 rounded-lg bg-[var(--accent-green)] hover:opacity-90 text-white font-medium">
                    Sim, alterar plano
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
