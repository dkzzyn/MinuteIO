import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import type { CallIntelligenceDetails } from "../../../types/sales";

type Props = {
  details: CallIntelligenceDetails;
  selectedSegmentId: string | null;
  onSelectSegment: (id: string | null) => void;
};

export default function CallIntelligenceTimeline({ details, selectedSegmentId, onSelectSegment }: Props) {
  const durationMin = details.durationMinutes;
  const segments = details.timelineSegments;
  const sentimentData = useMemo(
    () =>
      details.sentimentOverTime.map((p) => ({
        min: p.minuteOffset,
        label: `${p.minuteOffset}'`,
        value: Math.round(Math.max(0, Math.min(100, p.value)))
      })),
    [details.sentimentOverTime]
  );

  return (
    <div className="rounded-xl bg-[var(--bg-elevated)] border p-4" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="text-sm font-semibold text-[var(--text-primary)] mb-3">Linha do tempo da reunião</div>
      <div className="flex gap-0.5 mb-4">
        {segments.map((seg) => {
          const w = durationMin > 0 ? (100 * (seg.endMin - seg.startMin)) / durationMin : 0;
          const isSelected = selectedSegmentId === seg.id;
          return (
            <button
              key={seg.id}
              type="button"
              onClick={() => onSelectSegment(isSelected ? null : seg.id)}
              className="flex-1 min-w-0 py-2 px-1 rounded text-xs font-medium transition-colors truncate"
              style={{
                width: `${w}%`,
                backgroundColor: isSelected ? "var(--accent-green)" : "var(--bg-muted)",
                color: isSelected ? "white" : "var(--text-secondary)"
              }}
              title={seg.label}
            >
              {seg.label}
            </button>
          );
        })}
      </div>
      <div className="text-xs text-[var(--text-secondary)] mb-2">Sentimento ao longo do tempo</div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={sentimentData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="sentimentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-gold)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="var(--accent-gold)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" tick={{ fill: "var(--text-secondary)", fontSize: 10 }} stroke="var(--border-subtle)" />
          <YAxis domain={[0, 100]} tick={{ fill: "var(--text-secondary)", fontSize: 10 }} stroke="var(--border-subtle)" width={28} />
          <ReferenceLine y={50} stroke="var(--border-subtle)" strokeDasharray="2 2" />
          <Tooltip
            contentStyle={{ backgroundColor: "var(--bg-muted)", border: "1px solid var(--border-subtle)", borderRadius: 8 }}
            formatter={(value: number | undefined) => [(value ?? 0) + "%", "Sentimento"]}
            labelFormatter={(label) => `Minuto ${label}`}
          />
          <Area type="monotone" dataKey="value" stroke="var(--accent-gold)" strokeWidth={2} fill="url(#sentimentGrad)" />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-xs text-[var(--text-secondary)] mt-2">
        Clique em um bloco para destacar o trecho correspondente na transcrição.
      </p>
    </div>
  );
}
