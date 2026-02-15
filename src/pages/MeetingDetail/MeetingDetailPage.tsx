import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getMeetingDetails } from "../../services/api";
import type { CallIntelligenceDetails } from "../../types/sales";
import {
  CallIntelligenceHeader,
  CallIntelligenceSummaryCards,
  CallIntelligenceTimeline,
  CallIntelligenceTranscript,
  CallIntelligenceAISummary,
  CallIntelligenceActions
} from "../../components/meeting/callIntelligence";

type TabKey = "resumo" | "onboarding" | "transcricao" | "insights" | "traducoes";

const tabLabels: Record<TabKey, string> = {
  resumo: "Resumo",
  onboarding: "Onboarding / Próximos passos",
  transcricao: "Transcrição",
  insights: "Insights de vendas",
  traducoes: "Traduções"
};

const translationLanguages: { code: string; label: string }[] = [
  { code: "en-US", label: "Inglês (EUA)" },
  { code: "es-ES", label: "Espanhol (Espanha)" },
  { code: "es-MX", label: "Espanhol (México)" },
  { code: "fr-FR", label: "Francês (França)" },
  { code: "fr-CA", label: "Francês (Canadá)" },
  { code: "de-DE", label: "Alemão" },
  { code: "it-IT", label: "Italiano" }
];

const objectionLabels: Record<string, string> = {
  preco: "Preço",
  pensar: "Pensar",
  concorrente: "Concorrência",
  aprovacao: "Aprovação",
  tempo: "Prazo",
  integracao: "Integração",
  tecnico: "Técnico",
  nenhuma: "—"
};

