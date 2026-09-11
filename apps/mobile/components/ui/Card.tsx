import type { ReactNode } from 'react';
import * as Haptics from 'expo-haptics';
import { Pressable, View } from 'react-native';

export type CardProps = {
  children: ReactNode;
  onPress?: () => void;
  selected?: boolean;
  className?: string;
};

// DECISION: haptic feedback on press is a spec requirement for selection
// cards specifically (character creator step cards), not every Card use —
// but since it's a no-op unless `onPress` is provided, it's safe to bake
// into the shared component instead of a separate SelectableCard.
export const Card = ({ children, onPress, selected = false, className = '' }: CardProps) => {
  const baseClasses = `rounded-2xl border bg-background-elevated p-4 ${selected ? 'border-gold' : 'border-hairline'} ${className}`;

  if (!onPress) {
    return <View className={baseClasses}>{children}</View>;
  }

  const handlePress = (): void => {
    void Haptics.selectionAsync();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`active:opacity-80 ${baseClasses}`}
    >
      {children}
    </Pressable>
  );
};
