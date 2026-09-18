import { describe, expect, it } from 'vitest';
import { chunkPages } from './chunker.js';
import type { CleanedPage } from './text-cleaner.js';

const page = (pageNumber: number, lines: string[]): CleanedPage => ({ pageNumber, lines });

describe('chunkPages', () => {
  it('keeps a hyphenated race name as its own heading even when the hyphen extracts as a separate token', () => {
    // Regression: pdf-parse sometimes renders "Half-Elf" as "Half - Elf"
    // because the hyphen is its own text item; a lone "-" token used to
    // fail the Title Case check and swallow the whole race into whatever
    // chunk came before it.
    const chunks = chunkPages([
      page(6, [
        'Rock Gnome',
        'As a rock gnome, you have a natural inventiveness.',
        'Half - Elf',
        'Half - Elf Traits',
        'Your half - elf character has some qualities in common with elves.',
      ]),
    ]);

    const halfElf = chunks.find((c) => c.entityName === 'Half - Elf Traits');
    expect(halfElf).toBeDefined();
    expect(halfElf?.content).toContain('half - elf character');
  });

  it('does not truncate a Title Case list that wraps across a line boundary', () => {
    // Regression: "Skills: Choose two from Animal Handling, Athletics,"
    // followed by "Intimidation, Nature, Perception, and Survival" used to
    // read the second line as a new heading, since skill names are
    // themselves Title Case.
    const chunks = chunkPages([
      page(8, [
        'Proficiencies',
        'Saving Throws: Strength, Constitution',
        'Skills: Choose two from Animal Handling, Athletics,',
        'Intimidation, Nature, Perception, and Survival',
        'Equipment',
        'You start with the following equipment.',
      ]),
    ]);

    const proficiencies = chunks.find((c) => c.entityName === 'Proficiencies');
    expect(proficiencies?.content).toContain('Intimidation, Nature, Perception, and Survival');
  });

  it('does not truncate a list that wraps right after a dangling conjunction', () => {
    // Regression: "...Sleight of" / "Hand, and Stealth" and "...Nature,
    // and" / "Religion" wrap at a point with no trailing comma, so the
    // comma-only continuation check missed them.
    const chunks = chunkPages([
      page(39, [
        'Proficiencies',
        'Skills: Choose four from Acrobatics, Athletics, Sleight of',
        'Hand, and Stealth',
        'Equipment',
        'You start with the following equipment.',
      ]),
    ]);

    const proficiencies = chunks.find((c) => c.entityName === 'Proficiencies');
    expect(proficiencies?.content).toContain('Hand, and Stealth');
  });

  it('keeps a bare class section heading like "Hit Points" as its own chunk', () => {
    // Regression: the stat-block label denylist (added so inline monster
    // lines like "Hit Points 7 (2d6)" aren't misread as headings) also
    // matched a bare "Hit Points" class section heading with its value on
    // the next line, dropping it into the previous chunk instead.
    const chunks = chunkPages([
      page(8, [
        'Class Features',
        'As a barbarian, you gain the following class features.',
        'Hit Points',
        'Hit Dice: 1d12 per barbarian level',
      ]),
    ]);

    const hitPoints = chunks.find((c) => c.entityName === 'Hit Points');
    expect(hitPoints).toBeDefined();
    expect(hitPoints?.content).toContain('1d12 per barbarian level');
  });

  it('still classifies a monster stat block via its inline size/type line', () => {
    const chunks = chunkPages([
      page(315, [
        'Goblin',
        'Small humanoid (goblinoid), neutral evil',
        'Armor Class 15 (leather armor, shield)',
        'Hit Points 7 (2d6)',
        'Languages Common, Goblin',
        'Challenge 1/4 (50 XP)',
      ]),
    ]);

    const goblin = chunks.find((c) => c.entityName === 'Goblin');
    expect(goblin?.entityType).toBe('monster');
    // The inline "Hit Points 7 (2d6)" and "Languages Common, Goblin" lines
    // must stay inside the Goblin chunk, not split off as fake headings.
    expect(goblin?.content).toContain('Hit Points 7 (2d6)');
    expect(goblin?.content).toContain('Languages Common, Goblin');
  });

  it('classifies a spell chunk via its level/school signature line', () => {
    const chunks = chunkPages([
      page(144, [
        'Fireball',
        '3rd-level evocation',
        'Casting Time: 1 action',
        'A bright streak flashes from your pointing finger.',
      ]),
    ]);

    const fireball = chunks.find((c) => c.entityName === 'Fireball');
    expect(fireball?.entityType).toBe('spell');
  });
});
