import { ABILITY_LABELS_PT } from '@grimoire/shared';
import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Button, Card } from '../../../components/ui';
import { WizardScreen } from '../../../components/character';
import { ApiError, charactersApi } from '../../../services/api';
import {
  ABILITY_ORDER,
  abilityModifier,
  applyAbilityBonuses,
  calculateBaseAc,
  calculateHpMax,
  getRaceBonusSources,
} from '../../../utils/characterCreation';
import { useCharacterCreationStore } from '../../../stores/useCharacterCreationStore';

export default function SummaryStepScreen() {
  const [saving, setSaving] = useState(false);
  const race = useCharacterCreationStore((s) => s.getRace());
  const subrace = useCharacterCreationStore((s) => s.getSubrace());
  const characterClass = useCharacterCreationStore((s) => s.getClass());
  const background = useCharacterCreationStore((s) => s.getBackground());
  const baseAbilityScores = useCharacterCreationStore((s) => s.baseAbilityScores);
  const chosenBonusAbilities = useCharacterCreationStore((s) => s.chosenBonusAbilities);
  const name = useCharacterCreationStore((s) => s.name);
  const alignment = useCharacterCreationStore((s) => s.alignment);
  const chosenSkills = useCharacterCreationStore((s) => s.chosenSkills);
  const chosenCantrips = useCharacterCreationStore((s) => s.chosenCantrips);
  const chosenSpells = useCharacterCreationStore((s) => s.chosenSpells);
  const toCreateCharacterInput = useCharacterCreationStore((s) => s.toCreateCharacterInput);
  const reset = useCharacterCreationStore((s) => s.reset);

  // DECISION: computed here via useMemo instead of as a `s.getFinalAbilityScores()`
  // store selector — that getter builds a brand-new object on every call, and
  // Zustand's useSyncExternalStore-based hook re-invokes selectors on every render
  // to check for tearing. A selector with no stable output triggers an endless
  // "snapshot changed" -> re-render -> new snapshot cycle ("Maximum update depth
  // exceeded"). Selecting the stable primitive inputs and deriving the value in
  // the component avoids that entirely.
  const finalScores = useMemo(
    () => (race ? applyAbilityBonuses(baseAbilityScores, getRaceBonusSources(race, subrace), chosenBonusAbilities) : baseAbilityScores),
    [race, subrace, baseAbilityScores, chosenBonusAbilities],
  );
  const hpMax = useMemo(
    () => (characterClass ? calculateHpMax(characterClass.hitDie, abilityModifier(finalScores.con)) : 0),
    [characterClass, finalScores],
  );
  const ac = useMemo(() => calculateBaseAc(abilityModifier(finalScores.dex)), [finalScores]);

  if (!race || !characterClass || !background) {
    return <Redirect href="/create" />;
  }

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    try {
      await charactersApi.create(toCreateCharacterInput());
      reset();
      router.replace('/characters');
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Não foi possível salvar. Verifique sua conexão.';
      Alert.alert('Erro ao salvar', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <WizardScreen
      step={10}
      totalSteps={10}
      title="Resumo"
      onBack={() => router.push('/create/details')}
    >
      <View className="gap-4">
        <Card>
          <Text className="font-serif text-2xl text-gold">{name || 'Sem nome'}</Text>
          <Text className="font-sans text-sm text-muted">
            {race.name}
            {subrace ? ` (${subrace.name})` : ''} · {characterClass.name} · {background.name}
          </Text>
          {alignment ? <Text className="mt-1 font-sans text-xs text-muted">{alignment}</Text> : null}
        </Card>

        <Card>
          <Text className="mb-2 font-serif text-lg text-gold">Atributos</Text>
          <View className="flex-row flex-wrap gap-3">
            {ABILITY_ORDER.map((ability) => (
              <View key={ability} className="w-20 items-center rounded-lg border border-hairline py-2">
                <Text className="font-sans text-xs text-muted">{ABILITY_LABELS_PT[ability]}</Text>
                <Text className="font-serif text-lg text-ink">{finalScores[ability]}</Text>
                <Text className="font-sans text-xs text-muted">
                  {abilityModifier(finalScores[ability]) >= 0 ? '+' : ''}
                  {abilityModifier(finalScores[ability])}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <Text className="mb-2 font-serif text-lg text-gold">Combate</Text>
          <Text className="font-sans text-ink/80">PV máximo: {hpMax}</Text>
          <Text className="font-sans text-ink/80">CA: {ac}</Text>
          <Text className="font-sans text-ink/80">Deslocamento: {race.speed} pés</Text>
        </Card>

        {chosenSkills.length > 0 ? (
          <Card>
            <Text className="mb-1 font-serif text-lg text-gold">Perícias escolhidas</Text>
            <Text className="font-sans text-ink/80">{chosenSkills.join(', ')}</Text>
          </Card>
        ) : null}

        {chosenCantrips.length > 0 || chosenSpells.length > 0 ? (
          <Card>
            <Text className="mb-1 font-serif text-lg text-gold">Magias</Text>
            {chosenCantrips.length > 0 ? (
              <Text className="font-sans text-ink/80">Truques: {chosenCantrips.join(', ')}</Text>
            ) : null}
            {chosenSpells.length > 0 ? (
              <Text className="font-sans text-ink/80">1º nível: {chosenSpells.join(', ')}</Text>
            ) : null}
          </Card>
        ) : null}

        <Button label={saving ? 'Salvando...' : 'Salvar personagem'} onPress={handleSave} disabled={saving} loading={saving} />
      </View>
    </WizardScreen>
  );
}
