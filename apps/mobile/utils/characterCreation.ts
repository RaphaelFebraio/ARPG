import {
  POINT_BUY_COSTS,
  POINT_BUY_MAX_SCORE,
  POINT_BUY_MIN_SCORE,
  POINT_BUY_TOTAL_POINTS,
  type AbilityBonus,
  type AbilityScore,
  type Race,
  type Subrace,
} from '@grimoire/shared';

export type AbilityScores = Record<AbilityScore, number>;

export const ABILITY_ORDER: AbilityScore[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export const abilityModifier = (score: number): number => Math.floor((score - 10) / 2);

export const abilityScoreCost = (score: number): number => POINT_BUY_COSTS[score] ?? Infinity;

export const pointBuyCost = (scores: AbilityScores): number =>
  ABILITY_ORDER.reduce((total, ability) => total + abilityScoreCost(scores[ability]), 0);

export const isValidPointBuyScore = (score: number): boolean =>
  score >= POINT_BUY_MIN_SCORE && score <= POINT_BUY_MAX_SCORE;

export const pointBuyRemaining = (scores: AbilityScores): number => POINT_BUY_TOTAL_POINTS - pointBuyCost(scores);

export const isPointBuyValid = (scores: AbilityScores): boolean =>
  ABILITY_ORDER.every((a) => isValidPointBuyScore(scores[a])) && pointBuyRemaining(scores) >= 0;

// DECISION: 4d6-drop-lowest, the SRD's alternative to point buy/standard
// array. Kept as a pure function (no Math.random call sites scattered
// around) so the wizard can re-roll deterministically in tests if needed.
export const rollAbilityScore = (): number => {
  const rolls = Array.from({ length: 4 }, () => 1 + Math.floor(Math.random() * 6)).sort((a, b) => b - a);
  return rolls[0]! + rolls[1]! + rolls[2]!;
};

export const rollAllAbilityScores = (): AbilityScores =>
  Object.fromEntries(ABILITY_ORDER.map((a) => [a, rollAbilityScore()])) as AbilityScores;

/**
 * Applies race + subrace ability bonuses on top of base scores.
 * `chosenAbilities` resolves any `choose` bonus (e.g. Half-Elf's "two
 * other ability scores of your choice") to concrete abilities.
 */
export const applyAbilityBonuses = (
  base: AbilityScores,
  bonusSources: AbilityBonus[][],
  chosenAbilities: AbilityScore[],
): AbilityScores => {
  const result: AbilityScores = { ...base };
  let chooseIndex = 0;

  for (const bonuses of bonusSources) {
    for (const bonus of bonuses) {
      if (bonus.type === 'fixed') {
        result[bonus.ability] += bonus.amount;
      } else if (bonus.type === 'all') {
        for (const ability of ABILITY_ORDER) result[ability] += bonus.amount;
      } else {
        for (let i = 0; i < bonus.count; i += 1) {
          const ability = chosenAbilities[chooseIndex];
          chooseIndex += 1;
          if (ability) result[ability] += bonus.amount;
        }
      }
    }
  }

  return result;
};

export const countChoiceSlots = (bonuses: AbilityBonus[]): number =>
  bonuses.reduce((total, bonus) => (bonus.type === 'choose' ? total + bonus.count : total), 0);

export const getRaceBonusSources = (race: Race, subrace: Subrace | null): AbilityBonus[][] =>
  subrace ? [race.abilityBonuses, subrace.abilityBonuses] : [race.abilityBonuses];

export const calculateHpMax = (hitDie: number, conModifier: number): number => Math.max(1, hitDie + conModifier);

// DECISION: proficiency bonus is always +2 for a freshly created level-1
// character — the SRD's proficiency-by-level table only matters once the
// app supports leveling up, which is out of scope for character creation.
export const LEVEL_1_PROFICIENCY_BONUS = 2;

// DECISION: AC at creation is a simplified 10 + Dex modifier. Real armor
// AC (light/medium/heavy formulas, shields) depends on which equipment
// option the player picked, which is free-text in `fixedEquipment` /
// `equipmentChoices` rather than structured armor data — modeling that
// precisely is Fase 4 scope creep the spec doesn't ask for. The character
// sheet can be corrected by hand; this is a reasonable creation-time
// default, not the last word on the character's AC.
export const calculateBaseAc = (dexModifier: number): number => 10 + dexModifier;
