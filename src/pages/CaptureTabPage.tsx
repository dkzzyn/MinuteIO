import CaptureTabWithAudio from "../components/capture/CaptureTabWithAudio";

export default function CaptureTabPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <div className="w-full px-4 flex flex-col items-center">
        <div className="text-2xl font-semibold mb-2">Capturar aba com áudio</div>
        <div className="text-sm text-[var(--text-secondary)] mb-6">Selecione a aba onde sua reunião está acontecendo e marque “compartilhar áudio”.</div>
        <CaptureTabWithAudio />
      </div>
    </div>
  );
}
