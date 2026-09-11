import { useCallback, useState } from 'react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { colors, spacing } from '@/constants/theme';
import { addMemberDirect, fetchCircleMembers } from '@/lib/api/circles';
import { fetchFriends } from '@/lib/api/friends';
import type { Profile } from '@/types';

export default function AddMemberScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [candidates, setCandidates] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [friends, members] = await Promise.all([fetchFriends(), fetchCircleMembers(id)]);
      const memberIds = new Set(members.map((m) => m.user_id));
      setCandidates(friends.filter((f) => !memberIds.has(f.id)));
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleAdd = async (userId: string) => {
    if (!id) return;
    setAddingId(userId);
    try {
      await addMemberDirect(id, userId);
      setCandidates((c) => c.filter((p) => p.id !== userId));
    } catch (e: any) {
      Alert.alert('Erreur', e.message?.includes('CIRCLE_FULL') ? 'Ce Cercle a déjà 10 membres.' : e.message);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter un membre</Text>
      <FlatList
        data={candidates}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Avatar name={item.display_name} size={36} />
            <Text style={styles.name}>
              {item.display_name} <Text style={styles.handle}>@{item.handle}</Text>
            </Text>
            <Button label="Ajouter" onPress={() => handleAdd(item.id)} loading={addingId === item.id} variant="secondary" />
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.subtitle}>Tous tes amis sont déjà dans ce Cercle (ou tu n'as pas encore d'amis à ajouter).</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: spacing.lg, marginBottom: spacing.lg },
  subtitle: { color: colors.textMuted, fontSize: 14, marginTop: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  name: { color: colors.text, fontSize: 15, flex: 1 },
  handle: { color: colors.textMuted },
});
