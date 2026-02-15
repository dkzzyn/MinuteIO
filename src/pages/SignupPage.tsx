import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";
import "./SignupPage.css";
import SignupPlansModal from "../components/modals/SignupPlansModal";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BENEFITS = [
  "Automação inteligente",
  "Relatórios em tempo real",
  "Integração com suas ferramentas favoritas",
  "Resumos de reuniões e CRM com IA"
];

function validateEmail(value: string): string | null {
  if (!value.trim()) return "Informe seu e-mail.";
  if (!EMAIL_RE.test(value.trim())) return "E-mail inválido.";
  return null;
}

/** Ícone seta direita para o botão Ver Planos */
function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className ?? "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plansModalOpen, setPlansModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const nameErr = !fullName.trim() ? "Informe seu nome completo." : null;
    const emailErr = validateEmail(email);
    const passwordErr = !password.trim()
      ? "Informe uma senha."
      : password.length < 6
        ? "A senha deve ter pelo menos 6 caracteres."
        : null;
    const confirmErr =
      password !== confirmPassword ? "As senhas não coincidem." : null;

    setErrors({
      fullName: nameErr,
      email: emailErr,
      password: passwordErr,
      confirmPassword: confirmErr
    });

    if (nameErr || emailErr || passwordErr || confirmErr) return;

    setLoading(true);
    new Promise<{ ok: boolean; error?: string }>((resolve) => {
      setTimeout(() => resolve({ ok: true }), 1000);
    })
      .then((res) => {
        if (res.ok) {
          navigate("/login", { replace: true });
          return;
        }
        setSubmitError(res.error ?? "Não foi possível criar a conta.");
      })
      .catch(() => {
        setSubmitError("Não foi possível conectar. Tente novamente.");
      })
      .finally(() => setLoading(false));
  }

  return (
    <main className="login-page min-h-screen flex flex-col lg:flex-row">
      <div className="login-cinematic-bg" aria-hidden>
        <div className="login-cinematic-grain" />
      </div>

      {/* Lado esquerdo: branding (igual à login) */}
      <section
        className="login-hero flex flex-col justify-center px-8 py-14 lg:px-14 lg:py-20 lg:w-1/2"
        aria-label="Apresentação MinuteIO"
      >
        <div className="max-w-lg mx-auto w-full lg:mx-0">
          <div className="mb-12">
            <img
              src="/logo-minuteio.png"
              alt="MinuteIO"
              className="h-9 w-auto object-contain object-left"
            />
          </div>

          <div className="mb-5">
            <p className="text-2xl sm:text-3xl lg:text-4xl text-white font-bold leading-tight">
              Transforme reuniões em
            </p>
            <p className="headline-green text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mt-1 text-[#22C55E]">
              Resultados reais
            </p>
          </div>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-10 max-w-md">
            A plataforma que grava, resume e organiza suas reuniões automaticamente, conectando tudo ao seu funil de vendas e créditos de IA.
          </p>

          <ul className="space-y-3">
            {BENEFITS.map((item) => (
              <li key={item} className="flex items-center gap-2 text-white">
                <span className="text-[#22C55E]" aria-hidden>✔</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Lado direito: card de cadastro com glassmorphism e borda degradê */}
      <section
        className="login-right flex flex-col items-center justify-center px-6 py-14 lg:px-14 lg:py-20 lg:w-1/2"
        aria-label="Criar conta"
      >
        <div className="signup-card login-card w-full max-w-[400px] p-8 sm:p-10">
          <h2 className="text-xl font-bold text-white text-center">
            Crie sua conta
          </h2>
          <p className="text-sm text-slate-400 text-center mt-1 mb-8">
            É rápido e leva menos de 1 minuto.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="signup-name" className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                Nome completo
              </label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setErrors((prev) => ({ ...prev, fullName: null }));
                  setSubmitError(null);
                }}
                placeholder="Seu nome"
                disabled={loading}
                className="login-input w-full px-4 py-3 rounded-lg focus:ring-0 transition-shadow"
                style={{ borderColor: errors.fullName ? "#f87171" : undefined }}
                aria-invalid={Boolean(errors.fullName)}
              />
              {errors.fullName && (
                <p className="text-sm text-red-400 mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: null }));
                  setSubmitError(null);
                }}
                onBlur={() => setErrors((prev) => ({ ...prev, email: validateEmail(email) }))}
                placeholder="seu@email.com"
                disabled={loading}
                className="login-input w-full px-4 py-3 rounded-lg focus:ring-0 transition-shadow"
                style={{ borderColor: errors.email ? "#f87171" : undefined }}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && (
                <p className="text-sm text-red-400 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: null, confirmPassword: null }));
                    setSubmitError(null);
                  }}
                  placeholder="Mínimo 6 caracteres"
                  disabled={loading}
                  className="login-input w-full px-4 py-3 pr-20 rounded-lg focus:ring-0 transition-shadow"
                  style={{ borderColor: errors.password ? "#f87171" : undefined }}
                  aria-invalid={Boolean(errors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="login-link-accent absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium hover:underline"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-400 mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="signup-confirm" className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                Confirmar senha
              </label>
              <div className="relative">
                <input
                  id="signup-confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, confirmPassword: null }));
                    setSubmitError(null);
                  }}
                  placeholder="Repita a senha"
                  disabled={loading}
                  className="login-input w-full px-4 py-3 pr-20 rounded-lg focus:ring-0 transition-shadow"
                  style={{ borderColor: errors.confirmPassword ? "#f87171" : undefined }}
                  aria-invalid={Boolean(errors.confirmPassword)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="login-link-accent absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium hover:underline"
                  aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showConfirmPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-400 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Seção de planos: texto + botão Ver Planos */}
            <div className="pt-1">
              <p className="text-xs text-slate-400 text-center mb-2">
                Escolha o plano ideal para você
              </p>
              <button
                type="button"
                onClick={() => setPlansModalOpen(true)}
                className="signup-btn-plans"
              >
                Ver Planos
                <IconArrowRight />
              </button>
            </div>

            {submitError && (
              <p className="text-sm text-red-400" role="alert">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="login-btn w-full py-3 rounded-lg text-white transition-all duration-200"
            >
              {loading ? "Criando conta..." : "Criar Conta"}
            </button>
          </form>

          <p className="text-sm text-slate-400 text-center mt-6">
            Já tem uma conta?{" "}
            <Link to="/login" className="login-link-accent font-semibold hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </section>

      <SignupPlansModal open={plansModalOpen} onClose={() => setPlansModalOpen(false)} />
    </main>
  );
}
