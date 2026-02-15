import type {
  CallIntelligenceDetails,
  TranscriptChunkWithTags,
  TimelineSegment,
  SentimentAtTime,
  ParticipantWithRole
} from "../types/sales";
import { meetings } from "./data";

function iso(minutesOffset = 0) {
  const d = new Date(Date.now() + minutesOffset * 60000);
  return d.toISOString();
}

function buildSegments(durationMin: number): TimelineSegment[] {
  const step = Math.max(1, Math.floor(durationMin / 6));
  return [
    { id: "s1", label: "Introdução", startMin: 0, endMin: step, transcriptChunkIds: ["t1"] },
    { id: "s2", label: "Descoberta", startMin: step, endMin: step * 2, transcriptChunkIds: ["t2"] },
    { id: "s3", label: "Proposta", startMin: step * 2, endMin: step * 3, transcriptChunkIds: ["t3"] },
    { id: "s4", label: "Preço", startMin: step * 3, endMin: step * 4 },
    { id: "s5", label: "Objeções", startMin: step * 4, endMin: step * 5 },
    { id: "s6", label: "Fechamento", startMin: step * 5, endMin: durationMin }
  ];
}

function buildSentimentOverTime(durationMin: number): SentimentAtTime[] {
  const points: SentimentAtTime[] = [];
  for (let m = 0; m <= durationMin; m += Math.max(1, Math.floor(durationMin / 8))) {
    points.push({ minuteOffset: m, value: 45 + Math.sin(m / 5) * 25 + Math.random() * 15 });
  }
  return points;
}

