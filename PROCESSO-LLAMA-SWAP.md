# Processo completo: llama-swap + Ollama + Minute.IO (sem Docker)

## O que foi ligado no código

- Se **`OPENAI_BASE_URL`** existir no `server/.env`, o backend usa **Chat Completions** (llama-swap).
- Se **não** existir, continua usando **Ollama** em `OLLAMA_URL` + `/api/chat`.

## Passo a passo (você só executa nesta ordem)

### 1. Ollama

```bash
ollama serve
```

Outro terminal:

```bash
ollama pull gemma3:4b
# opcional: ollama pull llama3.2
```

### 2. llama-swap (na raiz do projeto Minute.IO)

```bash
cd /Users/diogosilva/Minute.IO
npm run llama-swap
```

(Isso usa `llama-swap-config.yaml` na raiz. Edite `useModelName` se o seu modelo for outro — confira com `ollama list`.)

### 3. Backend — `server/.env`

Adicione (ou descomente) **exatamente** isto:

```env
OPENAI_BASE_URL=http://localhost:8080/v1
OPENAI_API_KEY=sk-local-no-key
OLLAMA_MODEL=gpt-4
```

`gpt-4` é o **alias** definido no `llama-swap-config.yaml` para o `gemma3:4b`.

### 4. Subir o Minute.IO

```bash
cd /Users/diogosilva/Minute.IO
npm run dev:all
```

### 5. Teste rápido do proxy

```bash
curl -s http://localhost:8080/health
curl -s http://localhost:8080/v1/models
```

## Voltar ao Ollama direto (sem swap)

No `server/.env`:

- Remova ou comente `OPENAI_BASE_URL` e `OPENAI_API_KEY`.
- Defina `OLLAMA_MODEL` com o nome real do modelo (ex.: `gemma3:4b`).

## Arquivos importantes

| Arquivo | Função |
|---------|--------|
| `llama-swap-config.yaml` | Config do proxy (raiz do repo) |
| `server/ollama/ollamaService.ts` | Troca automática Ollama ↔ OpenAI-compat |
| `docs/llama-swap/SETUP.md` | Detalhes e troubleshooting |
