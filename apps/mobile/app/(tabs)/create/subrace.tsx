import { Redirect, router } from 'expo-router';
import { Text, View } from 'react-native';
import { Card } from '../../../components/ui';
import { WizardScreen } from '../../../components/character';
import { useCharacterCreationStore } from '../../../stores/useCharacterCreationStore';

export default function SubraceStepScreen() {
  const race = useCharacterCreationStore((s) => s.getRace());
  const subraceId = useCharacterCreationStore((s) => s.subraceId);
  const setSubrace = useCharacterCreationStore((s) => s.setSubrace);

  // DECISION: a declarative <Redirect> is the safe way to bail out of a
  // screen whose precondition isn't met — calling router.replace()
  // directly in the render body (the previous approach here) triggers a
  // navigation state update mid-render, which can cascade into React's
  // "Maximum update depth exceeded" error.
  if (!race) {
    return <Redirect href="/create" />;
  }

  return (
    <WizardScreen
      step={2}
      totalSteps={10}
      title="Sub-raça"
      onBack={() => router.back()}
      onNext={subraceId ? () => router.push('/create/class') : undefined}
    >
      <View className="gap-3">
        {race.subraces.map((subrace) => {
          const selected = subrace.id === subraceId;
          return (
            <Card key={subrace.id} selected={selected} onPress={() => setSubrace(subrace.id)}>
              <Text className="font-serif text-xl text-gold">{subrace.name}</Text>
              {selected ? (
                <View className="mt-3 gap-2">
                  {subrace.traits.map((trait) => (
                    <View key={trait.name}>
                      <Text className="font-sans text-sm font-semibold text-ink">{trait.name}</Text>
                      <Text className="font-sans text-sm text-ink/80">{trait.description}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </Card>
          );
        })}
      </View>
    </WizardScreen>
  );
}
