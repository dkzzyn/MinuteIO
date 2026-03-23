# Rotas candidatas — varredura expandida (Minute.IO)

Lista de **endpoints que ainda não existem** (ou existem só no mock/UI) mas fazem sentido no produto, com base em Prisma, páginas e comentários `TODO` no código.

Para o que **já está** implementado, ver `server/src/presentation/http/apiCatalog.ts` e `GET /api/catalog`.

---

## A. Auth & conta

| Método | Rota sugerida | Motivo |
|--------|----------------|--------|
| `POST` | `/api/auth/refresh` | Refresh token ou rotação de sessão (hoje só JWT longo). |
| `POST` | `/api/auth/logout` | Opcional: invalidar refresh / registrar evento de auditoria. |
| `POST` | `/api/auth/forgot-password` | `ForgotPasswordPage` é placeholder (“em breve”). |
| `POST` | `/api/auth/reset-password` | Completar fluxo com token de e-mail. |
| `POST` | `/api/auth/verify-email` | Se registo passar a exigir e-mail. |
| `GET` | `/api/auth/sessions` | Listar sessões ativas (multi-dispositivo). |
| `DELETE` | `/api/auth/sessions/:id` | Revogar uma sessão. |

---

## B. Perfil & preferências (User no Prisma)

Hoje: `GET/PUT /api/me` (nome, avatar).

| Método | Rota sugerida | Motivo |
|--------|----------------|--------|
| `PATCH` | `/api/me` | Atualização parcial (vs PUT completo). |
| `GET` | `/api/me/preferences` | Tema, sidebar, agente default — hoje em `localStorage` (`AgentsPage`, `ThemeToggle`, `SidebarContext`). |
| `PUT` | `/api/me/preferences` | Persistir preferências no servidor (sync entre dispositivos). |
| `POST` | `/api/me/avatar` | Upload direto (hoje só `avatarUrl` string). |
| `PUT` | `/api/me/password` | Alterar senha autenticado (diferente de reset por e-mail). |

---

## C. Reuniões (lacunas vs modelo `Meeting`)

Existe CRUD parcial: criar, listar, detalhe, clips, insights, chunks, analyses. **Não há** atualização/remoção da reunião inteira na API do router.

| Método | Rota sugerida | Motivo |
|--------|----------------|--------|
| `PATCH` | `/api/meetings/:id` | Editar título, datas, status, participantes, `postId`, etc. |
| `DELETE` | `/api/meetings/:id` | Arquivar ou apagar (cascade clips/insights no Prisma). |
| `POST` | `/api/meetings/:id/duplicate` | Clonar reunião / template. |
| `GET` | `/api/meetings/:id/export` | PDF/ICS/transcrição (query: `format`). |
| `POST` | `/api/meetings/:id/share` | Link público ou convite leitor (se produto precisar). |

---

## D. Times & convites (modelo `Team` / `TeamInvitation`)

Hoje: listar times do owner, criar time, convidar, aceitar/recusar convite.

| Método | Rota sugerida | Motivo |
|--------|----------------|--------|
| `GET` | `/api/teams/:id` | Detalhe do time (nome, owner, estatísticas). |
| `PATCH` | `/api/teams/:id` | Renomear / metadados. |
| `DELETE` | `/api/teams/:id` | Dissolver time (com regras de negócio). |
| `GET` | `/api/teams/:id/invites` | Convites pendentes **do** time (visão owner; hoje só fluxo “meus convites”). |
| `DELETE` | `/api/invites/:id` | Cancelar convite pendente (quem enviou). |
| `GET` | `/api/teams/:id/members` | **Requer modelo** `TeamMember` no Prisma se quiser membros além de owner + invites. |

---

## E. CRM — clientes (`clientsStore` + `localStorage`)

Sem tabela Prisma dedicada; dados só no browser.

| Método | Rota sugerida | Motivo |
|--------|----------------|--------|
| `GET` | `/api/clients` | Lista com filtros (empresa, owner). |
| `POST` | `/api/clients` | Criar cliente. |
| `GET` | `/api/clients/:id` | Detalhe. |
| `PATCH` | `/api/clients/:id` | Atualizar. |
| `DELETE` | `/api/clients/:id` | Remover / arquivar. |
| `GET` | `/api/clients/:id/meetings` | Ligação explícita reunião ↔ cliente (hoje participantes são strings). |

---

## F. Tokens, planos & billing (`companyTokensStore`, `PaymentsPlansPage`)

Tudo mock no front.

