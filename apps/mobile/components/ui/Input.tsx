import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { COLORS } from '../../constants/theme';

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export const Input = ({ label, error, className = '', ...textInputProps }: InputProps) => {
  return (
    <View className="gap-1.5">
      {label ? <Text className="font-sans text-sm text-gold/90">{label}</Text> : null}
      <TextInput
        placeholderTextColor={COLORS.textSecondary}
        className={`rounded-xl border bg-background-elevated px-4 py-3 font-sans text-base text-ink ${error ? 'border-ruby' : 'border-hairline'} ${className}`}
        {...textInputProps}
      />
      {error ? <Text className="font-sans text-xs text-ruby">{error}</Text> : null}
    </View>
  );
};
