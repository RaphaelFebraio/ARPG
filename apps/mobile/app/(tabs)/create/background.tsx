import { BACKGROUNDS } from '@grimoire/shared';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { Card } from '../../../components/ui';
import { WizardScreen } from '../../../components/character';
import { useCharacterCreationStore } from '../../../stores/useCharacterCreationStore';

const SKILL_LABELS_PT: Record<string, string> = {
  insight: 'Intuição',
  religion: 'Religião',
};

export default function BackgroundStepScreen() {
  const backgroundId = useCharacterCreationStore((s) => s.backgroundId);
  const setBackground = useCharacterCreationStore((s) => s.setBackground);

  // DECISION: the SRD 5.1 only publishes one background (Acolyte, see
  // packages/shared/src/data/backgrounds.ts) — auto-selecting it removes a
  // pointless tap on a screen with a single, unavoidable choice.
  useEffect(() => {
    if (!backgroundId && BACKGROUNDS.length === 1) setBackground(BACKGROUNDS[0]!.id);
  }, [backgroundId, setBackground]);

  return (
    <WizardScreen
      step={4}
      totalSteps={10}
      title="Antecedente"
      onBack={() => router.push('/create/class')}
      onNext={backgroundId ? () => router.push('/create/abilities') : undefined}
    >
      {BACKGROUNDS.length === 1 ? (
        <Text className="mb-3 font-sans text-sm text-muted">
          O SRD 5.1 (licença aberta) só publica um antecedente completo — os demais são exclusivos do Livro do
          Jogador.
        </Text>
      ) : null}

      <View className="gap-3">
        {BACKGROUNDS.map((background) => {
          const selected = background.id === backgroundId;
          return (
            <Card key={background.id} selected={selected} onPress={() => setBackground(background.id)}>
              <Text className="font-serif text-xl text-gold">{background.name}</Text>
              <Text className="mt-1 font-sans text-xs text-muted">
                Perícias: {background.skillProficiencies.map((s) => SKILL_LABELS_PT[s] ?? s).join(', ')}
              </Text>

              {selected ? (
                <View className="mt-3 gap-1">
                  <Text className="font-sans text-sm font-semibold text-ink">{background.feature.name}</Text>
                  <Text className="font-sans text-sm text-ink/80">{background.feature.description}</Text>
                  <Text className="mt-2 font-sans text-xs text-muted">
                    Equipamento: {background.equipment.join(', ')}
                  </Text>
                </View>
              ) : null}
            </Card>
          );
        })}
      </View>
    </WizardScreen>
  );
}
