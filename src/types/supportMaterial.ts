export type SupportMaterialType =
  | "PRESENTATION"
  | "PROPOSAL"
  | "MEETING_RECORDING"
  | "SCRIPT"
  | "REQUIREMENTS"
  | "OTHER";

export type MaterialFunnelStage =
  | "PRE_SALES"
  | "DISCOVERY"
  | "PROPOSAL"
  | "NEGOTIATION"
  | "POST_SALES";

export type SupportMaterial = {
  id: string;
  clientId: string;
  meetingId?: string;
  title: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSizeBytes?: number;
  materialType: SupportMaterialType;
  funnelStage: MaterialFunnelStage;
  isConfidential: boolean;
  tags: string[];
  uploadedByUserId: string;
  uploadedAt: string;
  notes?: string;
};

export const SUPPORT_MATERIAL_TYPE_LABELS: Record<SupportMaterialType, string> = {
  PRESENTATION: "Apresentação",
  PROPOSAL: "Proposta",
  MEETING_RECORDING: "Gravação de reunião (vídeo)",
  SCRIPT: "Script / Roteiro",
  REQUIREMENTS: "Documento de requisitos",
  OTHER: "Outro"
};

export const MATERIAL_FUNNEL_STAGE_LABELS: Record<MaterialFunnelStage, string> = {
  PRE_SALES: "Pré-venda",
  DISCOVERY: "Discovery",
  PROPOSAL: "Proposta",
  NEGOTIATION: "Negociação",
  POST_SALES: "Pós-venda / Onboarding"
};
