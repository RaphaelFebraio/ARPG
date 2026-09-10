import { describe, expect, it } from 'vitest';
import { createCharacterSchema } from './character.schema';

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
