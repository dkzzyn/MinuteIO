import { FormEvent, useEffect, useState } from "react";
import { ApiError } from "../infrastructure/http/api";
import {
  acceptInvite,
  createTeam,
  inviteToTeam,
  listMyInvites,
  listTeams,
  rejectInvite,
  type TeamInviteItem,
  type TeamItem,
} from "../services/teamsApi";

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [invites, setInvites] = useState<TeamInviteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamItem | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadData() {
    try {
      setError(null);
      const [t, i] = await Promise.all([listTeams(), listMyInvites()]);
      setTeams(t);
      setInvites(i);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao carregar times.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateTeam(e: FormEvent) {
    e.preventDefault();
    const name = newTeamName.trim();
    if (!name) return;
    try {
      setSaving(true);
      const created = await createTeam(name);
      setTeams((prev) => [created, ...prev]);
      setNewTeamName("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao criar time.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleInviteSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedTeam) return;
    const email = inviteEmail.trim();
    if (!email) return;

    try {
      setSaving(true);
      await inviteToTeam(selectedTeam.id, email);
      setInviteEmail("");
      setOpenInviteModal(false);
      await loadData();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Erro ao enviar convite.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleAccept(inviteId: string) {
    try {
      setSaving(true);
      await acceptInvite(inviteId);
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao aceitar convite.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleReject(inviteId: string) {
    try {
      setSaving(true);
      await rejectInvite(inviteId);
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao recusar convite.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div>Carregando times...</div>;

  return (
    <section className="max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Times</h1>
        <p className="text-sm text-slate-400 mt-1">
          Crie times e convide pessoas por e-mail.
        </p>
      </header>

      {error && (
        <div className="fixed right-4 top-4 z-[60] w-full max-w-md rounded-lg border border-red-500/50 bg-slate-900 px-4 py-3 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-red-300">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
              aria-label="Fechar aviso"
            >
              X
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleCreateTeam} className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
        <label htmlFor="team-name" className="block text-sm mb-2">
          Criar novo time
        </label>
        <div className="flex gap-2">
          <input
            id="team-name"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="Nome do time"
            className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={saving || !newTeamName.trim()}
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-50"
          >
            Criar
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
        <h2 className="text-lg font-medium mb-3">Meus times</h2>
        {teams.length === 0 ? (
          <p className="text-sm text-slate-400">Você ainda não possui times.</p>
        ) : (
          <ul className="space-y-2">
            {teams.map((team) => (
              <li key={team.id} className="rounded-md border border-slate-700 bg-slate-950 p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{team.name}</p>
                  <p className="text-xs text-slate-500">Criado em {new Date(team.createdAt).toLocaleString("pt-BR")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTeam(team);
                    setOpenInviteModal(true);
                  }}
                  className="rounded-md bg-blue-500 px-3 py-1.5 text-sm font-medium text-slate-950"
                >
                  Convidar por e-mail
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
        <h2 className="text-lg font-medium mb-3">Meus convites</h2>
        {invites.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum convite recebido.</p>
        ) : (
          <ul className="space-y-2">
            {invites.map((invite) => (
              <li key={invite.id} className="rounded-md border border-slate-700 bg-slate-950 p-3">
                <p className="text-sm">
                  Time: <strong>{invite.team?.name ?? invite.teamId}</strong>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Convidado por {invite.invitedBy?.name ?? invite.invitedById} • status: {invite.status}
                </p>
                {invite.status === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAccept(invite.id)}
                      className="rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium text-slate-950"
                      disabled={saving}
                    >
                      Aceitar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(invite.id)}
                      className="rounded-md bg-red-500 px-3 py-1.5 text-sm font-medium text-slate-950"
                      disabled={saving}
                    >
                      Recusar
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {openInviteModal && selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-4">
            <h3 className="text-lg font-medium">Convidar para "{selectedTeam.name}"</h3>
            <form onSubmit={handleInviteSubmit} className="mt-4 space-y-3">
              <div>
                <label htmlFor="invite-email" className="block text-sm mb-1">
                  E-mail do colaborador
                </label>
                <input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colaborador@empresa.com"
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpenInviteModal(false);
                    setInviteEmail("");
                    setSelectedTeam(null);
                  }}
                  className="rounded-md bg-slate-700 px-3 py-1.5 text-sm"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-500 px-3 py-1.5 text-sm font-medium text-slate-950 disabled:opacity-50"
                  disabled={saving || !inviteEmail.trim()}
                >
                  {saving ? "Enviando..." : "Enviar convite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
