import { useEffect, useState } from "react";
import { IconX } from "../icons";
import type { ClientStatus } from "../../types/client";

export type ClientPreset = {
  name: string;
  status: ClientStatus;
  tags: { segmento?: string; tamanho?: string; origemLead?: string };
  color: string;
};

const presets: Record<string, ClientPreset> = {
  vendas: { name: "Novo cliente – Vendas", status: "em_negociacao", tags: { segmento: "Vendas" }, color: "#22c55e" },
  marketing: { name: "Novo cliente – Marketing", status: "ativo", tags: { segmento: "Marketing" }, color: "#3b82f6" },
  desenvolvimento: { name: "Novo cliente – Desenvolvimento", status: "em_negociacao", tags: { segmento: "Tech" }, color: "#8b5cf6" },
  personalizado: { name: "Novo cliente", status: "em_negociacao", tags: {}, color: "#64748b" }
};

export type NewClientForm = {
  name: string;
  cnpjCpf: string;
  contactName: string;
  phone: string;
  email: string;
  status: ClientStatus;
  tags: { segmento?: string; tamanho?: string; origemLead?: string };
  color: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (form: NewClientForm) => void;
  presetKey?: keyof typeof presets | null;
};

export default function NewClientModal({ open, onClose, onCreate, presetKey = null }: Props) {
  const [name, setName] = useState("");
  const [cnpjCpf, setCnpjCpf] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<ClientStatus>("em_negociacao");
  const [segmento, setSegmento] = useState("");
  const [tamanho, setTamanho] = useState("");
  const [origemLead, setOrigemLead] = useState("");
  const [color, setColor] = useState("#64748b");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setError("");
      if (presetKey && presets[presetKey]) {
        const p = presets[presetKey];
        setName(p.name);
        setStatus(p.status);
        setSegmento(p.tags.segmento ?? "");
        setTamanho(p.tags.tamanho ?? "");
        setOrigemLead(p.tags.origemLead ?? "");
        setColor(p.color);
      } else {
        setName("");
        setCnpjCpf("");
        setContactName("");
        setPhone("");
        setEmail("");
        setStatus("em_negociacao");
        setSegmento("");
        setTamanho("");
        setOrigemLead("");
        setColor("#64748b");
      }
    }
  }, [open, presetKey]);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") onClose();
  }

  function submit() {
    if (!name.trim()) {
      setError("Informe o nome do cliente.");
      return;
    }
    setError("");
    onCreate({
      name: name.trim(),
      cnpjCpf: cnpjCpf.trim(),
      contactName: contactName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      status,
      tags: { segmento: segmento || undefined, tamanho: tamanho || undefined, origemLead: origemLead || undefined },
      color
    });
    onClose();
  }

  if (!open) return null;

  const colors = ["#22c55e", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#64748b"];

  return (
    <div className="fixed inset-0 z-50" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden />
      <div className="absolute inset-0 flex items-center justify-center px-4 overflow-y-auto py-8">
        <div
          className="w-full max-w-lg rounded-2xl bg-[var(--bg-elevated)] border shadow-xl my-auto"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border-subtle)" }}>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Novo cliente</h2>
            <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--nav-hover)] text-[var(--text-secondary)]" aria-label="Fechar">
              <IconX className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Nome do cliente (empresa) *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Loja Alpha, SaaS Beta"
                className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] outline-none text-[var(--text-primary)] placeholder:text-neutral-500"
                style={{ border: "1px solid var(--input-border)" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">CNPJ / CPF</label>
              <input
                value={cnpjCpf}
                onChange={(e) => setCnpjCpf(e.target.value)}
                placeholder="Ex: 12.345.678/0001-90"
                className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] outline-none text-[var(--text-primary)] placeholder:text-neutral-500"
                style={{ border: "1px solid var(--input-border)" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Contato principal</label>
              <input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Ex: Carlos Silva"
                className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] outline-none text-[var(--text-primary)] placeholder:text-neutral-500"
                style={{ border: "1px solid var(--input-border)" }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Telefone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] outline-none text-[var(--text-primary)]"
                  style={{ border: "1px solid var(--input-border)" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contato@empresa.com"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] outline-none text-[var(--text-primary)]"
                  style={{ border: "1px solid var(--input-border)" }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ClientStatus)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] border text-[var(--text-primary)] outline-none"
                style={{ borderColor: "var(--input-border)" }}
              >
                <option value="ativo">Ativo</option>
                <option value="em_negociacao">Em negociação</option>
                <option value="perdido">Perdido</option>
                <option value="ganho">Ganho</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Segmento</label>
                <input
                  value={segmento}
                  onChange={(e) => setSegmento(e.target.value)}
                  placeholder="Ex: Varejo"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] outline-none text-[var(--text-primary)]"
                  style={{ border: "1px solid var(--input-border)" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Tamanho</label>
                <input
                  value={tamanho}
                  onChange={(e) => setTamanho(e.target.value)}
                  placeholder="Ex: Médio"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] outline-none text-[var(--text-primary)]"
                  style={{ border: "1px solid var(--input-border)" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Origem do lead</label>
                <input
                  value={origemLead}
                  onChange={(e) => setOrigemLead(e.target.value)}
                  placeholder="Ex: Site"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] outline-none text-[var(--text-primary)]"
                  style={{ border: "1px solid var(--input-border)" }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Cor</label>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                    style={{ backgroundColor: c, borderColor: color === c ? "var(--text-primary)" : "transparent" }}
                    aria-label={`Cor ${c}`}
                  />
                ))}
              </div>
            </div>
            {error && <p className="text-sm text-[var(--chart-negative)]">{error}</p>}
          </div>
          <div className="p-5 border-t flex justify-end gap-2" style={{ borderColor: "var(--border-subtle)" }}>
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--nav-hover)] text-[var(--text-primary)]">
              Cancelar
            </button>
            <button type="button" onClick={submit} className="px-4 py-2 rounded-lg bg-[var(--accent-green)] hover:opacity-90 text-white font-medium">
              Criar cliente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { presets };
