import { useState } from "react";
import type { CallIntelligenceDetails } from "../../../types/sales";

const TAGS_EXAMPLE = ["Concorrente X", "Integração", "Suporte", "Discovery", "Demo"];

export default function CallIntelligenceActions({ details }: { details: CallIntelligenceDetails }) {
  const [nextStep, setNextStep] = useState(details.nextStepSuggested ?? "");
  const [suggestedDate, setSuggestedDate] = useState(details.suggestedDate ?? "");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  return (
    <div className="rounded-xl bg-[var(--bg-elevated)] border p-5" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="text-sm font-semibold text-[var(--text-primary)] mb-4">Ações e follow-up</div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Próximo passo</label>
          <input
            type="text"
            value={nextStep}
            onChange={(e) => setNextStep(e.target.value)}
            placeholder="Ex: Enviar proposta e agendar call com gestor"
            className="w-full px-3 py-2 rounded-lg bg-[var(--bg-muted)] border text-[var(--text-primary)] placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-[var(--accent-green)]"
            style={{ borderColor: "var(--border-subtle)" }}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Data sugerida</label>
          <input
            type="date"
            value={suggestedDate}
            onChange={(e) => setSuggestedDate(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[var(--bg-muted)] border text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--accent-green)]"
            style={{ borderColor: "var(--border-subtle)" }}
          />
        </div>

        <div>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-[var(--accent-green)] hover:opacity-90 text-white font-medium text-sm"
          >
            Gerar e-mail de follow-up
          </button>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Baseado no resumo e próximos passos da reunião.</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">Tagging rápido</label>
          <div className="flex flex-wrap gap-2">
            {TAGS_EXAMPLE.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? "bg-[var(--accent-green)] text-white"
                    : "bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--nav-hover)]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Concorrentes citados, produtos de interesse, etapa do funil.</p>
        </div>
      </div>
    </div>
  );
}
