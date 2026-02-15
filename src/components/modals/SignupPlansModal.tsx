import { useEffect } from "react";
import { IconX } from "../icons";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Ideal para iniciantes.",
    price: "Gratuito",
    popular: false,
    benefits: [
      "Até 3 automações ativas",
      "500 execuções por mês",
      "Relatórios básicos",
      "Integrações limitadas",
      "Suporte via email",
      "Dashboard padrão"
    ],
    cta: "Começar Gratuitamente",
    style: "outline" as const
  },
  {
    id: "pro",
    name: "Pro",
    tagline: null,
    price: "US$ 19/mês",
    popular: true,
    benefits: [
      "Automações ilimitadas",
      "10.000 execuções por mês",
      "Relatórios avançados",
      "Integrações ilimitadas",
      "Webhooks",
      "Exportação de dados",
      "Suporte prioritário",
      "Histórico completo"
    ],
    cta: "Assinar Plano Pro",
    style: "gradient" as const
  },
  {
    id: "business",
    name: "Business",
    tagline: "Para empresas e times.",
    price: "US$ 49/mês",
    popular: false,
    benefits: [
      "Tudo do plano Pro",
      "Execuções ilimitadas",
      "Multi-usuários",
      "Controle de permissões",
      "API dedicada",
      "SLA garantido",
      "Suporte 24/7",
      "Consultoria inicial"
    ],
    cta: "Falar com Especialista",
    style: "enterprise" as const
  }
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SignupPlansModal({ open, onClose }: Props) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="signup-plans-overlay"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-plans-title"
    >
      <div
        className="signup-plans-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-10"
          aria-label="Fechar"
        >
          <IconX className="w-5 h-5" />
        </button>

        <h2 id="signup-plans-title" className="text-2xl font-bold text-white text-center mb-1">
          Escolha o plano perfeito para você
        </h2>
        <p className="text-slate-400 text-center mb-8">
          Comece grátis e evolua conforme sua necessidade.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`signup-plan-card ${plan.popular ? "signup-plan-card--popular" : ""}`}
            >
              {plan.popular && (
                <div className="signup-plan-badge">Mais Popular</div>
              )}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                {plan.tagline && (
                  <p className="text-sm text-slate-400 mt-0.5">{plan.tagline}</p>
                )}
              </div>
              <p className="text-2xl font-bold text-white mb-6">{plan.price}</p>
              <ul className="space-y-2 mb-6">
                {plan.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-[#22C55E] shrink-0 mt-0.5" aria-hidden>✔</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`signup-plan-cta signup-plan-cta--${plan.style}`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
