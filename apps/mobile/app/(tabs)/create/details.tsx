import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Input } from '../../../components/ui';
import { WizardScreen } from '../../../components/character';
import { useCharacterCreationStore } from '../../../stores/useCharacterCreationStore';

export default function DetailsStepScreen() {
  const characterClass = useCharacterCreationStore((s) => s.getClass());
  const name = useCharacterCreationStore((s) => s.name);
  const alignment = useCharacterCreationStore((s) => s.alignment);
  const personality = useCharacterCreationStore((s) => s.personality);
  const setName = useCharacterCreationStore((s) => s.setName);
  const setAlignment = useCharacterCreationStore((s) => s.setAlignment);
  const setPersonality = useCharacterCreationStore((s) => s.setPersonality);

  const previousStep = characterClass?.spellcasting ? '/create/spells' : '/create/equipment';

  return (
    <WizardScreen
      step={9}
      totalSteps={10}
      title="Detalhes"
      onBack={() => router.push(previousStep)}
      onNext={name.trim().length > 0 ? () => router.push('/create/summary') : undefined}
    >
      <Text className="mb-4 font-sans text-sm text-muted">
        Só você escreve essa parte — a IA não interfere na identidade do seu personagem.
      </Text>

      <View className="gap-4">
        <Input label="Nome do personagem" value={name} onChangeText={setName} placeholder="Ex: Aria Nightsong" />
        <Input label="Alinhamento (opcional)" value={alignment} onChangeText={setAlignment} placeholder="Ex: Neutro e Bom" />
        <Input
          label="Aparência"
          value={personality.appearance}
          onChangeText={(text) => setPersonality({ appearance: text })}
          placeholder="Como seu personagem se parece?"
          multiline
        />
        <Input
          label="Traços de personalidade"
          value={personality.traits}
          onChangeText={(text) => setPersonality({ traits: text })}
          multiline
        />
        <Input
          label="Ideais"
          value={personality.ideals}
          onChangeText={(text) => setPersonality({ ideals: text })}
          multiline
        />
        <Input label="Vínculos" value={personality.bonds} onChangeText={(text) => setPersonality({ bonds: text })} multiline />
        <Input label="Defeitos" value={personality.flaws} onChangeText={(text) => setPersonality({ flaws: text })} multiline />
      </View>
    </WizardScreen>
  );
}
