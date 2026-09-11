import { Text, View } from 'react-native';
import { Card } from '../../../components/ui';

export default function CreateScreen() {
  return (
    <View className="flex-1 bg-background px-5 pt-16">
      <Text className="font-serif text-3xl text-gold">Criar Personagem</Text>
      <Text className="mt-2 font-sans text-base text-muted">
        O assistente guiado de criação (raça, classe, atributos, magias...) chega na Fase 4.
      </Text>
      <Card className="mt-6">
        <Text className="font-sans text-ink/80">Em breve por aqui.</Text>
      </Card>
    </View>
  );
}
