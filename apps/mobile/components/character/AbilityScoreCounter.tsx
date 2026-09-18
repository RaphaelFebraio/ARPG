import * as Haptics from 'expo-haptics';
import { Pressable, Text, View } from 'react-native';
import { ABILITY_LABELS_PT, type AbilityScore } from '@grimoire/shared';

export type AbilityScoreCounterProps = {
  ability: AbilityScore;
  score: number;
  modifier: number;
  cost?: number;
  onIncrement: () => void;
  onDecrement: () => void;
  canIncrement: boolean;
  canDecrement: boolean;
};

export const AbilityScoreCounter = ({
  ability,
  score,
  modifier,
  cost,
  onIncrement,
  onDecrement,
  canIncrement,
  canDecrement,
}: AbilityScoreCounterProps) => {
  const handlePress = (action: () => void, allowed: boolean): void => {
    if (!allowed) return;
    void Haptics.selectionAsync();
    action();
  };

  return (
    <View className="flex-row items-center justify-between rounded-xl border border-hairline bg-background-elevated px-4 py-3">
      <View>
        <Text className="font-sans text-sm text-muted">{ABILITY_LABELS_PT[ability]}</Text>
        {cost !== undefined ? <Text className="font-sans text-xs text-muted/70">Custo: {cost} pts</Text> : null}
      </View>

      <View className="flex-row items-center gap-4">
        <Pressable
          onPress={() => handlePress(onDecrement, canDecrement)}
          disabled={!canDecrement}
          accessibilityRole="button"
          accessibilityLabel={`Diminuir ${ABILITY_LABELS_PT[ability]}`}
          className={`h-8 w-8 items-center justify-center rounded-full border border-gold/40 ${canDecrement ? '' : 'opacity-30'}`}
        >
          <Text className="text-lg text-gold">−</Text>
        </Pressable>

        <View className="w-14 items-center">
          <Text className="font-serif text-2xl text-ink">{score}</Text>
          <Text className="font-sans text-xs text-muted">{modifier >= 0 ? `+${modifier}` : modifier}</Text>
        </View>

        <Pressable
          onPress={() => handlePress(onIncrement, canIncrement)}
          disabled={!canIncrement}
          accessibilityRole="button"
          accessibilityLabel={`Aumentar ${ABILITY_LABELS_PT[ability]}`}
          className={`h-8 w-8 items-center justify-center rounded-full border border-gold/40 ${canIncrement ? '' : 'opacity-30'}`}
        >
          <Text className="text-lg text-gold">+</Text>
        </Pressable>
      </View>
    </View>
  );
};
