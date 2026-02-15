import { Meeting, SalesInsight } from "../../types/sales";

export default function MeetingSummaryCard({ meeting, insights }: { meeting: Meeting; insights: SalesInsight[] }) {
  const latest = insights[insights.length - 1];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="rounded-lg bg-[var(--bg-elevated)] border p-4" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="font-semibold">Resumo Executivo</div>
        <div className="mt-2 text-sm text-[var(--text-secondary)]">{meeting.summary || "Sem resumo disponível."}</div>
      </div>
      <div className="rounded-lg bg-[var(--bg-elevated)] border p-4" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="font-semibold">Principais Objeções</div>
        <ul className="mt-2 text-sm text-[var(--text-secondary)] list-disc list-inside">
          {meeting.objection_types.map((o, idx) => <li key={idx}>{o}</li>)}
          {meeting.objection_types.length === 0 && <li>Nenhuma</li>}
        </ul>
      </div>
      <div className="rounded-lg bg-[var(--bg-elevated)] border p-4" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="font-semibold">Próximas Ações</div>
        <div className="mt-2 text-sm text-[var(--text-secondary)]">
          {latest ? (
            <>
              <div>Ação: {latest.action}</div>
              <div>Pergunta: {latest.proxima_pergunta}</div>
              <div>Stage: {latest.pipeline_stage} · Urgência {latest.urgency}</div>
            </>
          ) : "Sem ações sugeridas."}
        </div>
      </div>
    </div>
  );
}
