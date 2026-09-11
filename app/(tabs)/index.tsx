import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { colors, radius, shadow, spacing } from '@/constants/theme';
import { fetchMyCircles } from '@/lib/api/circles';
import type { Circle } from '@/types';

export default function CerclesScreen() {
  const router = useRouter();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      fetchMyCircles()
        .then((data) => active && setCircles(data))
        .finally(() => active && setLoading(false));
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cercles</Text>
        <Pressable style={styles.addButton} onPress={() => router.push('/circle/create')}>
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>

      <FlatList
        data={circles}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/circle/${item.id}`)}>
            <Avatar name={item.name} size={40} uri={item.image_url} />
            <Text style={styles.cardTitle}>{item.name}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Aucun Cercle</Text>
              <Text style={styles.emptySubtitle}>Crée ton premier Cercle pour retrouver tes potes.</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  addButton: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: '#0B0B10', fontSize: 22, fontWeight: '700', lineHeight: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 64 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.xs },
  emptySubtitle: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
});
