import { Text, View } from 'react-native';
import { Card } from '../../../components/ui';

export default function JournalScreen() {
  return (
    <View className="flex-1 bg-background px-5 pt-16">
      <Text className="font-serif text-3xl text-gold">Diário de Campanha</Text>
      <Text className="mt-2 font-sans text-base text-muted">
        Gravação de sessões por áudio, transcrição e recap narrativo chegam na Fase 6.
      </Text>
      <Card className="mt-6">
        <Text className="font-sans text-ink/80">Em breve por aqui.</Text>
      </Card>
    </View>
  );
}
