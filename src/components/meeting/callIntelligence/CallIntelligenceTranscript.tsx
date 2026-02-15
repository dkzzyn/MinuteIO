import { useMemo, useState } from "react";
import type { CallIntelligenceDetails, TranscriptTag } from "../../../types/sales";

type Filter = TranscriptTag | "all";

const filterLabels: Record<Filter, string> = {
  all: "Tudo",
  price: "Preço",
  objection: "Objeções",
  action: "Ações",
  next_step: "Próximo passo",
  question_client: "Perguntas do cliente"
};

const tagIcons: Record<TranscriptTag, string> = {
  action: "▶",
  objection: "⚠",
  next_step: "✓",
  price: "💰",
  question_client: "?"
};

export default function CallIntelligenceTranscript({
  details,
  highlightChunkIds
}: {
  details: CallIntelligenceDetails;
  highlightChunkIds: string[];
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return details.transcripts;
    return details.transcripts.filter((t) => t.tags?.includes(filter));
  }, [details.transcripts, filter]);

  return (
    <div className="rounded-xl bg-[var(--bg-elevated)] border overflow-hidden" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="p-4 border-b flex flex-wrap items-center gap-2" style={{ borderColor: "var(--border-subtle)" }}>
        <span className="text-sm font-semibold text-[var(--text-primary)] mr-2">Transcrição</span>
        {(Object.keys(filterLabels) as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === f
                ? "bg-[var(--accent-green)] text-white"
                : "bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--nav-hover)]"
            }`}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>
      <ul className="divide-y max-h-[400px] overflow-y-auto" style={{ borderColor: "var(--border-subtle)" }}>
        {filtered.map((t) => {
          const isSeller = t.speaker.toLowerCase().includes("vendedor") || t.speaker.toLowerCase().includes("closer");
          const isHighlighted = highlightChunkIds.length === 0 || highlightChunkIds.includes(t.id);
          return (
            <li
              key={t.id}
              className={`p-3 transition-colors ${
                isHighlighted ? "" : "opacity-50"
              } ${isSeller ? "bg-[var(--bg-muted)]/30" : ""}`}
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div className="flex items-start gap-2">
                <div className="flex gap-1 flex-shrink-0 mt-0.5">
                  {t.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="w-5 h-5 rounded flex items-center justify-center text-xs bg-[var(--bg-muted)] text-[var(--text-secondary)]"
                      title={tag}
                    >
                      {tagIcons[tag]}
                    </span>
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-[var(--text-secondary)]">
                    {new Date(t.timestamp).toLocaleTimeString("pt-BR", { timeStyle: "short" })} · {t.speaker}
                  </div>
                  <div className="mt-0.5 text-sm text-[var(--text-primary)]">{t.text}</div>
                </div>
              </div>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="p-4 text-[var(--text-secondary)] text-sm">Nenhum trecho com este filtro.</li>
        )}
      </ul>
    </div>
  );
}
