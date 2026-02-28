import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { month: "Out", score: 40 },
  { month: "Nov", score: 58 },
  { month: "Dez", score: 62 },
  { month: "Jan", score: 71 },
  { month: "Fev", score: 78 },
];

export default function DashboardTab() {
  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <article className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
          <p className="text-sm text-slate-400">Documentos criados (mês)</p>
          <p className="mt-2 text-2xl font-semibold">12</p>
        </article>
        <article className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
          <p className="text-sm text-slate-400">Documentos aprovados (mês)</p>
          <p className="mt-2 text-2xl font-semibold">7</p>
        </article>
        <article className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
          <p className="text-sm text-slate-400">Interações importantes</p>
          <p className="mt-2 text-2xl font-semibold">19</p>
        </article>
        <article className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
          <p className="text-sm text-slate-400">Times ativos</p>
          <p className="mt-2 text-2xl font-semibold">2</p>
        </article>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
        <h2 className="text-lg font-medium mb-3">Desempenho ao longo do tempo</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