export default function MeetingDetailPage() {
  const { id } = useParams();
  const [details, setDetails] = useState<CallIntelligenceDetails | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("resumo");
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [askAiQuery, setAskAiQuery] = useState("");
  const [onboardingChecked, setOnboardingChecked] = useState<Record<number, boolean>>({});
  const [nextMeetingType, setNextMeetingType] = useState("demo");
  const [nextMeetingWindow, setNextMeetingWindow] = useState("");
  const [translationLangs, setTranslationLangs] = useState<string[]>(["en-US"]);
  const [translateWhat, setTranslateWhat] = useState<"resumo" | "transcricao" | "ambos">("resumo");

  useEffect(() => {
    if (!id) return;
    getMeetingDetails(id).then((d) => setDetails(d ?? null));
  }, [id]);

  const highlightChunkIds = useMemo(() => {
    if (!details || !selectedSegmentId) return [];
    const seg = details.timelineSegments.find((s) => s.id === selectedSegmentId);
    return seg?.transcriptChunkIds ?? [];
  }, [details, selectedSegmentId]);

  const suggestedActions = useMemo(() => {
    if (!details) return [];
    const items: string[] = [];
    if (details.nextStepSuggested) items.push(details.nextStepSuggested);
    if (details.suggestedDate) items.push(`Agendar follow-up até ${new Date(details.suggestedDate).toLocaleDateString("pt-BR")}`);
    return items.length ? items : ["Definir próximo passo com o cliente"];
  }, [details]);

  const toggleOnboarding = (index: number) => {
    setOnboardingChecked((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleTranslationLang = (code: string) => {
    setTranslationLangs((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  if (!id) return <div className="text-[var(--text-secondary)]">Selecione uma reunião.</div>;
  if (!details) return <div className="text-[var(--text-secondary)]">Carregando...</div>;

  const badgeKeywords = [
    ...details.keywords,
    ...(details.objection_types || []).map((o) => objectionLabels[o] || o).filter((l) => l !== "—")
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Breadcrumb + Voltar para Relatórios */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <Link to="/reports" className="hover:text-[var(--text-primary)] transition-colors">
            Relatórios
          </Link>
          <span aria-hidden>/</span>
          <span className="text-[var(--text-primary)]">{details.clientName}</span>
          <span aria-hidden>/</span>
          <span className="text-[var(--text-primary)] truncate max-w-[180px]" title={details.title}>
            {details.title}
          </span>
        </nav>
        <Link
          to="/reports"
          className="px-3 py-1.5 rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--nav-hover)] text-sm font-medium text-[var(--text-primary)] transition-colors"
        >
          Voltar para Relatórios
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b" style={{ borderColor: "var(--border-subtle)" }}>
        {(Object.keys(tabLabels) as TabKey[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab
                ? "text-[var(--text-primary)] border-[var(--accent-green)]"
                : "text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] hover:bg-[var(--nav-hover)]"
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* Tab: Resumo */}
      {activeTab === "resumo" && (
        <div className="space-y-6">
          <CallIntelligenceHeader details={details} />
          <CallIntelligenceSummaryCards details={details} />
          {badgeKeywords.length > 0 && (
            <div className="rounded-xl bg-[var(--bg-elevated)] border p-4" style={{ borderColor: "var(--border-subtle)" }}>
              <div className="text-sm font-semibold text-[var(--text-primary)] mb-2">Tags da call</div>
              <div className="flex flex-wrap gap-2">
                {[...new Set(badgeKeywords)].map((k) => (
                  <span
                    key={k}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--bg-muted)] text-[var(--text-primary)]"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Onboarding / Próximos passos */}
      {activeTab === "onboarding" && (
        <div className="space-y-6">
          <div className="rounded-xl bg-[var(--bg-elevated)] border p-5" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="text-sm font-semibold text-[var(--text-primary)] mb-4">Ações recomendadas</div>
            <ul className="space-y-3">
              {suggestedActions.map((action, i) => (
                <li key={i} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id={`action-${i}`}
                    checked={!!onboardingChecked[i]}
                    onChange={() => toggleOnboarding(i)}
                    className="mt-1 rounded border-[var(--input-border)]"
                    style={{ accentColor: "var(--accent, #3B82F6)" }}
                  />
                  <label htmlFor={`action-${i}`} className={`text-sm flex-1 ${onboardingChecked[i] ? "line-through text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}`}>
                    {action}
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-[var(--bg-elevated)] border p-5" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="text-sm font-semibold text-[var(--text-primary)] mb-4">Próxima reunião sugerida</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Tipo</label>
                <select
                  value={nextMeetingType}
                  onChange={(e) => setNextMeetingType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] border text-[var(--text-primary)] outline-none"
                  style={{ borderColor: "var(--input-border)" }}
                >
                  <option value="demo">Demo</option>
                  <option value="discovery">Discovery</option>
                  <option value="closing">Closing</option>
                  <option value="proposal">Proposta</option>
                  <option value="follow-up">Follow-up</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Janela de data sugerida</label>
                <input
                  type="date"
                  value={nextMeetingWindow || details.suggestedDate || ""}
                  onChange={(e) => setNextMeetingWindow(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] border text-[var(--text-primary)] outline-none"
                  style={{ borderColor: "var(--input-border)" }}
                />
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Integração com CRM (status do deal, stage do funil) em breve.
            </p>
          </div>
          <CallIntelligenceActions details={details} />
        </div>
      )}

      {/* Tab: Transcrição */}
      {activeTab === "transcricao" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CallIntelligenceTimeline
              details={details}
              selectedSegmentId={selectedSegmentId}
              onSelectSegment={setSelectedSegmentId}
            />
            <CallIntelligenceTranscript details={details} highlightChunkIds={highlightChunkIds} />
          </div>
          <div className="rounded-xl bg-[var(--bg-elevated)] border p-4" style={{ borderColor: "var(--border-subtle)" }}>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Perguntar para a IA sobre a call
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={askAiQuery}
                onChange={(e) => setAskAiQuery(e.target.value)}
                placeholder="Ex: Quais objeções o cliente levantou? Próximos passos?"
                className="flex-1 px-3 py-2 rounded-lg bg-[var(--input-bg)] border text-[var(--text-primary)] placeholder:text-neutral-500 outline-none"
                style={{ borderColor: "var(--input-border)" }}
              />
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-[var(--accent-green)] hover:opacity-90 text-white font-medium text-sm whitespace-nowrap"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Traduções */}
      {activeTab === "traducoes" && (
        <div className="space-y-6">
          <div className="rounded-xl bg-[var(--bg-elevated)] border p-5" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="text-sm font-semibold text-[var(--text-primary)] mb-3">Idiomas para tradução</div>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Selecione os idiomas para os quais deseja ver o resumo e/ou a transcrição traduzidos.
            </p>
            <div className="flex flex-wrap gap-3">
              {translationLanguages.map(({ code, label }) => (
                <label
                  key={code}
                  className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border hover:bg-[var(--nav-hover)] transition-colors"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <input
                    type="checkbox"
                    checked={translationLangs.includes(code)}
                    onChange={() => toggleTranslationLang(code)}
                    className="rounded border-[var(--input-border)]"
                    style={{ accentColor: "var(--accent, #3B82F6)" }}
                  />
                  <span className="text-sm text-[var(--text-primary)]">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-[var(--bg-elevated)] border p-5" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="text-sm font-semibold text-[var(--text-primary)] mb-3">O que traduzir</div>
            <div className="flex flex-wrap gap-4">
              {(["resumo", "transcricao", "ambos"] as const).map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="translate-what"
                    checked={translateWhat === opt}
                    onChange={() => setTranslateWhat(opt)}
                    className="border-[var(--input-border)]"
                    style={{ accentColor: "var(--accent, #3B82F6)" }}
                  />
                  <span className="text-sm text-[var(--text-primary)]">
                    {opt === "resumo" && "Resumo da reunião"}
                    {opt === "transcricao" && "Transcrição"}
                    {opt === "ambos" && "Resumo e transcrição"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {translationLangs.length === 0 ? (
            <div className="rounded-xl bg-[var(--bg-elevated)] border p-6 text-center text-[var(--text-secondary)]" style={{ borderColor: "var(--border-subtle)" }}>
              Selecione pelo menos um idioma para exibir as traduções.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Traduções</div>
              {translationLangs.map((langCode) => {
                const meta = translationLanguages.find((l) => l.code === langCode);
                const label = meta?.label ?? langCode;
                return (
                  <div
                    key={langCode}
                    className="rounded-xl bg-[var(--bg-elevated)] border p-5 overflow-hidden"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-[var(--bg-muted)] text-[var(--text-secondary)]">
                        {label}
                      </span>
                    </div>
                    {(translateWhat === "resumo" || translateWhat === "ambos") && (
                      <div className="mb-4">
                        <div className="text-xs font-medium text-[var(--text-secondary)] mb-2">Resumo</div>
                        <ul className="space-y-2">
                          {details.aiSummaryBullets.map((bullet, i) => (
                            <li key={i} className="flex gap-2 text-sm text-[var(--text-secondary)]">
                              <span className="text-[var(--accent-green)] mt-0.5">•</span>
                              <span>
                                {langCode === "en-US"
                                  ? `[EN] ${bullet}`
                                  : langCode.startsWith("es")
                                    ? `[ES] ${bullet}`
                                    : langCode.startsWith("fr")
                                      ? `[FR] ${bullet}`
                                      : `[${langCode}] ${bullet}`}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {(translateWhat === "transcricao" || translateWhat === "ambos") && details.transcripts.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-[var(--text-secondary)] mb-2">Transcrição</div>
                        <ul className="space-y-2 max-h-64 overflow-y-auto">
                          {details.transcripts.map((t) => (
                            <li
                              key={t.id}
                              className="text-sm py-1.5 px-2 rounded odd:bg-[var(--bg-muted)]/30"
                              style={{ borderColor: "var(--border-subtle)" }}
                            >
                              <span className="text-[var(--text-secondary)] text-xs">
                                {new Date(t.timestamp).toLocaleTimeString("pt-BR", { timeStyle: "short" })} · {t.speaker}
                              </span>
                              <p className="mt-0.5 text-[var(--text-primary)]">
                                {langCode === "en-US"
                                  ? `[EN] ${t.text}`
                                  : langCode.startsWith("es")
                                    ? `[ES] ${t.text}`
                                    : langCode.startsWith("fr")
                                      ? `[FR] ${t.text}`
                                      : `[${langCode}] ${t.text}`}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Insights de vendas */}
      {activeTab === "insights" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CallIntelligenceSummaryCards details={details} />
            <CallIntelligenceTimeline
              details={details}
              selectedSegmentId={selectedSegmentId}
              onSelectSegment={setSelectedSegmentId}
            />
          </div>
          <CallIntelligenceAISummary details={details} />
          <div className="rounded-xl bg-[var(--bg-elevated)] border p-5" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="text-sm font-semibold text-[var(--text-primary)] mb-3">Insights desta call</div>
            <p className="text-sm text-[var(--text-secondary)]">
              Você falou {details.talkTimePct}% do tempo; o cliente {details.clientTimePct}%. 
              {details.talkTimePct > 55
                ? " Nos primeiros minutos o vendedor dominou a fala; o cliente ficou mais engajado quando pôde falar sobre prazo e próximos passos."
                : " O equilíbrio talk/listen está bom para uma call de descoberta."}
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              {details.nextStepSuggested
                ? `Próximo passo confirmado: ${details.nextStepSuggested}`
                : "Nenhum próximo passo claro foi confirmado na call. Recomendamos definir um follow-up."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
