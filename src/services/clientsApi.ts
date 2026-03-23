import { apiRequest } from "../infrastructure/http/api";
import type { Client } from "../types/client";

export function listClients(token: string): Promise<Client[]> {
  return apiRequest<Client[]>("/api/clients", { token });
}

export function getClient(token: string, id: string): Promise<Client> {
  return apiRequest<Client>(`/api/clients/${id}`, { token });
}

export function createClient(token: string, body: Omit<Client, "id">): Promise<Client> {
  return apiRequest<Client>("/api/clients", { method: "POST", token, body: body as Record<string, unknown> });
}

export function patchClient(token: string, id: string, patch: Partial<Client>): Promise<Client> {
  return apiRequest<Client>(`/api/clients/${id}`, {
    method: "PATCH",
    token,
    body: patch as Record<string, unknown>,
  });
}

export function deleteClient(token: string, id: string): Promise<void> {
  return apiRequest<void>(`/api/clients/${id}`, { method: "DELETE", token });
}
