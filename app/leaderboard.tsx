import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import { fetchMyCircles } from '@/lib/api/circles';
import type { Circle } from '@/types';

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours === 0 && minutes === 0) return '0 min';
  if (hours === 0) return `${minutes} min`;
  return `${hours} h ${minutes.toString().padStart(2, '0')}`;
}

export default function LeaderboardScreen() {
  const [circles, setCircles] = useState<Circle[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchMyCircles()
        .then((data) => {
          setCircles([...data].sort((a, b) => (b.total_play_seconds ?? 0) - (a.total_play_seconds ?? 0)));
        })
        .catch(() => {});
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Classement</Text>
      <Text style={styles.subtitle}>Temps de jeu cumulé par Cercle</Text>
      <FlatList
        style={{ marginTop: spacing.lg }}
        data={circles}
        keyExtractor={(c) => c.id}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={[styles.rank, index === 0 && styles.rankFirst]}>{index + 1}</Text>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.time}>{formatDuration(item.total_play_seconds ?? 0)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.subtitle}>Aucun Cercle pour l'instant.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: spacing.lg },
  subtitle: { color: colors.textMuted, fontSize: 14, marginTop: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rank: { color: colors.textMuted, fontWeight: '800', fontSize: 16, width: 28 },
  rankFirst: { color: colors.red },
  name: { color: colors.text, fontSize: 15, fontWeight: '600', flex: 1 },
  time: { color: colors.blue, fontSize: 14, fontWeight: '700' },
});
