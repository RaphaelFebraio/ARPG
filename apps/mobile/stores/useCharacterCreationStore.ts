import {
  BACKGROUNDS,
  CLASSES,
  RACES,
  type AbilityScore,
  type Background,
  type CharacterClass,
  type CreateCharacterInput,
  type Race,
  type Skill,
  type Subrace,
} from '@grimoire/shared';
import { create } from 'zustand';
import {
  ABILITY_ORDER,
  abilityModifier,
  applyAbilityBonuses,
  calculateBaseAc,
  calculateHpMax,
  getRaceBonusSources,
  LEVEL_1_PROFICIENCY_BONUS,
  rollAllAbilityScores,
  type AbilityScores,
} from '../utils/characterCreation';

export type AbilityMethod = 'pointbuy' | 'standard' | 'roll';

export type PersonalityDraft = {
  traits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  appearance: string;
};

type CreationState = {
  raceId: string | null;
  subraceId: string | null;
  classId: string | null;
  backgroundId: string | null;
  abilityMethod: AbilityMethod;
  baseAbilityScores: AbilityScores;
  chosenBonusAbilities: AbilityScore[];
  chosenSkills: Skill[];
  equipmentChoiceIndexes: number[];
  chosenCantrips: string[];
  chosenSpells: string[];
  name: string;
  alignment: string;
  personality: PersonalityDraft;

  setRace: (raceId: string) => void;
  setSubrace: (subraceId: string | null) => void;
  setClass: (classId: string) => void;
  setBackground: (backgroundId: string) => void;
  setAbilityMethod: (method: AbilityMethod) => void;
  rerollAbilityScores: () => void;
  setBaseAbilityScore: (ability: AbilityScore, value: number) => void;
  setBaseAbilityScores: (scores: AbilityScores) => void;
  /** Standard array mode: assigns `value` to `ability`, swapping with
   * whichever ability already held it (if any) so each of the six values
   * is used exactly once. */
  assignStandardArrayValue: (ability: AbilityScore, value: number) => void;
  setChosenBonusAbility: (index: number, ability: AbilityScore) => void;
  toggleSkill: (skill: Skill) => void;
  setEquipmentChoice: (slotIndex: number, optionIndex: number) => void;
  toggleCantrip: (name: string) => void;
  toggleSpell: (name: string) => void;
  setName: (name: string) => void;
  setAlignment: (alignment: string) => void;
  setPersonality: (personality: Partial<PersonalityDraft>) => void;
  reset: () => void;

  // Derived getters (kept as functions, not selectors, since they combine
  // store state with the static SRD data rather than being plain fields).
  getRace: () => Race | null;
  getSubrace: () => Subrace | null;
  getClass: () => CharacterClass | null;
  getBackground: () => Background | null;
  //
  // WARNING: getRace/getSubrace/getClass/getBackground are safe to call as
  // `useCharacterCreationStore((s) => s.getRace())` selectors because
  // Array.find returns the SAME object reference from the static RACES/
  // CLASSES/BACKGROUNDS arrays every time. getFinalAbilityScores/getHpMax/
  // getAc are NOT safe that way — they build a brand-new object/number
  // each call is fine for numbers, but getFinalAbilityScores' new object
  // trips up Zustand's useSyncExternalStore-based hook, which re-invokes
  // selectors on every render to check for tearing: a selector with no
  // stable output becomes an endless "snapshot changed" loop ("Maximum
  // update depth exceeded"). Only call these via `get()` inside another
  // store method (imperative, non-reactive), or from a component by
  // selecting the stable primitive inputs (baseAbilityScores,
  // chosenBonusAbilities, race/class) and deriving the value locally with
  // useMemo (see app/(tabs)/create/summary.tsx).
  getFinalAbilityScores: () => AbilityScores;
  getHpMax: () => number;
  getAc: () => number;
  toCreateCharacterInput: () => CreateCharacterInput;
};

const DEFAULT_BASE_SCORES: AbilityScores = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
// Sentinel for "standard array" mode, where every ability starts
// unassigned and the player places each of the six array values once.
const UNASSIGNED_SCORES: AbilityScores = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };

const emptyPersonality: PersonalityDraft = { traits: '', ideals: '', bonds: '', flaws: '', appearance: '' };

const initialState = {
  raceId: null,
  subraceId: null,
  classId: null,
  backgroundId: null,
  abilityMethod: 'pointbuy' as AbilityMethod,
  baseAbilityScores: DEFAULT_BASE_SCORES,
  chosenBonusAbilities: [],
  chosenSkills: [],
  equipmentChoiceIndexes: [],
  chosenCantrips: [],
  chosenSpells: [],
  name: '',
  alignment: '',
  personality: emptyPersonality,
};

