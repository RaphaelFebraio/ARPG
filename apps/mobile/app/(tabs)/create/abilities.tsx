import { ABILITY_LABELS_PT, STANDARD_ARRAY } from '@grimoire/shared';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Button } from '../../../components/ui';
import { AbilityScoreCounter, WizardScreen } from '../../../components/character';
import {
  ABILITY_ORDER,
  abilityModifier,
  abilityScoreCost,
  countChoiceSlots,
  getRaceBonusSources,
  isPointBuyValid,
  isValidPointBuyScore,
  pointBuyRemaining,
} from '../../../utils/characterCreation';
import { useCharacterCreationStore, type AbilityMethod } from '../../../stores/useCharacterCreationStore';

const METHOD_LABELS: Record<AbilityMethod, string> = {
  pointbuy: 'Compra de Pontos',
  standard: 'Array Padrão',
  roll: 'Rolagem',
};

export default function AbilitiesStepScreen() {
  const abilityMethod = useCharacterCreationStore((s) => s.abilityMethod);
  const setAbilityMethod = useCharacterCreationStore((s) => s.setAbilityMethod);
  const rerollAbilityScores = useCharacterCreationStore((s) => s.rerollAbilityScores);
  const baseScores = useCharacterCreationStore((s) => s.baseAbilityScores);
  const setBaseAbilityScore = useCharacterCreationStore((s) => s.setBaseAbilityScore);
  const assignStandardArrayValue = useCharacterCreationStore((s) => s.assignStandardArrayValue);
  const chosenBonusAbilities = useCharacterCreationStore((s) => s.chosenBonusAbilities);
  const setChosenBonusAbility = useCharacterCreationStore((s) => s.setChosenBonusAbility);
  const race = useCharacterCreationStore((s) => s.getRace());
  const subrace = useCharacterCreationStore((s) => s.getSubrace());

  const choiceSlots = race
    ? countChoiceSlots(getRaceBonusSources(race, subrace).flat())
    : 0;
  const excludedFromChoice = race
    ? getRaceBonusSources(race, subrace)
        .flat()
        .find((b) => b.type === 'choose')?.excluding ?? []
    : [];

  const pointBuyOk = abilityMethod !== 'pointbuy' || isPointBuyValid(baseScores);
  const standardArrayOk = abilityMethod !== 'standard' || ABILITY_ORDER.every((a) => baseScores[a] > 0);
  const bonusChoicesOk = chosenBonusAbilities.filter(Boolean).length >= choiceSlots;
  const canProceed = pointBuyOk && standardArrayOk && bonusChoicesOk;

  return (
    <WizardScreen
      step={5}
      totalSteps={10}
      title="Atributos"
      onBack={() => router.push('/create/background')}
      onNext={canProceed ? () => router.push('/create/skills') : undefined}
    >
      <View className="mb-4 flex-row gap-2">
        {(Object.keys(METHOD_LABELS) as AbilityMethod[]).map((method) => (
          <Pressable
            key={method}
            onPress={() => setAbilityMethod(method)}
            className={`flex-1 items-center rounded-lg border px-2 py-2 ${
              abilityMethod === method ? 'border-gold bg-gold/10' : 'border-hairline'
            }`}
          >
            <Text className={`font-sans text-xs ${abilityMethod === method ? 'text-gold' : 'text-muted'}`}>
              {METHOD_LABELS[method]}
            </Text>
          </Pressable>
        ))}
      </View>

      {abilityMethod === 'pointbuy' ? (
        <>
          <Text className="mb-3 font-sans text-sm text-muted">
            Pontos restantes: {pointBuyRemaining(baseScores)} de 27
          </Text>
          <View className="gap-2">
            {ABILITY_ORDER.map((ability) => (
              <AbilityScoreCounter
                key={ability}
                ability={ability}
                score={baseScores[ability]}
                modifier={abilityModifier(baseScores[ability])}
                cost={abilityScoreCost(baseScores[ability])}
                canDecrement={baseScores[ability] > 8}
                canIncrement={
                  isValidPointBuyScore(baseScores[ability] + 1) &&
                  pointBuyRemaining({ ...baseScores, [ability]: baseScores[ability] + 1 }) >= 0
                }
                onDecrement={() => setBaseAbilityScore(ability, baseScores[ability] - 1)}
                onIncrement={() => setBaseAbilityScore(ability, baseScores[ability] + 1)}
              />
            ))}
          </View>
        </>
      ) : null}

      {abilityMethod === 'standard' ? (
        <View className="gap-3">
          <Text className="font-sans text-sm text-muted">Toque num valor pra atribuí-lo à perícia.</Text>
          {ABILITY_ORDER.map((ability) => (
            <View key={ability} className="rounded-xl border border-hairline bg-background-elevated p-3">
              <Text className="font-sans text-sm text-muted">{ABILITY_LABELS_PT[ability]}</Text>
              <View className="mt-2 flex-row flex-wrap gap-2">
                {STANDARD_ARRAY.map((value) => {
                  const assignedHere = baseScores[ability] === value;
                  return (
                    <Pressable
                      key={value}
                      onPress={() => assignStandardArrayValue(ability, value)}
                      className={`h-10 w-10 items-center justify-center rounded-lg border ${
                        assignedHere ? 'border-gold bg-gold/10' : 'border-hairline'
                      }`}
                    >
                      <Text className={assignedHere ? 'text-gold' : 'text-ink/70'}>{value}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {abilityMethod === 'roll' ? (
        <View className="gap-3">
          <View className="gap-2">
            {ABILITY_ORDER.map((ability) => (
              <View
                key={ability}
                className="flex-row items-center justify-between rounded-xl border border-hairline bg-background-elevated px-4 py-3"
              >
                <Text className="font-sans text-sm text-muted">{ABILITY_LABELS_PT[ability]}</Text>
                <Text className="font-serif text-xl text-ink">
                  {baseScores[ability]} ({abilityModifier(baseScores[ability]) >= 0 ? '+' : ''}
                  {abilityModifier(baseScores[ability])})
                </Text>
              </View>
            ))}
          </View>
          <Button label="Rolar novamente (4d6, descarta o menor)" variant="secondary" onPress={rerollAbilityScores} />
        </View>
      ) : null}

      {choiceSlots > 0 ? (
        <View className="mt-6 gap-2">
          <Text className="font-serif text-lg text-gold">Bônus raciais à escolha</Text>
          <Text className="font-sans text-sm text-muted">
            Escolha {choiceSlots} atributo(s) para receber +1 (herança da sua raça).
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {ABILITY_ORDER.filter((a) => !excludedFromChoice.includes(a)).map((ability) => {
              const selectedIndex = chosenBonusAbilities.indexOf(ability);
              const isSelected = selectedIndex !== -1;
              return (
                <Pressable
                  key={ability}
                  onPress={() => {
                    const nextEmptyIndex = chosenBonusAbilities.length < choiceSlots ? chosenBonusAbilities.length : 0;
                    setChosenBonusAbility(isSelected ? selectedIndex : nextEmptyIndex, ability);
                  }}
                  className={`rounded-lg border px-3 py-2 ${isSelected ? 'border-gold bg-gold/10' : 'border-hairline'}`}
                >
                  <Text className={isSelected ? 'text-gold' : 'text-ink/70'}>{ABILITY_LABELS_PT[ability]}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </WizardScreen>
  );
}
