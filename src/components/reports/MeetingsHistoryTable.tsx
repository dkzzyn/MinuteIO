import { useNavigate } from "react-router-dom";
import { MeetingHistoryItem, type MeetingOutcome } from "../../services/reportsService";

function OutcomeBadge({ outcome }: { outcome?: MeetingOutcome }) {
  if (!outcome) return <span className="text-neutral-500">—</span>;
  const styles: Record<MeetingOutcome, string> = {
    Won: "bg-[var(--chart-positive)]/20 text-[var(--chart-positive)]",
    Lost: "bg-[var(--chart-negative)]/20 text-[var(--chart-negative)]",
    "Em andamento": "bg-[var(--accent-gold)]/20 text-[var(--accent-gold)]",
    "Sem decisão": "bg-[var(--text-secondary)]/20 text-[var(--text-secondary)]"
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${styles[outcome]}`}>
      {outcome}
    </span>
  );
}

function SentimentBar({ score }: { score?: number }) {
  if (score == null) return <span className="text-neutral-500">—</span>;
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 60 ? "var(--chart-positive)" : pct >= 40 ? "var(--accent-gold)" : "var(--chart-negative)";
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-2 rounded bg-[var(--bg-muted)] overflow-hidden">
        <div className="h-full rounded transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs text-[var(--text-secondary)] w-7">{pct}%</span>
    </div>
  );
}

export default function MeetingsHistoryTable({ items }: { items: MeetingHistoryItem[] }) {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl bg-[var(--bg-elevated)] border overflow-hidden" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="p-4 border-b font-semibold text-[var(--text-primary)]" style={{ borderColor: "var(--border-subtle)" }}>
        Histórico de Reuniões
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[var(--text-secondary)] bg-[var(--bg-muted)]">
            <tr className="text-left">
              <th className="p-3">CLIENTE / TÍTULO</th>
              <th className="p-3">DATA</th>
              <th className="p-3">DURAÇÃO</th>
              <th className="p-3">SENTIMENTO</th>
              <th className="p-3">RESULTADO</th>
              <th className="p-3">PRÓXIMO PASSO</th>
              <th className="p-3">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr
                key={it.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/meetings/${it.id}`)}
                onKeyDown={(e) => e.key === "Enter" && navigate(`/meetings/${it.id}`)}
                className="border-t hover:bg-[var(--nav-hover)] cursor-pointer transition-colors"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <td className="p-3">
                  <div className="font-medium text-[var(--text-primary)]">{it.clientName}</div>
                  <div className="text-xs text-[var(--text-secondary)]">{it.title}</div>
                </td>
                <td className="p-3 text-[var(--text-primary)]">{new Date(it.date).toLocaleDateString("pt-BR")}</td>
                <td className="p-3 text-[var(--text-primary)]">{it.durationMinutes} min</td>
                <td className="p-3">
                  <SentimentBar score={it.sentimentScore} />
                </td>
                <td className="p-3">
                  <OutcomeBadge outcome={it.outcome} />
                </td>
                <td className="p-3">
                  {it.nextStepDefined == null ? (
                    <span className="text-neutral-500">—</span>
                  ) : it.nextStepDefined ? (
                    <span className="text-[var(--chart-positive)] font-medium">Sim</span>
                  ) : (
                    <span className="text-[var(--chart-negative)] font-medium">Não</span>
                  )}
                </td>
                <td className="p-3">
                  <span className="px-3 py-1 rounded bg-[var(--bg-muted)] text-[var(--text-primary)] text-xs font-medium">
                    Ver Detalhes
                  </span>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-[var(--text-secondary)]">
                  Nenhum resultado encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
