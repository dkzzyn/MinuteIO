import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(value: string): string | null {
  if (!value.trim()) return "Informe seu e-mail.";
  if (!EMAIL_RE.test(value.trim())) return "E-mail inválido.";
  return null;
}

const METRICS = [
  { value: "40%", description: "Mais oportunidades avançando no funil" },
  { value: "2.1x", description: "Mais velocidade no follow-up" },
  { value: "85%", description: "Clientes mais satisfeitos com o atendimento" }
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    const emailErr = validateEmail(email);
    setEmailError(emailErr ?? null);
    if (emailErr) return;
    if (!password.trim()) {
      setSubmitError("Informe sua senha.");
      return;
    }

    setLoading(true);
    const simulateLogin = () =>
      new Promise<{ ok: boolean; error?: string }>((resolve) => {
        setTimeout(() => {
          if (password === "123456") resolve({ ok: true });
          else resolve({ ok: false, error: "E-mail ou senha incorretos." });
        }, 800);
      });

    simulateLogin()
      .then((res) => {
        if (res.ok) {
          login("demo-token");
          navigate("/", { replace: true });
          return;
        }
        setSubmitError(res.error ?? "E-mail ou senha incorretos.");
      })
      .catch(() => {
        setSubmitError("Não foi possível conectar. Verifique sua internet e tente novamente.");
      })
      .finally(() => setLoading(false));
  }

  return (
    <main className="login-page min-h-screen flex flex-col lg:flex-row">
      {/* Background cinematográfico premium (fixo, atrás de todo o conteúdo) */}
      <div className="login-cinematic-bg" aria-hidden>
        <div className="login-cinematic-grain" />
      </div>

      {/* Lado esquerdo: Hero */}
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
            <span className="block text-sm text-slate-400 mt-1.5">
              Inteligência Comercial em Reuniões
            </span>
          </div>

          <div className="mb-5">
            <p className="text-2xl sm:text-3xl lg:text-4xl text-white font-bold leading-tight">
              Transforme reuniões em
            </p>
            <p className="headline-green text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mt-1 text-[#22C55E]">
              Resultados reais
            </p>
          </div>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-12 max-w-md">
            A plataforma que grava, resume e organiza suas reuniões automaticamente, conectando tudo ao seu funil de vendas.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {METRICS.map((m) => (
              <div key={m.value} className="metric-card p-5">
                <span className="block h-0.5 w-10 rounded-full bg-[#22C55E] mb-3" aria-hidden />
                <span className="block text-2xl font-bold text-white">{m.value}</span>
                <p className="text-sm text-slate-300 mt-2 leading-snug">{m.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lado direito: Card de login */}
      <section
        className="login-right flex flex-col items-center justify-center px-6 py-14 lg:px-14 lg:py-20 lg:w-1/2"
        aria-label="Login"
      >
        <div className="login-card w-full max-w-[400px] p-8 sm:p-10">
          <h1 className="text-xl font-bold text-white text-center">
            Bem-vindo de volta
          </h1>
          <p className="text-sm text-slate-400 text-center mt-1 mb-8">
            Acesse seu painel de reuniões, CRM e créditos de IA.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                Email corporativo
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(null);
                  setSubmitError(null);
                }}
                onBlur={() => setEmailError(validateEmail(email))}
                placeholder="seu.nome@empresa.com"
                disabled={loading}
                className="login-input w-full px-4 py-3 rounded-lg focus:ring-0 transition-shadow"
                style={{ borderColor: emailError ? "#f87171" : undefined }}
                aria-invalid={Boolean(emailError)}
                aria-describedby={emailError ? "login-email-error" : undefined}
              />
              {emailError && (
                <p id="login-email-error" className="text-sm text-red-400 mt-1">
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setSubmitError(null);
                  }}
                  placeholder="Digite sua senha"
                  disabled={loading}
                  className="login-input w-full px-4 py-3 pr-20 rounded-lg focus:ring-0 transition-shadow"
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
            </div>

            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  disabled={loading}
                  className="rounded border-slate-500"
                />
                <span className="text-sm text-slate-300">Lembrar de mim</span>
              </label>
              <Link to="/forgot-password" className="login-link-accent text-sm font-medium hover:underline shrink-0">
                Esqueceu?
              </Link>
            </div>

            {submitError && (
              <p className="text-sm text-red-400" role="alert">
                {submitError}
              </p>
            )}

            <p className="text-xs text-slate-500 text-center">
              Acesso demo: use qualquer e-mail e senha <strong className="text-slate-400">123456</strong>
            </p>

            <button
              type="submit"
              disabled={loading}
              className="login-btn w-full py-3 rounded-lg text-white transition-all duration-200"
            >
              {loading ? "Entrando..." : "Entrar na plataforma →"}
            </button>
          </form>

          <p className="text-sm text-slate-400 text-center mt-6">
            Não tem uma conta?{" "}
            <Link to="/signup" className="login-link-accent font-semibold hover:underline">
              Criar conta grátis
            </Link>
          </p>

          <p className="text-xs text-slate-500 text-center mt-6 leading-relaxed">
            Protegido por reCAPTCHA e sujeito à Política de Privacidade e aos Termos de Uso.
          </p>
        </div>
      </section>
    </main>
  );
}
