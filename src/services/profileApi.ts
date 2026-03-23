import { apiRequest } from "../infrastructure/http/api";

const AUTH_STORAGE_KEY = "minuteio_auth_token";

function getToken(): string {
  const token = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!token) throw new Error("Usuário não autenticado.");
  return token;
}

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  isActive: boolean;
  preferences?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export function getMyProfile(): Promise<UserProfile> {
  return apiRequest<UserProfile>("/api/me", { token: getToken() });
}

export function updateMyProfile(input: {
  name?: string;
  avatarUrl?: string | null;
  preferences?: Record<string, unknown>;
}): Promise<UserProfile> {
  return apiRequest<UserProfile>("/api/me", {
    method: "PUT",
    token: getToken(),
    body: input,
  });
}

export function getMyPreferences(): Promise<Record<string, unknown>> {
  return apiRequest<{ preferences: Record<string, unknown> }>("/api/me/preferences", { token: getToken() }).then(
    (r) => r.preferences ?? {}
  );
}

export function mergeMyPreferences(partial: Record<string, unknown>): Promise<Record<string, unknown>> {
  return apiRequest<{ preferences: Record<string, unknown> }>("/api/me/preferences", {
    method: "PUT",
    token: getToken(),
    body: { preferences: partial },
  }).then((r) => r.preferences ?? {});
}
