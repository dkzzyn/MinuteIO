export default function MeetingsFilterBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="rounded-xl bg-[var(--bg-elevated)] border p-4" style={{ borderColor: "var(--border-subtle)" }}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Filtrar por nome do cliente ou título..."
        className="w-full px-4 py-3 rounded bg-[var(--input-bg)] outline-none"
      />
    </div>
  );
}
