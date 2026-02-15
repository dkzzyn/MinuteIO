import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import type { TalkToListenBar } from "../../services/reportsService";

const IDEAL_MIN = 40;
const IDEAL_MAX = 60;

function sellerBarColor(sellerPct: number) {
  if (sellerPct >= IDEAL_MIN && sellerPct <= IDEAL_MAX) return "var(--accent-green)";
  return "var(--accent-orange)";
}

export default function TalkToListenChart({ data }: { data: TalkToListenBar[] }) {
  return (
    <div className="rounded-xl bg-[var(--bg-elevated)] border p-4 h-[260px]" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="text-sm font-semibold text-[var(--text-primary)] mb-3">Talk-to-listen por tipo (ideal 40–60%)</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "var(--text-secondary)", fontSize: 11 }} stroke="var(--border-subtle)" unit="%" />
          <YAxis type="category" dataKey="type" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} stroke="var(--border-subtle)" width={52} />
          <Tooltip
            contentStyle={{ backgroundColor: "var(--bg-muted)", border: "1px solid var(--border-subtle)", borderRadius: 8 }}
            formatter={(value: number | undefined, name: string | undefined) => [(value ?? 0) + "%", name === "sellerPct" ? "Vendedor" : "Cliente"]}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value) => <span style={{ color: "var(--text-secondary)" }}>{value === "sellerPct" ? "Vendedor" : "Cliente"}</span>} />
          <Bar dataKey="sellerPct" name="sellerPct" radius={[0, 4, 4, 0]} stackId="a">
            {data.map((entry, i) => (
              <Cell key={i} fill={sellerBarColor(entry.sellerPct)} />
            ))}
          </Bar>
          <Bar dataKey="clientPct" name="clientPct" fill="var(--accent-blue)" radius={[0, 4, 4, 0]} stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