const detailsByMeeting: Record<string, Omit<CallIntelligenceDetails, "id" | "clientName" | "title" | "datetime" | "durationMinutes" | "participants" | "meetingType" | "status" | "win_probability" | "objection_types" | "summary">> = {
  m1: {
    sentimentAverage: 68,
    sentimentVariation: "subindo",
    sentimentOverTime: buildSentimentOverTime(45),
    talkTimePct: 45,
    clientTimePct: 55,
    questionsBySeller: 8,
    questionsByClient: 6,
    keywords: ["Preço", "Integração", "HubSpot", "ROI", "Trial"],
    timelineSegments: buildSegments(45),
    transcripts: [
      { id: "t1", speaker: "Vendedor", text: "Obrigado pelo tempo, vamos falar de metas de conversão.", timestamp: iso(-120), tags: [] },
      { id: "t2", speaker: "Cliente", text: "Estamos preocupados com o preço e integração com HubSpot.", timestamp: iso(-118), tags: ["price", "objection"] },
      { id: "t3", speaker: "Vendedor", text: "Perfeito, configuro trial e mostramos ROI rápido.", timestamp: iso(-115), tags: ["action", "next_step"] }
    ] as TranscriptChunkWithTags[],
    aiSummaryBullets: [
      "Contexto: Discovery com foco em metas de conversão e integração com stack atual.",
      "Principais dores: Preço e integração com HubSpot mencionados pelo cliente.",
      "Objeções: Preço e integração; vendedor propôs trial para validar ROI.",
      "Próximos passos: Configurar trial e demonstrar ROI em curto prazo."
    ],
    nextStepSuggested: "Configurar trial e agendar validação de ROI",
    suggestedDate: (() => { const d = new Date(); d.setDate(d.getDate() + 5); return d.toISOString().slice(0, 10); })()
  },
  m2: {
    sentimentAverage: 72,
    sentimentVariation: "estável",
    sentimentOverTime: buildSentimentOverTime(30),
    talkTimePct: 58,
    clientTimePct: 42,
    questionsBySeller: 5,
    questionsByClient: 4,
    keywords: ["Demo", "Aprovação", "Gestor", "Proposta"],
    timelineSegments: buildSegments(30),
    transcripts: [
      { id: "t4", speaker: "Vendedor", text: "Podemos agendar uma demo técnica semana que vem.", timestamp: iso(-60), tags: ["action"] },
      { id: "t5", speaker: "Cliente", text: "Preciso validar com meu gestor antes.", timestamp: iso(-58), tags: ["objection", "question_client"] }
    ] as TranscriptChunkWithTags[],
    aiSummaryBullets: [
      "Contexto: Demo funcional bem recebida; decisão depende de aprovação.",
      "Principais dores: Necessidade de validação com gestor.",
      "Objeções: Aprovação interna; vendedor sugeriu proposta formal e follow-up.",
      "Próximos passos: Enviar proposta formal e agendar follow-up com gestor."
    ],
    nextStepSuggested: "Enviar proposta formal e agendar call com gestor",
    suggestedDate: (() => { const d = new Date(); d.setDate(d.getDate() + 2); return d.toISOString().slice(0, 10); })()
  },
  m3: {
    sentimentAverage: 58,
    sentimentVariation: "caindo",
    sentimentOverTime: buildSentimentOverTime(25),
    talkTimePct: 62,
    clientTimePct: 38,
    questionsBySeller: 6,
    questionsByClient: 3,
    keywords: ["Implementación", "Tiempos", "Producción"],
    timelineSegments: buildSegments(25),
    transcripts: [] as TranscriptChunkWithTags[],
    aiSummaryBullets: [
      "Contexto: Propuesta enviada; foco em tiempos de implementación.",
      "Principais dores: Preocupación por plazos para ir a producción.",
      "Objeções: Tempo; vendedor propôs plan de implementación claro.",
      "Próximos passos: Definir plan de implementación y fecha estimada."
    ],
    nextStepSuggested: "Enviar plan de implementación e confirmar fecha",
    suggestedDate: (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toISOString().slice(0, 10); })()
  },
  m4: {
    sentimentAverage: 80,
    sentimentVariation: "subindo",
    sentimentOverTime: buildSentimentOverTime(35),
    talkTimePct: 42,
    clientTimePct: 58,
    questionsBySeller: 5,
    questionsByClient: 7,
    keywords: ["Contrato", "Onboarding", "Prazo", "Win"],
    timelineSegments: buildSegments(35),
    transcripts: [
      { id: "t6", speaker: "Vendedor", text: "Fechamos então: envio do contrato até amanhã e onboarding na próxima semana.", timestamp: iso(-95), tags: ["next_step", "action"] },
      { id: "t7", speaker: "Cliente", text: "Perfeito, combinado. Ansiosos para começar.", timestamp: iso(-94), tags: [] }
    ] as TranscriptChunkWithTags[],
    aiSummaryBullets: [
      "Contexto: Closing positivo com Startup Gamma.",
      "Resultado: Won. Cliente confirmou fechamento.",
      "Próximos passos: Enviar contrato e agendar onboarding."
    ],
    nextStepSuggested: "Enviar contrato e agendar onboarding",
    suggestedDate: (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); })()
  },
  m5: {
    sentimentAverage: 55,
    sentimentVariation: "estável",
    sentimentOverTime: buildSentimentOverTime(40),
    talkTimePct: 50,
    clientTimePct: 50,
    questionsBySeller: 8,
    questionsByClient: 6,
    keywords: ["Preço", "Pensar", "Follow-up", "Comparação"],
    timelineSegments: buildSegments(40),
    transcripts: [
      { id: "t8", speaker: "Cliente", text: "Precisamos de um tempo para comparar com outras opções.", timestamp: iso(-118), tags: ["objection", "price"] },
      { id: "t9", speaker: "Vendedor", text: "Sem problema. Que tal retomarmos na próxima semana?", timestamp: iso(-116), tags: ["next_step"] }
    ] as TranscriptChunkWithTags[],
    aiSummaryBullets: [
      "Contexto: Discovery com Agência Delta; interesse inicial.",
      "Objeções: Cliente pediu tempo para avaliar e comparar.",
      "Próximos passos: Follow-up em 1 semana; reforçar diferencial."
    ],
    nextStepSuggested: "Follow-up em 1 semana com material comparativo",
    suggestedDate: (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10); })()
  }
};

function parseParticipant(s: string): ParticipantWithRole {
  const match = s.match(/^(.+)\s*\((.+)\)$/);
  if (match) return { name: match[1].trim(), role: match[2].trim() };
  return { name: s, role: "Participante" };
}

export function getCallIntelligenceDetails(id: string): CallIntelligenceDetails | undefined {
  const meeting = meetings.find((m) => m.id === id);
  if (!meeting) return undefined;
  const extra = detailsByMeeting[id];
  if (!extra) return undefined;

  const typeLabel = meeting.pipeline_stage === "discovery" ? "Discovery" : meeting.pipeline_stage === "demo" ? "Demo" : meeting.pipeline_stage === "closing" ? "Closing" : meeting.pipeline_stage === "proposal" ? "Proposta" : meeting.pipeline_stage;
  const clientName = meeting.participants.find((p) => p.toLowerCase().includes("cliente")) ? parseParticipant(meeting.participants.find((p) => p.toLowerCase().includes("cliente"))!).name : meeting.participants[0]?.split("(")[0]?.trim() || "Cliente";

  return {
    id: meeting.id,
    clientName,
    title: meeting.title,
    datetime: meeting.datetime,
    durationMinutes: meeting.durationMinutes,
    participants: meeting.participants.map(parseParticipant),
    meetingType: meeting.pipeline_stage,
    status: meeting.result,
    win_probability: meeting.win_probability,
    objection_types: meeting.objection_types,
    summary: meeting.summary,
    ...extra
  };
}
