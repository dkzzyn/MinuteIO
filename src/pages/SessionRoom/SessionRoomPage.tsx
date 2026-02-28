import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import { getMeetingInsights, analyzeAndSaveMinute, setTaskDone, type MeetingInsightsView, type MinuteInsight } from "../../services/meetingInsightsApi";
import { useAudioCapture, type AudioChunkResult } from "../../hooks/useAudioCapture";
import "./SessionRoomPage.css";

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const SENTIMENT_LABEL: Record<string, string> = {
  positive: "positivo",
  neutral: "neutro",
  negative: "negativo",
};

const INSIGHTS_ERROR_MESSAGE = "Não foi possível carregar os insights. Entre em contato com o suporte para obter assistência.";

export default function SessionRoomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [insightsVisible, setInsightsVisible] = useState(false);
  const [newInsightPulse, setNewInsightPulse] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);

  const meetingTitle = "Reunião ao vivo";
  const participants = ["Você", "Cliente Alpha"];
  const isSharing = Boolean(screenStream);
  const { collapsed: sidebarCollapsed, toggleSidebar } = useSidebar();

  const [insightsView, setInsightsView] = useState<MeetingInsightsView | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [insightsTestLoading, setInsightsTestLoading] = useState(false);
  const [selectedMinute, setSelectedMinute] = useState<MinuteInsight | null>(null);

  const handleAudioChunkProcessed = useCallback((result: AudioChunkResult) => {
    if (result.insightsView) {
      setInsightsView(result.insightsView as MeetingInsightsView);
      setInsightsError(null);
      setNewInsightPulse(true);
      setTimeout(() => setNewInsightPulse(false), 1500);
    }
  }, []);

  const audioCapture = useAudioCapture({
    meetingId: id ?? "session",
    meetingContext: `Reunião: ${meetingTitle}`,
    title: meetingTitle,
    chunkIntervalMs: 60_000,
    onChunkProcessed: handleAudioChunkProcessed,
    onError: (err) => console.error("Erro na captura de áudio:", err),
  });

  const fetchInsights = useCallback(async () => {
    if (!id) return;
    try {
      setInsightsError(null);
      const view = await getMeetingInsights(id, meetingTitle);
      const hasData = view.realtimeSummary || view.minuteInsights.length > 0;
      setInsightsView(view);
      if (!hasData) setInsightsError(INSIGHTS_ERROR_MESSAGE);
    } catch {
      setInsightsView(null);
      setInsightsError(INSIGHTS_ERROR_MESSAGE);
    } finally {
      setInsightsLoading(false);
    }
  }, [id, meetingTitle]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  useEffect(() => {
    if (!id || !insightsVisible) return;
    const t = setInterval(fetchInsights, 30000);
    return () => clearInterval(t);
  }, [id, insightsVisible, fetchInsights]);

  async function handleTaskToggle(taskText: string, done: boolean) {
    if (!id) return;
    try {
      const view = await setTaskDone(id, taskText, !done);
      setInsightsView(view);
    } catch {
      // keep local state on error
    }
  }

  /** Gera um insight de teste chamando o Ollama (para validar backend + IA). */
  async function handleGenerateTestInsights() {
    if (!id) return;
    setInsightsTestLoading(true);
    setInsightsError(null);
    try {
      const view = await analyzeAndSaveMinute(id, {
        meetingContext: "Reunião de alinhamento com o cliente sobre o projeto.",
        minuteNumber: 1,
        transcriptChunk: "Cliente confirmou o orçamento. Ficou definido prazo para próxima semana. Precisamos enviar a proposta revisada e agendar reunião de follow-up.",
        title: meetingTitle,
      });
      setInsightsView(view);
      setInsightsError(null);
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Falha ao gerar insights. Verifique se o backend e o Ollama estão rodando (porta 3001 e 11434).";
      setInsightsError(msg);
    } finally {
      setInsightsTestLoading(false);
    }
  }

  useEffect(() => {
    const t = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!screenStream) return;
    const video = videoRef.current;
    if (video) {
      video.srcObject = screenStream;
    }
    const onEnded = () => {
      stopScreenShare();
    };
    screenStream.getVideoTracks().forEach((track) => track.addEventListener("ended", onEnded));
    return () => {
      screenStream.getVideoTracks().forEach((track) => track.removeEventListener("ended", onEnded));
    };
  }, [screenStream]);

  useEffect(() => {
    return () => {
      const stream = streamRef.current;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  function stopScreenShare() {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setScreenStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShareError(null);
  }

  async function handleStartScreenShare() {
    setShareError(null);
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setShareError("Seu navegador não suporta compartilhamento de tela.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });
      streamRef.current = stream;
      setScreenStream(stream);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setShareError("Compartilhamento cancelado ou negado.");
        } else {
          setShareError(err.message || "Não foi possível compartilhar a tela.");
        }
      } else {
        setShareError("Não foi possível compartilhar a tela.");
      }
    }
  }

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
    stopScreenShare();
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
      <aside className={`session-sidebar ${sidebarCollapsed ? "session-sidebar--collapsed" : ""}`}>
        <div className="session-sidebar-header">
          <Link to="/meetings" className="session-sidebar-logo" title="MinuteIO">
            <div className="session-sidebar-logo-icon" />
            {!sidebarCollapsed && <span className="font-semibold text-white">MinuteIO</span>}
          </Link>
          <button
            type="button"
            onClick={toggleSidebar}
            className="session-sidebar-toggle"
            title={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
            aria-label={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {sidebarCollapsed ? <path d="M9 18l6-6-6-6" /> : <path d="M15 18l-6-6 6-6" />}
            </svg>
          </button>
        </div>
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
            {isSharing ? (
              <button type="button" onClick={stopScreenShare} className="session-btn-share session-btn-share--active" title="Parar compartilhamento">
                <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                Parar compartilhamento
              </button>
            ) : (
              <button type="button" onClick={handleStartScreenShare} className="session-btn-share" title="Compartilhar tela para análise">
                <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                Compartilhar tela
              </button>
            )}

            {/* Controle de gravação de áudio */}
            {audioCapture.isCapturing ? (
              <button
                type="button"
                onClick={audioCapture.stopCapture}
                className="session-btn-audio session-btn-audio--active"
                title="Parar gravação de áudio"
              >
                <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
                Min {audioCapture.currentMinute} • Gravando
              </button>
            ) : (
              <button
                type="button"
                onClick={audioCapture.startCapture}
                className="session-btn-audio"
                title="Iniciar gravação de áudio para insights"
              >
                <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
                Gravar áudio
              </button>
            )}

            <button type="button" onClick={handleEndSession} className="session-btn-end">
              Encerrar
            </button>
          </div>
        </header>

        <div className="session-content">
          {isSharing ? (
            <div className="session-screen-wrap">
              <video
                ref={videoRef}
                className="session-screen-video"
                autoPlay
                playsInline
                muted
                aria-label="Tela compartilhada da reunião"
              />
              <p className="session-screen-hint">Os insights ao lado são gerados em tempo real com base na sua reunião.</p>
            </div>
          ) : (
            <div className="session-placeholder">
              <div className="session-waves">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="session-wave-bar" style={{ animationDelay: `${i * 0.08}s` }} />
                ))}
              </div>
              <p className="session-placeholder-text">Analisando conversa em tempo real...</p>
              <p className="session-placeholder-sub">Compartilhe sua tela para exibir a reunião ao vivo e ver os insights no painel à direita.</p>
              <button type="button" onClick={handleStartScreenShare} className="session-btn-share session-btn-share--center">
                <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                Compartilhar tela
              </button>
              {shareError && <p className="session-share-error">{shareError}</p>}
            </div>
          )}
        </div>
      </main>

      {/* Painel de Insights à direita (alimentado por blocos 1 em 1 minuto do Ollama) */}
      <aside className={`session-insights ${insightsVisible ? "session-insights--visible" : ""} ${newInsightPulse ? "session-insights--pulse" : ""}`}>
        <div className="session-insights-inner">
          <div className="session-insights-header">
            <h2 className="session-insights-title">Insights da Reunião</h2>
            <span className="session-insights-badge">IA ativa</span>
            <p className="session-insights-subtitle">Análise por minuto (Ollama)</p>
          </div>

          {!insightsVisible || insightsLoading ? (
            <div className="session-insights-loading">
              <div className="session-insights-spinner" />
              <p>Preparando análise...</p>
            </div>
          ) : insightsError || !insightsView || (!insightsView.realtimeSummary && insightsView.minuteInsights.length === 0) ? (
            <div className="session-insights-body">
              <div className="session-insights-error">
                <p>{insightsError ?? INSIGHTS_ERROR_MESSAGE}</p>
                <p className="session-insights-error-hint">Os insights aparecem quando a reunião é analisada minuto a minuto pelo Ollama.</p>
                <button
                  type="button"
                  className="session-insights-test-btn"
                  onClick={handleGenerateTestInsights}
                  disabled={insightsTestLoading}
                >
                  {insightsTestLoading ? "Gerando com Ollama…" : "Gerar insights de teste"}
                </button>
              </div>
            </div>
          ) : (
            <div className="session-insights-body">
              {(() => {
                const view = insightsView!;
                return (
                  <>
                    <section className="session-insights-section">
                      <h3 className="session-insights-section-title">Resumo em tempo real</h3>
                      <p className="session-insights-realtime-summary">{view.realtimeSummary}</p>
                    </section>

                    <section className="session-insights-section">
                      <h3 className="session-insights-section-title">Principais decisões</h3>
                      <ul className="session-insights-list">
                        {view.mainDecisions.length ? view.mainDecisions.map((d) => <li key={d}>{d}</li>) : <li className="session-insights-empty">Nenhuma ainda</li>}
                      </ul>
                    </section>

                    <section className="session-insights-section">
                      <h3 className="session-insights-section-title">Tarefas identificadas</h3>
                      <ul className="session-insights-list session-insights-list--check">
                        {view.tasks.length ? view.tasks.map((t) => (
                          <li key={t.text}>
                            <button type="button" onClick={() => handleTaskToggle(t.text, t.done)} className="session-insights-task-toggle" aria-pressed={t.done}>
                              {t.done ? <span className="text-[#22C55E]">✔</span> : <span className="session-insights-task-dot" />}
                            </button>
                            <span className={t.done ? "session-insights-task-done" : ""}>{t.text}</span>
                          </li>
                        )) : <li className="session-insights-empty">Nenhuma ainda</li>}
                      </ul>
                    </section>

                    <section className="session-insights-section">
                      <h3 className="session-insights-section-title">Pontos importantes</h3>
                      <div className="session-insights-tags">
                        {view.keyPoints.length ? view.keyPoints.map((p) => <span key={p} className="session-insights-tag">{p}</span>) : <span className="session-insights-empty">Nenhum ainda</span>}
                      </div>
                    </section>

                    {view.minuteInsights.length > 0 && (
                      <section className="session-insights-section">
                        <h3 className="session-insights-section-title">Timeline da reunião</h3>
                        <div className="session-insights-timeline">
                          <table className="session-insights-timeline-table">
                            <thead>
                              <tr>
                                <th>Min</th>
                                <th>Resumo</th>
                                <th>Sent.</th>
                              </tr>
                            </thead>
                            <tbody>
                              {view.minuteInsights.map((mi) => (
                                <tr
                                  key={mi.minute}
                                  onClick={() => setSelectedMinute(mi)}
                                  className={selectedMinute?.minute === mi.minute ? "session-insights-timeline-row--selected" : ""}
                                >
                                  <td>{mi.minute}</td>
                                  <td>{mi.summary.slice(0, 40)}{mi.summary.length > 40 ? "…" : ""}</td>
                                  <td>{SENTIMENT_LABEL[mi.sentiment] ?? mi.sentiment}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </section>
                    )}

                    {selectedMinute && (
                      <section className="session-insights-section session-insights-minute-detail">
                        <div className="session-insights-minute-detail-header">
                          <h3 className="session-insights-section-title">Minuto {selectedMinute.minute}</h3>
                          <button type="button" onClick={() => setSelectedMinute(null)} className="session-insights-minute-close" aria-label="Fechar">×</button>
                        </div>
                        <p className="session-insights-minute-summary">{selectedMinute.summary}</p>
                        {selectedMinute.key_points.length > 0 && (
                          <>
                            <p className="session-insights-section-label">Pontos deste minuto</p>
                            <ul className="session-insights-list">
                              {selectedMinute.key_points.map((p, i) => <li key={`m${selectedMinute.minute}-${i}`}>{p}</li>)}
                            </ul>
                          </>
                        )}
                        <p className="session-insights-sentiment-badge">
                          Sentimento: {SENTIMENT_LABEL[selectedMinute.sentiment] ?? selectedMinute.sentiment}
                        </p>
                      </section>
                    )}

                    <section className="session-insights-section">
                      <h3 className="session-insights-section-title">Exportações</h3>
                      <div className="session-insights-export-btns">
                        <button type="button" className="session-insights-export-btn">Exportar Resumo</button>
                        <button type="button" className="session-insights-export-btn">Baixar PDF</button>
                        <button type="button" className="session-insights-export-btn">Enviar para Slack</button>
                        <button type="button" className="session-insights-export-btn">Criar tarefa no Notion</button>
                      </div>
                    </section>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
