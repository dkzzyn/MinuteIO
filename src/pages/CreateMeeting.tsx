import { useState } from "react";
import { createMeeting } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function CreateMeeting() {
  const [title, setTitle] = useState("");
  const [datetime, setDatetime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [pipeline_stage, setPipelineStage] = useState("discovery");
  const [language, setLanguage] = useState("pt-BR");
  const [result, setResult] = useState("Em andamento");
  const [participants, setParticipants] = useState("Cliente,Vendedor");
  const [summary, setSummary] = useState("");
  const navigate = useNavigate();

  async function submit() {
    const payload = {
      title,
      datetime: datetime ? new Date(datetime).toISOString() : new Date().toISOString(),
      durationMinutes,
      pipeline_stage: pipeline_stage as any,
      language: language as any,
      result: result as any,
      participants: participants.split(",").map((s) => s.trim()),
      summary
    };
    const m = await createMeeting(payload);
    navigate(`/meetings/${m.id}`);
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="text-xl font-semibold">Criar/Agendar Reunião</div>
      <div className="space-y-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" className="w-full px-3 py-2 rounded bg-[var(--input-bg)]" style={{ border: '1px solid var(--input-border)' }} />
        <input value={datetime} onChange={(e) => setDatetime(e.target.value)} type="datetime-local" className="w-full px-3 py-2 rounded bg-[var(--input-bg)]" style={{ border: '1px solid var(--input-border)' }} />
        <input value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} type="number" min={1} className="w-full px-3 py-2 rounded bg-[var(--input-bg)]" style={{ border: '1px solid var(--input-border)' }} />
        <select value={pipeline_stage} onChange={(e) => setPipelineStage(e.target.value)} className="w-full px-3 py-2 rounded bg-[var(--input-bg)]" style={{ border: '1px solid var(--input-border)' }}>
          <option value="discovery">Discovery</option>
          <option value="demo">Demo</option>
          <option value="proposal">Proposal</option>
          <option value="closing">Closing</option>
          <option value="upsell">Upsell</option>
        </select>
        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-3 py-2 rounded bg-[var(--input-bg)]" style={{ border: '1px solid var(--input-border)' }}>
          <option value="pt-BR">pt-BR</option>
          <option value="en">en</option>
          <option value="es-MX">es-MX</option>
          <option value="es-ES">es-ES</option>
          <option value="fr-FR">fr-FR</option>
          <option value="fr-CA">fr-CA</option>
        </select>
        <input value={participants} onChange={(e) => setParticipants(e.target.value)} placeholder="Participantes (separados por vírgula)" className="w-full px-3 py-2 rounded bg-[var(--input-bg)]" style={{ border: '1px solid var(--input-border)' }} />
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Resumo inicial" className="w-full px-3 py-2 rounded bg-[var(--input-bg)] h-28" style={{ border: '1px solid var(--input-border)' }} />
      </div>
      <div className="flex gap-3">
        <button onClick={submit} className="px-4 py-2 rounded bg-[var(--accent-green)] hover:opacity-90 text-white">Salvar</button>
        <a href="#" className="px-4 py-2 rounded bg-[var(--bg-muted)]">Iniciar com MinuteIO</a>
      </div>
    </div>
  );
}
