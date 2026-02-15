import { useEffect, useRef, useState } from "react";

export default function TabCapture() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [chunks, setChunks] = useState<BlobPart[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [includeMic, setIncludeMic] = useState(false);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [stream, downloadUrl]);

  async function startCapture() {
    if (stream) return;
    const display = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: true });
    let finalStream = display;
    if (includeMic) {
      const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const dest = ctx.createMediaStreamDestination();
      const tabSrc = ctx.createMediaStreamSource(display);
      const micSrc = ctx.createMediaStreamSource(mic);
      tabSrc.connect(dest);
      micSrc.connect(dest);
      finalStream = new MediaStream([
        ...display.getVideoTracks(),
        ...dest.stream.getAudioTracks()
      ]);
    }
    setStream(finalStream);
    if (videoRef.current) {
      videoRef.current.srcObject = finalStream;
      await videoRef.current.play();
    }
  }

  function stopCapture() {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  }

  function startRecording() {
    if (!stream || recording) return;
    const mime = "video/webm;codecs=vp9,opus";
    const rec = new MediaRecorder(stream, { mimeType: mime });
    const localChunks: BlobPart[] = [];
    rec.ondataavailable = e => { if (e.data.size) localChunks.push(e.data); };
    rec.onstop = () => {
      const blob = new Blob(localChunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setChunks(localChunks);
      setDownloadUrl(url);
    };
    rec.start();
    setRecorder(rec);
    setRecording(true);
  }

  function stopRecording() {
    if (!recorder) return;
    recorder.stop();
    setRecorder(null);
    setRecording(false);
  }

  return (
    <div className="rounded-xl bg-[var(--bg-elevated)] border p-4 space-y-4" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="font-semibold">Capturar Aba com Áudio</div>
      <div className="text-sm text-[var(--text-secondary)]">Selecione uma aba e marque “compartilhar áudio” no diálogo do navegador.</div>
      <div className="flex items-center gap-2">
        <input id="mic" type="checkbox" checked={includeMic} onChange={(e) => setIncludeMic(e.target.checked)} />
        <label htmlFor="mic" className="text-sm">Incluir microfone</label>
      </div>
      <div className="flex gap-2">
        <button onClick={startCapture} className="px-4 py-2 rounded bg-[var(--accent-blue)] text-white">Iniciar captura</button>
        <button onClick={stopCapture} className="px-4 py-2 rounded bg-[var(--bg-muted)]">Parar captura</button>
        {!recording && <button onClick={startRecording} disabled={!stream} className="px-4 py-2 rounded bg-[var(--accent-green)] text-white disabled:opacity-60">Gravar</button>}
        {recording && <button onClick={stopRecording} className="px-4 py-2 rounded bg-[var(--accent-red)] text-white">Parar gravação</button>}
      </div>
      <div className="aspect-video bg-[var(--bg-muted)] rounded overflow-hidden">
        <video ref={videoRef} className="w-full h-full object-contain" muted />
      </div>
      {downloadUrl && (
        <div className="flex items-center gap-2">
          <a href={downloadUrl} download="captura.webm" className="px-4 py-2 rounded bg-[var(--bg-muted)]">Baixar gravação</a>
        </div>
      )}
    </div>
  );
}
