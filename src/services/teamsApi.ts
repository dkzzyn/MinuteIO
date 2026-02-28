import { apiRequest } from "../infrastructure/http/api";

const AUTH_STORAGE_KEY = "minuteio_auth_token";

function getToken(): string {
  const token = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!token) throw new Error("Usuário não autenticado.");
  return token;
}

export interface TeamItem {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamInviteItem {
  id: string;
  teamId: string;
  invitedUserId: string;
  invitedById: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
  team?: TeamItem;
  invitedBy?: { id: string; name: string; email: string };
}

export function listTeams(): Promise<TeamItem[]> {
  return apiRequest<TeamItem[]>("/api/teams", { token: getToken() });
}

export function createTeam(name: string): Promise<TeamItem> {
  return apiRequest<TeamItem>("/api/teams", {
    method: "POST",
    token: getToken(),
    body: { name },
  });
}

export function inviteToTeam(teamId: string, email: string): Promise<TeamInviteItem> {
  return apiRequest<TeamInviteItem>(`/api/teams/${teamId}/invites`, {
    method: "POST",
    token: getToken(),
    body: { email },
  });
}

export function listMyInvites(): Promise<TeamInviteItem[]> {
  return apiRequest<TeamInviteItem[]>("/api/invites/me", {
    token: getToken(),
  });
}

export function acceptInvite(inviteId: string): Promise<TeamInviteItem> {
  return apiRequest<TeamInviteItem>(`/api/invites/${inviteId}/accept`, {
    method: "PUT",
    token: getToken(),
  });
}

export function rejectInvite(inviteId: string): Promise<TeamInviteItem> {
  return apiRequest<TeamInviteItem>(`/api/invites/${inviteId}/reject`, {
    method: "PUT",
    token: getToken(),
  });
}
