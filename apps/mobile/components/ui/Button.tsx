import { ActivityIndicator, Pressable, Text } from 'react-native';
import { COLORS } from '../../constants/theme';

export type ButtonVariant = 'primary' | 'destructive' | 'secondary';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
};

const VARIANT_CLASSES: Record<ButtonVariant, { container: string; label: string }> = {
  primary: { container: 'bg-gold', label: 'text-background' },
  destructive: { container: 'bg-ruby', label: 'text-ink' },
  secondary: { container: 'border border-gold/40 bg-background-elevated', label: 'text-gold' },
};

const SPINNER_COLOR: Record<ButtonVariant, string> = {
  primary: COLORS.background,
  destructive: COLORS.textPrimary,
  secondary: COLORS.gold,
};

export const Button = ({ label, onPress, variant = 'primary', disabled = false, loading = false }: ButtonProps) => {
  const variantClasses = VARIANT_CLASSES[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      className={`items-center justify-center rounded-xl px-5 py-3 active:opacity-80 ${variantClasses.container} ${isDisabled ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={SPINNER_COLOR[variant]} />
      ) : (
        <Text className={`font-sans text-base font-semibold ${variantClasses.label}`}>{label}</Text>
      )}
    </Pressable>
  );
};
