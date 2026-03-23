/**
 * Clientes CRM — persistidos na API (PostgreSQL). Requer JWT.
 */
import type { Client, ClientPayment } from "../types/client";
import type { SupportMaterial } from "../types/supportMaterial";
import * as api from "../services/clientsApi";

const AUTH_STORAGE_KEY = "minuteio_auth_token";

function getToken(): string | null {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY);
  } catch {
    return null;
  }
}

export async function getClients(): Promise<Client[]> {
  const token = getToken();
  if (!token) return [];
  try {
    return await api.listClients(token);
  } catch {
    return [];
  }
}

export async function getClientById(id: string): Promise<Client | undefined> {
  const token = getToken();
  if (!token) return undefined;
  try {
    return await api.getClient(token, id);
  } catch {
    return undefined;
  }
}

export async function addClient(client: Omit<Client, "id">): Promise<Client> {
  const token = getToken();
  if (!token) throw new Error("Usuário não autenticado.");
  return api.createClient(token, client);
}

export async function updateClient(id: string, data: Partial<Client>): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("Usuário não autenticado.");
  await api.patchClient(token, id, data);
}

export async function addMaterial(
  clientId: string,
  material: Omit<import("../types/client").ClientMaterial, "id">
): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("Usuário não autenticado.");
  const c = await api.getClient(token, clientId);
  const id = `m-${Date.now()}`;
  const materials = [...(c.materials ?? []), { ...material, id }];
  await api.patchClient(token, clientId, { materials });
}

export async function addTimelineActivity(
  clientId: string,
  activity: Omit<import("../types/client").TimelineActivity, "id">
): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("Usuário não autenticado.");
  const c = await api.getClient(token, clientId);
  const id = `t-${Date.now()}`;
  const timeline = [{ ...activity, id }, ...(c.timeline ?? [])];
  await api.patchClient(token, clientId, { timeline });
}

export async function registerPayment(
  clientId: string,
  paymentId: string,
  data: { paidDate: string; paymentMethod: ClientPayment["paymentMethod"]; notes?: string }
): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("Usuário não autenticado.");
  const c = await api.getClient(token, clientId);
  const payments = c.payments.map((p) => {
    if (p.id !== paymentId) return p;
    return {
      ...p,
      status: "pago" as const,
      paidDate: data.paidDate,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      history: [...p.history, { date: data.paidDate, action: "paga" as const }],
    };
  });
  await api.patchClient(token, clientId, { payments });
}

export async function addPayment(
  clientId: string,
  data: Omit<ClientPayment, "id" | "history">
): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("Usuário não autenticado.");
  const c = await api.getClient(token, clientId);
  const id = `pay-${Date.now()}`;
  const status = data.status ?? "em_aberto";
  const payments = [
    ...c.payments,
    {
      ...data,
      id,
      status,
      history: [{ date: new Date().toISOString(), action: "criada" as const }],
    },
  ];
  await api.patchClient(token, clientId, { payments });
}

export async function addSupportMaterial(
  clientId: string,
  material: Omit<SupportMaterial, "id" | "clientId" | "uploadedAt" | "uploadedByUserId">
): Promise<SupportMaterial> {
  const token = getToken();
  if (!token) throw new Error("Usuário não autenticado.");
  const c = await api.getClient(token, clientId);
  const id = `sm-${Date.now()}`;
  const now = new Date().toISOString();
  const newMaterial: SupportMaterial = {
    ...material,
    id,
    clientId,
    uploadedAt: now,
    uploadedByUserId: "me",
  };
  const supportMaterials = [...(c.supportMaterials ?? []), newMaterial];
  await api.patchClient(token, clientId, { supportMaterials });
  return newMaterial;
}
