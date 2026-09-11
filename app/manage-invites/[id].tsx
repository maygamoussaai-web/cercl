import { useCallback, useState } from 'react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Alert, FlatList, Share, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors, radius, spacing } from '@/constants/theme';
import { createCircleInvite, fetchCircleInvites, revokeCircleInvite } from '@/lib/api/circles';
import type { CircleInvite } from '@/types';

function inviteStatus(invite: CircleInvite) {
  if (invite.used_at) return 'Utilisée';
  if (new Date(invite.expires_at).getTime() < Date.now()) return 'Expirée';
  return 'Active';
}

export default function ManageInvitesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [invites, setInvites] = useState<CircleInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      setInvites(await fetchCircleInvites(id));
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

  const handleCreate = async () => {
    if (!id) return;
    setCreating(true);
    try {
      const invite = await createCircleInvite(id);
      await Share.share({ message: `Rejoins mon Cercle sur CERCL : cercl.app/join/${invite.code}` });
      await load();
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = (inviteId: string) => {
    Alert.alert('Annuler cette invitation ?', undefined, [
      { text: 'Non', style: 'cancel' },
      {
        text: "Annuler l'invitation",
        style: 'destructive',
        onPress: async () => {
          try {
            await revokeCircleInvite(inviteId);
            load();
          } catch (e: any) {
            Alert.alert('Erreur', e.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invitations</Text>
      <Button label="Créer une nouvelle invitation" onPress={handleCreate} loading={creating} />

      <FlatList
        style={{ marginTop: spacing.lg }}
        data={invites}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => {
          const status = inviteStatus(item);
          return (
            <View style={styles.card}>
              <Text style={styles.code}>{item.code}</Text>
              <Text style={[styles.status, status === 'Active' && styles.statusActive]}>{status}</Text>
              {status === 'Active' && (
                <Text style={styles.revoke} onPress={() => handleRevoke(item.id)}>
                  Annuler
                </Text>
              )}
            </View>
          );
        }}
        ListEmptyComponent={!loading ? <Text style={styles.subtitle}>Aucune invitation créée.</Text> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: spacing.lg, marginBottom: spacing.lg },
  subtitle: { color: colors.textMuted, fontSize: 14, marginTop: spacing.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  code: { color: colors.text, fontSize: 15, fontWeight: '700' },
  status: { color: colors.textMuted, fontSize: 13 },
  statusActive: { color: colors.success },
  revoke: { color: colors.danger, fontSize: 13, fontWeight: '600' },
});
