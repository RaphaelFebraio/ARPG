import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Input } from '../ui';

export type ChatInputProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

export const ChatInput = ({ onSend, disabled = false }: ChatInputProps) => {
  const [text, setText] = useState('');

  const handleSend = (): void => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  const canSend = !disabled && text.trim().length > 0;

  return (
    <View className="flex-row items-end gap-2 border-t border-hairline bg-background px-4 py-3">
      <View className="flex-1">
        <Input
          value={text}
          onChangeText={setText}
          placeholder="Pergunte sobre uma regra..."
          editable={!disabled}
          multiline
        />
      </View>
      <Pressable
        onPress={handleSend}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel="Enviar pergunta"
        className={`h-11 w-11 items-center justify-center rounded-full bg-gold ${canSend ? '' : 'opacity-40'}`}
      >
        <Text className="text-lg text-background">➤</Text>
      </Pressable>
    </View>
  );
};
