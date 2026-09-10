# Pipeline RAG — Grimoire

> Status: planejado para a Fase 2. Este documento descreve o design; a
> implementação (chunker, ingest, retriever) ainda não existe no código.

## Ingestão (offline)

```
PDF (SRD 5.1)
  → Extração de texto
  → Limpeza (headers/footers/números de página)
  → Detecção de seções
  → Chunking por entidade (ver abaixo)
  → Embeddings via Ollama (nomic-embed-text, 768 dims)
  → Insert em rule_chunks (pgvector)
```

## Regra de chunking

Chunk por ENTIDADE, não por tamanho fixo: uma magia, um monstro, uma raça
(com todos os traços), uma classe (overview + 1 chunk por feature), uma regra
geral. Chunks > 1500 tokens são divididos com overlap de 200 tokens.

Metadata obrigatória por chunk: `source`, `chapter`, `section`, `entityType`
(`spell | monster | race | class | feature | rule | equipment | condition |
background`), `entityName`, `pageStart?`, `pageEnd?` — ver
`packages/shared/src/schemas/rules.schema.ts`.

## Retrieval (online)

```
Query → embedding (mesmo modelo da ingestão)
  → top 10 por cosine similarity (pgvector, índice HNSW)
  → filtro por score mínimo (RAG_SIMILARITY_THRESHOLD, default 0.72)
  → (opcional) reranking via LLM
  → top 5 (RAG_MAX_CHUNKS)
  → contexto concatenado → LLM com o system prompt de regras
```

## Regra inegociável

Se o retrieval não encontrar nada relevante, a resposta deve ser "Não
encontrei essa informação nos livros disponíveis." A IA nunca inventa regras.
