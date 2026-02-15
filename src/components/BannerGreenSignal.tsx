const BANNER_BG_IMAGE = '/banner.avif';

export default function BannerGreenSignal({ onActivate }: { onActivate?: () => void }) {
  return (
    <div className="relative rounded-xl overflow-hidden mb-6 min-h-[200px]">
      {/* Imagem de fundo */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${BANNER_BG_IMAGE})` }}
      />
      {/* Tonalidade verde sobre a imagem */}
      <div className="absolute inset-0 bg-[var(--accent-green)]/30 mix-blend-multiply" />
      {/* Overlay para legibilidade do texto */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
      <div className="relative p-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-muted)] text-xs text-[var(--text-secondary)]">
          Novo • IA para Vendas
        </div>
        <h1 className="mt-3 text-2xl md:text-3xl font-bold">
          O sinal verde que você precisa para avançar nas vendas.
        </h1>
        <p className="mt-2 text-[var(--text-secondary)] max-w-2xl">
          O MinuteIO analisa suas reuniões em tempo real, identifica objeções e entrega a melhor resposta para você fechar mais negócios.
        </p>
        <div className="mt-5 relative inline-block">
          <div className="absolute -inset-2 rounded-lg bg-gradient-to-r from-[color:rgba(34,197,94,0.2)] via-[color:rgba(34,197,94,0.1)] to-transparent blur-md" />
          <button onClick={onActivate} className="relative px-5 py-2 rounded-lg bg-[var(--accent-green)] hover:opacity-90 text-white font-medium">
            Ativar meu sinal verde
          </button>
        </div>
      </div>
    </div>
  );
}
