import { useRef, useState, useEffect, useCallback } from "react";
import { getMeetingInsights, analyzeAndSaveMinute, type MeetingInsightsView } from "../services/meetingInsightsApi";
import { useAudioCapture, type AudioChunkResult } from "../hooks/useAudioCapture";
import "./CaptureTabPage.css";

const MEETING_ID_CAPTURE = "capture";
const MEETING_TITLE = "Reunião ao vivo";
const INSIGHTS_ERROR_MESSAGE = "Não foi possível carregar os insights. Entre em contato com o suporte para obter assistência.";

export default function CaptureTabPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insightsVisible, setInsightsVisible] = useState(false);
  const [insightsLive, setInsightsLive] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [insightsView, setInsightsView] = useState<MeetingInsightsView | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [insightsTestLoading, setInsightsTestLoading] = useState(false);

  const handleAudioChunkProcessed = useCallback((result: AudioChunkResult) => {
    if (result.insightsView) {
      setInsightsView(result.insightsView as MeetingInsightsView);
      setInsightsError(null);
      setInsightsLive(true);
      setTimeout(() => setInsightsLive(false), 1500);
    }
  }, []);

  const audioCapture = useAudioCapture({
    meetingId: MEETING_ID_CAPTURE,
    meetingContext: `Reunião: ${MEETING_TITLE}`,
    title: MEETING_TITLE,
    chunkIntervalMs: 60_000,
    onChunkProcessed: handleAudioChunkProcessed,
    onError: (err) => setInsightsError(err.message),
  });

  const fetchInsights = useCallback(async () => {
    try {
      setInsightsError(null);
      const view = await getMeetingInsights(MEETING_ID_CAPTURE, MEETING_TITLE);
      const hasData = view.realtimeSummary || view.minuteInsights.length > 0;
      setInsightsView(view);
      if (!hasData) setInsightsError(INSIGHTS_ERROR_MESSAGE);
    } catch {
      setInsightsView(null);
      setInsightsError(INSIGHTS_ERROR_MESSAGE);
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  async function handleGenerateTestInsights() {
    setInsightsTestLoading(true);
    setInsightsError(null);
    try {
      const view = await analyzeAndSaveMinute(MEETING_ID_CAPTURE, {
        meetingContext: "Reunião de alinhamento com o cliente sobre o projeto.",
        minuteNumber: 1,
        transcriptChunk: "Cliente confirmou o orçamento. Ficou definido prazo para próxima semana. Precisamos enviar a proposta revisada e agendar reunião de follow-up.",
        title: MEETING_TITLE,
      });
      setInsightsView(view);
      setInsightsError(null);
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Falha ao gerar. Verifique se o backend e o Ollama estão rodando (portas 3001 e 11434).";
      setInsightsError(msg);
    } finally {
      setInsightsTestLoading(false);
    }
  }

  useEffect(() => {
    if (!stream) return;
    const v = videoRef.current;
    if (v) {
      v.srcObject = stream;
      v.play().catch(() => {});
    }
    const onEnded = () => stopCapture();
    stream.getVideoTracks().forEach((t) => t.addEventListener("ended", onEnded));
    return () => {
      stream.getVideoTracks().forEach((t) => t.removeEventListener("ended", onEnded));
    };
  }, [stream]);

  useEffect(() => {
    return () => {
      const s = streamRef.current;
      if (s) {
        s.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

 
  useEffect(() => {
    const t = setTimeout(() => {
      setInsightsVisible(true);
      setInsightsLive(true);
      const off = setTimeout(() => setInsightsLive(false), 800);
      return () => clearTimeout(off);
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!insightsVisible) return;
    setInsightsLoading(true);
    fetchInsights();
  }, [insightsVisible, fetchInsights]);

  async function startCapture() {
    setError(null);
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setError("Seu navegador não suporta captura de tela.");
      return;
    }
    try {
      const s = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: true
      });
      streamRef.current = s;
      setStream(s);
      setIsCapturing(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Não foi possível iniciar a captura.";
      setError(e instanceof Error && e.name === "NotAllowedError" ? "Captura cancelada." : msg);
    }
  }

  function stopCapture() {
    const s = streamRef.current;
    if (s) {
      s.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setStream(null);
    setIsCapturing(false);
    setError(null);
  }

  return (
    <div className="capture-tab">
      {/* Esquerda 70% – Área de compartilhamento */}
      <section className="capture-tab-left">
        <div className="capture-tab-left-inner">
          {!isCapturing ? (
            <>
              <div className="capture-tab-empty">
                <p className="capture-tab-empty-title">Reunião ao vivo</p>
                <p className="capture-tab-empty-sub">Compartilhe a aba da sua reunião para capturar áudio e vídeo. Os insights aparecem ao lado.</p>
                <div className="capture-tab-btns-row">
                  <button type="button" onClick={startCapture} className="capture-tab-btn-start">
                    <span className="capture-tab-btn-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="23 7 16 12 23 17 23 7" />
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                      </svg>
                    </span>
                    Compartilhar aba
                  </button>

                  {audioCapture.isCapturing ? (
                    <button
                      type="button"
                      onClick={audioCapture.stopCapture}
                      className="capture-tab-btn-audio capture-tab-btn-audio--active"
                      title="Parar gravação"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                      Min {audioCapture.currentMinute} • Gravando
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={audioCapture.startCapture}
                      className="capture-tab-btn-audio"
                      title="Gravar áudio do microfone"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="23" />
                        <line x1="8" y1="23" x2="16" y2="23" />
                      </svg>
                      Gravar áudio
                    </button>
                  )}
                </div>
                {error && <p className="capture-tab-error">{error}</p>}
                {audioCapture.error && <p className="capture-tab-error">{audioCapture.error}</p>}
              </div>
            </>
          ) : (
            <>
              {/* Aba para parar o compartilhamento de tela */}
              <div className="capture-tab-stop-bar">
                <span className="capture-tab-status">
                  <span className="capture-tab-status-dot" />
                  Compartilhando tela
                </span>
                <button type="button" onClick={stopCapture} className="capture-tab-btn-stop-share" title="Parar compartilhamento de tela">
                  <svg className="capture-tab-btn-stop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                  Parar compartilhamento de tela
                </button>
              </div>
              <div className="capture-tab-video-wrap">
                <video
                  ref={videoRef}
                  className="capture-tab-video"
                  autoPlay
                  playsInline
                  muted
                  aria-label="Captura da reunião"
                />
              </div>
              <div className="capture-tab-bar">
                <span className="capture-tab-status">
                  <span className="capture-tab-status-dot" />
                  Capturando aba…
                </span>
                <button type="button" onClick={stopCapture} className="capture-tab-btn-stop">
                  Parar captura
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Direita 30% – Painel Insights IA */}
      <aside className={`capture-tab-insights ${insightsVisible ? "capture-tab-insights--visible" : ""} ${drawerOpen ? "capture-tab-insights--drawer-open" : ""}`}>
        <div className="capture-tab-insights-inner">
          <div className="capture-tab-insights-header">
            <h2 className="capture-tab-insights-title">Insights da Reunião</h2>
            {insightsVisible && (
              <span className={`capture-tab-insights-badge ${insightsLive ? "capture-tab-insights-badge--live" : ""}`}>
                IA ativa
              </span>
            )}
          </div>

          {!insightsVisible ? (
            <div className="capture-tab-insights-loading">
              <div className="capture-tab-insights-spinner" />
              <p>Preparando análise em tempo real...</p>
            </div>
          ) : insightsLoading ? (
            <div className="capture-tab-insights-loading">
              <div className="capture-tab-insights-spinner" />
              <p>Carregando insights...</p>
            </div>
          ) : insightsError || !insightsView || (!insightsView.realtimeSummary && insightsView.minuteInsights.length === 0) ? (
            <div className="capture-tab-insights-body">
              <div className="capture-tab-insights-error">
                <p>{insightsError ?? INSIGHTS_ERROR_MESSAGE}</p>
                <p className="capture-tab-insights-error-hint">Gere um insight de teste com o Ollama para ver os dados aqui.</p>
                <button
                  type="button"
                  className="capture-tab-insights-test-btn"
                  onClick={handleGenerateTestInsights}
                  disabled={insightsTestLoading}
                >
                  {insightsTestLoading ? "Gerando com Ollama…" : "Gerar insights de teste"}
                </button>
              </div>
            </div>
          ) : (
            <div className="capture-tab-insights-body">
              <section className="capture-tab-insights-card">
                <h3 className="capture-tab-insights-card-title">Resumo em tempo real</h3>
                <p className="capture-tab-insights-card-text">{insightsView!.realtimeSummary}</p>
              </section>
              <section className="capture-tab-insights-card">
                <h3 className="capture-tab-insights-card-title">Principais decisões</h3>
                <ul className="capture-tab-insights-list">
                  {insightsView!.mainDecisions.length ? insightsView!.mainDecisions.map((d, i) => <li key={i}>{d}</li>) : <li className="capture-tab-insights-empty">Nenhuma ainda</li>}
                </ul>
              </section>
              <section className="capture-tab-insights-card">
                <h3 className="capture-tab-insights-card-title">Tarefas identificadas</h3>
                <ul className="capture-tab-insights-list capture-tab-insights-list--check">
                  {insightsView!.tasks.length ? insightsView!.tasks.map((t, i) => (
                    <li key={i}><span className="capture-tab-insights-check">{t.done ? "✔" : "○"}</span> {t.text}</li>
                  )) : <li className="capture-tab-insights-empty">Nenhuma ainda</li>}
                </ul>
              </section>
              <section className="capture-tab-insights-card">
                <h3 className="capture-tab-insights-card-title">Pontos importantes</h3>
                <ul className="capture-tab-insights-list">
                  {insightsView!.keyPoints.length ? insightsView!.keyPoints.map((p, i) => <li key={i}>{p}</li>) : <li className="capture-tab-insights-empty">Nenhum ainda</li>}
                </ul>
              </section>
            </div>
          )}
        </div>
        <button
          type="button"
          className="capture-tab-insights-drawer-toggle"
          onClick={() => setDrawerOpen(!drawerOpen)}
          aria-label={drawerOpen ? "Fechar insights" : "Abrir insights"}
        >
          {drawerOpen ? "Fechar" : "Abrir Insights"}
        </button>
      </aside>

      {/* Botão flutuante para abrir drawer em mobile */}
      <button
        type="button"
        className={`capture-tab-insights-fab ${drawerOpen ? "capture-tab-insights-fab--hidden" : ""}`}
        onClick={() => setDrawerOpen(true)}
        aria-label="Abrir insights"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      </button>
    </div>
  );
}
