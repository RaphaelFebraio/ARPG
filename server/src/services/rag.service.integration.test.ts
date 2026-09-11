import { describe, expect, it } from 'vitest';
import { NO_CONTEXT_ANSWER } from '../prompts/rules-assistant.js';
import { RagService } from './rag.service.js';

// DECISION: these hit the real local stack (Postgres with the ingested
// SRD 5.1 + a running Ollama), per the testing convention that RAG gets
// integration tests against a local database rather than mocks — the
// retrieval quality itself (thresholds, chunking, prompt) is exactly what
// needs verifying, and mocking any of that away would test nothing real.
// Requires: `docker compose up -d`, Ollama running, and `npm run ingest`
// already applied (see docs/RAG-PIPELINE.md).
// DECISION: generous timeout — each test runs 2-3 sequential local LLM
// calls (translate, embed, answer) on modest consumer hardware (RTX 3050
// laptop GPU), which can take well over 30s for a 5-chunk context.
const TEST_TIMEOUT_MS = 60_000;

describe('RagService (integration)', () => {
  const ragService = new RagService();

  it(
    'answers "what does Fireball do" with the real spell rules, not a hallucination',
    async () => {
      const result = await ragService.answerQuery({ query: 'o que faz a magia fireball?' });

      expect(result.answer.toLowerCase()).toContain('8d6');
      expect(result.sources.some((s) => s.entityName === 'Fireball' && s.entityType === 'spell')).toBe(true);
    },
    TEST_TIMEOUT_MS,
  );

  it(
    'answers "elf traits" in Portuguese by retrieving the Elf Traits chunk',
    async () => {
      const result = await ragService.answerQuery({ query: 'quais são os traços do elfo?' });

      expect(result.sources.some((s) => s.entityName === 'Elf Traits')).toBe(true);
      expect(result.answer.length).toBeGreaterThan(0);
    },
    TEST_TIMEOUT_MS,
  );

  it(
    'refuses to answer an out-of-scope question instead of inventing one',
    async () => {
      const result = await ragService.answerQuery({ query: 'qual é a capital da França?' });

      expect(result.answer).toBe(NO_CONTEXT_ANSWER);
      expect(result.sources).toEqual([]);
    },
    TEST_TIMEOUT_MS,
  );
});
