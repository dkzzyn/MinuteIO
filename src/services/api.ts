import { meetings, insightsByMeeting } from "../mock/data";
import { getCallIntelligenceDetails } from "../mock/callIntelligence";
import { Meeting, SalesInsight, CallIntelligenceDetails } from "../types/sales";

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function listMeetings(query?: { search?: string; stage?: string; lang?: string }): Promise<Meeting[]> {
  await delay(200);
  let data = meetings.slice().sort((a, b) => b.datetime.localeCompare(a.datetime));
  if (query?.search) {
    const s = query.search.toLowerCase();
    data = data.filter((m) => m.title.toLowerCase().includes(s) || m.participants.join(",").toLowerCase().includes(s));
  }
  if (query?.stage) {
    data = data.filter((m) => m.pipeline_stage === query.stage);
  }
  if (query?.lang) {
    data = data.filter((m) => m.language === query.lang);
  }
  return data;
}

export async function getMeeting(id: string): Promise<Meeting | undefined> {
  await delay(150);
  return meetings.find((m) => m.id === id);
}

export async function getInsights(id: string): Promise<SalesInsight[]> {
  await delay(150);
  return (insightsByMeeting[id] || []).slice().sort((a, b) => (a.timestamp || "").localeCompare(b.timestamp || ""));
}

/** Dados completos para a Call Intelligence View (uma reunião). */
export async function getMeetingDetails(id: string): Promise<CallIntelligenceDetails | undefined> {
  await delay(180);
  return getCallIntelligenceDetails(id);
}

export async function createMeeting(payload: Omit<Meeting, "id" | "win_probability" | "objection_types" | "transcripts" | "summary"> & { summary?: string }) {
  await delay(200);
  const id = "m" + (meetings.length + 1);
  const item: Meeting = {
    id,
    title: payload.title,
    datetime: payload.datetime,
    durationMinutes: payload.durationMinutes,
    language: payload.language,
    pipeline_stage: payload.pipeline_stage,
    result: payload.result,
    participants: payload.participants,
    win_probability: Math.round(Math.random() * 100) / 100,
    objection_types: [],
    summary: payload.summary || "",
    transcripts: []
  };
  meetings.push(item);
  return item;
}
