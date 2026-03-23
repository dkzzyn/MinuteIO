/** Client-side JWT exp check (UX only; server still validates). */
export function isJwtExpired(token: string, skewMs = 60_000): boolean {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return true;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payload = JSON.parse(atob(padded)) as { exp?: number };
    if (typeof payload.exp !== "number") return false;
    return payload.exp * 1000 < Date.now() + skewMs;
  } catch {
    return true;
  }
}

export const SESSION_EXPIRED_EVENT = "minuteio:session-expired";
export const REL_LOGIN_MESSAGE_KEY = "minuteio_relogin_reason";
