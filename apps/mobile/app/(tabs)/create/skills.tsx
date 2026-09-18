import { Redirect, router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { WizardScreen } from '../../../components/character';
import { useCharacterCreationStore } from '../../../stores/useCharacterCreationStore';

const SKILL_LABELS_PT: Record<string, string> = {
  acrobatics: 'Acrobacia',
  animal_handling: 'Adestrar Animais',
  arcana: 'Arcanismo',
  athletics: 'Atletismo',
  deception: 'Enganação',
  history: 'História',
  insight: 'Intuição',
  intimidation: 'Intimidação',
  investigation: 'Investigação',
  medicine: 'Medicina',
  nature: 'Natureza',
  perception: 'Percepção',
  performance: 'Atuação',
  persuasion: 'Persuasão',
  religion: 'Religião',
  sleight_of_hand: 'Prestidigitação',
  stealth: 'Furtividade',
  survival: 'Sobrevivência',
};

export default function SkillsStepScreen() {
  const characterClass = useCharacterCreationStore((s) => s.getClass());
  const background = useCharacterCreationStore((s) => s.getBackground());
  const chosenSkills = useCharacterCreationStore((s) => s.chosenSkills);
  const toggleSkill = useCharacterCreationStore((s) => s.toggleSkill);

  if (!characterClass || !background) {
    return <Redirect href="/create" />;
  }

  const { count, from } = characterClass.skillChoice;
  const backgroundSkills = new Set(background.skillProficiencies);
  const canProceed = chosenSkills.length === count;

  return (
    <WizardScreen
      step={6}
      totalSteps={10}
      title="Perícias"
      onBack={() => router.push('/create/abilities')}
      onNext={canProceed ? () => router.push('/create/equipment') : undefined}
    >
      <Text className="mb-1 font-sans text-sm text-muted">
        Escolha {count} perícia(s) de {characterClass.name} ({chosenSkills.length}/{count} selecionadas)
      </Text>
      <Text className="mb-4 font-sans text-xs text-muted">
        Já garantidas pelo antecedente: {[...backgroundSkills].map((s) => SKILL_LABELS_PT[s] ?? s).join(', ')}
      </Text>

      <View className="gap-2">
        {from.map((skill) => {
          const grantedByBackground = backgroundSkills.has(skill);
          const selected = chosenSkills.includes(skill);
          const disabled = grantedByBackground || (!selected && chosenSkills.length >= count);

          return (
            <Pressable
              key={skill}
              disabled={disabled}
              onPress={() => toggleSkill(skill)}
              className={`flex-row items-center justify-between rounded-xl border px-4 py-3 ${
                selected || grantedByBackground ? 'border-gold bg-gold/10' : 'border-hairline bg-background-elevated'
              } ${disabled && !grantedByBackground ? 'opacity-40' : ''}`}
            >
              <Text className="font-sans text-ink">{SKILL_LABELS_PT[skill] ?? skill}</Text>
              {grantedByBackground ? (
                <Text className="font-sans text-xs text-muted">antecedente</Text>
              ) : selected ? (
                <Text className="text-gold">✓</Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </WizardScreen>
  );
}
