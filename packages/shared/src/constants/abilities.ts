export const ABILITY_SCORES = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;

export type AbilityScore = (typeof ABILITY_SCORES)[number];

export const ABILITY_LABELS_PT: Record<AbilityScore, string> = {
  str: 'Força',
  dex: 'Destreza',
  con: 'Constituição',
  int: 'Inteligência',
  wis: 'Sabedoria',
  cha: 'Carisma',
};

// DECISION: point buy costs follow the SRD 5.1 standard table (8..15).
export const POINT_BUY_COSTS: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

export const POINT_BUY_TOTAL_POINTS = 27;
export const POINT_BUY_MIN_SCORE = 8;
export const POINT_BUY_MAX_SCORE = 15;

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const;
