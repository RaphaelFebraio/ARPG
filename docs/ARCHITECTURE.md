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
- [x] Fase 2 — RAG Pipeline (ver [docs/RAG-PIPELINE.md](RAG-PIPELINE.md))
- [x] Fase 3 — App Mobile (shell)
- [x] Fase 4 — Criação de Personagem
- [x] Fase 5 — Chat de Regras
- [ ] Fase 6 — Diário de Campanha
- [ ] Fase 7 — Polish

## Notas do app mobile

`apps/mobile` é um projeto Expo (SDK 57) com Expo Router, NativeWind e os 4
tabs do produto (criar, grimório, diário, personagens) — por enquanto só
telas placeholder; a lógica de cada uma chega nas Fases 4-6.

`package.json` do mobile exclui `react` e `react-dom` do
`expo install --fix` de propósito: o tooling web do `expo-router` (via
`@expo/ui`/radix-ui) puxa `19.3.0` de ambos, fora da versão exata que o
SDK 57 recomenda (`19.2.3`) mas dentro do range aceito pelo `react-native`
(`^19.2.3`). Deixar o npm resolver tudo pra `19.3.0` evita uma cópia
duplicada real no bundle (que o `expo-doctor` trata como erro de build),
trocando isso por um aviso de compatibilidade inofensivo.

## Criação de personagem (Fase 4)

Wizard de 10 passos em `apps/mobile/app/(tabs)/create/` (raça → sub-raça* →
classe → antecedente → atributos → perícias → equipamento → magias* →
detalhes → resumo; \* pulado quando não se aplica), com estado em
`stores/useCharacterCreationStore.ts` (Zustand) e validação em
`utils/characterCreation.ts` (point buy, standard array, rolagem, HP, CA).

Dados estáticos do SRD (`packages/shared/src/data/`) foram transcritos
direto dos chunks reais já ingeridos no Postgres (Fase 2), não de memória —
inclusive uma descoberta relevante: **o SRD 5.1 (Creative Commons) só
publica 1 antecedente completo (Acolyte) e 1 sub-raça por raça** (sem
Mountain Dwarf, Wood Elf, Stout Halfling, Forest Gnome); o resto é exclusivo
do Livro do Jogador pago e foi deliberadamente deixado de fora.

CRUD em `server/src/routes/character.ts` — sem autenticação real ainda
(Fase 7), usa um "dev user" único (`server/src/services/dev-user.service.ts`)
até a autenticação de verdade existir.

### Duas armadilhas reais encontradas testando de ponta a ponta

1. **Metro não resolve import `.js` apontando pra `.ts`.** O server (tsx/Node
   ESM) exige que imports relativos do `shared` terminem em `.js` mesmo
   quando o arquivo real é `.ts`; o Metro (bundler do Expo) não tem essa
   regra e falha ao resolver esses mesmos imports. `apps/mobile/metro.config.js`
   tem um `resolveRequest` customizado que cai pra `.ts`/`.tsx` quando o
   `.js` literal não existe — sem isso, o app mobile não builda.
2. **Selector do Zustand que retorna objeto novo a cada chamada trava em
   loop infinito.** `useCharacterCreationStore((s) => s.getFinalAbilityScores())`
   causava "Maximum update depth exceeded" na tela de resumo: o hook do
   Zustand usa `useSyncExternalStore`, que rechama o selector a cada render
   pra checar consistência — um selector sem saída estável vira um loop
   "snapshot mudou → re-render → novo snapshot" sem fim. A correção foi
   selecionar os campos primitivos estáveis (`baseAbilityScores`,
   `chosenBonusAbilities`) e derivar o valor localmente com `useMemo`. Ver o
   aviso extenso em `stores/useCharacterCreationStore.ts`.

Também corrigidos três bugs no chunker do RAG (Fase 2) descobertos ao
extrair esses dados — ver [docs/RAG-PIPELINE.md](RAG-PIPELINE.md).

## Chat de regras (Fase 5)

UI de chat em `apps/mobile/app/(tabs)/grimoire/index.tsx` (Zustand store em
`stores/useChatStore.ts`, componentes em `components/chat/`), consumindo o
`/rules/query` da Fase 2 direto. "Formatação rica" (spec Fase 5) é um
parser leve em `ChatBubble.tsx` que deixa em negrito dourado qualquer linha
`Rótulo: valor` — cobre o formato que o próprio prompt já pede pra
magias/monstros, sem precisar de uma lib de markdown.

Achado testando de ponta a ponta: a regra 4 do `RULES_ASSISTANT_SYSTEM_PROMPT`
dava `[PHB, Cap. 3 — Classes]` como exemplo literal de citação, e o modelo
copiava essa citação FALSA (nenhum chunk nosso é do PHB, nem tem número de
capítulo) em vez de usar o `[SRD 5.1]` real do contexto — inventar uma
fonte é exatamente o que a "regra inegociável" existe pra evitar. Corrigido
pra instruir o modelo a copiar a tag exata que aparece no contexto, com
teste de regressão em `rag.service.integration.test.ts`.

## Migração futura para VPS

A arquitetura foi desenhada para permitir migração para uma VPS Linux
(Hostinger) sem refatoração: tudo é configurável via env vars, a LLM segue
adapter pattern (Ollama ↔ Gemini/Groq), e o armazenamento de áudio será
abstraído atrás de uma interface (`saveAudio`/`getAudio`/`deleteAudio`) quando
o módulo de diário for implementado (Fase 6). Nenhum serviço AWS-specific é
usado. Ver o prompt original do projeto para o plano completo de deploy.
