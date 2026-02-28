import { apiRequest } from "../infrastructure/http/api";
import {
  Meeting,
  SalesInsight,
  CallIntelligenceDetails,
  type TranscriptChunkWithTags,
  type TimelineSegment,
  type SentimentAtTime,
} from "../types/sales";

const AUTH_STORAGE_KEY = "minuteio_auth_token";

function tokenOrThrow(): string {
  const token = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!token) throw new Error("Usuário não autenticado.");
  return token;
}

type ApiMeeting = {
  id: string;
  title: string;
  datetimeStart: string;
  durationMinutes: number;
  language: string;
  pipelineStage: string;
  result: string;
  participants: string[];
  winProbability: number;
  objectionTypes: string[];
  summary: string;
};

type ApiMeetingClip = {
  id: string;
  index: number;
  transcript: string;
  startTime: number;
  endTime: number;
  createdAt: string;
};

type ApiMeetingInsight = {
  id: string;
  clipId: string | null;
  type: string;
  content: string;
  createdAt: string;
};

function mapMeeting(meeting: ApiMeeting): Meeting {
  return {
    id: meeting.id,
    title: meeting.title,
    datetime: meeting.datetimeStart,
    durationMinutes: meeting.durationMinutes ?? 30,
    language: (meeting.language ?? "pt-BR") as Meeting["language"],
    pipeline_stage: (meeting.pipelineStage ?? "discovery") as Meeting["pipeline_stage"],
    result: (meeting.result ?? "Em andamento") as Meeting["result"],
    participants: meeting.participants ?? [],
    win_probability: meeting.winProbability ?? 0.5,
    objection_types: (meeting.objectionTypes ?? []) as Meeting["objection_types"],
    summary: meeting.summary ?? "",
    transcripts: [],
  };
}

export async function listMeetings(query?: { search?: string; stage?: string; lang?: string }): Promise<Meeting[]> {
  const token = tokenOrThrow();
  let data = (await apiRequest<ApiMeeting[]>("/api/meetings", { token })).map(mapMeeting);
  if (query?.search) {
    const s = query.search.toLowerCase();
    data = data.filter((m) => m.title.toLowerCase().includes(s) || m.participants.join(",").toLowerCase().includes(s));
  }
  if (query?.stage) data = data.filter((m) => m.pipeline_stage === query.stage);
  if (query?.lang) data = data.filter((m) => m.language === query.lang);
  return data;
}

export async function getMeeting(id: string): Promise<Meeting | undefined> {
  const token = tokenOrThrow();
  const data = await apiRequest<ApiMeeting>(`/api/meetings/${id}`, { token });
  return mapMeeting(data);
}

export async function getInsights(id: string): Promise<SalesInsight[]> {
  const token = tokenOrThrow();
  const insights = await apiRequest<ApiMeetingInsight[]>(`/api/meetings/${id}/insights`, { token });
  return insights
    .filter((x) => x.type === "minute_insight")
    .map((x) => {
      let parsed: any = {};
      try {
        parsed = JSON.parse(x.content);
      } catch {
        parsed = {};
      }
      return {
        app: "MinuteIO",
        detected_lang: "pt-BR",
        confidence_lang: 0.9,
        objection_type: "nenhuma",
        confidence: 0.8,
        emotion: parsed.sentiment === "negative" ? "duvida" : "neutro",
        resposta_principal: parsed.summary ?? "",
        translated_en: parsed.summary ?? "",
        proxima_pergunta: parsed.tasks?.[0]?.text ?? "Qual o próximo passo?",
        pipeline_stage: "discovery",
        urgency: "🟡media",
        action: "followup",
        win_probability: 0.5,
        copy_to_clipboard: true,
        timestamp: x.createdAt,
      } as SalesInsight;
    });
}

