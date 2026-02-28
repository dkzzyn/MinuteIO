# MinuteIO Server (Ollama)

Backend que chama o **Ollama** para:

1. **Análise de reunião (1 em 1 minuto)** – devolve `MinuteInsight` (summary, decisions, tasks, key_points, sentiment).
   - `POST /api/meetings/analyze-minute` – analisa um minuto (retorna JSON; não persiste).
   - `GET /api/meetings/:id/insights/view` – visão agregada da reunião (resumo, decisões, tarefas, pontos + timeline).
   - `POST /api/meetings/:id/insights/view/minutes` – adiciona um `MinuteInsight` já analisado.
   - `POST /api/meetings/:id/insights/view/analyze-minute` – analisa 1 minuto com Ollama e persiste.
   - `PATCH /api/meetings/:id/insights/view/tasks` – marca tarefa como feita/não feita.
   - `GET /api/meetings/:id/clips` – clipes persistidos da reunião.
   - `GET /api/meetings/:id/insights` – insights persistidos da reunião.
2. **Auth e Posts**
   - `POST /api/auth/register`
   - `POST /api/auth/login`
   - `GET/POST/PUT/DELETE /api/posts`
3. **Reuniões (persistidas no PostgreSQL)**
   - `POST /api/meetings`
   - `GET /api/meetings`
   - `GET /api/meetings/:id`
2. **Simulador de vendas** (cliente IA) – `POST /api/training/simulator/turn`
3. **Treino de objeções** – `POST /api/training/objections/evaluate`
4. **Resumo do dashboard de Treinamentos** – `POST /api/training/dashboard/summary`

## Pré-requisitos

- [Ollama](https://ollama.com) instalado e rodando em `http://localhost:11434`
- Um modelo puxado, ex.: `ollama pull llama3.2`

## Uso

```bash
cd server
npm install
npm run dev
```

O servidor sobe em `http://localhost:3001`. Variáveis de ambiente opcionais:

- `PORT` – porta (padrão 3001)
- `DATABASE_URL` – conexão PostgreSQL (Prisma)
- `JWT_SECRET` / `JWT_EXPIRES_IN` – autenticação
- `OLLAMA_URL` – URL do Ollama (padrão `http://localhost:11434`)
- `OLLAMA_MODEL` – modelo (padrão `llama3.2`)

## Prisma

```bash
cd server
npm run prisma:migrate
npm run prisma:seed
npm run prisma:studio
```

## Frontend

No projeto principal (Vite), configure no `.env`:

```
VITE_OLLAMA_API_URL=http://localhost:3001
```

As páginas de Treinamentos e a análise de reunião podem chamar `src/services/ollamaApi.ts` quando o backend estiver no ar; caso contrário, continuam com dados mock.

## Blocos de responsabilidade

- **`ollama/prompts.ts`** – prompts de sistema por modo (não incluir dados sensíveis).
- **`ollama/types.ts`** – tipos de entrada/saída (reutilizáveis).
- **`ollama/ollamaService.ts`** – chamadas HTTP ao Ollama e parsing do JSON de resposta.
- **`src/index.ts`** – rotas Express que recebem o body e chamam o serviço.
