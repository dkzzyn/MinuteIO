import { useEffect, useMemo, useState } from "react";
import {
  createAgent,
  getAgentConfig,
  listAgents,
  SELECTED_AGENT_STORAGE_KEY,
  updateAgent,
  updateAgentConfig,
  type Agent,
  type AgentConfig,
  type PromptConfig,
  DEFAULT_PROMPT_CONFIG,
} from "../services/agentsApi";

const cardClass = "rounded-xl bg-[var(--bg-elevated)] border p-5";
const borderStyle = { borderColor: "var(--border-subtle)" } as const;
const inputClass =
  "w-full px-3 py-2 rounded bg-[var(--input-bg)] outline-none text-[var(--text-primary)] border";
const inputStyle = { borderColor: "var(--input-border)" } as const;

const DEFAULT_CONFIG: Pick<AgentConfig, "sentimentTone" | "salesAggressiveness" | "isActive"> = {
  sentimentTone: "neutro",
  salesAggressiveness: "moderado",
  isActive: true,
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [newAgentName, setNewAgentName] = useState("");
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [sentimentTone, setSentimentTone] = useState<AgentConfig["sentimentTone"]>("neutro");
  const [salesAggressiveness, setSalesAggressiveness] = useState<AgentConfig["salesAggressiveness"]>("moderado");
  const [configIsActive, setConfigIsActive] = useState(true);
  const [agentIsActive, setAgentIsActive] = useState(true);
  const [objectionTipsText, setObjectionTipsText] = useState("{}");
  const [transcriptionEnabled, setTranscriptionEnabled] = useState(DEFAULT_PROMPT_CONFIG.transcription.enabled);
  const [transcriptionLanguage, setTranscriptionLanguage] = useState(DEFAULT_PROMPT_CONFIG.transcription.language);
  const [transcriptionMeetingType, setTranscriptionMeetingType] =
    useState<PromptConfig["transcription"]["meetingType"]>(DEFAULT_PROMPT_CONFIG.transcription.meetingType);
  const [transcriptionDetailLevel, setTranscriptionDetailLevel] =
    useState<PromptConfig["transcription"]["detailLevel"]>(DEFAULT_PROMPT_CONFIG.transcription.detailLevel);
  const [sentimentEnabled, setSentimentEnabled] = useState(DEFAULT_PROMPT_CONFIG.sentiment.enabled);
  const [sentimentMode, setSentimentMode] =
    useState<PromptConfig["sentiment"]["mode"]>(DEFAULT_PROMPT_CONFIG.sentiment.mode);
  const [showSentimentOverall, setShowSentimentOverall] = useState(DEFAULT_PROMPT_CONFIG.sentiment.showOverall);
  const [showSentimentPerParticipant, setShowSentimentPerParticipant] =
    useState(DEFAULT_PROMPT_CONFIG.sentiment.showPerParticipant);
  const [showSentimentIntensity, setShowSentimentIntensity] =
    useState(DEFAULT_PROMPT_CONFIG.sentiment.showIntensity);

  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === selectedAgentId) ?? null,
    [agents, selectedAgentId]
  );

  async function refreshAgents() {
    setLoadingAgents(true);
    setError(null);
    try {
      const data = await listAgents();
      setAgents(data);
      if (!data.length) {
        setSelectedAgentId(null);
        return;
      }

      const fromStorage = localStorage.getItem(SELECTED_AGENT_STORAGE_KEY);
      const initial = data.find((a) => a.id === fromStorage)?.id ?? data[0].id;
      setSelectedAgentId((prev) => prev ?? initial);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar agentes.");
    } finally {
      setLoadingAgents(false);
    }
  }

  useEffect(() => {
    refreshAgents();
  }, []);

  useEffect(() => {
    if (!selectedAgentId) return;
    localStorage.setItem(SELECTED_AGENT_STORAGE_KEY, selectedAgentId);
  }, [selectedAgentId]);

  useEffect(() => {
    async function loadConfig(agentId: string) {
      setLoadingConfig(true);
      setError(null);
      setSuccess(null);
      try {
        const config = await getAgentConfig(agentId);
        setSentimentTone(config.sentimentTone ?? DEFAULT_CONFIG.sentimentTone);
        setSalesAggressiveness(config.salesAggressiveness ?? DEFAULT_CONFIG.salesAggressiveness);
        setConfigIsActive(config.isActive ?? DEFAULT_CONFIG.isActive);
        setObjectionTipsText(JSON.stringify(config.objectionTips ?? {}, null, 2));
        const promptConfig = (config.extraConfig ?? DEFAULT_PROMPT_CONFIG) as PromptConfig;
        setTranscriptionEnabled(promptConfig.transcription?.enabled ?? DEFAULT_PROMPT_CONFIG.transcription.enabled);
        setTranscriptionLanguage(promptConfig.transcription?.language ?? DEFAULT_PROMPT_CONFIG.transcription.language);
        setTranscriptionMeetingType(
          promptConfig.transcription?.meetingType ?? DEFAULT_PROMPT_CONFIG.transcription.meetingType
        );
        setTranscriptionDetailLevel(
          promptConfig.transcription?.detailLevel ?? DEFAULT_PROMPT_CONFIG.transcription.detailLevel
        );
        setSentimentEnabled(promptConfig.sentiment?.enabled ?? DEFAULT_PROMPT_CONFIG.sentiment.enabled);
        setSentimentMode(promptConfig.sentiment?.mode ?? DEFAULT_PROMPT_CONFIG.sentiment.mode);
        setShowSentimentOverall(
          promptConfig.sentiment?.showOverall ?? DEFAULT_PROMPT_CONFIG.sentiment.showOverall
        );
        setShowSentimentPerParticipant(
          promptConfig.sentiment?.showPerParticipant ?? DEFAULT_PROMPT_CONFIG.sentiment.showPerParticipant
        );
        setShowSentimentIntensity(
          promptConfig.sentiment?.showIntensity ?? DEFAULT_PROMPT_CONFIG.sentiment.showIntensity
        );

        const currentAgent = agents.find((a) => a.id === agentId);
        setAgentIsActive(currentAgent?.isActive ?? true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao carregar configuração do agente.");
      } finally {
        setLoadingConfig(false);
      }
    }

    if (selectedAgentId) {
      loadConfig(selectedAgentId);
    }
  }, [selectedAgentId, agents]);

  async function handleCreateAgent() {
    const name = newAgentName.trim();
    if (!name) return;
    setError(null);
    setSuccess(null);
    try {
      const created = await createAgent({ name });
      setAgents((prev) => [created, ...prev]);
      setSelectedAgentId(created.id);
      setNewAgentName("");
      setSuccess("Agente criado com sucesso.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao criar agente.");
    }
  }

  async function handleSaveConfig() {
    if (!selectedAgentId) return;

    let parsedObjectionTips: Record<string, string>;
    try {
      const parsed = JSON.parse(objectionTipsText);
      if (typeof parsed !== "object" || parsed == null || Array.isArray(parsed)) {
        setError("Dicas de objeções deve ser um JSON no formato objeto.");
        return;
      }
      parsedObjectionTips = Object.fromEntries(
        Object.entries(parsed).map(([key, value]) => [key, String(value)])
      );
    } catch {
      setError("JSON inválido em dicas de objeções.");
      return;
    }

    setSavingConfig(true);
    setError(null);
    setSuccess(null);
    try {
      await updateAgent(selectedAgentId, { isActive: agentIsActive });
      await updateAgentConfig(selectedAgentId, {
        sentimentTone,
        salesAggressiveness,
        objectionTips: parsedObjectionTips,
        extraConfig: {
          transcription: {
            enabled: transcriptionEnabled,
            language: transcriptionLanguage,
            meetingType: transcriptionMeetingType,
            detailLevel: transcriptionDetailLevel,
          },
          sentiment: {
            enabled: sentimentEnabled,
            mode: sentimentMode,
            showOverall: showSentimentOverall,
            showPerParticipant: showSentimentPerParticipant,
            showIntensity: showSentimentIntensity,
          },
        },
        isActive: configIsActive,
      });
      setAgents((prev) =>
        prev.map((agent) =>
          agent.id === selectedAgentId
            ? { ...agent, isActive: agentIsActive }
            : agent
        )
      );
      setSuccess("Configuração do agente salva.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar configuração do agente.");
    } finally {
      setSavingConfig(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Agentes</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Configure tom, agressividade e dicas de objeções por agente.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
        <section className={`${cardClass} space-y-4`} style={borderStyle}>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Lista de agentes</h2>

          <div className="flex gap-2">
            <input
              className={inputClass}
              style={inputStyle}
              placeholder="Nome do agente"
              value={newAgentName}
              onChange={(e) => setNewAgentName(e.target.value)}
            />
            <button
              type="button"
              onClick={handleCreateAgent}
              className="px-3 py-2 rounded bg-[var(--bg-muted)] hover:bg-[var(--nav-hover)] text-sm"
            >
              Criar
            </button>
          </div>

          <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
            {loadingAgents && <p className="text-sm text-[var(--text-secondary)]">Carregando agentes...</p>}
            {!loadingAgents && !agents.length && (
              <p className="text-sm text-[var(--text-secondary)]">Nenhum agente criado ainda.</p>
            )}
            {agents.map((agent) => (
              <button
                key={agent.id}
                type="button"
                onClick={() => setSelectedAgentId(agent.id)}
                className={`w-full text-left rounded-lg border px-3 py-2 transition-colors ${
                  selectedAgentId === agent.id ? "bg-[var(--bg-muted)]" : "hover:bg-[var(--nav-hover)]"
                }`}
                style={borderStyle}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm text-[var(--text-primary)] truncate">{agent.name}</span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded ${
                      agent.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-neutral-500/20 text-neutral-300"
                    }`}
                  >
                    {agent.isActive ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">slug: {agent.slug}</p>
              </button>
            ))}
          </div>
        </section>

        <section className={`${cardClass} space-y-4`} style={borderStyle}>
          {!selectedAgent ? (
            <p className="text-sm text-[var(--text-secondary)]">
              Selecione um agente para editar as configurações.
            </p>
          ) : loadingConfig ? (
            <p className="text-sm text-[var(--text-secondary)]">Carregando configuração...</p>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">{selectedAgent.name}</h2>
                  <p className="text-xs text-[var(--text-secondary)]">{selectedAgent.slug}</p>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={agentIsActive}
                    onChange={(e) => setAgentIsActive(e.target.checked)}
                    style={{ accentColor: "var(--accent, #3B82F6)" }}
                  />
                  Agente ativo
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-[var(--text-secondary)]">Tom/sentimento</label>
                  <select
                    className={inputClass}
                    style={inputStyle}
                    value={sentimentTone}
                    onChange={(e) => setSentimentTone(e.target.value as AgentConfig["sentimentTone"])}
                  >
                    <option value="positivo">positivo</option>
                    <option value="neutro">neutro</option>
                    <option value="negativo">negativo</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-[var(--text-secondary)]">Agressividade de vendas</label>
                  <select
                    className={inputClass}
                    style={inputStyle}
                    value={salesAggressiveness}
                    onChange={(e) =>
                      setSalesAggressiveness(e.target.value as AgentConfig["salesAggressiveness"])
                    }
                  >
                    <option value="baixo">baixo</option>
                    <option value="moderado">moderado</option>
                    <option value="alto">alto</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={configIsActive}
                  onChange={(e) => setConfigIsActive(e.target.checked)}
                  style={{ accentColor: "var(--accent, #3B82F6)" }}
                />
                Configuração ativa
              </label>

              <div className="space-y-1">
                <label className="text-sm text-[var(--text-secondary)]">Dicas de objeções (JSON)</label>
                <textarea
                  value={objectionTipsText}
                  onChange={(e) => setObjectionTipsText(e.target.value)}
                  rows={10}
                  className={`${inputClass} font-mono text-xs`}
                  style={inputStyle}
                />
              </div>

              <div className="rounded-lg border p-4 space-y-4" style={borderStyle}>
                <h3 className="font-medium text-[var(--text-primary)]">Transcrição e Sentimento</h3>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={transcriptionEnabled}
                    onChange={(e) => setTranscriptionEnabled(e.target.checked)}
                    style={{ accentColor: "var(--accent, #3B82F6)" }}
                  />
                  Ativar transcrição automática
                </label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--text-secondary)]">Idioma</label>
                    <select
                      className={inputClass}
                      style={inputStyle}
                      value={transcriptionLanguage}
                      onChange={(e) => setTranscriptionLanguage(e.target.value)}
                    >
                      <option value="pt-BR">pt-BR</option>
                      <option value="en-US">en-US</option>
                      <option value="es-ES">es-ES</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[var(--text-secondary)]">Tipo de reunião</label>
                    <select
                      className={inputClass}
                      style={inputStyle}
                      value={transcriptionMeetingType}
                      onChange={(e) =>
                        setTranscriptionMeetingType(e.target.value as PromptConfig["transcription"]["meetingType"])
                      }
                    >
                      <option value="cliente">cliente</option>
                      <option value="venda">venda</option>
                      <option value="suporte">suporte</option>
                      <option value="interna">interna</option>
                      <option value="outro">outro</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[var(--text-secondary)]">Nível de detalhe</label>
                    <select
                      className={inputClass}
                      style={inputStyle}
                      value={transcriptionDetailLevel}
                      onChange={(e) =>
                        setTranscriptionDetailLevel(e.target.value as PromptConfig["transcription"]["detailLevel"])
                      }
                    >
                      <option value="resumo_curto">resumo curto</option>
                      <option value="topicos">tópicos</option>
                      <option value="completa">completa</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={sentimentEnabled}
                    onChange={(e) => setSentimentEnabled(e.target.checked)}
                    style={{ accentColor: "var(--accent, #3B82F6)" }}
                  />
                  Ativar análise de sentimento
                </label>

                <div className="space-y-1">
                  <label className="text-xs text-[var(--text-secondary)]">Modo de sentimento</label>
                  <select
                    className={inputClass}
                    style={inputStyle}
                    value={sentimentMode}
                    onChange={(e) => setSentimentMode(e.target.value as PromptConfig["sentiment"]["mode"])}
                  >
                    <option value="simple">simples (positivo/neutro/negativo)</option>
                    <option value="score">score numérico</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showSentimentOverall}
                      onChange={(e) => setShowSentimentOverall(e.target.checked)}
                      style={{ accentColor: "var(--accent, #3B82F6)" }}
                    />
                    Mostrar sentimento geral
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showSentimentPerParticipant}
                      onChange={(e) => setShowSentimentPerParticipant(e.target.checked)}
                      style={{ accentColor: "var(--accent, #3B82F6)" }}
                    />
                    Por participante
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showSentimentIntensity}
                      onChange={(e) => setShowSentimentIntensity(e.target.checked)}
                      style={{ accentColor: "var(--accent, #3B82F6)" }}
                    />
                    Mostrar intensidade
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={savingConfig}
                className="px-4 py-2 rounded bg-[var(--bg-muted)] hover:bg-[var(--nav-hover)] disabled:opacity-60"
              >
                {savingConfig ? "Salvando..." : "Salvar configuração"}
              </button>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
