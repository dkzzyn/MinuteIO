import { Kpis } from "../../services/reportsService";
import { IconCalendar, IconClock, IconChartUp, IconTrophy } from "../icons";

function Delta({ value }: { value: number }) {
  const positive = value >= 0;
  const color = positive ? "text-brand" : "text-danger";
  const sign = positive ? "+" : "";
  return <span className={`text-sm ${color}`}>{sign}{value}%</span>;
}

export default function KpiCardsRow({ kpis }: { kpis: Kpis }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="rounded-xl bg-[var(--bg-elevated)] border p-4" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-400">Total de Reuniões</div>
          <IconCalendar className="w-4 h-4 text-neutral-300" />
        </div>
        <div className="mt-2 text-3xl font-semibold">{kpis.totalMeetings}</div>
        <div className="mt-1 text-neutral-300">Variação: <Delta value={kpis.totalMeetingsDelta} /></div>
      </div>
      <div className="rounded-xl bg-[var(--bg-elevated)] border p-4" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-400">Duração Média</div>
          <IconClock className="w-4 h-4 text-neutral-300" />
        </div>
        <div className="mt-2 text-3xl font-semibold">{kpis.avgDurationMinutes} min</div>
        <div className="mt-1 text-neutral-300">Variação: <Delta value={kpis.avgDurationDelta} /></div>
      </div>
      <div className="rounded-xl bg-[var(--bg-elevated)] border p-4" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-400">Sentimento Médio</div>
          <IconChartUp className="w-4 h-4 text-neutral-300" />
        </div>
        <div className="mt-2 text-3xl font-semibold">{kpis.positiveSentiment}%</div>
        <div className="mt-3 h-2 rounded bg-[var(--bg-muted)] overflow-hidden">
          <div className="h-full bg-[var(--accent-green)]" style={{ width: `${kpis.positiveSentiment}%` }} />
        </div>
      </div>
      <div className="rounded-xl bg-[var(--bg-elevated)] border p-4" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-400">Taxa de Win</div>
          <IconTrophy className="w-4 h-4 text-neutral-300" />
        </div>
        <div className="mt-2 text-3xl font-semibold">{kpis.winRate}%</div>
        <div className="mt-1 text-neutral-300">{kpis.winRateDelta != null ? <>Variação: <Delta value={kpis.winRateDelta} /></> : null}</div>
      </div>
    </div>
  );
}
