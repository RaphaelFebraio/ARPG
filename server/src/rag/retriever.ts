import { sql } from 'drizzle-orm';
import type { ChunkMetadata, EntityType } from '@grimoire/shared';
import { db } from '../db/index.js';

export type RetrievedChunk = {
  metadata: ChunkMetadata;
  content: string;
  similarity: number;
};

export type RetrieveOptions = {
  entityType?: EntityType;
  limit?: number;
  threshold?: number;
};

// DECISION: similarity search over a customType vector column has no
// query-builder support in drizzle-orm, so we go through raw SQL. Rows are
// our own trusted rule_chunks table (not user input), so a single typed
// cast at this boundary is enough — no per-field runtime validation needed.
type RuleChunkRow = {
  content: string;
  source: string;
  chapter: string | null;
  section: string | null;
  entity_type: string;
  entity_name: string;
  page_start: number | null;
  page_end: number | null;
  similarity: number;
};

export class Retriever {
  async retrieve(queryEmbedding: number[], options: RetrieveOptions = {}): Promise<RetrievedChunk[]> {
    const { entityType, limit = 10, threshold = 0 } = options;
    const vectorLiteral = `[${queryEmbedding.join(',')}]`;

    const entityFilter = entityType ? sql`WHERE entity_type = ${entityType}` : sql``;

    const rows = (await db.execute(sql`
      SELECT content, source, chapter, section, entity_type, entity_name, page_start, page_end,
             1 - (embedding <=> ${vectorLiteral}::vector) AS similarity
      FROM rule_chunks
      ${entityFilter}
      ORDER BY embedding <=> ${vectorLiteral}::vector
      LIMIT ${limit}
    `)) as unknown as RuleChunkRow[];

    return rows
      .filter((row) => row.similarity >= threshold)
      .map((row) => ({
        content: row.content,
        similarity: row.similarity,
        metadata: {
          source: row.source,
          chapter: row.chapter,
          section: row.section,
          entityType: row.entity_type as EntityType,
          entityName: row.entity_name,
          pageStart: row.page_start,
          pageEnd: row.page_end,
        },
      }));
  }
}
