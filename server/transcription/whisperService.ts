/**
 * Serviço de transcrição de áudio usando Whisper.
 * Suporta: Whisper local (whisper.cpp CLI) ou API externa.
 * Configure WHISPER_MODE no .env: "local" | "api" | "mock"
 */
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

const WHISPER_MODE = process.env.WHISPER_MODE ?? "mock";
const WHISPER_MODEL = process.env.WHISPER_MODEL ?? "base";
const WHISPER_API_URL = process.env.WHISPER_API_URL ?? "";
const WHISPER_API_KEY = process.env.WHISPER_API_KEY ?? "";

export interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
}

/**
 * Transcreve um arquivo de áudio.
 * @param audioPath Caminho absoluto do arquivo de áudio
 */
export async function transcribeAudio(audioPath: string): Promise<TranscriptionResult> {
  if (!fs.existsSync(audioPath)) {
    throw new Error(`Arquivo de áudio não encontrado: ${audioPath}`);
  }

  switch (WHISPER_MODE) {
    case "local":
      return transcribeWithWhisperLocal(audioPath);
    case "api":
      return transcribeWithWhisperAPI(audioPath);
    case "mock":
    default:
      return transcribeMock(audioPath);
  }
}

/**
 * Mock: retorna transcrição fake para testes sem Whisper instalado.
 */
async function transcribeMock(audioPath: string): Promise<TranscriptionResult> {
  const filename = path.basename(audioPath);
  console.log(`[Whisper Mock] Simulando transcrição de: ${filename}`);
  
  await new Promise((r) => setTimeout(r, 500));
  
  return {
    text: `[Transcrição simulada do arquivo ${filename}] O cliente mencionou que precisa de uma solução até o final do mês. Ficou acordado que vamos enviar a proposta revisada até sexta-feira. A equipe técnica vai preparar um ambiente de testes.`,
    language: "pt",
    duration: 60,
  };
}

/**
 * Whisper local via CLI (whisper.cpp ou openai-whisper).
 * Requer whisper instalado e no PATH.
 */
async function transcribeWithWhisperLocal(audioPath: string): Promise<TranscriptionResult> {
  const outputDir = path.dirname(audioPath);
  const baseName = path.basename(audioPath, path.extname(audioPath));
  
  try {
    const cmd = `whisper "${audioPath}" --model ${WHISPER_MODEL} --language pt --output_format txt --output_dir "${outputDir}"`;
    console.log(`[Whisper Local] Executando: ${cmd}`);
    
    const { stderr } = await execAsync(cmd, { timeout: 120000 });
    if (stderr) console.warn("[Whisper Local] stderr:", stderr);
    
    const txtPath = path.join(outputDir, `${baseName}.txt`);
    if (!fs.existsSync(txtPath)) {
      throw new Error("Arquivo de transcrição não gerado");
    }
    
    const text = fs.readFileSync(txtPath, "utf-8").trim();
    fs.unlinkSync(txtPath);
    
    return { text, language: "pt" };
  } catch (err) {
    console.error("[Whisper Local] Erro:", err);
    throw new Error(`Falha na transcrição local: ${err instanceof Error ? err.message : err}`);
  }
}

/**
 * Whisper via API externa (ex.: OpenAI Whisper API ou servidor próprio).
 */
async function transcribeWithWhisperAPI(audioPath: string): Promise<TranscriptionResult> {
  if (!WHISPER_API_URL) {
    throw new Error("WHISPER_API_URL não configurado");
  }
  
  const audioBuffer = fs.readFileSync(audioPath);
  const filename = path.basename(audioPath);
  
  const formData = new FormData();
  formData.append("file", new Blob([audioBuffer]), filename);
  formData.append("model", "whisper-1");
  formData.append("language", "pt");
  
  const headers: Record<string, string> = {};
  if (WHISPER_API_KEY) {
    headers["Authorization"] = `Bearer ${WHISPER_API_KEY}`;
  }
  
  const res = await fetch(WHISPER_API_URL, {
    method: "POST",
    headers,
    body: formData,
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Whisper API error ${res.status}: ${text}`);
  }
  
  const data = await res.json() as { text?: string };
  return { text: data.text ?? "", language: "pt" };
}
