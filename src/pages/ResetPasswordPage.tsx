import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../services/authApi";
import { ApiError } from "../infrastructure/http/api";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!token.trim()) {
      setError("Link inválido. Solicite um novo e-mail de recuperação.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token.trim(), password);
      setDone(true);
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Não foi possível redefinir a senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg-primary)]">
      <div
        className="relative rounded-2xl border p-8 max-w-md w-full"
        style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)" }}
      >
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Nova senha</h1>
        {done ? (
          <p className="text-sm text-[var(--text-secondary)] mt-3">Senha atualizada. Redirecionando ao login…</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {!token && (
              <p className="text-sm text-[var(--chart-negative)]">Falta o token na URL. Use o link enviado ao e-mail.</p>
            )}
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">Nova senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] border text-[var(--text-primary)]"
                style={{ borderColor: "var(--input-border)" }}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">Confirmar senha</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] border text-[var(--text-primary)]"
                style={{ borderColor: "var(--input-border)" }}
                autoComplete="new-password"
              />
            </div>
            {error && <p className="text-sm text-[var(--chart-negative)]">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg bg-[var(--accent-green)] text-white font-medium text-sm disabled:opacity-60"
            >
              {loading ? "Salvando…" : "Definir senha"}
            </button>
          </form>
        )}
        <Link to="/login" className="inline-block mt-6 text-sm text-[var(--accent-green)] hover:underline">
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}
