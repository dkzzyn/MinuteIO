# Varredura: alvos para APIs, login e tokens (Minute.IO)

Documento gerado a partir da estrutura atual do repositório. Use como backlog de produto/engenharia.

**Varredura expandida de rotas ainda não implementadas:** ver [`ROTAS-CANDIDATAS.md`](./ROTAS-CANDIDATAS.md) (auth, CRM, billing, relatórios, treinos, admin, etc.).

---

## 1. Autenticação e tokens (hoje)

| Alvo | Onde | Estado | Notas |
|------|------|--------|--------|
| **Registro** | `POST /api/auth/register` | API pronta | `server/.../routes` + `authApi.registerUser` |
| **Login** | `POST /api/auth/login` | API pronta | Retorna `token` (JWT) + `user` |
| **JWT** | Header `Authorization: Bearer <token>` | Padrão | Emitido por `JwtTokenService`; validado em `authMiddleware` |
| **Perfil** | `GET/PUT /api/me` | API pronta | `profileApi` |
| **Armazenamento do token no browser** | `localStorage` chave `minuteio_auth_token` | Front | `AuthContext`, `apiRequest`, `meetingInsightsApi`, etc. |
| **Expiração / 401** | `api.ts` + `AuthContext` | Implementado | Limpa sessão e redireciona ao login |
| **Refresh token** | — | **Não existe** | Hoje só JWT de longa duração (`JWT_EXPIRES_IN`). Candidato: `POST /api/auth/refresh` |
| **Logout no servidor** | — | **Não existe** | JWT é stateless; “logout” só apaga no client. Candidato: blocklist Redis ou refresh rotativo |
| **Esqueci senha** | Tela `/forgot-password` | **Só UI** | Candidato: `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` |
| **OAuth / SSO** | — | **Não existe** | Candidato futuro: Google, Microsoft |

---

## 2. APIs REST já expostas no backend

Resumo por domínio (detalhe completo em `GET /api/catalog` com login).

| Domínio | Exemplos de rotas |
|---------|-------------------|
| Auth + perfil | `/api/auth/*`, `/api/me` |
| Posts | CRUD `/api/posts` |
| Reuniões | `/api/meetings`, clips, insights, chunks, analyses |
| IA (legado em `index.ts`) | `analyze-minute`, `insights/view`, `audio-chunk`, training simulator/objections |
| Agentes | `/api/agents`, config |
| Prompts | `/api/prompts`, versões |
| Times / convites | `/api/teams`, `/api/invites/*` |
| Sistema | `/api/health`, `/api/healthz`, `/api/catalog` |

---

## 3. Front: o que já chama API vs o que ainda é local

### Já integrado ao backend (Bearer JWT)

| Área | Ficheiros / serviços |
|------|----------------------|
| Login / registo | `authApi.ts` |
| Posts | `postsApi.ts`, `PostsPage` |
| Reuniões (lista, detalhe, criar) | `api.ts` (`listMeetings`, `getMeeting`, …) |
| Insights / áudio / view | `meetingInsightsApi.ts`, `useAudioCapture.ts` |
| Perfil | `profileApi.ts` |
| Agentes | `agentsApi.ts` |
| Times | `teamsApi.ts`, aba Time no perfil |
| Catálogo de APIs | `catalogApi.ts`, página `/apis` |
| Ollama “ping” | `ollamaApi.ts` → `/api/health` |

### Ainda **não** é API (candidatos fortes)

| Alvo | Onde | Ideia de API futura |
|------|------|---------------------|
| **Clientes / CRM** | `clientsStore.ts` + `localStorage` por `userId` | `GET/POST/PUT/DELETE /api/clients` com `companyId`/`userId` |
| **Tokens de empresa / consumo IA (mock)** | `companyTokensStore.ts` | `GET /api/usage/tokens`, eventos de consumo |
| **Treinamento – dados mock** | `TrainingHubPage`, `mockData.ts`, `trainingDashboardMock.ts` | Endpoints de progresso, histórico, notas |
| **Relatórios** | `reportsService.ts` (pode misturar mock + meetings) | `GET /api/reports/...` agregados |
| **Pagamentos / planos** | `PaymentsPlansPage` (provável mock) | Stripe/webhook + `GET /api/billing` |
| **Agente selecionado** | `localStorage` em `AgentsPage` | Opcional: `PUT /api/me/preferences` |
| **Tema** | `localStorage` `theme` | Pode ficar só no client ou `PUT /api/me` com `preferences` JSON |
| **Sidebar recolhida** | `SidebarContext` | Idem |

---

## 4. Segurança e boas práticas (checklist)

- [ ] **HTTPS** em produção; nunca enviar JWT em query string.
- [ ] **CORS** restrito ao domínio do front em prod.
- [ ] **JWT_SECRET** forte e único por ambiente (`server/.env`).
- [ ] **Rate limit** em `POST /api/auth/login` e `register` (anti brute-force).
- [ ] **Refresh tokens** ou sessões curtas + silent refresh se app mobile/PWA.
- [ ] **Upload de áudio**: limite de tamanho, tipo MIME, antivírus opcional.
- [ ] **Roles** (`admin`, `supervisor`, `user`) já usados em partes do backend; alinhar todas as rotas sensíveis.

---

## 5. Priorização sugerida (roadmap curto)

1. **Refresh token ou aumentar UX de re-login** — já mitigado com 30d + limpeza em 401; refresh é o passo “enterprise”.
2. **Clientes no PostgreSQL** — maior valor: dados partilháveis e backup (hoje `localStorage`).
3. **Forgot/reset password** — completa o fluxo de auth.
4. **Treinamentos** — substituir mocks por `GET/POST` persistidos.
5. **OpenAPI/Swagger** — gerar spec a partir do catálogo ou Zod para integrações externas.

---

## 6. Referências rápidas no código

| Conceito | Local |
|----------|--------|
| Middleware JWT | `server/src/presentation/http/middlewares/authMiddleware.ts` |
| Emissão JWT no login | `server/src/application/use-cases/auth/LoginUser.ts` |
| Cliente HTTP + 401 | `src/infrastructure/http/api.ts` |
| Sessão React | `src/context/AuthContext.tsx` |
| Lista oficial de rotas (JSON) | `server/src/presentation/http/apiCatalog.ts` |

---

*Última varredura: estrutura do repo Minute.IO (Express + Prisma + React). Atualize este ficheiro quando criar rotas novas.*
