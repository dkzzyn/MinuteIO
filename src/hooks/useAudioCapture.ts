/**
 * Hook para capturar áudio da reunião e enviar chunks a cada intervalo.
 * Usa MediaRecorder para gravar e envia para o backend processar.
 */
import { useRef, useState, useCallback, useEffect } from "react";
import { apiUrl } from "../config/apiBase";
const DEFAULT_CHUNK_INTERVAL_MS = 60_000; // 1 minuto
const AUTH_STORAGE_KEY = "minuteio_auth_token";

export interface AudioCaptureOptions {
  meetingId: string;
  meetingContext?: string;
  title?: string;
  chunkIntervalMs?: number;
  onChunkProcessed?: (result: AudioChunkResult) => void;
  onError?: (error: Error) => void;
}

export interface AudioChunkResult {
  meetingId: string;
  minuteNumber: number;
  transcription: string;
  insight: {
    minute: number;
    summary: string;
    decisions: string[];
    tasks: { text: string; done: boolean }[];
    key_points: string[];
    sentiment: string;
  } | null;
  insightsView?: unknown;
}

export interface UseAudioCaptureReturn {
  isCapturing: boolean;
  isPaused: boolean;
  currentMinute: number;
  error: string | null;
  startCapture: () => Promise<void>;
  stopCapture: () => void;
  pauseCapture: () => void;
  resumeCapture: () => void;
}

export function useAudioCapture(options: AudioCaptureOptions): UseAudioCaptureReturn {
  const {
    meetingId,
    meetingContext = "Reunião em andamento",
    title = "Reunião ao vivo",
    chunkIntervalMs = DEFAULT_CHUNK_INTERVAL_MS,
    onChunkProcessed,
    onError,
  } = options;

  const [isCapturing, setIsCapturing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<number | null>(null);
  const minuteCounterRef = useRef(0);

  const sendChunkToBackend = useCallback(
    async (audioBlob: Blob, minuteNumber: number) => {
      const formData = new FormData();
      formData.append("audio", audioBlob, `chunk-${minuteNumber}.webm`);
      formData.append("meetingContext", meetingContext);
      formData.append("minuteNumber", String(minuteNumber));
      formData.append("title", title);

      try {
        const token = localStorage.getItem(AUTH_STORAGE_KEY);
        const res = await fetch(apiUrl(`/api/meetings/${meetingId}/audio-chunk`), {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: formData,
        });

        if (!res.ok) {
          const text = await res.text();
          let msg = text;
          try {
            const json = JSON.parse(text) as { error?: string };
            if (json.error) msg = json.error;
          } catch {}
          throw new Error(msg);
        }

        const result = (await res.json()) as AudioChunkResult;
        onChunkProcessed?.(result);
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e.message);
        onError?.(e);
      }
    },
    [meetingId, meetingContext, title, onChunkProcessed, onError]
  );

  const processAndSendChunk = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") return;

    recorder.stop();
  }, []);

  const handleDataAvailable = useCallback((e: BlobEvent) => {
    if (e.data.size > 0) {
      chunksRef.current.push(e.data);
    }
  }, []);

  const handleRecorderStop = useCallback(async () => {
    if (chunksRef.current.length === 0) return;

    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    chunksRef.current = [];

    minuteCounterRef.current += 1;
    const minuteNumber = minuteCounterRef.current;
    setCurrentMinute(minuteNumber);

    sendChunkToBackend(blob, minuteNumber);

    const recorder = mediaRecorderRef.current;
    const stream = streamRef.current;
    if (recorder && stream && !isPaused) {
      try {
        const newRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
        newRecorder.ondataavailable = handleDataAvailable;
        newRecorder.onstop = handleRecorderStop;
        mediaRecorderRef.current = newRecorder;
        newRecorder.start();
      } catch (err) {
        console.error("Erro ao reiniciar gravação:", err);
      }
    }
  }, [isPaused, sendChunkToBackend, handleDataAvailable]);

  const startCapture = useCallback(async () => {
    setError(null);
    minuteCounterRef.current = 0;
    setCurrentMinute(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      recorder.ondataavailable = handleDataAvailable;
      recorder.onstop = handleRecorderStop;
      mediaRecorderRef.current = recorder;

      recorder.start();
      setIsCapturing(true);
      setIsPaused(false);

      intervalRef.current = window.setInterval(() => {
        processAndSendChunk();
      }, chunkIntervalMs);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao iniciar captura de áudio";
      setError(msg);
      onError?.(new Error(msg));
    }
  }, [chunkIntervalMs, handleDataAvailable, handleRecorderStop, processAndSendChunk, onError]);

  const stopCapture = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }

    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setIsCapturing(false);
    setIsPaused(false);
  }, []);

  const pauseCapture = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.pause();
      setIsPaused(true);
    }
  }, []);

  const resumeCapture = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "paused") {
      recorder.resume();
      setIsPaused(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, [stopCapture]);

  return {
    isCapturing,
    isPaused,
    currentMinute,
    error,
    startCapture,
    stopCapture,
    pauseCapture,
    resumeCapture,
  };
}
