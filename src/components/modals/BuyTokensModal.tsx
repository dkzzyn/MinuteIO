import { useState, useMemo } from "react";
import { IconX } from "../icons";
import type { CompanyTokens } from "../../types/companyTokens";

export type ExtraTokensOptionId = "1000" | "5000" | "10000" | "custom";

const PACKAGES: { id: Exclude<ExtraTokensOptionId, "custom">; label: string; tokens: number; price: number; description: string }[] = [
  { id: "1000", label: "1.000 tokens", tokens: 1000, price: 50, description: "Recomendado para pequenos picos de uso." },
  { id: "5000", label: "5.000 tokens", tokens: 5000, price: 250, description: "Ideal para times com uso intenso de IA." },
  { id: "10000", label: "10.000 tokens", tokens: 10000, price: 500, description: "Melhor custo-benefício para empresas em escala." }
];

const PRICE_PER_1000 = 50;

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

type Props = {
  open: boolean;
  onClose: () => void;
  company: CompanyTokens;
  onSuccess?: () => void;
};

export default function BuyTokensModal({ open, onClose, company, onSuccess }: Props) {
  const [selectedOptionId, setSelectedOptionId] = useState<ExtraTokensOptionId>("5000");
  const [customTokens, setCustomTokens] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "pix" | "boleto">("card");
  const [status, setStatus] = useState<"idle" | "processing" | "success">("idle");

  const tokensAvailable = company.tokensTotalPerCycle - company.tokensUsed;
  const usagePercent = company.tokensTotalPerCycle ? Math.round((company.tokensUsed / company.tokensTotalPerCycle) * 100) : 0;
  const renewalFormatted = new Date(company.renewalDate).toLocaleDateString("pt-BR");

  const additionalTokens = useMemo(() => {
    if (selectedOptionId === "custom") {
      const n = parseInt(customTokens.replace(/\D/g, ""), 10);
      if (Number.isNaN(n) || n < 1000) return 0;
      return Math.floor(n / 1000) * 1000;
    }
    const p = PACKAGES.find((x) => x.id === selectedOptionId);
    return p ? p.tokens : 0;
  }, [selectedOptionId, customTokens]);

  const totalToPay = useMemo(() => {
    if (selectedOptionId === "custom" && additionalTokens > 0) return (additionalTokens / 1000) * PRICE_PER_1000;
    const p = PACKAGES.find((x) => x.id === selectedOptionId);
    return p ? p.price : 0;
  }, [selectedOptionId, additionalTokens]);

  function handleConfirm() {
    setStatus("processing");
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setStatus("idle");
      }, 2000);
    }, 1500);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" onKeyDown={(e) => e.key === "Escape" && status === "idle" && onClose()}>
      <div className="absolute inset-0 bg-black/60" onClick={() => status === "idle" && onClose()} aria-hidden />
      <div className="absolute inset-0 flex items-center justify-center px-4 overflow-y-auto py-8">
        <div className="w-full max-w-2xl rounded-2xl bg-[var(--bg-elevated)] border shadow-xl my-auto" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border-subtle)" }}>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Adquirir tokens adicionais</h2>
            <button type="button" onClick={() => status === "idle" && onClose()} className="p-2 rounded-lg hover:bg-[var(--nav-hover)]" aria-label="Fechar">
              <IconX className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            <p className="text-sm text-[var(--text-secondary)]">
              Precisa de mais créditos de IA para este ciclo? Escolha um pacote de tokens adicionais. Tokens excedentes serão cobrados a {formatMoney(company.overagePricePer1000)} por 1.000 tokens.
            </p>

            {/* Resumo no topo */}
            <div className="rounded-xl bg-[var(--bg-muted)]/70 p-4 space-y-1 text-sm">
              <p className="text-[var(--text-primary)]"><strong>Plano atual:</strong> {company.planName} – {company.tokensTotalPerCycle.toLocaleString("pt-BR")} tokens/mês.</p>
              <p className="text-[var(--text-secondary)]"><strong>Tokens disponíveis neste ciclo:</strong> {tokensAvailable.toLocaleString("pt-BR")} de {company.tokensTotalPerCycle.toLocaleString("pt-BR")}.</p>
              <p className="text-[var(--text-secondary)]"><strong>Uso do ciclo:</strong> {usagePercent}%.</p>
              <p className="text-[var(--text-secondary)]"><strong>Renovação:</strong> {renewalFormatted}.</p>
            </div>

            {/* Escolha o pacote */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Escolha o pacote de tokens</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PACKAGES.map((p) => (
                  <label
                    key={p.id}
                    className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-colors ${
                      selectedOptionId === p.id ? "border-[var(--accent-green)] bg-[var(--accent-green)]/10" : "border-[var(--border-subtle)] hover:bg-[var(--nav-hover)]"
                    }`}
                  >
                    <input type="radio" name="tokens-package" value={p.id} checked={selectedOptionId === p.id} onChange={() => setSelectedOptionId(p.id)} className="sr-only" />
                    <span className="font-semibold text-[var(--text-primary)]">{p.label}</span>
                    <span className="text-lg font-bold text-[var(--text-primary)] mt-0.5">{formatMoney(p.price)}</span>
                    <span className="text-xs text-[var(--text-secondary)] mt-1">{p.description}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3">
                <label className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-colors ${selectedOptionId === "custom" ? "border-[var(--accent-green)] bg-[var(--accent-green)]/10" : "border-[var(--border-subtle)] hover:bg-[var(--nav-hover)]"}`}>
                  <input type="radio" name="tokens-package" value="custom" checked={selectedOptionId === "custom"} onChange={() => setSelectedOptionId("custom")} className="sr-only" />
                  <span className="font-semibold text-[var(--text-primary)]">Quantidade personalizada</span>
                  <input
                    type="text"
                    value={customTokens}
                    onChange={(e) => setCustomTokens(e.target.value)}
                    placeholder="Ex.: 3.000"
                    className="mt-2 w-32 px-3 py-2 rounded-lg bg-[var(--input-bg)] border text-[var(--text-primary)]"
                    style={{ borderColor: "var(--input-border)" }}
                    onClick={() => setSelectedOptionId("custom")}
                  />
                  <span className="text-xs text-[var(--text-secondary)] mt-1">Mínimo 1.000 tokens, múltiplos de 1.000. Valor calculado automaticamente.</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Resumo do pedido */}
              <div className="rounded-xl bg-[var(--bg-muted)]/50 p-4">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Resumo do pedido</h3>
                <p className="text-sm text-[var(--text-secondary)]">Tokens adicionais: <strong className="text-[var(--text-primary)]">{additionalTokens.toLocaleString("pt-BR")}</strong></p>
                <p className="text-sm text-[var(--text-secondary)]">Valor por 1.000 tokens: {formatMoney(PRICE_PER_1000)}</p>
                <p className="text-lg font-bold text-[var(--text-primary)] mt-2">Total a pagar: {formatMoney(totalToPay)}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-2">Esses tokens expiram ao final do ciclo atual ({renewalFormatted}) ou podem seguir sua regra de negócio.</p>
              </div>

              {/* Forma de pagamento */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Forma de pagamento</h3>
                <div className="space-y-2">
                  {(["card", "pix", "boleto"] as const).map((m) => (
                    <label key={m} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="payment" value={m} checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} className="rounded" style={{ accentColor: "var(--accent-green)" }} />
                      <span className="text-sm text-[var(--text-primary)]">
                        {m === "card" && "Cartão de crédito"}
                        {m === "pix" && "Pix"}
                        {m === "boleto" && "Boleto"}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-2">Pagamento processado com segurança.</p>
              </div>
            </div>
          </div>

          <div className="p-5 border-t flex justify-end gap-2" style={{ borderColor: "var(--border-subtle)" }}>
            {status === "idle" && (
              <>
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--nav-hover)] text-[var(--text-primary)]">
                  Cancelar
                </button>
                <button type="button" onClick={handleConfirm} disabled={additionalTokens < 1000} className="px-4 py-2 rounded-lg bg-[var(--accent-green)] hover:opacity-90 text-white font-medium disabled:opacity-50">
                  Confirmar compra
                </button>
              </>
            )}
            {status === "processing" && <p className="text-sm text-[var(--text-secondary)]">Compra em processamento…</p>}
            {status === "success" && <p className="text-sm text-[var(--chart-positive)]">Tokens adicionados com sucesso. Seu novo saldo será atualizado em instantes.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
