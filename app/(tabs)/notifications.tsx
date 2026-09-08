import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
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
  const [items, setItems] = useState<AppNotification[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications().then(setItems).catch(() => {});
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <FlatList
        data={items}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => markNotificationRead(item.id)}>
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
  label: { color: colors.text, fontSize: 15 },
});
