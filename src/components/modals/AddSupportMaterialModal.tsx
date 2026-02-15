import { useState, useRef } from "react";
import { IconX, IconFile, IconUpload } from "../icons";
import type {
  SupportMaterialType,
  MaterialFunnelStage
} from "../../types/supportMaterial";

export type AddSupportMaterialPayload = {
  title: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSizeBytes?: number;
  materialType: SupportMaterialType;
  funnelStage: MaterialFunnelStage;
  isConfidential: boolean;
  tags: string[];
  notes?: string;
  meetingId?: string;
};

const ACCEPTED_TYPES =
  ".pdf,.pptx,.docx,.mp4,.mov,.mp3,.png,.jpg,.jpeg";
const MAX_SIZE_MB = 200;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const MATERIAL_TYPE_OPTIONS: { value: SupportMaterialType; label: string }[] = [
  { value: "PRESENTATION", label: "Apresentação" },
  { value: "PROPOSAL", label: "Proposta" },
  { value: "MEETING_RECORDING", label: "Gravação de reunião (vídeo)" },
  { value: "SCRIPT", label: "Script / Roteiro" },
  { value: "REQUIREMENTS", label: "Documento de requisitos" },
  { value: "OTHER", label: "Outro" }
];

const FUNNEL_STAGE_OPTIONS: { value: MaterialFunnelStage; label: string }[] = [
  { value: "PRE_SALES", label: "Pré-venda" },
  { value: "DISCOVERY", label: "Discovery" },
  { value: "PROPOSAL", label: "Proposta" },
  { value: "NEGOTIATION", label: "Negociação" },
  { value: "POST_SALES", label: "Pós-venda / Onboarding" }
];

const QUICK_TAGS: { id: string; label: string }[] = [
  { id: "uso_interno", label: "Uso interno" },
  { id: "enviado_cliente", label: "Enviado ao cliente" },
  { id: "usado_demo", label: "Usado em reunião de demo" },
  { id: "usado_diagnostico", label: "Usado em reunião de diagnóstico" }
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileKind(mime: string): "pdf" | "video" | "audio" | "image" | "doc" {
  if (mime.includes("pdf")) return "pdf";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("image/")) return "image";
  return "doc";
}

export type ClientMeetingOption = { id: string; title: string; date: string };

type Props = {
  open: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
  clientMeetings: ClientMeetingOption[];
  onSuccess: (payload: AddSupportMaterialPayload) => void;
};

