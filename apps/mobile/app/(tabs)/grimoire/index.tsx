import { Text, View } from 'react-native';
import { Card } from '../../../components/ui';

export default function GrimoireScreen() {
  return (
    <View className="flex-1 bg-background px-5 pt-16">
      <Text className="font-serif text-3xl text-gold">Grimório</Text>
      <Text className="mt-2 font-sans text-base text-muted">
        Chat de consulta às regras do SRD 5.1, com fontes citadas, chega na Fase 5.
      </Text>
      <Card className="mt-6">
        <Text className="font-sans text-ink/80">Em breve por aqui.</Text>
      </Card>
    </View>
  );
}
