import { z } from 'zod';
import { ENTITY_TYPES } from '../constants/rag';

export const chunkMetadataSchema = z.object({
  source: z.string(),
  chapter: z.string(),
  section: z.string(),
  entityType: z.enum(ENTITY_TYPES),
  entityName: z.string(),
  pageStart: z.number().int().optional(),
  pageEnd: z.number().int().optional(),
});

export const rulesQuerySchema = z.object({
  query: z.string().min(1).max(500),
  filters: z
    .object({
      entityType: z.enum(ENTITY_TYPES).optional(),
    })
    .optional(),
});

export const rulesAnswerSchema = z.object({
  answer: z.string(),
  sources: z.array(chunkMetadataSchema),
});

export type ChunkMetadata = z.infer<typeof chunkMetadataSchema>;
export type RulesQueryInput = z.infer<typeof rulesQuerySchema>;
export type RulesAnswer = z.infer<typeof rulesAnswerSchema>;
