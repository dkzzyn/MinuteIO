import { useEffect, useState } from "react";
import { IconX } from "../icons";

export type ProjectPreset = {
  name: string;
  type: string;
  color: string;
};

const presets: Record<string, ProjectPreset> = {
  vendas: { name: "Projeto de vendas", type: "vendas", color: "#22c55e" },
  marketing: { name: "Projeto de marketing", type: "marketing", color: "#3b82f6" },
  desenvolvimento: { name: "Projeto de desenvolvimento", type: "desenvolvimento", color: "#8b5cf6" },
  personalizado: { name: "Meu projeto", type: "personalizado", color: "#64748b" }
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (project: { name: string; type: string; color: string }) => void;
  presetKey?: keyof typeof presets | null;
};

export default function NewProjectModal({ open, onClose, onCreate, presetKey = null }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState("personalizado");
  const [color, setColor] = useState("#64748b");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setError("");
      if (presetKey && presets[presetKey]) {
        const p = presets[presetKey];
        setName(p.name);
        setType(p.type);
        setColor(p.color);
      } else {
        setName("");
        setType("personalizado");
        setColor("#64748b");
      }
    }
  }, [open, presetKey]);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") onClose();
  }

  function submit() {
    if (!name.trim()) {
      setError("Informe o nome do projeto.");
      return;
    }
    setError("");
    onCreate({ name: name.trim(), type, color });
    onClose();
  }

  if (!open) return null;

  const colors = ["#22c55e", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#64748b"];

  return (
    <div className="fixed inset-0 z-50" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div
          className="w-full max-w-lg rounded-2xl bg-[var(--bg-elevated)] border shadow-xl"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border-subtle)" }}>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Novo projeto</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--nav-hover)] text-[var(--text-secondary)]"
              aria-label="Fechar"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Nome do projeto *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Pipeline Q1, Campanha de lançamento"
                className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] outline-none text-[var(--text-primary)] placeholder:text-neutral-500"
                style={{ border: "1px solid var(--input-border)" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] border text-[var(--text-primary)] outline-none"
                style={{ borderColor: "var(--input-border)" }}
              >
                <option value="vendas">Vendas</option>
                <option value="marketing">Marketing</option>
                <option value="desenvolvimento">Desenvolvimento</option>
                <option value="personalizado">Personalizado</option>
              </select>
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
                    style={{
                      backgroundColor: c,
                      borderColor: color === c ? "var(--text-primary)" : "transparent"
                    }}
                    aria-label={`Cor ${c}`}
                  />
                ))}
              </div>
            </div>
            {error && <p className="text-sm text-[var(--chart-negative)]">{error}</p>}
          </div>
          <div className="p-5 border-t flex justify-end gap-2" style={{ borderColor: "var(--border-subtle)" }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--nav-hover)] text-[var(--text-primary)]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={submit}
              className="px-4 py-2 rounded-lg bg-[var(--accent-green)] hover:opacity-90 text-white font-medium"
            >
              Criar projeto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { presets };
