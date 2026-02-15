import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NewClientModal, { presets } from "../components/modals/NewClientModal";
import type { NewClientForm } from "../components/modals/NewClientModal";
import { getClients, addClient } from "../data/clientsStore";
import type { Client } from "../types/client";

const projectTypeKeys = ["vendas", "marketing", "desenvolvimento", "personalizado"] as const;
const projectTypeLabels: Record<string, string> = {
  vendas: "Projeto de vendas",
  marketing: "Projeto de marketing",
  desenvolvimento: "Projeto de desenvolvimento",
  personalizado: "Projeto personalizado"
};

const statusLabels: Record<Client["status"], string> = {
  ativo: "Ativo",
  em_negociacao: "Em negociação",
  perdido: "Perdido",
  ganho: "Ganho",
  inativo: "Inativo"
};

const statusStyles: Record<Client["status"], string> = {
  ativo: "bg-[var(--chart-positive)]/20 text-[var(--chart-positive)]",
  em_negociacao: "bg-[var(--accent-gold)]/20 text-[var(--accent-gold)]",
  perdido: "bg-[var(--chart-negative)]/20 text-[var(--chart-negative)]",
  ganho: "bg-[var(--chart-positive)]/20 text-[var(--chart-positive)]",
  inativo: "bg-[var(--text-secondary)]/20 text-[var(--text-secondary)]"
};

function ClientCard({ client }: { client: Client }) {
  const statusStyle = statusStyles[client.status] ?? "";
  const tagItems = [client.tags.segmento, client.tags.tamanho, client.tags.origemLead].filter(Boolean);

  return (
    <Link
      to={`/project/${client.id}`}
      className="block rounded-xl border p-5 hover:bg-[var(--nav-hover)] transition-colors text-left"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-3 h-3 rounded-full shrink-0 mt-1.5"
          style={{ backgroundColor: client.color }}
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-[var(--text-primary)]">{client.name}</h3>
          {client.cnpjCpf && (
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{client.cnpjCpf}</p>
          )}
          <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle}`}>
            {statusLabels[client.status]}
          </span>
          {client.lastActivityLabel && (
            <p className="text-sm text-[var(--text-secondary)] mt-2">{client.lastActivityLabel}</p>
          )}
          {tagItems.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tagItems.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-md text-xs bg-[var(--bg-muted)] text-[var(--text-secondary)]"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function Project() {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPreset, setModalPreset] = useState<keyof typeof presets | null>(null);

  useEffect(() => {
    setClients(getClients());
  }, []);

  const refreshClients = () => setClients(getClients());

  const openModal = (presetKey?: keyof typeof presets) => {
    setModalPreset(presetKey ?? null);
    setModalOpen(true);
  };

  const handleCreateClient = (form: NewClientForm) => {
    addClient({
      name: form.name,
      cnpjCpf: form.cnpjCpf,
      contactName: form.contactName,
      phone: form.phone,
      email: form.email,
      status: form.status,
      tags: form.tags,
      color: form.color,
      materials: [],
      timeline: [],
      generalData: {},
      tasks: [],
      customFields: {},
      payments: []
    });
    refreshClients();
  };

  const filteredClients = search
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.contactName.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase())
      )
    : clients;
  const isEmpty = clients.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Clientes</h1>
        {!isEmpty && (
          <div className="flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente..."
              className="w-full sm:w-64 px-3 py-2 rounded-lg bg-[var(--input-bg)] outline-none text-[var(--text-primary)] placeholder:text-neutral-500"
              style={{ border: "1px solid var(--input-border)" }}
            />
            <button
              type="button"
              onClick={() => openModal()}
              className="px-3 py-2 rounded-lg bg-[var(--accent-green)] hover:opacity-90 text-white text-sm font-medium whitespace-nowrap"
            >
              + Novo cliente
            </button>
          </div>
        )}
      </div>

      {isEmpty ? (
        <div className="rounded-xl bg-[var(--bg-elevated)] border overflow-hidden" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="p-8 md:p-12 text-center max-w-xl mx-auto">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Nenhum cliente ainda</h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Crie um novo cliente (projeto) para começar e acompanhe todo o dossiê em um só lugar.
            </p>
            <p className="text-sm text-[var(--text-secondary)] mb-8">
              Cada cliente tem seu dossiê: contato, materiais, reuniões, tarefas e dados gerais.
            </p>

            <button
              type="button"
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--accent-green)] hover:opacity-90 text-white font-semibold shadow-lg"
            >
              <span className="text-lg leading-none">+</span>
              Criar meu primeiro cliente
            </button>

            <div className="mt-10 pt-8 border-t" style={{ borderColor: "var(--border-subtle)" }}>
              <p className="text-sm text-[var(--text-secondary)] mb-4">Ou comece por um tipo:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {projectTypeKeys.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => openModal(key)}
                    className="px-4 py-2.5 rounded-xl border bg-[var(--bg-muted)]/50 hover:bg-[var(--nav-hover)] text-[var(--text-primary)] text-sm font-medium transition-colors"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    {projectTypeLabels[key]}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-8">
              <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-green)] underline underline-offset-2">
                Ver como organizar meus clientes
              </a>
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-[var(--bg-elevated)] border overflow-hidden" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border-subtle)" }}>
            <span className="font-semibold text-[var(--text-primary)]">Lista de clientes</span>
            <button
              type="button"
              onClick={() => openModal()}
              className="px-3 py-1.5 rounded-lg bg-[var(--accent-green)] hover:opacity-90 text-white text-sm font-medium"
            >
              + Novo cliente
            </button>
          </div>
          <div className="p-4">
            {filteredClients.length === 0 ? (
              <div className="p-6 text-center text-[var(--text-secondary)]">
                Nenhum cliente encontrado para &quot;{search}&quot;.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClients.map((client) => (
                  <ClientCard key={client.id} client={client} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <NewClientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateClient}
        presetKey={modalPreset}
      />
    </div>
  );
}
