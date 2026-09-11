import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { colors, spacing } from '@/constants/theme';
import { fetchBlockedUsers, unblockUser } from '@/lib/api/friends';
import type { Profile } from '@/types';

export default function BlockedUsersScreen() {
  const [blocked, setBlocked] = useState<Profile[]>([]);

  const load = useCallback(() => {
    fetchBlockedUsers().then(setBlocked).catch(() => {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleUnblock = async (userId: string) => {
    try {
      await unblockUser(userId);
      load();
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Utilisateurs bloqués</Text>
      <FlatList
        data={blocked}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Avatar name={item.display_name} size={36} uri={item.avatar_url} />
            <Text style={styles.name}>{item.display_name}</Text>
            <Text style={styles.link} onPress={() => handleUnblock(item.id)}>
              Débloquer
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.subtitle}>Personne de bloqué.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: spacing.lg, marginBottom: spacing.lg },
  subtitle: { color: colors.textMuted, fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  name: { color: colors.text, fontSize: 15, flex: 1 },
  link: { color: colors.accent, fontSize: 13, fontWeight: '600' },
});
