import { Meeting } from "../../types/sales";

export default function MeetingHeaderCard({ meeting }: { meeting: Meeting }) {
  const participantsCount = meeting.participants.length;
  return (
    <div className="rounded-xl bg-[var(--bg-elevated)] border p-5" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="text-xs text-neutral-400 mb-1 uppercase tracking-wide">{meeting.pipeline_stage} call</div>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-2xl md:text-3xl font-bold">{meeting.title}</div>
          <div className="mt-2 text-sm text-[var(--text-secondary)]">
            {new Date(meeting.datetime).toLocaleString()} · {meeting.durationMinutes} min · {participantsCount} participantes
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded bg-[var(--accent-red)] text-white text-sm">Processando gravação</button>
          <span className="px-3 py-1 rounded bg-[var(--bg-muted)] text-sm">Qualidade 0%</span>
          <button className="px-3 py-1 rounded bg-[var(--bg-muted)] text-sm">Compartilhar</button>
          <button className="px-3 py-1 rounded bg-[var(--bg-muted)] text-sm">Baixar</button>
        </div>
      </div>
    </div>
  );
}
