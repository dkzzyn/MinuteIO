import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("123456", 10);

  await prisma.meetingAnalysis.deleteMany();
  await prisma.promptVersion.deleteMany();
  await prisma.prompt.deleteMany();
  await prisma.meetingInsight.deleteMany();
  await prisma.meetingClip.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.post.deleteMany();

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@minuteio.local" },
      update: { name: "Admin MinuteIO", role: "admin", isActive: true },
      create: {
        name: "Admin MinuteIO",
        email: "admin@minuteio.local",
        passwordHash,
        role: "admin",
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "vendedor1@minuteio.local" },
      update: { name: "Vendedor Um", role: "user", isActive: true },
      create: {
        name: "Vendedor Um",
        email: "vendedor1@minuteio.local",
        passwordHash,
        role: "user",
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "vendedor2@minuteio.local" },
      update: { name: "Vendedor Dois", role: "user", isActive: true },
      create: {
        name: "Vendedor Dois",
        email: "vendedor2@minuteio.local",
        passwordHash,
        role: "user",
        isActive: true,
      },
    }),
  ]);

  const [admin, seller1] = users;

  const postA = await prisma.post.create({
    data: {
      userId: admin.id,
      title: "Pauta Discovery Loja Alpha",
      content: "Objetivo: entender dores de integração e próximos passos comerciais.",
      isPublished: true,
    },
  });

  const postB = await prisma.post.create({
    data: {
      userId: seller1.id,
      title: "Follow-up Demo SaaS Beta",
      content: "Resumo da demo com foco em ROI e integração com CRM.",
      isPublished: false,
    },
  });

  const meeting1 = await prisma.meeting.create({
    data: {
      userId: admin.id,
      postId: postA.id,
      type: "online",
      title: "Discovery com Loja Alpha",
      description: "Alinhamento inicial com cliente e identificação de objeções.",
      durationMinutes: 45,
      language: "pt-BR",
      pipelineStage: "discovery",
      result: "Em andamento",
      participants: ["Carlos (Cliente)", "Ana (Vendedor)"],
      winProbability: 0.64,
      objectionTypes: ["preco", "integracao"],
      summary: "Cliente interessado, com dúvidas sobre preço e integração.",
      datetimeStart: new Date(),
      status: "running",
    },
  });

  const meeting2 = await prisma.meeting.create({
    data: {
      userId: seller1.id,
      postId: postB.id,
      type: "online",
      title: "Demo com SaaS Beta",
      description: "Demo técnica com time de decisão.",
      durationMinutes: 30,
      language: "en",
      pipelineStage: "demo",
      result: "Em andamento",
      participants: ["John (Cliente)", "Maria (Closer)"],
      winProbability: 0.72,
      objectionTypes: ["aprovacao"],
      summary: "Cliente gostou da demo, mas precisa de aprovação interna.",
      datetimeStart: new Date(Date.now() - 1000 * 60 * 90),
      status: "finished",
    },
  });

  const clip1 = await prisma.meetingClip.create({
    data: {
      meetingId: meeting1.id,
      index: 1,
      startTime: 0,
      endTime: 60,
      transcript:
        "Obrigado pelo tempo. Hoje queremos entender os desafios atuais de vendas e integração com HubSpot.",
      processedByAi: true,
    },
  });

  const clip2 = await prisma.meetingClip.create({
    data: {
      meetingId: meeting1.id,
      index: 2,
      startTime: 60,
      endTime: 120,
      transcript:
        "Nossa principal preocupação é preço e tempo de implantação. Precisamos aprovar internamente.",
      processedByAi: true,
    },
  });

  const minuteInsight1 = {
    minute: 1,
    summary: "Introdução da reunião com foco em dores de integração e processo comercial.",
    decisions: ["Avançar para diagnóstico técnico na próxima reunião."],
    tasks: [{ text: "Enviar checklist de integração", done: false }],
    key_points: ["Integração com HubSpot", "Objetivos de conversão"],
    sentiment: "neutral",
  };

  const minuteInsight2 = {
    minute: 2,
    summary: "Cliente levantou objeções de preço e tempo de implantação.",
    decisions: ["Preparar proposta com cronograma de implantação."],
    tasks: [{ text: "Enviar proposta revisada", done: false }],
    key_points: ["Objeção de preço", "Aprovação interna"],
    sentiment: "negative",
  };

  await prisma.meetingInsight.createMany({
    data: [
      {
        meetingId: meeting1.id,
        clipId: clip1.id,
        type: "minute_insight",
        content: JSON.stringify(minuteInsight1),
      },
      {
        meetingId: meeting1.id,
        clipId: clip2.id,
        type: "minute_insight",
        content: JSON.stringify(minuteInsight2),
      },
      {
        meetingId: meeting1.id,
        clipId: null,
        type: "translation",
        content: "EN: Customer asks for clear implementation timeline and pricing details.",
      },
      {
        meetingId: meeting2.id,
        clipId: null,
        type: "summary",
        content: "Demo bem recebida; próximo passo é aprovação do gestor.",
      },
    ],
  });

  const summaryPrompt = await prisma.prompt.create({
    data: {
      slug: "meeting_summary",
      title: "Resumo detalhado de reuniao",
      description: "Resume reunioes em bullets e identifica decisoes.",
      promptText:
        "Voce e um assistente de reunioes. Gere resumo em ate 5 bullets, decisoes e proximos passos.",
      version: 1,
      isActive: true,
      modelHint: "gemma3:4b",
    },
  });

  const actionItemsPrompt = await prisma.prompt.create({
    data: {
      slug: "action_items",
      title: "Extracao de tarefas",
      description: "Identifica tarefas acionaveis com prazo e responsavel.",
      promptText:
        "Extraia tarefas da transcricao com prioridade, responsavel e prazo quando houver contexto.",
      version: 1,
      isActive: true,
      modelHint: "gemma3:4b",
    },
  });

  await prisma.promptVersion.createMany({
    data: [
      {
        promptId: summaryPrompt.id,
        version: 1,
        promptText:
          "Voce e um assistente de reunioes. Gere resumo em ate 5 bullets, decisoes e proximos passos.",
        description: "Versao inicial de resumo",
        createdById: admin.id,
      },
      {
        promptId: actionItemsPrompt.id,
        version: 1,
        promptText:
          "Extraia tarefas da transcricao com prioridade, responsavel e prazo quando houver contexto.",
        description: "Versao inicial de tarefas",
        createdById: admin.id,
      },
    ],
  });

  await prisma.meetingAnalysis.create({
    data: {
      meetingId: meeting1.id,
      promptId: summaryPrompt.id,
      createdById: admin.id,
      modelUsed: "gemma3:4b",
      inputTextHash: "seed-hash-1",
      outputText: "Resumo gerado via seed para validar trilha de analises por prompt.",
    },
  });

  console.log("Seed concluído com sucesso.");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
