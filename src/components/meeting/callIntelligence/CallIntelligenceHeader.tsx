import type { CallIntelligenceDetails } from "../../../types/sales";

const meetingTypeLabels: Record<string, string> = {
  discovery: "Discovery",
  demo: "Demo",
  proposal: "Proposta",
  closing: "Closing",
  upsell: "Upsell"
};

const statusStyles: Record<string, string> = {
  Won: "bg-[var(--chart-positive)]/20 text-[var(--chart-positive)]",
  Lost: "bg-[var(--chart-negative)]/20 text-[var(--chart-negative)]",
  "Em andamento": "bg-[var(--accent-gold)]/20 text-[var(--accent-gold)]"
};

export default function CallIntelligenceHeader({ details }: { details: CallIntelligenceDetails }) {
  const typeLabel = meetingTypeLabels[details.meetingType] ?? details.meetingType;
  const statusStyle = statusStyles[details.status] ?? "bg-[var(--bg-muted)] text-[var(--text-secondary)]";

  return (
    <header className="rounded-xl bg-[var(--bg-elevated)] border p-5 md:p-6" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm text-[var(--text-secondary)] mb-1">{details.clientName}</div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">{details.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--text-secondary)]">
            <span>{new Date(details.datetime).toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })}</span>
            <span>{details.durationMinutes} min</span>
            <span>{details.participants.length} participantes</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--bg-muted)] text-[var(--text-primary)]">
              {typeLabel}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle}`}>
              {details.status}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--bg-muted)] text-[var(--text-secondary)]">
              Win {Math.round(details.win_probability * 100)}%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--nav-hover)] text-sm text-[var(--text-primary)]">
            Compartilhar
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--nav-hover)] text-sm text-[var(--text-primary)]">
            Baixar
          </button>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t flex flex-wrap gap-4" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="text-sm font-medium text-[var(--text-primary)]">Participantes</div>
        <ul className="flex flex-wrap gap-4">
          {details.participants.map((p, i) => (
            <li key={i} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[var(--bg-muted)] flex items-center justify-center text-xs font-medium text-[var(--text-secondary)]">
                {p.name.slice(0, 1)}
              </div>
              <div>
                <span className="text-sm text-[var(--text-primary)]">{p.name}</span>
                <span className="text-xs text-[var(--text-secondary)] ml-1">({p.role})</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
