const events = [
  { id: "1", label: "Documento de proposta aprovado", points: 120 },
  { id: "2", label: "Atendimento concluído com sucesso", points: 80 },
  { id: "3", label: "Follow-up realizado no prazo", points: 35 },
];

function getRank(total: number) {
  if (total >= 500) return "Ouro";
  if (total >= 250) return "Prata";
  return "Bronze";
}

export default function PontuacaoTab() {
  const total = events.reduce((sum, item) => sum + item.points, 0);

  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
          <p className="text-sm text-slate-400">Pontuação total</p>
          <p className="mt-2 text-2xl font-semibold">{total}</p>
        </article>
        <article className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
          <p className="text-sm text-slate-400">Rank atual</p>
          <p className="mt-2 text-2xl font-semibold">{getRank(total)}</p>
        </article>
        <article className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
          <p className="text-sm text-slate-400">Eventos recentes</p>
          <p className="mt-2 text-2xl font-semibold">{events.length}</p>
        </article>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
        <h2 className="text-lg font-medium mb-3">Últimos eventos</h2>
        <ul className="space-y-2">
          {events.map((event) => (
            <li key={event.id} className="rounded-md border border-slate-700 bg-slate-950 p-3 flex items-center justify-between">
              <span className="text-sm">{event.label}</span>
              <strong className="text-emerald-400">+{event.points}</strong>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
