import { Meeting } from "../../types/sales";

export default function ParticipantsCard({ meeting }: { meeting: Meeting }) {
  return (
    <div className="rounded-lg bg-[var(--bg-elevated)] border p-4" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="font-semibold">Participantes</div>
      <ul className="mt-2 space-y-2">
        {meeting.participants.map((p, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--bg-muted)]" />
            <div>
              <div className="text-sm">{p}</div>
              <div className="text-xs text-[var(--text-secondary)]">Desconhecido</div>
            </div>
          </li>
        ))}
        {meeting.participants.length === 0 && <li className="text-[var(--text-secondary)] text-sm">Sem participantes.</li>}
      </ul>
    </div>
  );
}
