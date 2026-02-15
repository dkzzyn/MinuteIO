import { useEffect, useMemo, useState } from "react";
import {
  getReportsKpis,
  getMeetingsHistory,
  getMeetingsByDay,
  getOutcomeDistribution,
  getSentimentOverTime,
  getTalkToListenByType,
  MeetingHistoryItem,
  Kpis,
  MeetingsByDayPoint,
  OutcomeSlice,
  SentimentOverTimePoint,
  TalkToListenBar
} from "../../services/reportsService";
import KpiCardsRow from "../../components/reports/KpiCardsRow";
import MeetingsFilterBar from "../../components/reports/MeetingsFilterBar";
import MeetingsHistoryTable from "../../components/reports/MeetingsHistoryTable";
import MeetingVolumeChart from "../../components/reports/MeetingVolumeChart";
import OutcomeDonutChart from "../../components/reports/OutcomeDonutChart";
import TalkToListenChart from "../../components/reports/TalkToListenChart";
import SentimentOverTimeChart from "../../components/reports/SentimentOverTimeChart";

export default function ReportsPage() {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [history, setHistory] = useState<MeetingHistoryItem[]>([]);
  const [meetingsByDay, setMeetingsByDay] = useState<MeetingsByDayPoint[]>([]);
  const [outcomeDist, setOutcomeDist] = useState<OutcomeSlice[]>([]);
  const [sentimentOverTime, setSentimentOverTime] = useState<SentimentOverTimePoint[]>([]);
  const [talkToListen, setTalkToListen] = useState<TalkToListenBar[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getReportsKpis(),
      getMeetingsHistory(),
      getMeetingsByDay(),
      getOutcomeDistribution(),
      getSentimentOverTime(),
      getTalkToListenByType()
    ]).then(([kp, hist, byDay, outcome, sentiment, talk]) => {
      setKpis(kp);
      setHistory(hist);
      setMeetingsByDay(byDay);
      setOutcomeDist(outcome);
      setSentimentOverTime(sentiment);
      setTalkToListen(talk);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    if (!filter) return history;
    const s = filter.toLowerCase();
    return history.filter((h) => h.clientName.toLowerCase().includes(s) || h.title.toLowerCase().includes(s));
  }, [filter, history]);

  if (loading || !kpis) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-[var(--bg-elevated)] border p-4" style={{ borderColor: "var(--border-subtle)" }}>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filtrar por nome do cliente ou título..."
          className="w-full px-4 py-3 rounded bg-[var(--bg-muted)] outline-none text-[var(--text-primary)] placeholder:text-neutral-500"
        />
      </div>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">Relatórios e Insights</h1>
        <p className="text-[var(--text-secondary)]">Análise detalhada da performance comercial das suas reuniões com IA.</p>
      </div>

      {/* Linha 1: Cards KPIs */}
      <KpiCardsRow kpis={kpis} />

      {/* Linha 2: Volume de reuniões (esq) + Resultado pizza (dir) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MeetingVolumeChart data={meetingsByDay} />
        <OutcomeDonutChart data={outcomeDist} />
      </div>

      {/* Linha 3: Talk-to-listen (esq) + Sentimento no tempo (dir) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TalkToListenChart data={talkToListen} />
        <SentimentOverTimeChart data={sentimentOverTime} />
      </div>

      {/* Linha 4: Tabela de histórico com sentimento, resultado, próximo passo */}
      <MeetingsFilterBar value={filter} onChange={setFilter} />
      <MeetingsHistoryTable items={filtered} />
    </div>
  );
}
