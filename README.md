# MinuteIO

App de reuniões e insights com IA: relatórios, call intelligence, clientes (mini-CRM) e configurações, com foco no modelo de pensamento ollama.

## Desenvolvimento

```bash
# frontend
npm install
npm run dev

# backend (em outro terminal)
cd server
npm install
npm run dev
```

## Banco (PostgreSQL + Prisma)

```bash
cd server
npm run prisma:migrate
npm run prisma:seed
```

Variáveis importantes:

- Front: `VITE_OLLAMA_API_URL` em `.env`
- Back: `DATABASE_URL`, `JWT_SECRET`, `OLLAMA_URL`, `OLLAMA_MODEL` em `server/.env`

## Build

```bash
npm run build
npm run preview
```

## Docker (frontend + backend + postgres)

```bash
docker compose up --build
```

Serviços:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Postgres: `localhost:5432` (`admin` / `123456`, DB `meu_app`)

Para rodar migrations/seed dentro do backend localmente:

```bash
cd server
npm run prisma:migrate
npm run prisma:seed
```
