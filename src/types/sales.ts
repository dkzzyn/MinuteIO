export type PipelineStage = "discovery" | "demo" | "proposal" | "closing" | "upsell";

export type ObjectionType =
  | "preco"
  | "pensar"
  | "concorrente"
  | "aprovacao"
  | "tempo"
  | "integracao"
  | "tecnico"
  | "nenhuma";

export type Emotion =
  | "empolgado"
  | "excited"
  | "frio"
  | "cold"
  | "irritado"
  | "frustrated"
  | "duvida"
  | "doubt"
  | "neutro";

export type DetectedLang = "pt-BR" | "en" | "es" | "es-MX" | "es-ES" | "fr-FR" | "fr-CA";

export interface SalesInsight {
  app: "MinuteIO";
  detected_lang: DetectedLang;
  confidence_lang: number;
  objection_type: ObjectionType;
  confidence: number;
  emotion: Emotion;
  resposta_principal: string;
  translated_en: string;
  proxima_pergunta: string;
  pipeline_stage: PipelineStage;
  urgency: "🔴alta" | "🟡media" | "🟢baixa";
  action: "trial_setup" | "proposal_send" | "followup" | "demo_live" | "closing";
  win_probability: number;
  copy_to_clipboard: boolean;
  timestamp?: string;
}

export interface TranscriptChunk {
  id: string;
  speaker: string;
  text: string;
  timestamp: string;
}

export type MeetingResult = "Won" | "Lost" | "Em andamento";

export interface Meeting {
  id: string;
  title: string;
  datetime: string;
  durationMinutes: number;
  language: DetectedLang;
  pipeline_stage: PipelineStage;
  result: MeetingResult;
  participants: string[];
  win_probability: number;
  objection_types: ObjectionType[];
  summary: string;
  transcripts: TranscriptChunk[];
}

// --- Call Intelligence View (detalhes de uma reunião) ---

export interface ParticipantWithRole {
  name: string;
  role: string; // "Cliente", "Vendedor", "Decision Maker", etc.
}

export interface TimelineSegment {
  id: string;
  label: string; // "Introdução", "Descoberta", "Proposta", "Preço", "Objeções", "Fechamento"
  startMin: number; // minuto desde o início (0 = início da call)
  endMin: number;
  transcriptChunkIds?: string[];
}

export interface SentimentAtTime {
  minuteOffset: number;
  value: number; // 0-100
}

export type TranscriptTag = "action" | "objection" | "next_step" | "price" | "question_client";

export interface TranscriptChunkWithTags extends TranscriptChunk {
  tags?: TranscriptTag[];
}

export interface CallIntelligenceDetails {
  id: string;
  clientName: string;
  title: string;
  datetime: string;
  durationMinutes: number;
  participants: ParticipantWithRole[];
  meetingType: PipelineStage; // Discovery / Demo / Closing etc.
  status: MeetingResult; // Ganha / Perdida / Em andamento
  win_probability: number;

  // Cards acima do fold
  sentimentAverage: number; // 0-100
  sentimentVariation: "subindo" | "estável" | "caindo";
  sentimentOverTime: SentimentAtTime[];
  talkTimePct: number; // % vendedor
  clientTimePct: number; // % cliente
  questionsBySeller: number;
  questionsByClient: number;
  keywords: string[]; // Preço, Integração, Concorrente, etc.

  // Timeline + transcript
  timelineSegments: TimelineSegment[];
  transcripts: TranscriptChunkWithTags[];

  // Resumo IA (bullet points)
  aiSummaryBullets: string[];

  // Ações / follow-up
  nextStepSuggested?: string;
  suggestedDate?: string; // ISO
  objection_types: ObjectionType[];
  summary: string;
}
