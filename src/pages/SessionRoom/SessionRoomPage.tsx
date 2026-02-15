import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./SessionRoomPage.css";

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const MOCK_TOPICS = ["Integração de sistemas", "Prazos de entrega", "Proposta comercial"];
const MOCK_KEYWORDS = ["API", "SLA", "Onboarding", "Proposta"];
const MOCK_ACTIONS = ["Enviar proposta até sexta", "Agendar call com marketing", "Atualizar dashboard"];
const MOCK_METRICS = [
  { label: "Você", value: "45%" },
  { label: "Cliente", value: "55%" },
  { label: "Sentimento", value: "Positivo" },
  { label: "Engajamento", value: "Alto" }
];

export default function SessionRoomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [insightsVisible, setInsightsVisible] = useState(false);
  const [newInsightPulse, setNewInsightPulse] = useState(false);

  const meetingTitle = "Reunião ao vivo";
  const participants = ["Você", "Cliente Alpha"];

  useEffect(() => {
    const t = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setInsightsVisible(true);
      setNewInsightPulse(true);
      const pulseOff = setTimeout(() => setNewInsightPulse(false), 600);
      return () => clearTimeout(pulseOff);
    }, 12000);
    return () => clearTimeout(timeout);
  }, []);

  function handleEndSession() {
    if (window.confirm("Encerrar reunião? O resumo será gerado automaticamente.")) {
      navigate("/meetings");
    }
  }

  if (!id) {
    return (
      <div className="session-room session-room--loading">
        <p>Carregando sessão...</p>
      </div>
    );
  }

  return (
    <div className="session-room">
      {/* Sidebar esquerda */}
      <aside className="session-sidebar">
        <Link to="/meetings" className="session-sidebar-logo">
          <span className="font-semibold text-white">MinuteIO</span>
        </Link>
        <nav className="session-sidebar-nav">
          <span className="session-sidebar-item session-sidebar-item--active" title="Reunião ativa">
            <svg className="icon icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </span>
        </nav>
        <div className="session-sidebar-footer">
          <div className="w-8 h-8 rounded-full bg-[var(--bg-muted)]" />
        </div>
      </aside>

      {/* Área principal central */}
      <main className="session-main">
        <header className="session-header">
          <div className="session-header-left">
            <h1 className="session-title">{meetingTitle}</h1>
            <span className="session-status">
              <span className="session-status-dot" /> Gravando
            </span>
          </div>
          <div className="session-header-right">
            <span className="session-timer">{formatTimer(timerSeconds)}</span>
            <span className="session-participants">{participants.length} participantes</span>
            <button type="button" onClick={handleEndSession} className="session-btn-end">
              Encerrar
            </button>
          </div>
        </header>

        <div className="session-content">
          <div className="session-placeholder">
            <div className="session-waves">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="session-wave-bar" style={{ animationDelay: `${i * 0.08}s` }} />
              ))}
            </div>
            <p className="session-placeholder-text">Analisando conversa em tempo real...</p>
            <p className="session-placeholder-sub">Os insights aparecerão no painel à direita.</p>
          </div>
        </div>
      </main>

      {/* Painel de Insights à direita */}
      <aside className={`session-insights ${insightsVisible ? "session-insights--visible" : ""} ${newInsightPulse ? "session-insights--pulse" : ""}`}>
        <div className="session-insights-inner">
          <div className="session-insights-header">
            <h2 className="session-insights-title">Insights em Tempo Real</h2>
            <p className="session-insights-subtitle">Análise automática da reunião</p>
          </div>

          {!insightsVisible ? (
            <div className="session-insights-loading">
              <div className="session-insights-spinner" />
              <p>Preparando análise...</p>
            </div>
          ) : (
            <div className="session-insights-body">
              <section className="session-insights-section">
                <h3 className="session-insights-section-title">Resumo ao Vivo</h3>
                <p className="session-insights-section-label">Tópicos discutidos</p>
                <ul className="session-insights-list">
                  {MOCK_TOPICS.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <p className="session-insights-section-label mt-2">Palavras-chave</p>
                <div className="session-insights-tags">
                  {MOCK_KEYWORDS.map((k) => (
                    <span key={k} className="session-insights-tag">{k}</span>
                  ))}
                </div>
              </section>

              <section className="session-insights-section">
                <h3 className="session-insights-section-title">Ações Detectadas</h3>
                <ul className="session-insights-list session-insights-list--check">
                  {MOCK_ACTIONS.map((a) => (
                    <li key={a}><span className="text-[#22C55E]">✔</span> {a}</li>
                  ))}
                </ul>
              </section>

              <section className="session-insights-section">
                <h3 className="session-insights-section-title">Métricas</h3>
                <div className="session-insights-metrics">
                  {MOCK_METRICS.map((m) => (
                    <div key={m.label} className="session-insights-metric">
                      <span className="session-insights-metric-label">{m.label}</span>
                      <span className="session-insights-metric-value">{m.value}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="session-insights-section">
                <h3 className="session-insights-section-title">Exportações</h3>
                <div className="session-insights-export-btns">
                  <button type="button" className="session-insights-export-btn">Exportar Resumo</button>
                  <button type="button" className="session-insights-export-btn">Baixar PDF</button>
                  <button type="button" className="session-insights-export-btn">Enviar para Slack</button>
                  <button type="button" className="session-insights-export-btn">Criar tarefa no Notion</button>
                </div>
              </section>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
