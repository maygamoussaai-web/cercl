import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/constants/theme';
import { fetchNotifications, markNotificationRead } from '@/lib/api/notifications';
import type { AppNotification } from '@/types';

const LABELS: Record<string, string> = {
  friend_request: "Nouvelle demande d'ami",
  friend_request_accepted: "Demande d'ami acceptée",
  game_launched: 'Une partie vient d\'être lancée 🔥',
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<AppNotification[]>([]);

  const load = useCallback(() => {
    fetchNotifications().then(setItems).catch(() => {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handlePress = async (item: AppNotification) => {
    if (!item.read_at) {
      markNotificationRead(item.id).catch(() => {});
    }
    if (item.type === 'game_launched' && (item.payload as any)?.game_id) {
      router.push(`/game/${(item.payload as any).game_id}`);
    } else if (item.type === 'friend_request' || item.type === 'friend_request_accepted') {
      router.push('/(tabs)/amis');
    } else if (item.circle_id) {
      router.push(`/circle/${item.circle_id}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <FlatList
        data={items}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => (
          <Pressable style={[styles.row, !item.read_at && styles.unread]} onPress={() => handlePress(item)}>
            <Text style={styles.label}>{LABELS[item.type] ?? item.type}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.subtitle}>Aucune notification.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: spacing.lg },
  subtitle: { color: colors.textMuted, fontSize: 14 },
  row: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  unread: { backgroundColor: colors.surface },
  label: { color: colors.text, fontSize: 15 },
});
