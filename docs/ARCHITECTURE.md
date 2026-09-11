# Arquitetura — Grimoire

## Visão geral

Grimoire é um monorepo (Turborepo + npm workspaces) com três pacotes principais:

- `apps/mobile` — app Expo (React Native) para jogadores/mestres.
- `server` — API Fastify que expõe personagens, regras (RAG) e diário de campanha.
- `packages/shared` — schemas Zod, tipos e constantes compartilhadas entre mobile e server.

Tudo roda localmente por padrão: PostgreSQL + pgvector e Redis em Docker, LLM e
embeddings via Ollama nativo, transcrição via whisper.cpp nativo. Nenhuma API
key é obrigatória para o MVP funcionar (ver Restrições no prompt original do
projeto).

## Stack

| Camada | Tecnologia |
| --- | --- |
| Mobile | Expo (React Native) + Expo Router + Zustand + NativeWind |
| Backend | Node.js 20+ / Fastify / TypeScript strict |
| Banco | PostgreSQL 16 + pgvector (Docker) |
| ORM | Drizzle ORM |
| LLM / Embedding | Ollama (Llama 3.1 8B + nomic-embed-text) |
| Transcrição | whisper.cpp (modelo `base`) |
| Fila | BullMQ + Redis |

## Convenção de erros

Erros de negócio estendem `AppError` (`server/src/errors.ts`), com `code` e
`statusCode` próprios. O handler global (`server/src/plugins/error-handler.ts`)
converte qualquer erro na resposta padrão:

```json
{ "success": false, "error": { "code": "...", "message": "..." } }
```

## Setup local

Pré-requisitos: Docker Desktop (WSL2), Ollama nativo, Node.js ≥ 20, ffmpeg,
binário whisper.cpp em `./bin/`.

```bash
cp .env.example .env
bash scripts/setup.sh
```

O script `scripts/setup.sh` sobe o Docker Compose, baixa os modelos do Ollama,
baixa o modelo whisper.cpp, instala as dependências, aplica o schema do banco
(Drizzle) e roda a ingestão do SRD 5.1 se o PDF estiver presente em
`./data/pdf`. Rodar apenas na primeira vez (ou quando os modelos mudarem).

No dia a dia, usar `bash scripts/dev-up.sh`: garante que o Docker Desktop está
rodando (inicia se preciso, espera o engine ficar pronto), sobe Postgres +
Redis, espera o Postgres ficar saudável e então sobe o servidor com
`npm run dev`.

## Status de implementação

- [x] Fase 1 — Fundação (monorepo, Docker, Fastify + health check, shared, Drizzle schema)
- [ ] Fase 2 — RAG Pipeline
- [ ] Fase 3 — App Mobile (shell)
- [ ] Fase 4 — Criação de Personagem
- [ ] Fase 5 — Chat de Regras
- [ ] Fase 6 — Diário de Campanha
- [ ] Fase 7 — Polish

## Migração futura para VPS

A arquitetura foi desenhada para permitir migração para uma VPS Linux
(Hostinger) sem refatoração: tudo é configurável via env vars, a LLM segue
adapter pattern (Ollama ↔ Gemini/Groq), e o armazenamento de áudio será
abstraído atrás de uma interface (`saveAudio`/`getAudio`/`deleteAudio`) quando
o módulo de diário for implementado (Fase 6). Nenhum serviço AWS-specific é
usado. Ver o prompt original do projeto para o plano completo de deploy.
