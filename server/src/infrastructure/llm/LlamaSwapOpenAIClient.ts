/**
 * OpenAI-compatible client aimed at llama-swap (local LLM hot-swap proxy).
 * Comments in English per project convention.
 */

import "dotenv/config";
import OpenAI from "openai";
import type { ChatCompletionChunk, ChatCompletionMessageParam } from "openai/resources/chat/completions";

export type LlamaSwapClientConfig = {
  /** Base URL for OpenAI-compatible API (include /v1). Default: http://localhost:8080/v1 */
  baseUrl: string;
  /** Sent as Bearer; use any non-empty string if llama-swap has no apiKeys */
  apiKey: string;
  /** Default model id when chat()/stream() omit model */
  defaultModel: string;
  /** Map app-level names to upstream model ids (optional) */
  modelMap?: Record<string, string>;
  maxRetries: number;
  retryBaseDelayMs: number;
  timeoutMs: number;
};

const DEFAULT_CONFIG: Omit<LlamaSwapClientConfig, "apiKey"> = {
  baseUrl: process.env.OPENAI_BASE_URL ?? "http://localhost:8080/v1",
  defaultModel: process.env.LLM_DEFAULT_MODEL ?? "gpt-4",
  modelMap: {
    "gpt-4": "gpt-4",
    "gpt-3.5-turbo": "gpt-3.5-turbo",
    gemma: "gemma",
    mistral: "mistral",
  },
  maxRetries: Number(process.env.LLM_MAX_RETRIES ?? 3),
  retryBaseDelayMs: Number(process.env.LLM_RETRY_BASE_MS ?? 500),
  timeoutMs: Number(process.env.LLM_TIMEOUT_MS ?? 120_000),
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || (status >= 500 && status <= 599);
}

function resolveModel(requested: string | undefined, cfg: LlamaSwapClientConfig): string {
  const raw = requested?.trim() || cfg.defaultModel;
  const mapped = cfg.modelMap?.[raw] ?? cfg.modelMap?.[raw.toLowerCase()];
  return mapped ?? raw;
}

export class LlamaSwapOpenAIClient {
  private readonly openai: OpenAI;
  private readonly cfg: LlamaSwapClientConfig;

  constructor(partial?: Partial<LlamaSwapClientConfig>) {
    const apiKey = partial?.apiKey ?? process.env.OPENAI_API_KEY ?? "sk-local-no-key";
    this.cfg = {
      ...DEFAULT_CONFIG,
      ...partial,
      apiKey,
      modelMap: { ...DEFAULT_CONFIG.modelMap, ...partial?.modelMap },
    };

    this.openai = new OpenAI({
      baseURL: this.cfg.baseUrl.replace(/\/$/, ""),
      apiKey: this.cfg.apiKey,
      maxRetries: 0,
      timeout: this.cfg.timeoutMs,
    });
  }

  getConfig(): Readonly<LlamaSwapClientConfig> {
    return { ...this.cfg };
  }

  /** Resolve logical model name to the string sent in the "model" field. */
  mapModel(model?: string): string {
    return resolveModel(model, this.cfg);
  }

  private async withRetries<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= this.cfg.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        const status = err instanceof OpenAI.APIError ? err.status : undefined;
        const retryable =
          err instanceof OpenAI.APIError
            ? status != null && isRetryableStatus(status)
            : err instanceof TypeError; // network
        if (!retryable || attempt === this.cfg.maxRetries) break;
        const delay = this.cfg.retryBaseDelayMs * 2 ** attempt;
        await sleep(delay);
      }
    }
    throw lastError;
  }

  async chat(params: {
    messages: ChatCompletionMessageParam[];
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<string> {
    const model = resolveModel(params.model, this.cfg);
    const completion = await this.withRetries(() =>
      this.openai.chat.completions.create({
        model,
        messages: params.messages,
        temperature: params.temperature,
        max_tokens: params.maxTokens,
        stream: false,
      })
    );
    const text = completion.choices[0]?.message?.content;
    return typeof text === "string" ? text : "";
  }

  /**
   * Streaming chat completions (SSE). Yields text deltas.
   */
  async *stream(params: {
    messages: ChatCompletionMessageParam[];
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): AsyncGenerator<string, void, unknown> {
    const model = resolveModel(params.model, this.cfg);
    const stream = await this.withRetries(() =>
      this.openai.chat.completions.create({
        model,
        messages: params.messages,
        temperature: params.temperature,
        max_tokens: params.maxTokens,
        stream: true,
      })
    );

    for await (const chunk of stream as AsyncIterable<ChatCompletionChunk>) {
      const delta = chunk.choices[0]?.delta?.content;
      if (typeof delta === "string" && delta.length > 0) yield delta;
    }
  }
}
