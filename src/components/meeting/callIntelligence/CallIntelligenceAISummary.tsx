import type { CallIntelligenceDetails } from "../../../types/sales";

export default function CallIntelligenceAISummary({ details }: { details: CallIntelligenceDetails }) {
  return (
    <div className="rounded-xl bg-[var(--bg-elevated)] border p-5" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="text-sm font-semibold text-[var(--text-primary)] mb-3">Resumo da IA</div>
      <ul className="space-y-2">
        {details.aiSummaryBullets.map((bullet, i) => (
          <li key={i} className="flex gap-2 text-sm text-[var(--text-secondary)]">
            <span className="text-[var(--accent-green)] mt-0.5">•</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
