import { FormEvent, useEffect, useState } from "react";
import type { UserProfile } from "../../services/profileApi";
import {
  acceptInvite,
  createTeam,
  inviteToTeam,
  listMyInvites,
  listTeams,
  rejectInvite,
  type TeamInviteItem,
  type TeamItem,
} from "../../services/teamsApi";

type Props = {
  profile: UserProfile;
  onError: (message: string) => void;
};

export default function TimeTab({ profile, onError }: Props) {
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [invites, setInvites] = useState<TeamInviteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<TeamItem | null>(null);

  const isSupervisor = profile.role.toLowerCase() === "supervisor";
  const isAdmin = profile.role.toLowerCase() === "admin";
  const canManageTeams = isSupervisor || isAdmin;

  async function loadData() {
    try {
      setLoading(true);
      const [myTeams, myInvites] = await Promise.all([listTeams(), listMyInvites()]);
      setTeams(myTeams);
      setInvites(myInvites);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Erro ao carregar dados de time.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateTeam(e: FormEvent) {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    try {
      setSaving(true);
      const created = await createTeam(newTeamName.trim());
      setTeams((prev) => [created, ...prev]);
      setNewTeamName("");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Erro ao criar time.");
    } finally {
      setSaving(false);
    }
  }

  async function handleInvite(e: FormEvent) {
    e.preventDefault();
    if (!selectedTeam || !inviteEmail.trim()) return;
    try {
      setSaving(true);
      await inviteToTeam(selectedTeam.id, inviteEmail.trim());
      setInviteEmail("");
      setSelectedTeam(null);
      await loadData();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Erro ao enviar convite.");
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
      onError(err instanceof Error ? err.message : "Erro ao aceitar convite.");
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
      onError(err instanceof Error ? err.message : "Erro ao recusar convite.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-sm text-slate-300">Carregando dados de time...</div>;

  return (
    <section className="space-y-4">
      {canManageTeams && (
        <form onSubmit={handleCreateTeam} className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
          <h2 className="text-lg font-medium mb-3">Criar time</h2>
          <div className="flex gap-2">
            <input
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Nome do time"
              className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 disabled:opacity-50"
              disabled={saving || !newTeamName.trim()}
            >
              Criar
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
        <h2 className="text-lg font-medium mb-3">{canManageTeams ? "Times que você gerencia" : "Seus times"}</h2>
        {teams.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum time encontrado.</p>
        ) : (
          <ul className="space-y-2">
            {teams.map((team) => (
              <li key={team.id} className="rounded-md border border-slate-700 bg-slate-950 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{team.name}</p>
                    <p className="text-xs text-slate-500">Criado em {new Date(team.createdAt).toLocaleString("pt-BR")}</p>
                  </div>
                  {canManageTeams && (
                    <button
                      type="button"
                      onClick={() => setSelectedTeam(team)}
                      className="rounded-md bg-blue-500 px-3 py-1.5 text-sm font-medium text-slate-950"
                    >
                      Convidar membro
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
        <h2 className="text-lg font-medium mb-3">Convites pendentes</h2>
        {invites.filter((x) => x.status === "pending").length === 0 ? (
          <p className="text-sm text-slate-400">Você não possui convites pendentes.</p>
        ) : (
          <ul className="space-y-2">
            {invites
              .filter((invite) => invite.status === "pending")
              .map((invite) => (
                <li key={invite.id} className="rounded-md border border-slate-700 bg-slate-950 p-3">
                  <p className="text-sm">
                    Time: <strong>{invite.team?.name ?? invite.teamId}</strong>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Convidado por {invite.invitedBy?.name ?? invite.invitedById}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAccept(invite.id)}
                      disabled={saving}
                      className="rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium text-slate-950"
                    >
                      Aceitar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(invite.id)}
                      disabled={saving}
                      className="rounded-md bg-red-500 px-3 py-1.5 text-sm font-medium text-slate-950"
                    >
                      Recusar
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>

      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-4">
            <h3 className="text-lg font-medium">Convidar para "{selectedTeam.name}"</h3>
            <form onSubmit={handleInvite} className="mt-4 space-y-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@empresa.com"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTeam(null);
                    setInviteEmail("");
                  }}
                  className="rounded-md bg-slate-700 px-3 py-1.5 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !inviteEmail.trim()}
                  className="rounded-md bg-blue-500 px-3 py-1.5 text-sm font-medium text-slate-950 disabled:opacity-50"
                >
                  Enviar convite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
