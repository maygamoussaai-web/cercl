import { useCallback, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, FlatList, Share, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { colors, radius, shadow, spacing } from '@/constants/theme';
import { createCircleInvite, fetchCircle, fetchCircleMembers, launchGame } from '@/lib/api/circles';
import { getCircleConversationId } from '@/lib/api/chat';
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
      const sorted = [...m].sort((a, b) => (a.profiles?.handle ?? '').localeCompare(b.profiles?.handle ?? ''));
      setCircle(c);
      setMembers(sorted);
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

  const handleOpenChat = async () => {
    if (!id) return;
    try {
      const conversationId = await getCircleConversationId(id);
      if (conversationId) router.push(`/conversation/${conversationId}`);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  };

  if (loading || !circle) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{circle.name}</Text>
      <Text style={styles.subtitle}>{members.length}/10 membres • ordre alphabétique</Text>

      <FlatList
        data={members}
        keyExtractor={(m) => m.user_id}
        style={{ marginVertical: spacing.lg }}
        renderItem={({ item }) => (
          <View style={styles.memberRow}>
            <Avatar name={item.profiles?.display_name ?? '?'} size={36} />
            <View style={{ marginLeft: spacing.sm, flex: 1 }}>
              <Text style={styles.memberName}>{item.profiles?.display_name ?? '…'}</Text>
              <Text style={styles.memberHandle}>@{item.profiles?.handle}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.subtitle}>Aucun membre pour l'instant.</Text>}
      />

      <Button label="Discussion du Cercle" onPress={handleOpenChat} variant="secondary" />
      <View style={{ height: spacing.sm }} />
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
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberName: { color: colors.text, fontSize: 16, fontWeight: '600' },
  memberHandle: { color: colors.textMuted, fontSize: 14 },
});
