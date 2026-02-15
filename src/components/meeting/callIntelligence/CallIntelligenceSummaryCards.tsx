import type { CallIntelligenceDetails } from "../../../types/sales";

const variationLabels = { subindo: "Subindo", estável: "Estável", caindo: "Caindo" };
const variationStyles = {
  subindo: "text-[var(--chart-positive)]",
  estável: "text-[var(--accent-gold)]",
  caindo: "text-[var(--chart-negative)]"
};

export default function CallIntelligenceSummaryCards({ details }: { details: CallIntelligenceDetails }) {
  const variationStyle = variationStyles[details.sentimentVariation] ?? "";
  const variationLabel = variationLabels[details.sentimentVariation] ?? details.sentimentVariation;

  return (
    <div className="grid grid-cols-4 gap-4 min-w-0">
      <div className="min-w-0 rounded-xl bg-[var(--bg-elevated)] border p-4 overflow-hidden" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="text-sm text-[var(--text-secondary)]">Sentimento médio</div>
        <div className="mt-1 text-2xl font-bold text-[var(--text-primary)]">{details.sentimentAverage}%</div>
        <div className={`mt-1 text-xs font-medium ${variationStyle}`}>{variationLabel} na call</div>
        <div className="mt-2 h-2 rounded bg-[var(--bg-muted)] overflow-hidden">
          <div
            className="h-full rounded bg-[var(--accent-green)]"
            style={{ width: `${Math.min(100, details.sentimentAverage)}%` }}
          />
        </div>
      </div>

      <div className="min-w-0 rounded-xl bg-[var(--bg-elevated)] border p-4 overflow-hidden" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="text-sm text-[var(--text-secondary)]">Talk / Listen</div>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-base font-bold text-[var(--accent-blue)]">Vendedor {details.talkTimePct}%</span>
          <span className="text-[var(--text-secondary)]">·</span>
          <span className="text-base font-bold text-[var(--accent-green)]">Cliente {details.clientTimePct}%</span>
        </div>
        <div className="mt-2 h-2 rounded bg-[var(--bg-muted)] overflow-hidden flex">
          <div className="h-full bg-[var(--accent-blue)]" style={{ width: `${details.talkTimePct}%` }} />
          <div className="h-full bg-[var(--accent-green)]" style={{ width: `${details.clientTimePct}%` }} />
        </div>
      </div>

      <div className="min-w-0 rounded-xl bg-[var(--bg-elevated)] border p-4 overflow-hidden" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="text-sm text-[var(--text-secondary)]">Perguntas na call</div>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-xl font-bold text-[var(--text-primary)]">{details.questionsBySeller}</span>
          <span className="text-xs text-[var(--text-secondary)]">vendedor</span>
          <span className="text-[var(--text-secondary)]">·</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">{details.questionsByClient}</span>
          <span className="text-xs text-[var(--text-secondary)]">cliente</span>
        </div>
      </div>

      <div className="min-w-0 rounded-xl bg-[var(--bg-elevated)] border p-4 overflow-hidden" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="text-sm text-[var(--text-secondary)]">Palavras-chave</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {details.keywords.map((k, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--bg-muted)] text-[var(--text-primary)]"
            >
              {k}
            </span>
          ))}
          {details.keywords.length === 0 && (
            <span className="text-xs text-[var(--text-secondary)]">Nenhuma detectada</span>
          )}
        </div>
      </div>
    </div>
  );
}
