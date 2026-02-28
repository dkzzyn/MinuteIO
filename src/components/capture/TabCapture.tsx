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

  return null;
}
