# Grimoire

Companion app para D&D 5e: criação guiada de personagem, consulta de regras
via RAG (fiel ao SRD 5.1) e diário de campanha com entrada por áudio.

100% local-first em desenvolvimento — sem custo, sem API keys obrigatórias.
PostgreSQL/pgvector e Redis rodam em Docker; LLM, embeddings e transcrição
rodam nativamente via Ollama e whisper.cpp.

## Stack

Expo (React Native) · Fastify · PostgreSQL + pgvector · Drizzle ORM · Ollama
(Llama 3.1 8B + nomic-embed-text) · whisper.cpp · Docker Compose.

Ver [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para detalhes.

## Setup

Pré-requisitos: Docker Desktop (WSL2), [Ollama](https://ollama.com), Node.js
≥ 20, ffmpeg, binário whisper.cpp em `./bin/`.

Primeira vez (baixa modelos Ollama/whisper e faz a ingestão do SRD):

```bash
cp .env.example .env
bash scripts/setup.sh
```

Dia a dia (sobe Docker Desktop se preciso, Postgres + Redis, e o servidor):

```bash
bash scripts/dev-up.sh
```

## Estrutura

```
apps/mobile/     # App Expo
server/          # API Fastify
packages/shared/ # Schemas Zod e tipos compartilhados
docker/          # Docker Compose (Postgres + pgvector, Redis)
docs/            # Arquitetura, API, pipeline RAG
```

## Status

Fase 1 (Fundação) concluída. Ver
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#status-de-implementação) para o
progresso das próximas fases.
