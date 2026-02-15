import { Link } from "react-router-dom";

/** Placeholder para recuperação de senha; evoluir com formulário de e-mail. */
export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg-primary)]">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-muted)]/30 via-[var(--bg-primary)] to-[var(--bg-muted)]/20 pointer-events-none" aria-hidden />
      <div className="relative rounded-2xl border p-8 max-w-md w-full text-center" style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)" }}>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Esqueceu sua senha?</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-2">
          Em breve você poderá solicitar a redefinição por e-mail.
        </p>
        <Link to="/login" className="inline-block mt-6 px-4 py-2 rounded-lg bg-[var(--accent-green)] hover:opacity-90 text-white font-medium text-sm">
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}
