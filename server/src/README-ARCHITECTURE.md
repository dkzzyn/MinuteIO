## Estrutura Clean (Etapa 1)

- `domain/`: entidades e contratos (interfaces de repositório)
- `application/`: casos de uso
- `infrastructure/`: Prisma, banco e integrações externas
- `presentation/`: rotas/controladores HTTP

Nesta etapa, os endpoints existentes de Ollama/insights permanecem em `src/index.ts`
para evitar quebra de comportamento.
