import { describe, expect, it } from 'vitest';
import { rulesQuerySchema } from './rules.schema';

describe('rulesQuerySchema', () => {
  it('accepts a plain query without filters', () => {
    const result = rulesQuerySchema.safeParse({ query: 'o que faz fireball?' });

    expect(result.success).toBe(true);
  });

  it('accepts a query with a valid entityType filter', () => {
    const result = rulesQuerySchema.safeParse({
      query: 'traços do elfo',
      filters: { entityType: 'race' },
    });

    expect(result.success).toBe(true);
  });

  it('rejects an invalid entityType filter', () => {
    const result = rulesQuerySchema.safeParse({
      query: 'traços do elfo',
      filters: { entityType: 'invalid_type' },
    });

    expect(result.success).toBe(false);
  });

  it('rejects an empty query', () => {
    const result = rulesQuerySchema.safeParse({ query: '' });

    expect(result.success).toBe(false);
  });
});
