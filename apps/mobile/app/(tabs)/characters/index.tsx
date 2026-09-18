import type { Character } from '@grimoire/shared';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, Text, View } from 'react-native';
import { Button, Card } from '../../../components/ui';
import { ApiError, charactersApi } from '../../../services/api';

export default function CharactersScreen() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setCharacters(await charactersApi.list());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível carregar seus personagens.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const handleDelete = (character: Character): void => {
    Alert.alert('Excluir personagem', `Excluir ${character.name}? Essa ação não pode ser desfeita.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await charactersApi.delete(character.id);
          void load();
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-background px-5 pt-16">
      <Text className="font-serif text-3xl text-gold">Personagens</Text>
      <Text className="mt-2 mb-6 font-sans text-base text-muted">Seus heróis salvos.</Text>

      {error ? <Text className="mb-4 font-sans text-sm text-ruby">{error}</Text> : null}

      <FlatList
        data={characters}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#D4A574" />}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={
          !loading ? (
            <Card>
              <Text className="font-sans text-ink/80">
                Nenhum personagem ainda. Toque em "Criar" para começar sua jornada.
              </Text>
            </Card>
          ) : null
        }
        renderItem={({ item }) => (
          <Card>
            <Text className="font-serif text-xl text-gold">{item.name}</Text>
            <Text className="font-sans text-sm text-muted">
              {item.race}
              {item.subrace ? ` (${item.subrace})` : ''} · {item.class} · Nível {item.level}
            </Text>
            <Text className="mt-1 font-sans text-xs text-muted">
              PV {item.hpMax} · CA {item.ac}
            </Text>
            <View className="mt-3">
              <Button label="Excluir" variant="destructive" onPress={() => handleDelete(item)} />
            </View>
          </Card>
        )}
      />

      <View className="py-4">
        <Button label="Criar novo personagem" onPress={() => router.push('/create')} />
      </View>
    </View>
  );
}
