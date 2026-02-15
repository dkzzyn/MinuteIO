import { useEffect, useMemo, useState } from "react";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import { listMeetings } from "../services/api";
import { Meeting } from "../types/sales";
import MeetingDetailPage from "./MeetingDetail/MeetingDetailPage";

function MeetingListItem({ m }: { m: Meeting }) {
  return (
    <Link to={`/meetings/${m.id}`} className="block px-3 py-2 rounded hover:bg-[var(--nav-hover)]">
      <div className="font-medium">{m.title}</div>
      <div className="text-xs text-[var(--text-secondary)]">{new Date(m.datetime).toLocaleString()} · {m.language} · {m.pipeline_stage}</div>
    </Link>
  );
}

function Placeholder() {
  return <div className="text-neutral-400">Selecione uma reunião.</div>;
}

export default function Meetings() {
  const [items, setItems] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<string>("");
  const [lang, setLang] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    listMeetings().then((res) => {
      setItems(res);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return items.filter((m) => {
      const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase());
      const matchStage = !stage || m.pipeline_stage === stage;
      const matchLang = !lang || m.language === lang;
      return matchSearch && matchStage && matchLang;
    });
  }, [items, search, stage, lang]);

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <div className="rounded-lg bg-[var(--bg-elevated)] border p-3 space-y-3" style={{ borderColor: "var(--border-subtle)" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar relatório" className="w-full px-3 py-2 rounded bg-[var(--input-bg)] outline-none" style={{ border: '1px solid var(--input-border)' }} />
          <div className="flex gap-2">
            <select value={stage} onChange={(e) => setStage(e.target.value)} className="flex-1 px-3 py-2 rounded bg-[var(--input-bg)]" style={{ border: '1px solid var(--input-border)' }}>
              <option value="">Stage</option>
              <option value="discovery">Discovery</option>
              <option value="demo">Demo</option>
              <option value="proposal">Proposal</option>
              <option value="closing">Closing</option>
              <option value="upsell">Upsell</option>
            </select>
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="flex-1 px-3 py-2 rounded bg-[var(--input-bg)]" style={{ border: '1px solid var(--input-border)' }}>
              <option value="">Idioma</option>
              <option value="pt-BR">pt-BR</option>
              <option value="en">en</option>
              <option value="es-MX">es-MX</option>
              <option value="es-ES">es-ES</option>
              <option value="fr-FR">fr-FR</option>
              <option value="fr-CA">fr-CA</option>
            </select>
          </div>
        </div>
        <div className="mt-3 rounded-lg bg-[var(--bg-elevated)] border" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="p-3 border-b font-semibold" style={{ borderColor: "var(--border-subtle)" }}>Relatórios</div>
          <div className="p-2 space-y-1">
            {filtered.map((m) => <MeetingListItem key={m.id} m={m} />)}
            {filtered.length === 0 && <div className="p-3 text-[var(--text-secondary)]">Nenhum relatório.</div>}
          </div>
        </div>
        <button onClick={() => navigate("/meetings/new")} className="mt-3 w-full px-3 py-2 rounded bg-[var(--accent-green)] hover:opacity-90">Iniciar com MinuteIO</button>
      </div>
      <div className="md:col-span-2">
        <Routes>
          <Route path=":id" element={<MeetingDetailPage />} />
          <Route path="*" element={<div className="text-neutral-400">Selecione um relatório.</div>} />
        </Routes>
      </div>
    </div>
  );
}
