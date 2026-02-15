import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getClientById, addSupportMaterial } from "../data/clientsStore";
import { getMeetingsHistory } from "../services/reportsService";
import type { Client, ClientMaterial, MaterialCategory } from "../types/client";
import { SUPPORT_MATERIAL_TYPE_LABELS, MATERIAL_FUNNEL_STAGE_LABELS } from "../types/supportMaterial";
import ClientPaymentsTab from "../components/client/ClientPaymentsTab";
import AddSupportMaterialModal from "../components/modals/AddSupportMaterialModal";

const statusLabels: Record<Client["status"], string> = {
  ativo: "Ativo",
  em_negociacao: "Em negociação",
  perdido: "Perdido",
  ganho: "Ganho",
  inativo: "Inativo"
};

const funnelLabels: Record<string, string> = {
  prospeccao: "Prospecção",
  qualificacao: "Qualificação",
  proposta: "Proposta",
  negociacao: "Negociação",
  fechamento: "Fechamento"
};

const materialCategoryLabels: Record<MaterialCategory, string> = {
  "pre-venda": "Pré-venda",
  proposta: "Proposta",
  "pos-venda": "Pós-venda"
};

const materialTypeLabels: Record<ClientMaterial["type"], string> = {
  pdf: "PDF",
  ppt: "Apresentação",
  link: "Link",
  doc: "Documento"
};

const activityTypeLabels: Record<string, string> = {
  reuniao: "Reunião",
  nota: "Nota",
  ligacao: "Ligação",
  email: "E-mail",
  documento: "Documento",
  outro: "Outro"
};

type TabKey = "resumo" | "materiais" | "pagamentos";

