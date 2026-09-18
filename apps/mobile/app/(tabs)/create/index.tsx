import { RACES } from '@grimoire/shared';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Card } from '../../../components/ui';
import { WizardScreen } from '../../../components/character';
import { useCharacterCreationStore } from '../../../stores/useCharacterCreationStore';

export default function RaceStepScreen() {
  const raceId = useCharacterCreationStore((s) => s.raceId);
  const setRace = useCharacterCreationStore((s) => s.setRace);

  const handleNext = (): void => {
    const race = RACES.find((r) => r.id === raceId);
    router.push(race && race.subraces.length > 0 ? '/create/subrace' : '/create/class');
  };

  return (
    <WizardScreen step={1} totalSteps={10} title="Raça" onNext={raceId ? handleNext : undefined}>
      <View className="gap-3">
        {RACES.map((race) => {
          const selected = race.id === raceId;
          return (
            <Card key={race.id} selected={selected} onPress={() => setRace(race.id)}>
              <Text className="font-serif text-xl text-gold">{race.name}</Text>
              <Text className="mt-1 font-sans text-xs text-muted">
                {race.size} · Deslocamento {race.speed} pés
              </Text>

              {selected ? (
                <View className="mt-3 gap-2">
                  {race.traits.map((trait) => (
                    <View key={trait.name}>
                      <Text className="font-sans text-sm font-semibold text-ink">{trait.name}</Text>
                      <Text className="font-sans text-sm text-ink/80">{trait.description}</Text>
                    </View>
                  ))}
                  <Text className="font-sans text-xs text-muted">Idiomas: {race.languages.join(', ')}</Text>
                </View>
              ) : null}
            </Card>
          );
        })}
      </View>
    </WizardScreen>
  );
}
