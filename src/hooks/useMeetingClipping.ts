import { useCallback, useEffect, useRef, useState } from "react";
import { analyzeMeetingChunk, listMeetingChunks, type MeetingChunkAnalysis } from "../services/meetingInsightsApi";

export interface UseMeetingClippingOptions {
  meetingId: string;
  meetingContext?: string;
  title?: string;
  agentId?: string;
  intervalMs?: number;
  getCurrentTranscriptChunk: () => string;
}

export interface UseMeetingClippingReturn {
  isRunning: boolean;
  isSending: boolean;
  error: string | null;
  analyses: MeetingChunkAnalysis[];
  startMeetingAnalysis: () => void;
  stopMeetingAnalysis: () => void;
  refreshAnalyses: () => Promise<void>;
}

const DEFAULT_INTERVAL_MS = 60_000;

export function useMeetingClipping(options: UseMeetingClippingOptions): UseMeetingClippingReturn {
  const {
    meetingId,
    meetingContext = "Reunião em andamento",
    title = "Reunião ao vivo",
    agentId,
    intervalMs = DEFAULT_INTERVAL_MS,
    getCurrentTranscriptChunk,
  } = options;

  const [isRunning, setIsRunning] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<MeetingChunkAnalysis[]>([]);
  const timerRef = useRef<number | null>(null);
  const nextChunkRef = useRef(1);
  const inflightRef = useRef(false);
  const lastSentTranscriptRef = useRef("");

  const refreshAnalyses = useCallback(async () => {
    try {
      const data = await listMeetingChunks(meetingId);
      setAnalyses(data);
      const maxChunk = data.reduce((max, item) => (item.chunkIndex > max ? item.chunkIndex : max), 0);
      nextChunkRef.current = maxChunk + 1;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao carregar chunks.";
      setError(msg);
    }
  }, [meetingId]);

  const sendCurrentChunk = useCallback(async () => {
    if (inflightRef.current) return;
    const transcript = getCurrentTranscriptChunk().trim();
    if (!transcript || transcript === lastSentTranscriptRef.current) return;

    inflightRef.current = true;
    setIsSending(true);
    setError(null);

    const chunkIndex = nextChunkRef.current;
    const payload = {
      chunkIndex,
      transcript,
      meetingContext,
      title,
      agentId,
    };

    try {
      await analyzeMeetingChunk(meetingId, payload);
      lastSentTranscriptRef.current = transcript;
      nextChunkRef.current += 1;
      await refreshAnalyses();
    } catch (err) {
      try {
        await analyzeMeetingChunk(meetingId, payload);
        lastSentTranscriptRef.current = transcript;
        nextChunkRef.current += 1;
        await refreshAnalyses();
      } catch (retryErr) {
        const msg = retryErr instanceof Error ? retryErr.message : "Erro ao analisar chunk.";
        setError(msg);
      }
    } finally {
      setIsSending(false);
      inflightRef.current = false;
    }
  }, [agentId, getCurrentTranscriptChunk, meetingContext, meetingId, refreshAnalyses, title]);

  const stopMeetingAnalysis = useCallback(() => {
    if (timerRef.current != null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const startMeetingAnalysis = useCallback(() => {
    if (timerRef.current != null) return;
    setIsRunning(true);
    timerRef.current = window.setInterval(() => {
      void sendCurrentChunk();
    }, intervalMs);
  }, [intervalMs, sendCurrentChunk]);

  useEffect(() => {
    void refreshAnalyses();
  }, [refreshAnalyses]);

  useEffect(() => {
    return () => {
      if (timerRef.current != null) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    isRunning,
    isSending,
    error,
    analyses,
    startMeetingAnalysis,
    stopMeetingAnalysis,
    refreshAnalyses,
  };
}
