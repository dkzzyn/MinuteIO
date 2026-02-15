import { useRef, useState } from "react";

type Props = {
  onStreamReady?: (stream: MediaStream) => void;
  onStop?: () => void;
};

export default function CaptureTabWithAudio({ onStreamReady, onStop }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStartCapture() {
    try {
      setError(null);
      const s = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: true });
      setStream(s);
      setIsCapturing(true);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
      }
      if (onStreamReady) onStreamReady(s);
      else console.log("Stream pronto:", s);
    } catch (e: any) {
      setError(e?.message || "Não foi possível iniciar a captura.");
    }
  }

  function handleStopCapture() {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    setStream(null);
    setIsCapturing(false);
    if (onStop) onStop();
  }

  return (
    <div className="bg-[var(--bg-elevated)] rounded-2xl p-8 w-full max-w-xl border" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-2xl font-semibold mb-2">Nova Reunião</div>
          <div className="text-sm text-[var(--text-secondary)]">Selecione a aba onde sua reunião está acontecendo e marque “compartilhar áudio”.</div>
        </div>
      </div>
      {!isCapturing && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--bg-muted)]" />
            <div className="text-sm text-[var(--text-secondary)]">
              <div>• Clique no botão abaixo.</div>
              <div>• Escolha a aba da sua reunião (Zoom, Meet, etc.).</div>
              <div>• Certifique-se de marcar a opção “compartilhar áudio”.</div>
            </div>
          </div>
          <button onClick={handleStartCapture} className="bg-[var(--accent-green)] hover:opacity-90 text-black font-medium px-4 py-2 rounded-lg">
            Selecionar aba e compartilhar áudio
          </button>
          {error && <div className="text-[var(--accent-red)] text-sm">{error}</div>}
        </div>
      )}
      {isCapturing && (
        <div className="mt-6">
          <div className="inline-block px-3 py-1 rounded-full bg-[var(--accent-green)] text-black text-sm mb-3">Capturando aba…</div>
          <div className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--border-subtle)" }}>
            <video ref={videoRef} className="w-full h-48 object-cover" autoPlay muted />
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleStopCapture} className="px-4 py-2 rounded bg-[var(--accent-red)] text-white">Parar captura</button>
          </div>
        </div>
      )}
    </div>
  );
}
