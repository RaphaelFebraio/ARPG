import { describe, expect, it } from 'vitest';
import { ABILITY_SCORES } from '../constants/abilities.js';
import { SKILLS } from '../constants/skills.js';
import { BACKGROUNDS } from './backgrounds.js';
import { CLASSES } from './classes.js';
import { RACES } from './races.js';
import { CANTRIPS_BY_CLASS, LEVEL_1_SPELLS_BY_CLASS } from './spells-level1.js';

const isAbility = (value: string): boolean => (ABILITY_SCORES as readonly string[]).includes(value);
const isSkill = (value: string): boolean => (SKILLS as readonly string[]).includes(value);

describe('character creation static data', () => {
  it('only references real ability scores in race bonuses', () => {
    for (const race of RACES) {
      for (const bonus of race.abilityBonuses) {
        if (bonus.type === 'fixed') expect(isAbility(bonus.ability)).toBe(true);
        if (bonus.type === 'choose') bonus.excluding?.forEach((a) => expect(isAbility(a)).toBe(true));
      }
      for (const subrace of race.subraces) {
        for (const bonus of subrace.abilityBonuses) {
          if (bonus.type === 'fixed') expect(isAbility(bonus.ability)).toBe(true);
        }
      }
    }
  });

  it('only references real skills in class skill choices and backgrounds', () => {
    for (const cls of CLASSES) {
      expect(cls.skillChoice.from.length).toBeGreaterThanOrEqual(cls.skillChoice.count);
      for (const skill of cls.skillChoice.from) expect(isSkill(skill)).toBe(true);
    }
    for (const background of BACKGROUNDS) {
      for (const skill of background.skillProficiencies) expect(isSkill(skill)).toBe(true);
    }
  });

  it('gives every spellcasting class a real spellcasting ability', () => {
    for (const cls of CLASSES) {
      if (cls.spellcasting) expect(isAbility(cls.spellcasting.ability)).toBe(true);
    }
  });

  it('only lists spells for classes that actually cast at level 1', () => {
    const casterIds = new Set(CLASSES.filter((c) => c.spellcasting).map((c) => c.id));
    for (const classId of Object.keys(CANTRIPS_BY_CLASS)) expect(casterIds.has(classId)).toBe(true);
    for (const classId of Object.keys(LEVEL_1_SPELLS_BY_CLASS)) expect(casterIds.has(classId)).toBe(true);
  });

  it('has exactly one background, matching the SRD 5.1 CC content boundary', () => {
    expect(BACKGROUNDS).toHaveLength(1);
    expect(BACKGROUNDS[0]?.id).toBe('acolyte');
  });
});
