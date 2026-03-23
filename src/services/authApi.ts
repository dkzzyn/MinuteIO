import { apiRequest } from "../infrastructure/http/api";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterOutput {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface RefreshOutput {
  token: string;
  refreshToken: string;
}

export function registerUser(input: RegisterInput): Promise<RegisterOutput> {
  return apiRequest<RegisterOutput>("/api/auth/register", {
    method: "POST",
    body: input,
  });
}

export function loginUser(input: LoginInput): Promise<LoginOutput> {
  return apiRequest<LoginOutput>("/api/auth/login", {
    method: "POST",
    body: input,
  });
}

export function refreshSession(refreshToken: string): Promise<RefreshOutput> {
  return apiRequest<RefreshOutput>("/api/auth/refresh", {
    method: "POST",
    body: { refreshToken },
  });
}

export function logoutWithRefresh(refreshToken: string | null): Promise<void> {
  if (!refreshToken) return Promise.resolve();
  return apiRequest<void>("/api/auth/logout", {
    method: "POST",
    body: { refreshToken },
  });
}

export function forgotPassword(email: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>("/api/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export function resetPassword(token: string, newPassword: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>("/api/auth/reset-password", {
    method: "POST",
    body: { token, newPassword },
  });
}
