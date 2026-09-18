import { CLASSES } from '@grimoire/shared';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Card } from '../../../components/ui';
import { WizardScreen } from '../../../components/character';
import { useCharacterCreationStore } from '../../../stores/useCharacterCreationStore';

export default function ClassStepScreen() {
  const classId = useCharacterCreationStore((s) => s.classId);
  const setClass = useCharacterCreationStore((s) => s.setClass);
  const race = useCharacterCreationStore((s) => s.getRace());

  return (
    <WizardScreen
      step={3}
      totalSteps={10}
      title="Classe"
      onBack={() => router.push(race && race.subraces.length > 0 ? '/create/subrace' : '/create')}
      onNext={classId ? () => router.push('/create/background') : undefined}
    >
      <View className="gap-3">
        {CLASSES.map((characterClass) => {
          const selected = characterClass.id === classId;
          return (
            <Card key={characterClass.id} selected={selected} onPress={() => setClass(characterClass.id)}>
              <Text className="font-serif text-xl text-gold">{characterClass.name}</Text>
              <Text className="mt-1 font-sans text-xs text-muted">Dado de Vida: d{characterClass.hitDie}</Text>

              {selected ? (
                <View className="mt-3 gap-1">
                  <Text className="font-sans text-sm text-ink/80">
                    Proficiências em armadura: {characterClass.armorProficiencies.join(', ') || 'Nenhuma'}
                  </Text>
                  <Text className="font-sans text-sm text-ink/80">
                    Proficiências em armas: {characterClass.weaponProficiencies.join(', ')}
                  </Text>
                  <Text className="font-sans text-sm text-ink/80">
                    Testes de resistência: {characterClass.savingThrows.map((s) => s.toUpperCase()).join(', ')}
                  </Text>
                  {characterClass.spellcasting ? (
                    <Text className="font-sans text-sm text-ink/80">Conjurador de magias</Text>
                  ) : null}
                </View>
              ) : null}
            </Card>
          );
        })}
      </View>
    </WizardScreen>
  );
}
