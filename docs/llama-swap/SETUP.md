# llama-swap + Ollama + cliente OpenAI (Minute.IO)

## Visão geral

1. **Ollama** — API compatível com OpenAI em `http://127.0.0.1:11434/v1`.
2. **llama-swap** — outra API OpenAI em `http://localhost:8080/v1`; troca o upstream conforme o campo `model`.
3. O backend Minute.IO pode usar `OPENAI_BASE_URL=http://localhost:8080/v1` + pacote `openai`.

---

## Caminho recomendado: **sem Docker**

### 1) Ollama

```bash
ollama serve
```

Em outro terminal:

```bash
ollama pull llama3:70b
ollama pull mistral
ollama pull gemma2:27b
```

(Ajuste os nomes ao que você realmente usa, ex.: `gemma3:4b`.)

### 2) llama-swap (binário no Mac / Linux)

**macOS (Homebrew):**

```bash
brew tap mostlygeek/llama-swap
brew install llama-swap
```

Copie o exemplo e edite se precisar:

```bash
cp docs/llama-swap/config.example.yaml ./llama-swap-config.yaml
llama-swap --config ./llama-swap-config.yaml --listen localhost:8080
```

O arquivo padrão usa **`http://127.0.0.1:11434/v1`** — correto quando Ollama e llama-swap rodam na mesma máquina, sem Docker.

**Binário:** baixe em [Releases · mostlygeek/llama-swap](https://github.com/mostlygeek/llama-swap/releases) e rode o mesmo comando com `--config` e `--listen`.

### 3) Backend Minute.IO (`server/.env`)

```env
OPENAI_BASE_URL=http://localhost:8080/v1
OPENAI_API_KEY=sk-local-no-key
LLM_DEFAULT_MODEL=gpt-4
```

(Se você habilitar `apiKeys` no yaml do llama-swap, use a mesma chave em `OPENAI_API_KEY`.)

### 4) Teste

**Não abra só `http://localhost:8080/v1` no navegador** — isso gera **404** (rota inexistente). É normal.

Use um destes:

```bash
# Saúde do proxy
curl -s http://localhost:8080/health

# Lista de modelos expostos
curl -s http://localhost:8080/v1/models

# Chat (use um modelo/alias do seu config.yaml)
curl -s http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4","messages":[{"role":"user","content":"Olá"}],"stream":false}'
```

---

## Código TypeScript no projeto

Classe: `server/src/infrastructure/llm/LlamaSwapOpenAIClient.ts`

---

## Opcional: Docker (só quando quiser)

Só use se o Docker Desktop estiver rodando. Se o Ollama ficar no **host** e o llama-swap no **container**, no `config.yaml` use:

`ollama_openai_base: "http://host.docker.internal:11434/v1"` (Mac/Windows)  
Linux: `--add-host=host.docker.internal:host-gateway` no `docker run`.

---

## Spring Boot

Exemplo: `docs/llama-swap/SpringBootChatClient.java`