/** Dados completos para a Call Intelligence View (uma reunião). */
export async function getMeetingDetails(id: string): Promise<CallIntelligenceDetails | undefined> {
  const token = tokenOrThrow();
  const [meeting, clips, insights] = await Promise.all([
    apiRequest<ApiMeeting>(`/api/meetings/${id}`, { token }),
    apiRequest<ApiMeetingClip[]>(`/api/meetings/${id}/clips`, { token }),
    apiRequest<ApiMeetingInsight[]>(`/api/meetings/${id}/insights`, { token }),
  ]);

  const minuteInsights = insights
    .filter((x) => x.type === "minute_insight")
    .map((x) => {
      try {
        return JSON.parse(x.content) as {
          minute: number;
          summary: string;
          sentiment: "positive" | "neutral" | "negative";
          key_points?: string[];
          decisions?: string[];
          tasks?: { text: string; done: boolean }[];
        };
      } catch {
        return null;
      }
    })
    .filter((x): x is NonNullable<typeof x> => !!x)
    .sort((a, b) => a.minute - b.minute);

  const transcripts: TranscriptChunkWithTags[] = clips
    .sort((a, b) => a.index - b.index)
    .map((clip) => ({
      id: clip.id,
      speaker: "Reunião",
      text: clip.transcript || "Trecho sem transcrição disponível.",
      timestamp: clip.createdAt,
      tags: [],
    }));

  const timelineSegments: TimelineSegment[] = clips
    .sort((a, b) => a.index - b.index)
    .map((clip) => ({
      id: `seg-${clip.index}`,
      label: `Minuto ${clip.index}`,
      startMin: Math.floor((clip.startTime ?? 0) / 60),
      endMin: Math.floor((clip.endTime ?? 60) / 60),
      transcriptChunkIds: [clip.id],
    }));

  const sentimentOverTime: SentimentAtTime[] = minuteInsights.map((mi) => ({
    minuteOffset: mi.minute,
    value: mi.sentiment === "positive" ? 80 : mi.sentiment === "negative" ? 35 : 55,
  }));
  const sentimentAverage =
    sentimentOverTime.length > 0
      ? Math.round(sentimentOverTime.reduce((acc, cur) => acc + cur.value, 0) / sentimentOverTime.length)
      : 55;

  const aiSummaryBullets =
    minuteInsights.length > 0
      ? minuteInsights.map((mi) => mi.summary)
      : [meeting.summary || "Sem resumo disponível."];

  const nextTask = minuteInsights
    .flatMap((mi) => mi.tasks ?? [])
    .find((task) => !task.done);

  return {
    id: meeting.id,
    clientName: meeting.participants?.[0]?.split("(")[0]?.trim() || "Cliente",
    title: meeting.title,
    datetime: meeting.datetimeStart,
    durationMinutes: meeting.durationMinutes ?? 30,
    participants: (meeting.participants ?? []).map((name) => ({ name, role: "Participante" })),
    meetingType: (meeting.pipelineStage ?? "discovery") as CallIntelligenceDetails["meetingType"],
    status: (meeting.result ?? "Em andamento") as CallIntelligenceDetails["status"],
    win_probability: meeting.winProbability ?? 0.5,
    sentimentAverage,
    sentimentVariation: "estável",
    sentimentOverTime,
    talkTimePct: 50,
    clientTimePct: 50,
    questionsBySeller: 0,
    questionsByClient: 0,
    keywords: Array.from(
      new Set(minuteInsights.flatMap((mi) => mi.key_points ?? []).map((x) => x.trim()).filter(Boolean))
    ).slice(0, 10),
    timelineSegments,
    transcripts,
    aiSummaryBullets,
    nextStepSuggested: nextTask?.text,
    suggestedDate: undefined,
    objection_types: (meeting.objectionTypes ?? []) as CallIntelligenceDetails["objection_types"],
    summary: meeting.summary ?? "",
  };
}

export async function createMeeting(
  payload: Omit<Meeting, "id" | "win_probability" | "objection_types" | "transcripts" | "summary"> & { summary?: string }
) {
  const token = tokenOrThrow();
  const created = await apiRequest<ApiMeeting>("/api/meetings", {
    method: "POST",
    token,
    body: {
      type: "online",
      title: payload.title,
      datetimeStart: payload.datetime,
      datetimeEnd: null,
      status: "scheduled",
      recordingUrl: null,
      durationMinutes: payload.durationMinutes,
      language: payload.language,
      pipelineStage: payload.pipeline_stage,
      result: payload.result,
      participants: payload.participants,
      winProbability: Math.round(Math.random() * 100) / 100,
      objectionTypes: [],
      summary: payload.summary ?? "",
    },
  });
  return mapMeeting(created);
}
