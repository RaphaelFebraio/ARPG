import { readFile } from 'node:fs/promises';
import { db } from '../db/index.js';
import { ruleChunks } from '../db/schema.js';
import { EmbeddingService } from '../services/embedding.service.js';
import { chunkPages, type RawChunk } from './chunker.js';
import { extractPdfPages } from './pdf-extractor.js';
import { cleanPages } from './text-cleaner.js';

export type IngestSummary = {
  chunkCount: number;
  entityCounts: Record<string, number>;
};

const EMBED_BATCH_SIZE = 16;

const countByEntityType = (chunks: RawChunk[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const chunk of chunks) {
    counts[chunk.entityType] = (counts[chunk.entityType] ?? 0) + 1;
  }
  return counts;
};

export const runIngestPipeline = async (filePath: string, source = 'SRD 5.1'): Promise<IngestSummary> => {
  const buffer = await readFile(filePath);
  const pages = await extractPdfPages(buffer);
  const cleaned = cleanPages(pages);
  const chunks = chunkPages(cleaned);

  const embeddingService = new EmbeddingService();

  // DECISION: truncate before ingesting so re-running the script against an
  // updated PDF replaces the corpus instead of duplicating/stacking chunks
  // from previous runs (there is no stable natural key to upsert on).
  await db.delete(ruleChunks);

  for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
    const batch = chunks.slice(i, i + EMBED_BATCH_SIZE);
    const embeddings = await embeddingService.embedBatch(batch.map((chunk) => chunk.content));

    await db.insert(ruleChunks).values(
      batch.map((chunk, index) => ({
        content: chunk.content,
        embedding: embeddings[index] ?? [],
        source,
        chapter: null,
        section: null,
        entityType: chunk.entityType,
        entityName: chunk.entityName,
        pageStart: chunk.pageStart,
        pageEnd: chunk.pageEnd,
        tokenCount: chunk.tokenCount,
      })),
    );
  }

  return { chunkCount: chunks.length, entityCounts: countByEntityType(chunks) };
};