const tabLabels: Record<TabKey, string> = {
  resumo: "Resumo",
  materiais: "Materiais de apoio",
  pagamentos: "Pagamentos"
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-[var(--bg-elevated)] border overflow-hidden" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="p-4 border-b font-semibold text-[var(--text-primary)]" style={{ borderColor: "var(--border-subtle)" }}>
        {title}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("resumo");
  const [addMaterialModalOpen, setAddMaterialModalOpen] = useState(false);
  const [clientMeetings, setClientMeetings] = useState<{ id: string; title: string; date: string }[]>([]);

  useEffect(() => {
    if (!id) return;
    setClient(getClientById(id) ?? null);
  }, [id]);

  useEffect(() => {
    if (!client) return;
    getMeetingsHistory().then((list) => {
      const forClient = list.filter((m) => m.clientName === client.name);
      setClientMeetings(forClient.map((m) => ({ id: m.id, title: m.title, date: m.date })));
    });
  }, [client?.id, client?.name]);

  const refreshClient = () => {
    if (id) setClient(getClientById(id) ?? null);
  };

  if (!id) return <div className="text-[var(--text-secondary)]">ID não informado.</div>;
  if (!client) return <div className="text-[var(--text-secondary)]">Cliente não encontrado.</div>;

  const supportMaterials = client.supportMaterials ?? [];
  const hasMaterials = client.materials.length > 0 || supportMaterials.length > 0;
  const g = client.generalData;

  return (
    <div className="space-y-6 pb-8">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--text-secondary)]">
        <Link to="/project" className="hover:text-[var(--text-primary)]">Clientes</Link>
        <span aria-hidden>/</span>
        <span className="text-[var(--text-primary)]">{client.name}</span>
      </div>

      {/* Cabeçalho do cliente */}
      <header className="rounded-xl bg-[var(--bg-elevated)] border p-5 md:p-6" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: client.color }} />
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">{client.name}</h1>
            </div>
            {client.cnpjCpf && <p className="text-sm text-[var(--text-secondary)] mt-0.5">{client.cnpjCpf}</p>}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--text-secondary)]">
              <span><strong className="text-[var(--text-primary)]">Contato:</strong> {client.contactName}</span>
              {client.phone && <span>Tel: {client.phone}</span>}
              <span>E-mail: {client.email}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {client.funnelStage && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--bg-muted)] text-[var(--text-primary)]">
                  {funnelLabels[client.funnelStage]}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--bg-muted)] text-[var(--text-secondary)]">
                {statusLabels[client.status]}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/meetings/new"
              className="px-4 py-2 rounded-lg bg-[var(--accent-green)] hover:opacity-90 text-white font-medium text-sm"
            >
              Nova reunião
            </Link>
            <button
              type="button"
              onClick={() => setAddMaterialModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--nav-hover)] text-[var(--text-primary)] font-medium text-sm"
            >
              Adicionar documento
            </button>
          </div>
        </div>
      </header>

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
          <Section title="Linha do tempo / Atividades">
            {client.timeline.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">Nenhuma atividade registrada.</p>
            ) : (
              <ul className="space-y-3">
                {client.timeline.map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <span className="text-xs text-[var(--text-secondary)] shrink-0 w-20">
                      {new Date(a.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                    </span>
                    <div>
                      <span className="text-xs font-medium text-[var(--text-secondary)]">{activityTypeLabels[a.type] ?? a.type}</span>
                      <p className="font-medium text-[var(--text-primary)]">{a.title}</p>
                      {a.description && <p className="text-sm text-[var(--text-secondary)]">{a.description}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Dados gerais do cliente">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {g.endereco && <><dt className="text-[var(--text-secondary)]">Endereço</dt><dd className="text-[var(--text-primary)]">{g.endereco}</dd></>}
              {g.tamanhoEmpresa && <><dt className="text-[var(--text-secondary)]">Tamanho da empresa</dt><dd className="text-[var(--text-primary)]">{g.tamanhoEmpresa}</dd></>}
              {g.areaAtuacao && <><dt className="text-[var(--text-secondary)]">Área de atuação</dt><dd className="text-[var(--text-primary)]">{g.areaAtuacao}</dd></>}
              {g.ticketMedio && <><dt className="text-[var(--text-secondary)]">Ticket médio</dt><dd className="text-[var(--text-primary)]">{g.ticketMedio}</dd></>}
              {g.responsaveisInternos && g.responsaveisInternos.length > 0 && (
                <>
                  <dt className="text-[var(--text-secondary)]">Responsáveis internos</dt>
                  <dd className="text-[var(--text-primary)]">{g.responsaveisInternos.join(", ")}</dd>
                </>
              )}
            </dl>
            {!g.endereco && !g.tamanhoEmpresa && !g.areaAtuacao && !g.ticketMedio && (!g.responsaveisInternos || g.responsaveisInternos.length === 0) && (
              <p className="text-sm text-[var(--text-secondary)]">Nenhum dado cadastrado. Edite o cliente para preencher.</p>
            )}
          </Section>

          <Section title="Tarefas relacionadas ao cliente">
            {client.tasks.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">Nenhuma tarefa.</p>
            ) : (
              <ul className="space-y-2">
                {client.tasks.map((t) => (
                  <li key={t.id} className="flex items-center gap-2">
                    <input type="checkbox" checked={t.done} readOnly className="rounded" />
                    <span className={t.done ? "line-through text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}>{t.title}</span>
                    {t.dueDate && <span className="text-xs text-[var(--text-secondary)]">{new Date(t.dueDate).toLocaleDateString("pt-BR")}</span>}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {Object.keys(client.customFields).length > 0 && (
            <Section title="Campos personalizados">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {Object.entries(client.customFields).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-[var(--text-secondary)]">{key.replace(/_/g, " ")}</dt>
                    <dd className="text-[var(--text-primary)]">{value}</dd>
                  </div>
                ))}
              </dl>
            </Section>
          )}
        </div>
      )}

      {/* Tab: Materiais de apoio */}
      {activeTab === "materiais" && (
        <Section title="Materiais de apoio para reuniões">
          {!hasMaterials ? (
            <div className="text-center py-8">
              <h3 className="font-semibold text-[var(--text-primary)] mb-1">Nenhum material cadastrado ainda</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Adicione apresentações, propostas e anotações para usar nas próximas reuniões com este cliente.
              </p>
              <button
                type="button"
                onClick={() => setAddMaterialModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-[var(--accent-green)] hover:opacity-90 text-white font-medium text-sm"
              >
                Adicionar primeiro material
              </button>
            </div>
          ) : (
            <ul className="space-y-2">
              {supportMaterials.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--bg-muted)]/50"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <div>
                    <span className="font-medium text-[var(--text-primary)]">{m.title}</span>
                    <span className="text-xs text-[var(--text-secondary)] ml-2">
                      {SUPPORT_MATERIAL_TYPE_LABELS[m.materialType]} · {MATERIAL_FUNNEL_STAGE_LABELS[m.funnelStage]} · {new Date(m.uploadedAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--accent-green)] hover:underline">Abrir</a>
                </li>
              ))}
              {client.materials.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--bg-muted)]/50"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <div>
                    <span className="font-medium text-[var(--text-primary)]">{m.name}</span>
                    <span className="text-xs text-[var(--text-secondary)] ml-2">
                      {materialTypeLabels[m.type]} · {materialCategoryLabels[m.category]} · {new Date(m.date).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  {m.url && <a href={m.url} className="text-sm text-[var(--accent-green)] hover:underline">Abrir</a>}
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {/* Tab: Pagamentos */}
      {activeTab === "pagamentos" && (
        <ClientPaymentsTab client={client} onRefresh={refreshClient} />
      )}

      <AddSupportMaterialModal
        open={addMaterialModalOpen}
        onClose={() => setAddMaterialModalOpen(false)}
        clientId={client.id}
        clientName={client.name}
        clientMeetings={clientMeetings}
        onSuccess={(payload) => {
          addSupportMaterial(client.id, payload);
          refreshClient();
        }}
      />
    </div>
  );
}
