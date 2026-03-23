import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import {
  isJwtExpired,
  REL_LOGIN_MESSAGE_KEY,
  SESSION_EXPIRED_EVENT,
} from "../auth/jwtExpiry";

const STORAGE_KEY = "minuteio_auth_token";
const REFRESH_STORAGE_KEY = "minuteio_refresh_token";

type AuthContextValue = {
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken?: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function readRefresh(): string | null {
  try {
    return localStorage.getItem(REFRESH_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => readToken());
  const [refreshToken, setRefreshTokenState] = useState<string | null>(() => readRefresh());

  useEffect(() => {
    const stored = readToken();
    if (stored !== token) setTokenState(stored);
  }, []);

  /** Drop expired JWT on load so ProtectedRoute sends user to login. */
  useEffect(() => {
    const t = readToken();
    if (!t || !isJwtExpired(t)) return;
    try {
      sessionStorage.setItem(REL_LOGIN_MESSAGE_KEY, "Sessão expirada. Faça login novamente.");
    } catch {
      /* ignore */
    }
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(REFRESH_STORAGE_KEY);
    setTokenState(null);
    setRefreshTokenState(null);
  }, []);

  /** Any API 401 with Bearer → clear session. */
  useEffect(() => {
    const onExpired = () => {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(REFRESH_STORAGE_KEY);
      setTokenState(null);
      setRefreshTokenState(null);
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const login = useCallback((accessToken: string, rt?: string | null) => {
    localStorage.setItem(STORAGE_KEY, accessToken);
    setTokenState(accessToken);
    if (rt) {
      localStorage.setItem(REFRESH_STORAGE_KEY, rt);
      setRefreshTokenState(rt);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(REFRESH_STORAGE_KEY);
    setTokenState(null);
    setRefreshTokenState(null);
  }, []);

  const value: AuthContextValue = {
    token,
    refreshToken,
    isAuthenticated: Boolean(token),
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
