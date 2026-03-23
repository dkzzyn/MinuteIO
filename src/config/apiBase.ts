/**
 * URL base do backend Minute.IO **sem** sufixo `/api`.
 *
 * - **Dev sem `VITE_OLLAMA_API_URL`:** string vazia → o front usa URLs relativas `/api/...`
 *   e o Vite faz proxy para `http://localhost:3001` (evita CORS).
 * - **Com `VITE_OLLAMA_API_URL`:** usa esse valor; remove `/` final e um eventual `/api` duplicado.
 */
export function getApiBaseUrl(): string {
  const raw = (import.meta.env.VITE_OLLAMA_API_URL as string | undefined)?.trim();
  if (raw) {
    let u = raw.replace(/\/+$/, "");
    if (/\/api$/i.test(u)) u = u.slice(0, -4);
    return u;
  }
  if (import.meta.env.DEV) return "";
  return "http://localhost:3001";
}

/** Monta URL completa para um path que começa com `/` (ex.: `/api/catalog`). */
export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/** Texto para mostrar na UI (catálogo de APIs, etc.). */
export function getApiBaseLabel(): string {
  const b = getApiBaseUrl();
  if (b) return b;
  if (import.meta.env.DEV) return `${typeof window !== "undefined" ? window.location.origin : ""} (proxy Vite → :3001)`;
  return "http://localhost:3001";
}
