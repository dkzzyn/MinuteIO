import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { MeetingsByDayPoint } from "../../services/reportsService";

const chartColor = "var(--accent-green)";

export default function MeetingVolumeChart({ data }: { data: MeetingsByDayPoint[] }) {
  return (
    <div className="rounded-xl bg-[var(--bg-elevated)] border p-4 h-[260px]" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="text-sm font-semibold text-[var(--text-primary)] mb-3">Evolução de reuniões</div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <XAxis dataKey="label" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} stroke="var(--border-subtle)" />
          <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 11 }} stroke="var(--border-subtle)" allowDecimals={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "var(--bg-muted)", border: "1px solid var(--border-subtle)", borderRadius: 8 }}
            labelStyle={{ color: "var(--text-primary)" }}
            formatter={(value: number | undefined) => [value ?? 0, "Reuniões"]}
          />
          <Line type="monotone" dataKey="count" stroke={chartColor} strokeWidth={2} dot={{ fill: chartColor, r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