export const useCharacterCreationStore = create<CreationState>((set, get) => ({
  ...initialState,

  setRace: (raceId) => set({ raceId, subraceId: null, chosenBonusAbilities: [] }),
  setSubrace: (subraceId) => set({ subraceId, chosenBonusAbilities: [] }),
  setClass: (classId) => set({ classId, chosenSkills: [], equipmentChoiceIndexes: [], chosenCantrips: [], chosenSpells: [] }),
  setBackground: (backgroundId) => set({ backgroundId }),
  setAbilityMethod: (abilityMethod) =>
    set({
      abilityMethod,
      baseAbilityScores:
        abilityMethod === 'standard'
          ? UNASSIGNED_SCORES
          : abilityMethod === 'roll'
            ? rollAllAbilityScores()
            : DEFAULT_BASE_SCORES,
    }),
  rerollAbilityScores: () => set({ baseAbilityScores: rollAllAbilityScores() }),
  assignStandardArrayValue: (ability, value) =>
    set((state) => {
      const next = { ...state.baseAbilityScores };
      const previousHolder = ABILITY_ORDER.find((a) => a !== ability && next[a] === value);
      if (previousHolder) next[previousHolder] = next[ability];
      next[ability] = value;
      return { baseAbilityScores: next };
    }),
  setBaseAbilityScore: (ability, value) =>
    set((state) => ({ baseAbilityScores: { ...state.baseAbilityScores, [ability]: value } })),
  setBaseAbilityScores: (baseAbilityScores) => set({ baseAbilityScores }),
  setChosenBonusAbility: (index, ability) =>
    set((state) => {
      const next = [...state.chosenBonusAbilities];
      next[index] = ability;
      return { chosenBonusAbilities: next };
    }),
  toggleSkill: (skill) =>
    set((state) => ({
      chosenSkills: state.chosenSkills.includes(skill)
        ? state.chosenSkills.filter((s) => s !== skill)
        : [...state.chosenSkills, skill],
    })),
  setEquipmentChoice: (slotIndex, optionIndex) =>
    set((state) => {
      const next = [...state.equipmentChoiceIndexes];
      next[slotIndex] = optionIndex;
      return { equipmentChoiceIndexes: next };
    }),
  toggleCantrip: (name) =>
    set((state) => ({
      chosenCantrips: state.chosenCantrips.includes(name)
        ? state.chosenCantrips.filter((n) => n !== name)
        : [...state.chosenCantrips, name],
    })),
  toggleSpell: (name) =>
    set((state) => ({
      chosenSpells: state.chosenSpells.includes(name)
        ? state.chosenSpells.filter((n) => n !== name)
        : [...state.chosenSpells, name],
    })),
  setName: (name) => set({ name }),
  setAlignment: (alignment) => set({ alignment }),
  setPersonality: (personality) => set((state) => ({ personality: { ...state.personality, ...personality } })),
  reset: () => set(initialState),

  getRace: () => RACES.find((r) => r.id === get().raceId) ?? null,
  getSubrace: () => {
    const race = get().getRace();
    return race?.subraces.find((s) => s.id === get().subraceId) ?? null;
  },
  getClass: () => CLASSES.find((c) => c.id === get().classId) ?? null,
  getBackground: () => BACKGROUNDS.find((b) => b.id === get().backgroundId) ?? null,

  getFinalAbilityScores: () => {
    const race = get().getRace();
    if (!race) return get().baseAbilityScores;
    const subrace = get().getSubrace();
    return applyAbilityBonuses(get().baseAbilityScores, getRaceBonusSources(race, subrace), get().chosenBonusAbilities);
  },

  getHpMax: () => {
    const characterClass = get().getClass();
    if (!characterClass) return 0;
    const conModifier = abilityModifier(get().getFinalAbilityScores().con);
    return calculateHpMax(characterClass.hitDie, conModifier);
  },

  getAc: () => calculateBaseAc(abilityModifier(get().getFinalAbilityScores().dex)),

  toCreateCharacterInput: () => {
    const state = get();
    const race = state.getRace();
    const characterClass = state.getClass();
    const background = state.getBackground();
    const subrace = state.getSubrace();
    const finalScores = state.getFinalAbilityScores();

    if (!race || !characterClass || !background) {
      throw new Error('Personagem incompleto: raça, classe e antecedente são obrigatórios.');
    }

    return {
      name: state.name || 'Sem nome',
      race: race.name,
      subrace: subrace?.name,
      class: characterClass.name,
      level: 1,
      background: background.name,
      alignment: state.alignment || undefined,
      ...finalScores,
      hpMax: state.getHpMax(),
      ac: state.getAc(),
      speed: race.speed,
      proficiency: LEVEL_1_PROFICIENCY_BONUS,
      skills: [
        ...state.chosenSkills.map((skill) => ({ skill, proficient: true })),
        ...background.skillProficiencies
          .filter((skill) => !state.chosenSkills.includes(skill))
          .map((skill) => ({ skill, proficient: true })),
      ],
      equipment: [
        ...characterClass.equipmentChoices.map((choice, index) => ({
          name: choice.options[state.equipmentChoiceIndexes[index] ?? 0] ?? choice.options[0]!,
          quantity: 1,
          equipped: true,
        })),
        ...characterClass.fixedEquipment.map((name) => ({ name, quantity: 1, equipped: true })),
        ...background.equipment.map((name) => ({ name, quantity: 1, equipped: false })),
      ],
      spells: [
        ...state.chosenCantrips.map((name) => ({ name, level: 0, prepared: true })),
        ...state.chosenSpells.map((name) => ({ name, level: 1, prepared: true })),
      ],
      features: [],
      personality: state.personality,
    };
  },
}));
