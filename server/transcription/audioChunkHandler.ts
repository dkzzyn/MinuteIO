/**
 * Handler para processar chunks de áudio de reuniões.
 * Fluxo: recebe áudio → transcreve (Whisper) → analisa (Ollama) → persiste insight.
 */
import type { Request, Response } from "express";
import type { Options, FileFilterCallback } from "multer";
import fs from "fs";
import path from "path";
import { transcribeAudio } from "./whisperService";
import { analyzeMeetingMinute } from "../ollama/ollamaService";
import { saveMinuteInsight, getMeetingInsightsView } from "../meetingInsightsService";
import { prisma } from "../src/infrastructure/database/prisma/client";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export interface AudioChunkBody {
  meetingContext?: string;
  minuteNumber?: number;
  title?: string;
}

/**
 * POST /api/meetings/:id/audio-chunk
 * Recebe arquivo de áudio (multipart), transcreve e gera insights.
 */
export async function handleAudioChunk(req: Request, res: Response) {
  const meetingId = req.params.id;
  const file = req.file;
  
  if (!file) {
    return res.status(400).json({ error: "Arquivo de áudio não enviado" });
  }
  
  const body = req.body as AudioChunkBody;
  const meetingContext = body.meetingContext ?? "Reunião em andamento";
  const minuteNumber = body.minuteNumber != null ? Number(body.minuteNumber) : 1;
  const title = body.title ?? "Reunião ao vivo";
  const userId = req.userId;
  
  console.log(`[AudioChunk] Recebido: meeting=${meetingId}, minute=${minuteNumber}, file=${file.originalname}`);
  
  try {
    const meetingExists = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meetingExists) {
      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado para criar reunião." });
      }
      await prisma.meeting.create({
        data: {
          id: meetingId,
          userId,
          postId: null,
          type: "online",
          title,
          description: null,
          durationMinutes: 30,
          language: "pt-BR",
          pipelineStage: "discovery",
          result: "Em andamento",
          participants: ["Cliente", "Vendedor"],
          winProbability: 0.5,
          objectionTypes: [],
          summary: "",
          datetimeStart: new Date(),
          datetimeEnd: null,
          status: "running",
          recordingUrl: null,
        },
      });
    }

    const transcription = await transcribeAudio(file.path);
    console.log(`[AudioChunk] Transcrição (${transcription.text.length} chars): ${transcription.text.slice(0, 100)}...`);
    
    if (!transcription.text.trim()) {
      fs.unlinkSync(file.path);
      return res.json({
        meetingId,
        minuteNumber,
        transcription: "",
        insight: null,
        message: "Áudio sem fala detectada",
      });
    }

    await prisma.meetingClip.upsert({
      where: {
        meetingId_index: {
          meetingId,
          index: minuteNumber,
        },
      },
      update: {
        startTime: Math.max(0, (minuteNumber - 1) * 60),
        endTime: minuteNumber * 60,
        transcript: transcription.text,
        processedByAi: false,
      },
      create: {
        meetingId,
        index: minuteNumber,
        startTime: Math.max(0, (minuteNumber - 1) * 60),
        endTime: minuteNumber * 60,
        transcript: transcription.text,
        processedByAi: false,
      },
    });
    
    const insight = await analyzeMeetingMinute({
      meetingContext,
      minuteNumber,
      transcriptChunk: transcription.text,
    });
    console.log(`[AudioChunk] Insight gerado: ${insight.summary.slice(0, 80)}...`);
    
    await saveMinuteInsight(meetingId, insight, title, req.userId);
    
    const view = await getMeetingInsightsView(meetingId, title);
    
    fs.unlinkSync(file.path);
    
    return res.json({
      meetingId,
      minuteNumber,
      transcription: transcription.text,
      insight,
      insightsView: view,
    });
  } catch (err) {
    console.error("[AudioChunk] Erro:", err);
    
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Erro ao processar áudio",
    });
  }
}

/**
 * Retorna configuração do multer para uploads de áudio.
 */
export function getAudioUploadConfig(): Options {
  return {
    dest: UPLOADS_DIR,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
      const allowedMimes = ["audio/webm", "audio/wav", "audio/mp3", "audio/mpeg", "audio/ogg", "audio/mp4", "audio/x-m4a"];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Tipo de arquivo não suportado: ${file.mimetype}`));
      }
    },
  };
}
