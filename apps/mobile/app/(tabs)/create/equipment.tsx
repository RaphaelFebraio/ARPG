import { Redirect, router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { WizardScreen } from '../../../components/character';
import { useCharacterCreationStore } from '../../../stores/useCharacterCreationStore';

export default function EquipmentStepScreen() {
  const characterClass = useCharacterCreationStore((s) => s.getClass());
  const background = useCharacterCreationStore((s) => s.getBackground());
  const equipmentChoiceIndexes = useCharacterCreationStore((s) => s.equipmentChoiceIndexes);
  const setEquipmentChoice = useCharacterCreationStore((s) => s.setEquipmentChoice);

  if (!characterClass || !background) {
    return <Redirect href="/create" />;
  }

  const canProceed = characterClass.equipmentChoices.every((_, index) => equipmentChoiceIndexes[index] !== undefined);
  const hasSpellcasting = Boolean(characterClass.spellcasting);

  return (
    <WizardScreen
      step={7}
      totalSteps={10}
      title="Equipamento"
      onBack={() => router.push('/create/skills')}
      onNext={
        canProceed ? () => router.push(hasSpellcasting ? '/create/spells' : '/create/details') : undefined
      }
    >
      <View className="gap-4">
        {characterClass.equipmentChoices.map((choice, slotIndex) => (
          <View key={slotIndex} className="gap-2">
            <Text className="font-sans text-sm text-muted">Escolha uma opção:</Text>
            {choice.options.map((option, optionIndex) => {
              const selected = equipmentChoiceIndexes[slotIndex] === optionIndex;
              return (
                <Pressable
                  key={option}
                  onPress={() => setEquipmentChoice(slotIndex, optionIndex)}
                  className={`rounded-xl border px-4 py-3 ${
                    selected ? 'border-gold bg-gold/10' : 'border-hairline bg-background-elevated'
                  }`}
                >
                  <Text className={selected ? 'text-gold' : 'text-ink/80'}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}

        {characterClass.fixedEquipment.length > 0 ? (
          <View className="gap-1 rounded-xl border border-hairline bg-background-elevated p-4">
            <Text className="font-sans text-sm text-muted">Você também recebe:</Text>
            <Text className="font-sans text-ink/80">{characterClass.fixedEquipment.join(', ')}</Text>
          </View>
        ) : null}

        {background.equipment.length > 0 ? (
          <View className="gap-1 rounded-xl border border-hairline bg-background-elevated p-4">
            <Text className="font-sans text-sm text-muted">Do antecedente ({background.name}):</Text>
            <Text className="font-sans text-ink/80">{background.equipment.join(', ')}</Text>
          </View>
        ) : null}
      </View>
    </WizardScreen>
  );
}
