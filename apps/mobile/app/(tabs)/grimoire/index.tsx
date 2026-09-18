import { useEffect, useRef } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { ChatBubble, ChatInput } from '../../../components/chat';
import { COLORS } from '../../../constants/theme';
import { useChatStore } from '../../../stores/useChatStore';

export default function GrimoireScreen() {
  const messages = useChatStore((s) => s.messages);
  const loading = useChatStore((s) => s.loading);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages.length, loading]);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View className="border-b border-hairline px-5 pb-3 pt-16">
        <Text className="font-serif text-3xl text-gold">Grimório</Text>
        <Text className="mt-1 font-sans text-sm text-muted">Pergunte sobre regras do SRD 5.1.</Text>
      </View>

      <ScrollView ref={scrollRef} className="flex-1 px-4" contentContainerStyle={{ paddingVertical: 16, gap: 10 }}>
        {messages.length === 0 ? (
          <View className="mt-10 items-center gap-2 px-6">
            <Text className="text-center font-sans text-sm text-muted">
              Pergunte algo como "o que faz a magia Fireball?" ou "quais são os traços do elfo?". Se não estiver
              nos livros, eu digo que não sei — nunca invento uma regra.
            </Text>
          </View>
        ) : null}

        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}

        {loading ? (
          <View className="max-w-[60%] flex-row items-center gap-2 self-start rounded-2xl border border-hairline bg-background-elevated px-4 py-3">
            <ActivityIndicator size="small" color={COLORS.gold} />
            <Text className="font-sans text-sm text-muted">Consultando os livros...</Text>
          </View>
        ) : null}
      </ScrollView>

      <ChatInput onSend={sendMessage} disabled={loading} />
    </KeyboardAvoidingView>
  );
}