export default function AddSupportMaterialModal({
  open,
  onClose,
  clientId,
  clientName,
  clientMeetings,
  onSuccess
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isConfidential, setIsConfidential] = useState(false);
  const [title, setTitle] = useState("");
  const [materialType, setMaterialType] = useState<SupportMaterialType>("PRESENTATION");
  const [funnelStage, setFunnelStage] = useState<MaterialFunnelStage>("DISCOVERY");
  const [meetingId, setMeetingId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "uploading" | "success">("idle");
  const [error, setError] = useState("");

  const canSave = Boolean(file && title.trim());
  const meetingOptions = [
    { id: "", title: "Nenhuma reunião específica", date: "" },
    ...clientMeetings
  ];

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError("");
    const f = e.target.files?.[0];
    if (!f) {
      setFile(null);
      return;
    }
    if (f.size > MAX_SIZE_BYTES) {
      setError(`Arquivo maior que ${MAX_SIZE_MB} MB.`);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFile(f);
  }

  function toggleTag(id: string) {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title.trim()) return;
    setStatus("uploading");
    setError("");
    // Simula upload; em produção seria FormData + API
    setTimeout(() => {
      const fileUrl = URL.createObjectURL(file);
      onSuccess({
        title: title.trim(),
        fileUrl,
        fileName: file.name,
        fileType: file.type,
        fileSizeBytes: file.size,
        materialType,
        funnelStage,
        isConfidential,
        tags: selectedTags,
        notes: notes.trim() || undefined,
        meetingId: meetingId || undefined
      });
      setStatus("success");
      resetForm();
      onClose();
    }, 1500);
  }

  function resetForm() {
    setFile(null);
    setTitle("");
    setMaterialType("PRESENTATION");
    setFunnelStage("DISCOVERY");
    setMeetingId("");
    setNotes("");
    setSelectedTags([]);
    setIsConfidential(false);
    setStatus("idle");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleClose() {
    if (status === "uploading") return;
    resetForm();
    onClose();
  }

  if (!open) return null;

  const fileKind = file ? getFileKind(file.type) : null;

  return (
    <div
      className="fixed inset-0 z-50"
      onKeyDown={(e) => e.key === "Escape" && status !== "uploading" && handleClose()}
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => status !== "uploading" && handleClose()}
        aria-hidden
      />
      <div className="absolute inset-0 flex items-center justify-center px-4 overflow-y-auto py-8">
        <div
          className="w-full max-w-lg rounded-2xl bg-[var(--bg-elevated)] border shadow-xl my-auto"
          style={{ borderColor: "var(--border-subtle)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="p-5 border-b flex items-center justify-between"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              Adicionar material de apoio
            </h2>
            <button
              type="button"
              onClick={handleClose}
              disabled={status === "uploading"}
              className="p-2 rounded-lg hover:bg-[var(--nav-hover)] disabled:opacity-50"
              aria-label="Fechar"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            <p className="text-sm text-[var(--text-secondary)]">
              Envie arquivos para usar em reuniões com a {clientName}, como
              apresentações, propostas e gravações de chamadas.
            </p>

            {/* Seção 1 – Arquivo */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                Arquivo
              </h3>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                onChange={handleFileChange}
                className="hidden"
                aria-label="Selecionar arquivo"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border bg-[var(--bg-muted)] hover:bg-[var(--nav-hover)] text-[var(--text-primary)]"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <IconUpload className="w-4 h-4" />
                Escolher arquivo
              </button>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5">
                Formatos aceitos: PDF, PPTX, DOCX, MP4, MOV, MP3, PNG, JPG.
                Tamanho máximo: {MAX_SIZE_MB} MB.
              </p>
              {error && (
                <p className="text-sm text-[var(--chart-negative)] mt-1">{error}</p>
              )}
              {file && (
                <div
                  className="mt-2 flex items-center gap-2 p-3 rounded-lg bg-[var(--bg-muted)]"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <IconFile className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {formatFileSize(file.size)} · {fileKind === "pdf" ? "PDF" : fileKind === "video" ? "Vídeo" : fileKind === "audio" ? "Áudio" : fileKind === "image" ? "Imagem" : "Documento"}
                    </p>
                  </div>
                </div>
              )}
              <label className="mt-2 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isConfidential}
                  onChange={(e) => setIsConfidential(e.target.checked)}
                  className="rounded"
                  style={{ accentColor: "var(--accent-green)" }}
                />
                <span className="text-sm text-[var(--text-primary)]">
                  Este arquivo é confidencial (visível apenas para sua equipe).
                </span>
              </label>
            </div>

            {/* Seção 2 – Informações do material */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Informações do material
              </h3>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">
                  Título do material
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='Ex.: "Apresentação comercial", "Proposta v2", "Gravação da demo"'
                  className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] border text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                  style={{ borderColor: "var(--input-border)" }}
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">
                  Tipo de material
                </label>
                <select
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value as SupportMaterialType)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] border text-sm text-[var(--text-primary)]"
                  style={{ borderColor: "var(--input-border)" }}
                >
                  {MATERIAL_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">
                  Fase do funil
                </label>
                <select
                  value={funnelStage}
                  onChange={(e) => setFunnelStage(e.target.value as MaterialFunnelStage)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] border text-sm text-[var(--text-primary)]"
                  style={{ borderColor: "var(--input-border)" }}
                >
                  {FUNNEL_STAGE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">
                  Reunião relacionada (opcional)
                </label>
                <select
                  value={meetingId}
                  onChange={(e) => setMeetingId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] border text-sm text-[var(--text-primary)]"
                  style={{ borderColor: "var(--input-border)" }}
                >
                  {meetingOptions.map((m) => (
                    <option key={m.id || "none"} value={m.id}>
                      {m.id ? `${m.title} – ${m.date ? new Date(m.date).toLocaleDateString("pt-BR") : ""}` : m.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">
                  Observações
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder='Ex.: "Versão revisada da proposta com desconto adicional."'
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] border text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] resize-y"
                  style={{ borderColor: "var(--input-border)" }}
                />
              </div>
            </div>

            {/* Seção 3 – Tags rápidas */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                Tags rápidas (opcional)
              </h3>
              <div className="flex flex-wrap gap-2">
                {QUICK_TAGS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.id)}
                    className={`px-3 py-1.5 rounded-full text-sm border ${
                      selectedTags.includes(t.id)
                        ? "bg-[var(--accent-green)]/20 border-[var(--accent-green)] text-[var(--accent-green)]"
                        : "bg-[var(--bg-muted)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--nav-hover)]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rodapé */}
            <div
              className="pt-4 border-t flex justify-end gap-2"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <button
                type="button"
                onClick={handleClose}
                disabled={status === "uploading"}
                className="px-4 py-2 rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--nav-hover)] text-[var(--text-primary)] disabled:opacity-50"
              >
                Cancelar
              </button>
              {status === "uploading" ? (
                <span className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)]">
                  <span className="inline-block w-4 h-4 border-2 border-[var(--accent-green)] border-t-transparent rounded-full animate-spin" />
                  Enviando arquivo…
                </span>
              ) : (
                <button
                  type="submit"
                  disabled={!canSave}
                  className="px-4 py-2 rounded-lg bg-[var(--accent-green)] hover:opacity-90 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Salvar material
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
