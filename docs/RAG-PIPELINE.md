# Pipeline RAG — Grimoire

> Status: implementado (Fase 2). `server/src/rag/` (chunker, pdf-extractor,
> text-cleaner, ingest, retriever) e `server/src/services/rag.service.ts`.

## Ingestão (offline, `npm run ingest`)

```
PDF (SRD 5.1)
  → Extração de texto por página (pdf-parse, reconstruindo linhas via
    coordenada Y dos itens de texto — ver server/src/rag/pdf-extractor.ts)
  → Limpeza (normalização de espaços/hífens, remoção de rodapé repetido
    e números de página — server/src/rag/text-cleaner.ts)
  → Chunking por entidade (ver abaixo — server/src/rag/chunker.ts)
  → Embeddings via Ollama (nomic-embed-text, 768 dims), em lotes de 16
  → Insert em rule_chunks (pgvector), truncando a tabela antes (idempotente)
```

## Regra de chunking

Chunk por ENTIDADE, detectada via heurística de linha (sem acesso a
tamanho de fonte, só texto puro): uma linha curta, sem pontuação final e
em Title Case é um cabeçalho (nome de magia, monstro, feature de classe
etc.); tudo até o próximo cabeçalho vira um chunk. Sinais adicionais:

- **Magia**: corpo começa com `<N>th-level <escola>` ou `<Escola> cantrip`.
- **Monstro**: corpo começa com tamanho de criatura (`Medium humanoid...`).
- Qualquer outra coisa (raça, classe, background, regra geral) cai em
  `entityType: 'rule'` — não há marcador de capítulo confiável no texto do
  SRD 5.1 pra diferenciar isso de forma mais fina, então não adivinhamos.

Chunks > 1500 tokens (estimado por `chars/4`) são divididos com overlap de
200 tokens. Linhas de rótulo de stat-block sem dois-pontos (`Languages
Common, Goblin`, `Armor Class 20`, `STR DEX CON...`) são explicitamente
excluídas da detecção de cabeçalho — sem isso, elas fragmentam magias e
monstros no meio do stat block.

`chapter`/`section` ficam `null`: o SRD 5.1 não tem marcadores de capítulo
no texto extraído, só títulos de entidade, então preenchê-los seria
adivinhação.

## Retrieval (online)

```
Query do jogador (pt-BR)
  → Tradução para inglês via LLM local (ver "Tradução de query" abaixo)
  → Embedding da query traduzida (mesmo modelo da ingestão)
  → top 10 por cosine similarity (pgvector, índice HNSW)
  → filtro por score mínimo (RAG_SIMILARITY_THRESHOLD, default 0.55)
  → top 5 (RAG_MAX_CHUNKS)
  → contexto concatenado → LLM com o system prompt de regras
    (resposta gerada a partir da query ORIGINAL em pt-BR)
```

Sem reranking via LLM por enquanto — o corte por threshold + top 5 já
mostrou boa precisão nos testes manuais; fica como possível melhoria futura.

### Tradução de query

O SRD é todo em inglês, mas o app é em pt-BR. Testes mostraram que o
nomic-embed-text local casa bem query↔conteúdo quando ambos estão em
inglês (~0.65-0.85 de similaridade para perguntas relevantes), mas cai
muito para queries em português contra o mesmo conteúdo (~0.55 mesmo para
perguntas certeiras, às vezes retornando o chunk errado). Em vez de trocar
de modelo de embedding, o `RagService` traduz a pergunta pro inglês com o
próprio Llama local antes de gerar o embedding (`prompts/query-translation.ts`),
e usa a pergunta original em pt-BR só na geração da resposta final.

## Regra inegociável

Se nada passar do threshold de similaridade, a resposta é "Não encontrei
essa informação nos livros disponíveis" **sem chamar o LLM** — não é só uma
instrução de prompt, é impossível o modelo inventar em cima de um contexto
vazio porque ele nunca é chamado nesse caso.
