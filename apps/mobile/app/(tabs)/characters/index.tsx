import { Text, View } from 'react-native';
import { Card } from '../../../components/ui';

export default function CharactersScreen() {
  return (
    <View className="flex-1 bg-background px-5 pt-16">
      <Text className="font-serif text-3xl text-gold">Personagens</Text>
      <Text className="mt-2 font-sans text-base text-muted">
        A lista de personagens salvos chega junto com o CRUD da Fase 4.
      </Text>
      <Card className="mt-6">
        <Text className="font-sans text-ink/80">Nenhum personagem ainda.</Text>
      </Card>
    </View>
  );
}
