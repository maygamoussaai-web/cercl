import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { colors, spacing } from '@/constants/theme';
import { getOrCreateDirectConversation } from '@/lib/api/chat';
import {
  blockUser,
  fetchFriends,
  fetchIncomingRequests,
  removeFriend,
  respondToRequest,
  searchProfilesByHandle,
  sendFriendRequest,
} from '@/lib/api/friends';
import type { FriendRequest, Profile } from '@/types';

export default function AmisScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Profile[]>([]);

  const loadAll = useCallback(() => {
    fetchIncomingRequests().then(setRequests).catch(() => {});
    fetchFriends().then(setFriends).catch(() => {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  const handleSearch = async () => {
    try {
      setResults(await searchProfilesByHandle(query));
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  };

  const handleAdd = async (userId: string) => {
    try {
      await sendFriendRequest(userId);
      Alert.alert('Demande envoyée');
      setResults((r) => r.filter((p) => p.id !== userId));
    } catch (e: any) {
      Alert.alert('Erreur', e.message?.includes('ALREADY_FRIENDS') ? 'Déjà amis.' : e.message);
    }
  };

  const handleRespond = async (id: string, accept: boolean) => {
    await respondToRequest(id, accept);
    loadAll();
  };

  const handleMessage = async (userId: string) => {
    try {
      const conversationId = await getOrCreateDirectConversation(userId);
      router.push(`/conversation/${conversationId}`);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  };

  const handleRemove = (userId: string, name: string) => {
    Alert.alert(`Retirer ${name} de tes amis ?`, undefined, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Retirer',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeFriend(userId);
            loadAll();
          } catch (e: any) {
            Alert.alert('Erreur', e.message);
          }
        },
      },
    ]);
  };

  const handleBlock = (userId: string, name: string) => {
    Alert.alert(`Bloquer ${name} ?`, "Vous ne pourrez plus vous envoyer de demandes ni de messages.", [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Bloquer',
        style: 'destructive',
        onPress: async () => {
          try {
            await blockUser(userId);
            loadAll();
            setResults((r) => r.filter((p) => p.id !== userId));
          } catch (e: any) {
            Alert.alert('Erreur', e.message);
          }
        },
      },
    ]);
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}
      ListHeaderComponent={
        <View>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Amis</Text>
            <Text style={styles.blockedLink} onPress={() => router.push('/blocked-users')}>
              Bloqués
            </Text>
          </View>

          <TextField placeholder="Chercher un @identifiant" value={query} onChangeText={setQuery} onSubmitEditing={handleSearch} autoCapitalize="none" />
          <Button label="Chercher" onPress={handleSearch} variant="secondary" />

          {results.length > 0 && (
            <View style={{ marginTop: spacing.md }}>
              {results.map((p) => (
                <View key={p.id} style={styles.row}>
                  <Avatar name={p.display_name} size={36} uri={p.avatar_url} />
                  <Text style={styles.name}>
                    {p.display_name} <Text style={styles.handle}>@{p.handle}</Text>
                  </Text>
                  <Button label="Ajouter" onPress={() => handleAdd(p.id)} variant="secondary" />
                </View>
              ))}
            </View>
          )}

          {requests.length > 0 && (
            <View style={{ marginTop: spacing.xl }}>
              <Text style={styles.sectionTitle}>Demandes reçues</Text>
              {requests.map((r) => (
                <View key={r.id} style={styles.row}>
                  <Avatar name={r.sender?.display_name ?? '?'} size={36} uri={r.sender?.avatar_url} />
                  <Text style={styles.name}>{r.sender?.display_name}</Text>
                  <View style={{ flexDirection: 'row' }}>
                    <Button label="Accepter" onPress={() => handleRespond(r.id, true)} />
                    <View style={{ width: spacing.sm }} />
                    <Button label="Refuser" onPress={() => handleRespond(r.id, false)} variant="secondary" />
                  </View>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.sectionTitle}>Mes amis</Text>
        </View>
      }
      data={friends}
      keyExtractor={(f) => f.id}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Avatar name={item.display_name} size={36} uri={item.avatar_url} />
          <Text style={styles.name}>
            {item.display_name} <Text style={styles.handle}>@{item.handle}</Text>
          </Text>
          <Button label="Message" onPress={() => handleMessage(item.id)} variant="secondary" />
          <Text style={styles.removeLink} onPress={() => handleRemove(item.id, item.display_name)}>
            Retirer
          </Text>
          <Text style={styles.blockLink} onPress={() => handleBlock(item.id, item.display_name)}>
            Bloquer
          </Text>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.subtitle}>Aucun ami pour l'instant.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  blockedLink: { color: colors.textMuted, fontSize: 13 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm },
  subtitle: { color: colors.textMuted, fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  name: { color: colors.text, fontSize: 15, flex: 1 },
  handle: { color: colors.textMuted },
  removeLink: { color: colors.danger, fontSize: 12, marginLeft: spacing.xs },
  blockLink: { color: colors.textMuted, fontSize: 12, marginLeft: spacing.xs },
});
