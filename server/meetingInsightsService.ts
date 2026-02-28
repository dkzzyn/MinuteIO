/**
 * Serviço de insights de reunião persistido no PostgreSQL via Prisma.
 * Substitui o antigo armazenamento em memória (Map).
 */

import { prisma } from "./src/infrastructure/database/prisma/client";
import type { MinuteInsight, MeetingInsightsView } from "./ollama/types";

const LAST_N_SUMMARIES = 5;

type SaveOptions = {
  title?: string;
  userId?: string;
};

async function ensureMeeting(meetingId: string, options?: SaveOptions) {
  const existing = await prisma.meeting.findUnique({ where: { id: meetingId } });
  if (existing) {
    const updates: Record<string, unknown> = {};
    if (options?.title && existing.title !== options.title) updates.title = options.title;
    if (Object.keys(updates).length) {
      await prisma.meeting.update({
        where: { id: meetingId },
        data: updates,
      });
    }
    return;
  }

  if (!options?.userId) {
    throw new Error("meeting userId é obrigatório para criar reunião.");
  }

  await prisma.meeting.create({
    data: {
      id: meetingId,
      userId: options.userId,
      postId: null,
      type: "online",
      title: options.title ?? "Reunião",
      description: null,
      datetimeStart: new Date(),
      datetimeEnd: null,
      status: "running",
      recordingUrl: null,
    },
  });
}

async function loadMinuteInsights(meetingId: string): Promise<MinuteInsight[]> {
  const rows = await prisma.meetingInsight.findMany({
    where: { meetingId, type: "minute_insight" },
    orderBy: { createdAt: "asc" },
  });

  const parsed = rows
    .map((row: { content: string }) => {
      try {
        return JSON.parse(row.content) as MinuteInsight;
      } catch {
        return null;
      }
    })
    .filter((x: MinuteInsight | null): x is MinuteInsight => !!x)
    .sort((a: MinuteInsight, b: MinuteInsight) => a.minute - b.minute);

  return parsed;
}

/**
 * Salva um insight de minuto (vindo do Ollama após analyzeMeetingMinute).
 * Se já existir insight para aquele minuto, substitui.
 */
export async function saveMinuteInsight(
  meetingId: string,
  insight: MinuteInsight,
  title?: string,
  userId?: string
): Promise<void> {
  await ensureMeeting(meetingId, { title, userId });

  const clip = await prisma.meetingClip.upsert({
    where: {
      meetingId_index: {
        meetingId,
        index: insight.minute,
      },
    },
    update: {
      processedByAi: true,
      startTime: Math.max(0, (insight.minute - 1) * 60),
      endTime: insight.minute * 60,
    },
    create: {
      meetingId,
      index: insight.minute,
      startTime: Math.max(0, (insight.minute - 1) * 60),
      endTime: insight.minute * 60,
      transcript: "",
      processedByAi: true,
    },
  });

  const existing = await prisma.meetingInsight.findFirst({
    where: {
      meetingId,
      clipId: clip.id,
      type: "minute_insight",
    },
  });

  if (existing) {
    await prisma.meetingInsight.update({
      where: { id: existing.id },
      data: {
        content: JSON.stringify(insight),
        createdAt: new Date(),
      },
    });
    return;
  }

  await prisma.meetingInsight.create({
    data: {
      meetingId,
      clipId: clip.id,
      type: "minute_insight",
      content: JSON.stringify(insight),
    },
  });
}

/**
 * Retorna a visão agregada para a aba "Insights da Reunião".
 */
export async function getMeetingInsightsView(meetingId: string, title?: string): Promise<MeetingInsightsView | null> {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
  });

  if (!meeting) {
    return {
      title: title ?? "Reunião",
      realtimeSummary: "",
      mainDecisions: [],
      tasks: [],
      keyPoints: [],
      minuteInsights: [],
    };
  }

  const minuteInsights = await loadMinuteInsights(meetingId);
  if (minuteInsights.length === 0) {
    return {
      title: meeting.title,
      realtimeSummary: "",
      mainDecisions: [],
      tasks: [],
      keyPoints: [],
      minuteInsights: [],
    };
  }

  const summaries = minuteInsights.map((i) => i.summary).filter(Boolean);
  const realtimeSummary =
    summaries.length <= LAST_N_SUMMARIES
      ? summaries.join(" ")
      : summaries.slice(-LAST_N_SUMMARIES).join(" ");

  const decisionsSet = new Set<string>();
  minuteInsights.forEach((i) => i.decisions.forEach((d) => decisionsSet.add(d.trim())));
  const mainDecisions = Array.from(decisionsSet).filter(Boolean);

  const tasksSeen = new Set<string>();
  const tasks: { text: string; done: boolean }[] = [];
  minuteInsights.forEach((i) =>
    i.tasks.forEach((t) => {
      const key = t.text.trim().toLowerCase();
      if (!key || tasksSeen.has(key)) return;
      tasksSeen.add(key);
      tasks.push({ text: t.text.trim(), done: t.done ?? false });
    })
  );

  const pointsSet = new Set<string>();
  minuteInsights.forEach((i) => i.key_points.forEach((p) => pointsSet.add(p.trim())));
  const keyPoints = Array.from(pointsSet).filter(Boolean);

  return {
    title: meeting.title,
    realtimeSummary: realtimeSummary.trim() || "Nenhum resumo ainda.",
    mainDecisions,
    tasks,
    keyPoints,
    minuteInsights,
  };
}

/**
 * Marca uma tarefa como feita/não feita (por texto) e persiste no banco.
 */
export async function setTaskDone(meetingId: string, taskText: string, done: boolean): Promise<void> {
  const rows = await prisma.meetingInsight.findMany({
    where: { meetingId, type: "minute_insight" },
  });

  await Promise.all(
    rows.map(async (row: { id: string; content: string }) => {
      let parsed: MinuteInsight;
      try {
        parsed = JSON.parse(row.content) as MinuteInsight;
      } catch {
        return;
      }
      const task = parsed.tasks.find((t) => t.text.trim() === taskText.trim());
      if (!task) return;
      task.done = done;
      await prisma.meetingInsight.update({
        where: { id: row.id },
        data: { content: JSON.stringify(parsed) },
      });
    })
  );
}
