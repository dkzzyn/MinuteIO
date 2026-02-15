import { useEffect, useState } from "react";
import { createMeeting } from "../../services/api";
import { IconX } from "../icons";
import { useNavigate } from "react-router-dom";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function NewMeetingModal({ open, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setTitle("");
      setClientName("");
      setClientEmail("");
      setError("");
      setSubmitting(false);
    }
  }, [open]);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") onClose();
  }

  async function submit() {
    if (!title.trim()) {
      setError("Informe o título da reunião.");
      return;
    }
    setError("");
    setSubmitting(true);
    const payload = {
      title,
      datetime: new Date().toISOString(),
      durationMinutes: 30,
      pipeline_stage: "discovery" as any,
      language: "pt-BR" as any,
      result: "Em andamento" as any,
      participants: [clientName || "Cliente", "Vendedor"],
      summary: ""
    };
    const m = await createMeeting(payload);
    setSubmitting(false);
    onClose();
    navigate(`/capture-tab?meeting=${encodeURIComponent(m.id)}`);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-2xl bg-[var(--bg-elevated)] border" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="p-5 border-b" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="flex items-center justify-between">
              <div className="text-xl font-semibold">Nova Reunião</div>
              <button onClick={onClose} className="p-2 rounded bg-[var(--bg-muted)]"><IconX className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <div className="text-sm text-[var(--text-secondary)] mb-1">Título da Reunião *</div>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Reunião de Vendas – Cliente X" className="w-full px-3 py-2 rounded bg-[var(--input-bg)] outline-none" style={{ border: '1px solid var(--input-border)' }} />
            </div>
            <div>
              <div className="text-sm text-[var(--text-secondary)] mb-1">Nome do Cliente</div>
              <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Ex: João Silva" className="w-full px-3 py-2 rounded bg-[var(--input-bg)] outline-none" style={{ border: '1px solid var(--input-border)' }} />
            </div>
            <div>
              <div className="text-sm text-[var(--text-secondary)] mb-1">Email do Cliente</div>
              <input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="Ex: joao@empresa.com" className="w-full px-3 py-2 rounded bg-[var(--input-bg)] outline-none" style={{ border: '1px solid var(--input-border)' }} />
            </div>
            {error && <div className="text-[var(--accent-red)] text-sm">{error}</div>}
          </div>
          <div className="p-5 border-t flex justify-end gap-2" style={{ borderColor: "var(--border-subtle)" }}>
            <button onClick={onClose} className="px-4 py-2 rounded bg-[var(--bg-muted)]">Cancelar</button>
            <button onClick={submit} disabled={submitting} className="px-4 py-2 rounded bg-[var(--accent-green)] text-white disabled:opacity-60">{submitting ? "Criando..." : "Criar Reunião"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
