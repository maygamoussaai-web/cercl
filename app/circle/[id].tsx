import { useCallback, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, FlatList, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { colors, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getCircleConversationId } from '@/lib/api/chat';
import {
  createCircleInvite,
  fetchCircle,
  fetchCircleMembers,
  launchGame,
  removeCircleMember,
  renameCircle,
  transferCircleOwnership,
  updateCircleImage,
} from '@/lib/api/circles';
import { fetchActiveGameForCircle } from '@/lib/api/game';
import { pickImage, uploadPublicImage } from '@/lib/api/media';
import { useCirclePresence } from '@/lib/api/presence';
import type { Circle, CircleMember, Game } from '@/types';

const MODES = [
  { key: 'chill', label: 'Chill' },
  { key: 'entre_nous', label: 'Entre nous' },
  { key: 'ambiance', label: 'Ambiance' },
  { key: 'chaos', label: 'Chaos' },
  { key: 'couple', label: 'Couple' },
];

export default function CircleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useAuth();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [selectedMode, setSelectedMode] = useState('chill');

  const myId = session?.user.id;
  const online = useCirclePresence(id, myId);

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

  const isCreator = circle && myId === circle.creator_id;

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
      const g = await launchGame(id, selectedMode);
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

  const handleStartRename = () => {
    setNewName(circle?.name ?? '');
    setRenaming(true);
  };

  const handleSaveRename = async () => {
    if (!id || !newName.trim()) return;
    try {
      await renameCircle(id, newName.trim());
      setRenaming(false);
      await load();
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  };

  const handleChangeImage = async () => {
    if (!id) return;
    const uri = await pickImage(true);
    if (!uri) return;
    setUploadingImage(true);
    try {
      const url = await uploadPublicImage('circle-images', `${id}/image.jpg`, uri);
      await updateCircleImage(id, url);
      await load();
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLeave = () => {
    if (!id || !myId) return;
    Alert.alert('Quitter ce Cercle ?', undefined, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Quitter',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeCircleMember(id, myId);
            router.replace('/');
          } catch (e: any) {
            Alert.alert('Erreur', e.message);
          }
        },
      },
    ]);
  };

  const handleRemoveMember = (userId: string, name: string) => {
    if (!id) return;
    Alert.alert(`Retirer ${name} ?`, undefined, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Retirer',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeCircleMember(id, userId);
            await load();
          } catch (e: any) {
            Alert.alert('Erreur', e.message);
          }
        },
      },
    ]);
  };

  const handleTransfer = (userId: string, name: string) => {
    if (!id) return;
    Alert.alert(`Faire de ${name} le nouveau créateur ?`, "Tu ne pourras plus gérer ce Cercle ensuite (sauf s'il te le retransfère).", [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Transférer',
        style: 'destructive',
        onPress: async () => {
          try {
            await transferCircleOwnership(id, userId);
            setTransferring(false);
            await load();
          } catch (e: any) {
            Alert.alert('Erreur', e.message);
          }
        },
      },
    ]);
  };

  if (loading || !circle) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Avatar name={circle.name} size={64} uri={circle.image_url} />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          {renaming ? (
            <View>
              <TextField value={newName} onChangeText={setNewName} placeholder="Nom du Cercle" />
              <View style={{ flexDirection: 'row' }}>
                <Button label="Enregistrer" onPress={handleSaveRename} />
                <View style={{ width: spacing.sm }} />
                <Button label="Annuler" onPress={() => setRenaming(false)} variant="secondary" />
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.title}>{circle.name}</Text>
              {isCreator && (
                <View style={{ flexDirection: 'row', gap: spacing.md }}>
                  <Text style={styles.editLink} onPress={handleStartRename}>
                    Renommer
                  </Text>
                  <Text style={styles.editLink} onPress={handleChangeImage}>
                    {uploadingImage ? 'Envoi…' : 'Changer la photo'}
                  </Text>
                </View>
              )}
            </>
          )}
          <Text style={styles.subtitle}>{members.length}/10 membres • ordre alphabétique</Text>
        </View>
      </View>

      <FlatList
        data={members}
        keyExtractor={(m) => m.user_id}
        style={{ marginVertical: spacing.lg }}
        renderItem={({ item }) => (
          <View style={styles.memberRow}>
            <Avatar
              name={item.profiles?.display_name ?? '?'}
              size={36}
              online={online.has(item.user_id)}
              uri={item.profiles?.avatar_url}
            />
            <View style={{ marginLeft: spacing.sm, flex: 1 }}>
              <Text style={styles.memberName}>{item.profiles?.display_name ?? '…'}</Text>
              <Text style={styles.memberHandle}>@{item.profiles?.handle}</Text>
            </View>
            {isCreator && item.user_id !== myId && !transferring && (
              <Text
                style={styles.removeLink}
                onPress={() => handleRemoveMember(item.user_id, item.profiles?.display_name ?? 'ce membre')}
              >
                Retirer
              </Text>
            )}
            {isCreator && item.user_id !== myId && transferring && (
              <Text style={styles.transferLink} onPress={() => handleTransfer(item.user_id, item.profiles?.display_name ?? 'ce membre')}>
                Transférer ici
              </Text>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.subtitle}>Aucun membre pour l'instant.</Text>}
      />

      {isCreator && (
        <>
          <Button label="Ajouter un membre" onPress={() => router.push(`/add-member/${id}`)} variant="secondary" />
          <View style={{ height: spacing.sm }} />
          <Button label="Gérer les invitations" onPress={() => router.push(`/manage-invites/${id}`)} variant="secondary" />
          <View style={{ height: spacing.sm }} />
          <Button
            label={transferring ? 'Annuler le transfert' : 'Transférer la propriété'}
            onPress={() => setTransferring((t) => !t)}
            variant="secondary"
          />
          <View style={{ height: spacing.sm }} />
        </>
      )}
      <Button label="Discussion du Cercle" onPress={handleOpenChat} variant="secondary" />
      <View style={{ height: spacing.sm }} />
      <Button label="Inviter des potes" onPress={handleInvite} loading={inviting} variant="secondary" />

      {!activeGame && (
        <>
          <View style={{ height: spacing.lg }} />
          <Text style={styles.modeLabel}>Ambiance de la partie</Text>
          <View style={styles.modeRow}>
            {MODES.map((m) => (
              <Pressable
                key={m.key}
                onPress={() => setSelectedMode(m.key)}
                style={[styles.modeChip, selectedMode === m.key && styles.modeChipActive]}
              >
                <Text style={[styles.modeChipText, selectedMode === m.key && styles.modeChipTextActive]}>{m.label}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
      <View style={{ height: spacing.sm }} />
      <Button label={activeGame ? 'Rejoindre la partie' : 'Lancer une partie'} onPress={handleLaunch} loading={launching} />

      {!isCreator && (
        <>
          <View style={{ height: spacing.sm }} />
          <Button label="Quitter le Cercle" onPress={handleLeave} variant="secondary" />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.lg },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  editLink: { color: colors.blue, fontSize: 13, fontWeight: '600', marginTop: spacing.xs },
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
  removeLink: { color: colors.red, fontSize: 13, fontWeight: '600' },
  transferLink: { color: colors.blue, fontSize: 13, fontWeight: '600' },
  modeLabel: { color: colors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: spacing.sm },
  modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  modeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeChipActive: { backgroundColor: colors.blue, borderColor: colors.blue },
  modeChipText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  modeChipTextActive: { color: '#FFFFFF' },
});