| Método | Rota sugerida | Motivo |
|--------|----------------|--------|
| `GET` | `/api/billing/plan` | Plano atual, limites. |
| `GET` | `/api/billing/usage` | Tokens/créditos do ciclo (substitui `getCompanyTokens`). |
| `GET` | `/api/billing/usage/entries` | Histórico filtrável (`getTokenUsageEntries`). |
| `POST` | `/api/billing/checkout` | Iniciar Stripe/checkout (retorna URL ou clientSecret). |
| `POST` | `/api/billing/webhooks/stripe` | Webhook assinado (sem JWT de utilizador). |

---

## G. Relatórios (`reportsService.ts`)

Hoje agrega **no cliente** a partir de `listMeetings` + `getMeetingDetails` (KPIs parcialmente fixos, ex. `positiveSentiment: 65`).

| Método | Rota sugerida | Motivo |
|--------|----------------|--------|
| `GET` | `/api/reports/kpis` | KPIs com deltas reais (período vs período). |
| `GET` | `/api/reports/meetings-by-day` | Agregação no servidor (menos payload). |
| `GET` | `/api/reports/sentiment-over-time` | Séries temporais a partir de insights/analyses. |
| `GET` | `/api/reports/history` | Tabela paginada de histórico. |
| `GET` | `/api/reports/export` | CSV/Excel para admins. |

---

## H. Treinamentos (mocks + rotas parciais)

Já existem: `POST /api/training/simulator/turn`, `objections/evaluate`, `dashboard/summary` (sem auth).

Comentários no código apontam para rotas **ainda não alinhadas** com o que a UI usa:

| Método | Rota sugerida | Onde surge no código |
|--------|----------------|----------------------|
| `POST` | `/api/training/simulations/message` | `mockData.ts`, `TrainingSimulatorPage` (“em produção chamar…”) — nome diferente de `simulator/turn`. |
| `GET` | `/api/training/product/progress` | `TrainingHubPage` TODO — lições concluídas. |
| `GET` | `/api/training/hub` | Cards do hub (módulos, estado). |
| `POST` | `/api/training/lessons/:id/complete` | Marcar lição como feita. |
| `GET` | `/api/training/dashboards/me` | Substituir `trainingDashboardMock` por dados do utilizador. |
| `POST` | `/api/training/objections/evaluate` | Já existe — alinhar `TrainingObjectionsPage` (há TODO para ligar ao POST). |

---

## I. Agentes & prompts (extensões)

Já há CRUD base de agentes e prompts.

| Método | Rota sugerida | Motivo |
|--------|----------------|--------|
| `DELETE` | `/api/agents/:id` | Remover agente (hoje só PATCH). |
| `POST` | `/api/agents/:id/duplicate` | Clonar configuração. |
| `GET` | `/api/prompts/:id` | Detalhe por id (há slug/latest e lista). |
| `PATCH` | `/api/prompts/:id` | Ativar/desativar sem nova versão. |

---

## J. Admin / RBAC (`User.role`)

Campo `role` existe; rotas admin podem ser escassas.

| Método | Rota sugerida | Motivo |
|--------|----------------|--------|
| `GET` | `/api/admin/users` | Lista utilizadores (admin). |
| `PATCH` | `/api/admin/users/:id` | `role`, `isActive`. |
| `GET` | `/api/admin/metrics` | Uso global, erros, LLM. |

---

## K. Sistema, integrações & DX

| Método | Rota sugerida | Motivo |
|--------|----------------|--------|
| `GET` | `/api/openapi.json` ou `/api/docs` | Spec OpenAPI gerada ou estática. |
| `GET` | `/api/version` | Git SHA / build (deploy). |
| `POST` | `/api/internal/jobs/:name` | Tarefas agendadas protegidas por secret (se usar workers). |
| `POST` | `/api/webhooks/meeting-completed` | Integração Zapier/Make (futuro). |

---

## L. Mapa rápido: origem → candidato

| Origem no repo | Candidatos principais |
|----------------|------------------------|
| `prisma/schema.prisma` | PATCH/DELETE meeting; membros de time; entidade Client; Usage/Billing |
| `clientsStore.ts` | `/api/clients/*` |
| `companyTokensStore.ts` + `PaymentsPlansPage` | `/api/billing/*` |
| `reportsService.ts` | `/api/reports/*` |
| `Training/*` + `mockData.ts` | progress, simulations/message, dashboards |
| `ForgotPasswordPage` | forgot + reset password |
| `TODO` em `TrainingObjectionsPage` | ligar UI a `POST .../objections/evaluate` |
| Preferências em `localStorage` | `/api/me/preferences` |

---

*Atualizar este ficheiro quando fechar gaps ou renomear rotas para manter consistência com `apiCatalog.ts`.*
