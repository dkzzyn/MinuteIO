import { useState } from "react";

const inputClass =
  "w-full px-3 py-2 rounded bg-[var(--input-bg)] outline-none text-[var(--text-primary)]";
const inputBorder = { border: "1px solid var(--input-border)" as const };
const blockClass =
  "rounded-xl bg-[var(--bg-elevated)] border p-5 space-y-4";
const blockBorder = { borderColor: "var(--border-subtle)" } as const;
const labelClass = "text-sm font-medium text-[var(--text-secondary)]";
const selectClass = `${inputClass} cursor-pointer`;

type CoachMode = "agressivo" | "consultivo" | "silencioso" | "tempo-real" | "equilibrado";
type MeetingType = "discovery" | "demo" | "onboarding" | "suporte" | "internal" | "custom";

function SettingsBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={blockClass} style={blockBorder}>
      <h2 className="text-base font-semibold text-[var(--text-primary)] border-b pb-3" style={{ borderColor: "var(--border-subtle)" }}>
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function Settings() {
  const [defaultLang, setDefaultLang] = useState("pt-BR");
  const [langExtras, setLangExtras] = useState({
    detectAuto: false,
    useCompanyLang: false,
  });
  const [countryTone, setCountryTone] = useState("BR");
  const [toneExtras, setToneExtras] = useState({
    customPerPipeline: false,
    neutralInternational: false,
  });
  const [mode, setMode] = useState<CoachMode>("consultivo");
  const [durationLimit, setDurationLimit] = useState<number | "custom">(60);
  const [customDuration, setCustomDuration] = useState(45);
  const [durationExtras, setDurationExtras] = useState({
    autoEndAtLimit: true,
    warn5MinBefore: true,
  });
  const [meetingType, setMeetingType] = useState<MeetingType>("discovery");
  const [customMeetingTag, setCustomMeetingTag] = useState("");
  const [insightTypes, setInsightTypes] = useState({
    objections: true,
    engagement: true,
    nextSteps: true,
    triggerWords: true,
    sentiment: true,
  });
  const [privacy, setPrivacy] = useState({
    saveTranscript: true,
    anonymizeNames: false,
    allowTrainingData: false,
  });

  const toggleInsight = (key: keyof typeof insightTypes) =>
    setInsightTypes((prev) => ({ ...prev, [key]: !prev[key] }));
  const togglePrivacy = (key: keyof typeof privacy) =>
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));

  const coachModes: { value: CoachMode; label: string; desc: string }[] = [
    {
      value: "agressivo",
      label: "Agressivo",
      desc: "Feedback direto, sem “amenizar”. Mais foco em apontar erros e oportunidades perdidas.",
    },
    {
      value: "consultivo",
      label: "Consultivo",
      desc: "Feedback mais suave, com sugestões e reforço positivo.",
    },
    {
      value: "silencioso",
      label: "Silencioso",
      desc: "Só relatório pós-call, sem intervenções durante a call.",
    },
    {
      value: "tempo-real",
      label: "Em tempo real",
      desc: "Insights a cada 1 minuto durante a call.",
    },
    {
      value: "equilibrado",
      label: "Equilibrado",
      desc: "Mistura de consultivo com alertas importantes.",
    },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div className="text-xl font-semibold text-[var(--text-primary)]">
        Configurações
      </div>

      {/* Bloco: Idioma padrão */}
      <SettingsBlock title="Idioma padrão">
        <div className="space-y-1">
          <label className={labelClass}>Idioma</label>
          <select
            value={defaultLang}
            onChange={(e) => setDefaultLang(e.target.value)}
            className={selectClass}
            style={inputBorder}
          >
            <option value="pt-BR">pt-BR (Português Brasil)</option>
            <option value="en-US">en-US (Inglês EUA)</option>
            <option value="es-MX">es-MX (Espanhol México)</option>
            <option value="es-ES">es-ES (Espanhol Espanha)</option>
            <option value="fr-FR">fr-FR (Francês França)</option>
            <option value="fr-CA">fr-CA (Francês Canadá)</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={langExtras.detectAuto}
              onChange={() =>
                setLangExtras((p) => ({ ...p, detectAuto: !p.detectAuto }))
              }
              className="rounded border-[var(--input-border)]"
              style={{ accentColor: "var(--accent, #3B82F6)" }}
            />
            <span className="text-sm text-[var(--text-secondary)]">
              Detectar automaticamente pelo idioma da call
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={langExtras.useCompanyLang}
              onChange={() =>
                setLangExtras((p) => ({ ...p, useCompanyLang: !p.useCompanyLang }))
              }
              className="rounded border-[var(--input-border)]"
              style={{ accentColor: "var(--accent, #3B82F6)" }}
            />
            <span className="text-sm text-[var(--text-secondary)]">
              Usar idioma da empresa/equipe como padrão
            </span>
          </label>
        </div>
      </SettingsBlock>

      {/* Bloco: País alvo para tom */}
      <SettingsBlock title="País alvo para tom">
        <p className="text-sm text-[var(--text-secondary)]">
          Usado para adaptar exemplos, expressões e estilo de speech de vendas.
        </p>
        <div className="space-y-1">
          <label className={labelClass}>País</label>
          <select
            value={countryTone}
            onChange={(e) => setCountryTone(e.target.value)}
            className={selectClass}
            style={inputBorder}
          >
            <option value="BR">BR</option>
            <option value="US">US</option>
            <option value="MX">MX</option>
            <option value="ES">ES</option>
            <option value="FR">FR</option>
            <option value="CA">CA</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={toneExtras.customPerPipeline}
              onChange={() =>
                setToneExtras((p) => ({
                  ...p,
                  customPerPipeline: !p.customPerPipeline,
                }))
              }
              className="rounded border-[var(--input-border)]"
              style={{ accentColor: "var(--accent, #3B82F6)" }}
            />
            <span className="text-sm text-[var(--text-secondary)]">
              Personalizar tom por pipeline (ex.: Vendas BR, Latam, França)
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={toneExtras.neutralInternational}
              onChange={() =>
                setToneExtras((p) => ({
                  ...p,
                  neutralInternational: !p.neutralInternational,
                }))
              }
              className="rounded border-[var(--input-border)]"
              style={{ accentColor: "var(--accent, #3B82F6)" }}
            />
            <span className="text-sm text-[var(--text-secondary)]">
              Tom neutro internacional (calls mistas)
            </span>
          </label>
        </div>
      </SettingsBlock>

      {/* Bloco: Modo do coach */}
      <SettingsBlock title="Modo do coach">
        <div className="space-y-2">
          {coachModes.map((m) => (
            <label
              key={m.value}
              className={`flex gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                mode === m.value ? "bg-[var(--bg-muted)]" : "hover:bg-[var(--nav-hover)]"
              }`}
              style={blockBorder}
            >
              <input
                type="radio"
                name="coach-mode"
                value={m.value}
                checked={mode === m.value}
                onChange={() => setMode(m.value)}
                className="mt-0.5"
                style={{ accentColor: "var(--accent, #3B82F6)" }}
              />
              <div>
                <span className="font-medium text-[var(--text-primary)]">
                  {m.label}
                </span>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                  {m.desc}
                </p>
              </div>
            </label>
          ))}
        </div>
      </SettingsBlock>

      {/* Bloco: Limite de duração da call */}
      <SettingsBlock title="Limite de duração da call">
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={durationLimit}
            onChange={(e) =>
              setDurationLimit(
                e.target.value === "custom" ? "custom" : Number(e.target.value)
              )
            }
            className={`${selectClass} max-w-[140px]`}
            style={inputBorder}
          >
            <option value={30}>30 min</option>
            <option value={60}>60 min</option>
            <option value={90}>90 min</option>
            <option value="custom">Custom</option>
          </select>
          {durationLimit === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={5}
                max={240}
                value={customDuration}
                onChange={(e) => setCustomDuration(Number(e.target.value))}
                className={`${inputClass} w-20`}
                style={inputBorder}
              />
              <span className="text-sm text-[var(--text-secondary)]">min</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={durationExtras.autoEndAtLimit}
              onChange={() =>
                setDurationExtras((p) => ({
                  ...p,
                  autoEndAtLimit: !p.autoEndAtLimit,
                }))
              }
              className="rounded border-[var(--input-border)]"
              style={{ accentColor: "var(--accent, #3B82F6)" }}
            />
            <span className="text-sm text-[var(--text-secondary)]">
              Encerrar análise automaticamente ao atingir limite
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={durationExtras.warn5MinBefore}
              onChange={() =>
                setDurationExtras((p) => ({
                  ...p,
                  warn5MinBefore: !p.warn5MinBefore,
                }))
              }
              className="rounded border-[var(--input-border)]"
              style={{ accentColor: "var(--accent, #3B82F6)" }}
            />
            <span className="text-sm text-[var(--text-secondary)]">
              Alertar 5 minutos antes do limite
            </span>
          </label>
        </div>
      </SettingsBlock>

      {/* Bloco: Tipo de reunião */}
      <SettingsBlock title="Tipo de reunião">
        <p className="text-sm text-[var(--text-secondary)]">
          Ajuda a personalizar os insights.
        </p>
        <div className="space-y-1">
          <label className={labelClass}>Tipo</label>
          <select
            value={meetingType}
            onChange={(e) => setMeetingType(e.target.value as MeetingType)}
            className={selectClass}
            style={inputBorder}
          >
            <option value="discovery">Discovery</option>
            <option value="demo">Demo</option>
            <option value="onboarding">Onboarding</option>
            <option value="suporte">Suporte</option>
            <option value="internal">Internal / 1:1</option>
            <option value="custom">Custom tag</option>
          </select>
        </div>
        {meetingType === "custom" && (
          <div className="space-y-1">
            <label className={labelClass}>Tag personalizada</label>
            <input
              type="text"
              value={customMeetingTag}
              onChange={(e) => setCustomMeetingTag(e.target.value)}
              placeholder="Ex: Follow-up técnico"
              className={inputClass}
              style={inputBorder}
            />
          </div>
        )}
      </SettingsBlock>

      {/* Bloco: Tipo de insight */}
      <SettingsBlock title="Tipo de insight">
        <p className="text-sm text-[var(--text-secondary)]">
          Selecione quais análises deseja receber.
        </p>
        <div className="space-y-2">
          {[
            {
              key: "objections" as const,
              label: "Detecção de objeções",
            },
            {
              key: "engagement" as const,
              label: "Análise de engajamento (talk/listen ratio)",
            },
            {
              key: "nextSteps" as const,
              label: "Sugestão de próximos passos",
            },
            {
              key: "triggerWords" as const,
              label: "Palavras gatilho (preço, contrato, prazo)",
            },
            {
              key: "sentiment" as const,
              label: "Sentimento do cliente",
            },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={insightTypes[key]}
                onChange={() => toggleInsight(key)}
                className="rounded border-[var(--input-border)]"
                style={{ accentColor: "var(--accent, #3B82F6)" }}
              />
              <span className="text-sm text-[var(--text-primary)]">
                {label}
              </span>
            </label>
          ))}
        </div>
      </SettingsBlock>

      {/* Bloco: Privacidade e gravação */}
      <SettingsBlock title="Privacidade e gravação">
        <div className="space-y-3">
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <span className="text-sm text-[var(--text-primary)]">
              Salvar transcrição desta reunião
            </span>
            <input
              type="checkbox"
              checked={privacy.saveTranscript}
              onChange={() => togglePrivacy("saveTranscript")}
              className="rounded border-[var(--input-border)]"
              style={{ accentColor: "var(--accent, #3B82F6)" }}
            />
          </label>
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <span className="text-sm text-[var(--text-primary)]">
              Anonimizar nomes da call nos relatórios
            </span>
            <input
              type="checkbox"
              checked={privacy.anonymizeNames}
              onChange={() => togglePrivacy("anonymizeNames")}
              className="rounded border-[var(--input-border)]"
              style={{ accentColor: "var(--accent, #3B82F6)" }}
            />
          </label>
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <span className="text-sm text-[var(--text-primary)]">
              Permitir uso dos dados para treinar modelos internos
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPrivacy((p) => ({ ...p, allowTrainingData: false }))}
                className={`px-3 py-1.5 rounded text-sm ${
                  !privacy.allowTrainingData
                    ? "bg-[var(--bg-muted)] font-medium"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                Não
              </button>
              <button
                type="button"
                onClick={() => setPrivacy((p) => ({ ...p, allowTrainingData: true }))}
                className={`px-3 py-1.5 rounded text-sm ${
                  privacy.allowTrainingData
                    ? "bg-[var(--bg-muted)] font-medium"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                Sim
              </button>
            </div>
          </label>
        </div>
      </SettingsBlock>
    </div>
  );
}
