import { Meeting, SalesInsight, TranscriptChunk } from "../types/sales";

function iso(minutesOffset = 0) {
  const d = new Date(Date.now() + minutesOffset * 60000);
  return d.toISOString();
}

const transcriptsA: TranscriptChunk[] = [
  { id: "t1", speaker: "Vendedor", text: "Obrigado pelo tempo, vamos falar de metas de conversão.", timestamp: iso(-120) },
  { id: "t2", speaker: "Cliente", text: "Estamos preocupados com o preço e integração com HubSpot.", timestamp: iso(-118) },
  { id: "t3", speaker: "Vendedor", text: "Perfeito, configuro trial e mostramos ROI rápido.", timestamp: iso(-115) }
];

const transcriptsB: TranscriptChunk[] = [
  { id: "t4", speaker: "Vendedor", text: "Podemos agendar uma demo técnica semana que vem.", timestamp: iso(-60) },
  { id: "t5", speaker: "Cliente", text: "Preciso validar com meu gestor antes.", timestamp: iso(-58) }
];

export const meetings: Meeting[] = [
  {
    id: "m1",
    title: "Discovery com Loja Alpha",
    datetime: iso(-180),
    durationMinutes: 45,
    language: "pt-BR",
    pipeline_stage: "discovery",
    result: "Em andamento",
    participants: ["Carlos (Cliente)", "Ana (Vendedor)"],
    win_probability: 0.62,
    objection_types: ["preco", "integracao"],
    summary: "Cliente com interesse, preocupações de preço e integração. Próximo passo: trial e validação ROI.",
    transcripts: transcriptsA
  },
  {
    id: "m2",
    title: "Demo com SaaS Beta",
    datetime: iso(-90),
    durationMinutes: 30,
    language: "en",
    pipeline_stage: "demo",
    result: "Em andamento",
    participants: ["John (Cliente)", "Maria (Closer)"],
    win_probability: 0.74,
    objection_types: ["aprovacao"],
    summary: "Demo positiva, precisa de aprovação do gestor. Próximo passo: proposta formal.",
    transcripts: transcriptsB
  },
  {
    id: "m3",
    title: "Proposal com Retail MX",
    datetime: iso(-30),
    durationMinutes: 25,
    language: "es-MX",
    pipeline_stage: "proposal",
    result: "Lost",
    participants: ["Lucia (Cliente)", "Pedro (Closer)"],
    win_probability: 0.81,
    objection_types: ["tempo"],
    summary: "Propuesta enviada, preocupación por tiempos de implementación. Siguiente paso: plan de implementación.",
    transcripts: []
  },
  {
    id: "m4",
    title: "Closing Call",
    datetime: iso(-96),
    durationMinutes: 35,
    language: "pt-BR",
    pipeline_stage: "closing",
    result: "Won",
    participants: ["Startup Gamma (Cliente)", "Ana (Vendedor)"],
    win_probability: 0.88,
    objection_types: [],
    summary: "Fechamento positivo. Próximo passo: envio de contrato e onboarding.",
    transcripts: []
  },
  {
    id: "m5",
    title: "Discovery Onboarding",
    datetime: iso(-120),
    durationMinutes: 40,
    language: "pt-BR",
    pipeline_stage: "discovery",
    result: "Em andamento",
    participants: ["Agência Delta (Cliente)", "Carlos (Vendedor)"],
    win_probability: 0.52,
    objection_types: ["pensar"],
    summary: "Discovery inicial; cliente pediu tempo para avaliar. Próximo passo: follow-up em 1 semana.",
    transcripts: []
  }
];

export const insightsByMeeting: Record<string, SalesInsight[]> = {
  m1: [
    {
      app: "MinuteIO",
      detected_lang: "pt-BR",
      confidence_lang: 0.98,
      objection_type: "preco",
      confidence: 0.95,
      emotion: "duvida",
      resposta_principal: "Perfeito, configuro agora o trial para provar o ROI sem risco.",
      translated_en: "Perfect, I’ll set up the trial now to prove ROI risk-free.",
      proxima_pergunta: "Qual meta de conversão vocês buscam este mês?",
      pipeline_stage: "demo",
      urgency: "🔴alta",
      action: "trial_setup",
      win_probability: 0.7,
      copy_to_clipboard: true,
      timestamp: iso(-114)
    }
  ],
  m2: [
    {
      app: "MinuteIO",
      detected_lang: "en",
      confidence_lang: 0.97,
      objection_type: "aprovacao",
      confidence: 0.93,
      emotion: "neutro",
      resposta_principal: "Perfect, I’ll send a formal proposal and set a follow-up tomorrow.",
      translated_en: "Perfect, I’ll send a formal proposal and set a follow-up tomorrow.",
      proxima_pergunta: "What’s the best email for your manager?",
      pipeline_stage: "proposal",
      urgency: "🟡media",
      action: "proposal_send",
      win_probability: 0.76,
      copy_to_clipboard: true,
      timestamp: iso(-57)
    }
  ],
  m3: [
    {
      app: "MinuteIO",
      detected_lang: "es-MX",
      confidence_lang: 0.96,
      objection_type: "tempo",
      confidence: 0.92,
      emotion: "duvida",
      resposta_principal: "Perfecto, definimos hoy un plan claro de implementación para acelerar tiempos.",
      translated_en: "Perfect, we define a clear implementation plan today to speed timelines.",
      proxima_pergunta: "¿Qué fecha estiman para ir a producción?",
      pipeline_stage: "proposal",
      urgency: "🟡media",
      action: "followup",
      win_probability: 0.82,
      copy_to_clipboard: true,
      timestamp: iso(-25)
    }
  ]
};
