import { zodToJsonSchema } from 'zod-to-json-schema';
import { describe, expect, it } from 'vitest';
import { createCharacterSchema, updateCharacterSchema } from './character.schema.js';

const validInput = {
  name: 'Aria Nightsong',
  race: 'elf',
  class: 'wizard',
  background: 'sage',
  str: 8,
  dex: 14,
  con: 12,
  int: 15,
  wis: 10,
  cha: 10,
  hpMax: 8,
};

describe('createCharacterSchema', () => {
  it('accepts a valid character payload and applies defaults', () => {
    const result = createCharacterSchema.parse(validInput);

    expect(result.level).toBe(1);
    expect(result.ac).toBe(10);
    expect(result.skills).toEqual([]);
  });

  it('rejects an ability score above the allowed range', () => {
    const result = createCharacterSchema.safeParse({ ...validInput, str: 31 });

    expect(result.success).toBe(false);
  });

  it('rejects a missing required field', () => {
    const { name: _name, ...withoutName } = validInput;
    const result = createCharacterSchema.safeParse(withoutName);

    expect(result.success).toBe(false);
  });
});

describe('updateCharacterSchema', () => {
  it('parses a partial payload without filling in unset fields', () => {
    const result = updateCharacterSchema.parse({ level: 2 });

    expect(result).toEqual({ level: 2 });
  });

  // Regression: updateCharacterSchema used to be createCharacterSchema.partial(),
  // which keeps each field's inner `.default(...)`. Fastify's AJV validator has
  // `useDefaults` on, so it filled those defaults into every PUT request
  // regardless of what the caller sent — a PUT with only `{ level: 2 }` would
  // silently wipe `skills`/`equipment`/etc. back to `[]`. The JSON Schema this
  // schema converts to (what AJV actually validates against) must not carry a
  // `default` keyword on any field.
  it('produces a JSON Schema with no default keywords, so AJV cannot inject them', () => {
    const jsonSchema = zodToJsonSchema(updateCharacterSchema, { $refStrategy: 'none' }) as {
      properties: Record<string, { default?: unknown }>;
    };

    for (const [field, fieldSchema] of Object.entries(jsonSchema.properties)) {
      expect(fieldSchema, `field "${field}" should not have a default`).not.toHaveProperty('default');
    }
  });
});
