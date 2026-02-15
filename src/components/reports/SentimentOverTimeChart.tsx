import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import type { SentimentOverTimePoint } from "../../services/reportsService";

const lineColor = "var(--accent-gold)";

export default function SentimentOverTimeChart({ data }: { data: SentimentOverTimePoint[] }) {
  return (
    <div className="rounded-xl bg-[var(--bg-elevated)] border p-4 h-[260px]" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="text-sm font-semibold text-[var(--text-primary)] mb-3">Sentimento ao longo do tempo</div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <XAxis dataKey="label" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} stroke="var(--border-subtle)" />
          <YAxis domain={[0, 100]} tick={{ fill: "var(--text-secondary)", fontSize: 11 }} stroke="var(--border-subtle)" unit="%" />
          <ReferenceLine y={50} stroke="var(--border-subtle)" strokeDasharray="3 3" />
          <Tooltip
            contentStyle={{ backgroundColor: "var(--bg-muted)", border: "1px solid var(--border-subtle)", borderRadius: 8 }}
            formatter={(value: number | undefined) => [(value ?? 0) + "%", "Sentimento"]}
          />
          <Line type="monotone" dataKey="value" stroke={lineColor} strokeWidth={2} dot={{ fill: lineColor, r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
