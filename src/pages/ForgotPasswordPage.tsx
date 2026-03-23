import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authApi";
import { ApiError } from "../infrastructure/http/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const em = email.trim();
    if (!em) {
      setError("Informe seu e-mail.");
      return;
    }
    if (!EMAIL_RE.test(em)) {
      setError("E-mail inválido.");
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(em);
      setSent(true);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Não foi possível enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg-primary)]">
      <div
        className="absolute inset-0 bg-gradient-to-br from-[var(--bg-muted)]/30 via-[var(--bg-primary)] to-[var(--bg-muted)]/20 pointer-events-none"
        aria-hidden
      />
      <div
        className="relative rounded-2xl border p-8 max-w-md w-full text-center"
        style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)" }}
      >
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Esqueceu sua senha?</h1>
        {sent ? (
          <p className="text-sm text-[var(--text-secondary)] mt-3">
            Se existir uma conta com esse e-mail, enviaremos instruções. Em desenvolvimento, o link também aparece no
            console do servidor.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 text-left space-y-4">
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] border text-[var(--text-primary)]"
                style={{ borderColor: "var(--input-border)" }}
                autoComplete="email"
              />
            </div>
            {error && <p className="text-sm text-[var(--chart-negative)]">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg bg-[var(--accent-green)] text-white font-medium text-sm disabled:opacity-60"
            >
              {loading ? "Enviando…" : "Enviar link de redefinição"}
            </button>
          </form>
        )}
        <Link
          to="/login"
          className="inline-block mt-6 px-4 py-2 rounded-lg bg-[var(--accent-green)] hover:opacity-90 text-white font-medium text-sm"
        >
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}
