type TabKey = "visao" | "transcricao" | "analise";

export default function MeetingTabs({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
  const base = "px-3 py-2 rounded-full border text-sm";
  const activeBtn = "bg-[var(--accent-red)] border-[var(--accent-red)] text-white";
  const inactiveBtn = "border-[var(--border-subtle)] text-[var(--text-secondary)]";
  return (
    <div className="flex gap-2">
      <button onClick={() => onChange("visao")} className={`${base} ${active === "visao" ? activeBtn : inactiveBtn}`}>Visão Geral</button>
      <button onClick={() => onChange("transcricao")} className={`${base} ${active === "transcricao" ? activeBtn : inactiveBtn}`}>Transcrição</button>
      <button onClick={() => onChange("analise")} className={`${base} ${active === "analise" ? activeBtn : inactiveBtn}`}>Análise IA</button>
    </div>
  );
}
