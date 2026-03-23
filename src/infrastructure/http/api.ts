import { REL_LOGIN_MESSAGE_KEY, SESSION_EXPIRED_EVENT } from "../../auth/jwtExpiry";
import { apiUrl, getApiBaseLabel } from "../../config/apiBase";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;
  const url = apiUrl(path);

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: {
        ...(body != null ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body != null ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new ApiError(
      `Sem ligação ao servidor (${reason}). Arranca o backend: cd server && npm run dev. ` +
        `Na raiz podes usar npm run dev:all. URL tentada: ${url} · ${getApiBaseLabel()}`,
      0
    );
  }

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    let message = text || "Erro na requisição.";
    try {
      const parsed = JSON.parse(text) as { error?: string };
      if (parsed.error) message = parsed.error;
    } catch {
      const cannot = text.match(/Cannot\s+GET\s+[^\s<]+/i);
      if (cannot) message = cannot[0];
    }
    if (res.status === 401 && token) {
      try {
        sessionStorage.setItem(
          REL_LOGIN_MESSAGE_KEY,
          message.includes("expirad") || message.includes("inválido")
            ? "Sessão expirada ou token inválido. Faça login novamente."
            : message
        );
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      } catch {
        // ignore storage in private mode
      }
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text().catch(() => "");
  const trimmed = text.trim();
  if (!trimmed) {
    throw new ApiError("Resposta vazia do servidor.", res.status);
  }
  if (trimmed.startsWith("<") || trimmed.startsWith("<!")) {
    throw new ApiError(
      "O servidor devolveu HTML em vez de JSON (proxy desligado ou rota errada). " +
        "Reinicia o Vite e confirma que o Express está na porta 3001.",
      res.status
    );
  }
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    throw new ApiError(
      `Resposta inválida (não é JSON). Início: ${trimmed.slice(0, 100)}…`,
      res.status
    );
  }
}
