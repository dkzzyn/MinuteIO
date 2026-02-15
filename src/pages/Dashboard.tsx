import { useEffect, useMemo, useState } from "react";
import { listMeetings } from "../services/api";
import BannerGreenSignal from "../components/BannerGreenSignal";
import NewMeetingModal from "../components/modals/NewMeetingModal";
import { Meeting } from "../types/sales";
import TabCapture from "../components/capture/TabCapture";

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--bg-elevated)] border p-4" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="text-sm text-[var(--text-secondary)]">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function RecentMeetingsTable({ items }: { items: Meeting[] }) {
  return (
    <div className="rounded-lg bg-[var(--bg-elevated)] border overflow-hidden" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="p-3 border-b font-semibold" style={{ borderColor: "var(--border-subtle)" }}>Últimas reuniões</div>
      <table className="w-full text-sm">
        <thead className="text-[var(--text-secondary)]">
          <tr className="text-left">
            <th className="p-3">Título</th>
            <th className="p-3">Data</th>
            <th className="p-3">Duração</th>
            <th className="p-3">Idioma</th>
            <th className="p-3">Stage</th>
            <th className="p-3">Resultado</th>
          </tr>
        </thead>
        <tbody>
          {items.map((m) => (
            <tr key={m.id} className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
              <td className="p-3">{m.title}</td>
              <td className="p-3">{new Date(m.datetime).toLocaleString()}</td>
              <td className="p-3">{m.durationMinutes} min</td>
              <td className="p-3">{m.language}</td>
              <td className="p-3">{m.pipeline_stage}</td>
              <td className="p-3">{m.result}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && <div className="p-4 text-[var(--text-secondary)]">Sem reuniões recentes.</div>}
    </div>
  );
}

export default function Dashboard() {
  const [items, setItems] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    listMeetings().then((res) => {
      setItems(res.slice(0, 5));
      setLoading(false);
    });
  }, []);

  const stats = useMemo(() => {
    const count = items.length;
    const winAvg = items.reduce((acc, m) => acc + (m.win_probability || 0), 0) / (count || 1);
    const lang = items.length ? items[0].language : "pt-BR";
    return { count, winAvg, lang };
  }, [items]);

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      <BannerGreenSignal onActivate={() => setOpenModal(true)} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Reuniões na semana" value={String(stats.count)} />
        <StatCard title="Win rate estimado" value={(stats.winAvg * 100).toFixed(0) + "%"} />
        <StatCard title="Idioma principal" value={stats.lang} />
      </div>
      <RecentMeetingsTable items={items} />
      <TabCapture />
      <NewMeetingModal open={openModal} onClose={() => setOpenModal(false)} />
    </div>
  );
}
