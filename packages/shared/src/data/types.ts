import type { AbilityScore } from '../constants/abilities.js';
import type { Skill } from '../constants/skills.js';

// DECISION: ability bonuses come in three shapes in the SRD — a fixed bonus
// to one score (most races), "+1 to every score" (Human), and "+2 to one
// fixed score, +1 to N others of your choice" (Half-Elf). Modeling all
// three explicitly (rather than always "choose N") keeps the data honest
// about which part is fixed vs. a real player choice.
export type FixedAbilityBonus = { type: 'fixed'; ability: AbilityScore; amount: number };
export type ChooseAbilityBonus = { type: 'choose'; count: number; amount: number; excluding?: AbilityScore[] };
export type AllAbilityBonus = { type: 'all'; amount: number };
export type AbilityBonus = FixedAbilityBonus | ChooseAbilityBonus | AllAbilityBonus;

export type RaceTrait = {
  name: string;
  description: string;
};

export type Subrace = {
  id: string;
  name: string;
  abilityBonuses: AbilityBonus[];
  traits: RaceTrait[];
};

export type Race = {
  id: string;
  name: string;
  size: 'Small' | 'Medium';
  speed: number;
  abilityBonuses: AbilityBonus[];
  traits: RaceTrait[];
  languages: string[];
  subraces: Subrace[];
};

export type EquipmentChoice = {
  options: string[];
};

export type SkillChoice = {
  count: number;
  from: Skill[];
};

export type SpellcastingInfo = {
  ability: AbilityScore;
  cantripsKnown: number;
  // Bard/Sorcerer/Warlock/Wizard have a fixed "spells known" (or, for
  // Wizard, spellbook-at-creation) count at level 1 — this is that number.
  // Cleric/Druid instead PREPARE spells daily from their whole list, a
  // count equal to their spellcasting ability modifier + level (min 1),
  // so they carry `preparedFormula: true` here and spellsKnown is left at
  // 0; the actual count must be computed from the character's ability
  // score, not read from this static table.
  spellsKnown: number;
  preparedFormula?: true;
};

export type CharacterClass = {
  id: string;
  name: string;
  hitDie: 6 | 8 | 10 | 12;
  primaryAbility: AbilityScore;
  savingThrows: AbilityScore[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  skillChoice: SkillChoice;
  equipmentChoices: EquipmentChoice[];
  fixedEquipment: string[];
  spellcasting: SpellcastingInfo | null;
};

export type Background = {
  id: string;
  name: string;
  skillProficiencies: Skill[];
  equipment: string[];
  feature: { name: string; description: string };
};

export type SpellSummary = {
  name: string;
  school: string;
};
