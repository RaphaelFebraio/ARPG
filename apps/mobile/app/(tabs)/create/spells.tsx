import { CANTRIPS_BY_CLASS, LEVEL_1_SPELLS_BY_CLASS } from '@grimoire/shared';
import { Redirect, router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { WizardScreen } from '../../../components/character';
import { useCharacterCreationStore } from '../../../stores/useCharacterCreationStore';

export default function SpellsStepScreen() {
  const characterClass = useCharacterCreationStore((s) => s.getClass());
  const chosenCantrips = useCharacterCreationStore((s) => s.chosenCantrips);
  const chosenSpells = useCharacterCreationStore((s) => s.chosenSpells);
  const toggleCantrip = useCharacterCreationStore((s) => s.toggleCantrip);
  const toggleSpell = useCharacterCreationStore((s) => s.toggleSpell);

  if (!characterClass) {
    return <Redirect href="/create" />;
  }

  if (!characterClass.spellcasting) {
    return <Redirect href="/create/details" />;
  }

  const { cantripsKnown, spellsKnown, preparedFormula } = characterClass.spellcasting;
  const availableCantrips = CANTRIPS_BY_CLASS[characterClass.id] ?? [];
  const availableSpells = LEVEL_1_SPELLS_BY_CLASS[characterClass.id] ?? [];

  // Prepared casters (Cleric, Druid) pick a suggested number at creation —
  // the real count (ability modifier + level) is computed on the summary
  // screen once final ability scores are known; here we just avoid a hard
  // limit of 0.
  const spellTarget = preparedFormula ? Math.max(1, spellsKnown) || availableSpells.length : spellsKnown;

  return (
    <WizardScreen
      step={8}
      totalSteps={10}
      title="Magias"
      onBack={() => router.push('/create/equipment')}
      onNext={
        chosenCantrips.length === cantripsKnown && chosenSpells.length > 0
          ? () => router.push('/create/details')
          : undefined
      }
    >
      <Text className="mb-1 font-serif text-lg text-gold">Truques (cantrips)</Text>
      <Text className="mb-3 font-sans text-sm text-muted">
        Escolha {cantripsKnown} ({chosenCantrips.length}/{cantripsKnown})
      </Text>
      <View className="mb-6 gap-2">
        {availableCantrips.map((spell) => {
          const selected = chosenCantrips.includes(spell.name);
          const disabled = !selected && chosenCantrips.length >= cantripsKnown;
          return (
            <Pressable
              key={spell.name}
              disabled={disabled}
              onPress={() => toggleCantrip(spell.name)}
              className={`flex-row items-center justify-between rounded-xl border px-4 py-3 ${
                selected ? 'border-gold bg-gold/10' : 'border-hairline bg-background-elevated'
              } ${disabled ? 'opacity-40' : ''}`}
            >
              <Text className="text-ink">{spell.name}</Text>
              <Text className="font-sans text-xs text-muted">{spell.school}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text className="mb-1 font-serif text-lg text-gold">Magias de 1º nível</Text>
      <Text className="mb-3 font-sans text-sm text-muted">
        {preparedFormula
          ? `Sugestão: escolha até ${spellTarget} (a quantidade real depende do seu modificador de habilidade)`
          : `Escolha ${spellTarget} (${chosenSpells.length}/${spellTarget})`}
      </Text>
      <View className="gap-2">
        {availableSpells.map((spell) => {
          const selected = chosenSpells.includes(spell.name);
          const disabled = !preparedFormula && !selected && chosenSpells.length >= spellTarget;
          return (
            <Pressable
              key={spell.name}
              disabled={disabled}
              onPress={() => toggleSpell(spell.name)}
              className={`flex-row items-center justify-between rounded-xl border px-4 py-3 ${
                selected ? 'border-gold bg-gold/10' : 'border-hairline bg-background-elevated'
              } ${disabled ? 'opacity-40' : ''}`}
            >
              <Text className="text-ink">{spell.name}</Text>
              <Text className="font-sans text-xs text-muted">{spell.school}</Text>
            </Pressable>
          );
        })}
      </View>
    </WizardScreen>
  );
}
