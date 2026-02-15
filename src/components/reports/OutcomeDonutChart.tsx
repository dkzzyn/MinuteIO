import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { OutcomeSlice } from "../../services/reportsService";

export default function OutcomeDonutChart({ data }: { data: OutcomeSlice[] }) {
  return (
    <div className="rounded-xl bg-[var(--bg-elevated)] border p-4 h-[260px]" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="text-sm font-semibold text-[var(--text-primary)] mb-3">Resultado das reuniões</div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} stroke="var(--bg-elevated)" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "var(--bg-muted)", border: "1px solid var(--border-subtle)", borderRadius: 8 }}
            formatter={(value: number | undefined, name: string | undefined) => {
              const total = data.reduce((s, d) => s + d.value, 0);
              const pct = total && value != null ? Math.round((value / total) * 100) : 0;
              return [`${value ?? 0} (${pct}%)`, name ?? ""];
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value) => <span style={{ color: "var(--text-secondary)" }}>{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
