import { useCallback, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, FlatList, Share, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors, spacing } from '@/constants/theme';
import { createCircleInvite, fetchCircle, fetchCircleMembers, launchGame } from '@/lib/api/circles';
import { fetchActiveGameForCircle } from '@/lib/api/game';
import type { Circle, CircleMember, Game } from '@/types';

export default function CircleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [launching, setLaunching] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [c, m, g] = await Promise.all([fetchCircle(id), fetchCircleMembers(id), fetchActiveGameForCircle(id)]);
      setCircle(c);
      setMembers(m);
      setActiveGame(g);
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

  const handleInvite = async () => {
    if (!id) return;
    setInviting(true);
    try {
      const invite = await createCircleInvite(id);
      await Share.share({ message: `Rejoins mon Cercle sur CERCL : cercl.app/join/${invite.code}` });
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setInviting(false);
    }
  };

  const handleLaunch = async () => {
    if (!id) return;
    if (activeGame) {
      router.push(`/game/${activeGame.id}`);
      return;
    }
    setLaunching(true);
    try {
      const g = await launchGame(id);
      router.push(`/game/${g.id}`);
    } catch (e: any) {
      if (e.message?.includes('GAME_ALREADY_ACTIVE')) {
        await load();
        Alert.alert('Partie déjà en cours', "Quelqu'un vient de la lancer — tu peux la rejoindre.");
      } else {
        Alert.alert('Erreur', e.message);
      }
    } finally {
      setLaunching(false);
    }
  };

  if (loading || !circle) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{circle.name}</Text>
      <Text style={styles.subtitle}>{members.length}/10 membres</Text>

      <FlatList
        data={members}
        keyExtractor={(m) => m.user_id}
        style={{ marginVertical: spacing.lg }}
        renderItem={({ item }) => (
          <View style={styles.memberRow}>
            <Text style={styles.memberName}>{item.profiles?.display_name ?? '…'}</Text>
            <Text style={styles.memberHandle}>@{item.profiles?.handle}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.subtitle}>Aucun membre pour l'instant.</Text>}
      />

      <Button label="Inviter des potes" onPress={handleInvite} loading={inviting} variant="secondary" />
      <View style={{ height: spacing.sm }} />
      <Button label={activeGame ? 'Rejoindre la partie' : 'Lancer une partie'} onPress={handleLaunch} loading={launching} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: spacing.lg },
  subtitle: { color: colors.textMuted, fontSize: 14, marginTop: spacing.xs },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberName: { color: colors.text, fontSize: 16, fontWeight: '600' },
  memberHandle: { color: colors.textMuted, fontSize: 14 },
});
