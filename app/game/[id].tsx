import { useCallback, useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { colors, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import {
  advanceTurn,
  chooseTurnType,
  fetchGame,
  fetchGamePlayers,
  fetchLatestTurn,
  joinGame,
  setCustomQuestion,
  subscribeToGame,
} from '@/lib/api/game';
import type { Game } from '@/types';

function Bottle() {
  return (
    <View style={styles.bottleWrap}>
      <View style={styles.bottleNeck} />
      <View style={styles.bottleBody} />
    </View>
  );
}

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();

  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [turn, setTurn] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [customText, setCustomText] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [g, p, t] = await Promise.all([fetchGame(id), fetchGamePlayers(id), fetchLatestTurn(id)]);
      const sortedPlayers = [...p].sort((a, b) => (a.profiles?.handle ?? '').localeCompare(b.profiles?.handle ?? ''));
      setGame(g);
      setPlayers(sortedPlayers);
      setTurn(t);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!id) return undefined;
    return subscribeToGame(id, load);
  }, [id, load]);

  const myId = session?.user.id;
  const isPlaying = players.some((p) => p.user_id === myId);
  const isTarget = turn && turn.target_id === myId;
  const isPoser = turn && turn.poser_id === myId;

  const handleJoin = async () => {
    if (!id) return;
    setBusy(true);
    try {
      await joinGame(id);
      await load();
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleAdvance = async () => {
    if (!id) return;
    setBusy(true);
    try {
      await advanceTurn(id);
      await load();
    } catch (e: any) {
      Alert.alert('Erreur', e.message?.includes('NOT_ENOUGH_PLAYERS') ? 'Il faut au moins 2 joueurs.' : e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleChoice = async (choice: 'action' | 'verite') => {
    if (!turn) return;
    setBusy(true);
    try {
      await chooseTurnType(turn.id, choice);
      await load();
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleCustomSubmit = async () => {
    if (!turn || !customText.trim()) return;
    setBusy(true);
    try {
      await setCustomQuestion(turn.id, customText.trim());
      setCustomText('');
      await load();
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading || !game) {
    return <View style={styles.container} />;
  }

  const targetPlayer = players.find((p) => p.user_id === turn?.target_id);
  const poserPlayer = players.find((p) => p.user_id === turn?.poser_id);
  const revealedText = turn?.custom_question ?? turn?.game_content?.text_content ?? null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Action ou Vérité</Text>

      {game.status === 'lobby' && (
        <View>
          <Text style={styles.subtitle}>{players.length} joueur(s) dans le lobby</Text>
          {players.map((p) => (
            <View key={p.user_id} style={styles.playerRow}>
              <Avatar name={p.profiles?.display_name ?? '?'} size={32} />
              <Text style={styles.playerName}>{p.profiles?.display_name}</Text>
            </View>
          ))}
          {!isPlaying && <Button label="Rejoindre" onPress={handleJoin} loading={busy} />}
          {isPlaying && (
            <Button label="Commencer la partie" onPress={handleAdvance} loading={busy} disabled={players.length < 2} />
          )}
          {players.length < 2 && <Text style={styles.hint}>Il faut au moins 2 joueurs pour commencer.</Text>}
        </View>
      )}

      {game.status === 'in_progress' && turn && (
        <View>
          <Bottle />
          <View style={styles.rolesRow}>
            <View style={styles.roleBlock}>
              <Avatar name={targetPlayer?.profiles?.display_name ?? '?'} size={48} />
              <Text style={styles.roleLabel}>Cible (répond)</Text>
              <Text style={styles.roleName}>{targetPlayer?.profiles?.display_name ?? '…'}</Text>
            </View>
            <View style={styles.roleBlock}>
              <Avatar name={poserPlayer?.profiles?.display_name ?? '?'} size={48} />
              <Text style={styles.roleLabel}>Poseur (pose la question)</Text>
              <Text style={styles.roleName}>{poserPlayer?.profiles?.display_name ?? '…'}</Text>
            </View>
          </View>

          {isTarget && !turn.choice && (
            <View style={styles.choiceRow}>
              <Button label="Action" onPress={() => handleChoice('action')} loading={busy} />
              <View style={{ width: spacing.sm }} />
              <Button label="Vérité" onPress={() => handleChoice('verite')} loading={busy} variant="secondary" />
            </View>
          )}

          {!turn.choice && !isTarget && (
            <Text style={styles.hint}>En attente du choix Action/Vérité de {targetPlayer?.profiles?.display_name}…</Text>
          )}

          {isPoser && turn.choice && !revealedText && (
            <View style={{ marginTop: spacing.lg }}>
              <Text style={styles.subtitle}>
                Pas de question dans la banque pour l'instant — écris-en une pour {targetPlayer?.profiles?.display_name} :
              </Text>
              <TextField placeholder="Ta question" value={customText} onChangeText={setCustomText} multiline />
              <Button label="Valider" onPress={handleCustomSubmit} loading={busy} />
            </View>
          )}

          {!isPoser && turn.choice && !revealedText && (
            <Text style={styles.hint}>En attente que {poserPlayer?.profiles?.display_name} écrive sa question…</Text>
          )}

          {revealedText && (
            <View style={styles.card}>
              <Text style={styles.cardType}>{turn.choice === 'action' ? 'ACTION' : 'VÉRITÉ'}</Text>
              <Text style={styles.cardText}>{revealedText}</Text>
            </View>
          )}

          {turn.completed_at && <Button label="Tour suivant" onPress={handleAdvance} loading={busy} />}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', marginTop: spacing.lg, marginBottom: spacing.lg },
  subtitle: { color: colors.textMuted, fontSize: 14, marginBottom: spacing.sm },
  playerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  playerName: { color: colors.text, fontSize: 16 },
  hint: { color: colors.textMuted, fontSize: 13, marginTop: spacing.sm, textAlign: 'center' },
  bottleWrap: { alignItems: 'center', marginBottom: spacing.lg },
  bottleNeck: { width: 14, height: 22, backgroundColor: colors.accent, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  bottleBody: { width: 34, height: 78, backgroundColor: colors.accent, borderRadius: 14, marginTop: -2 },
  rolesRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.lg },
  roleBlock: { alignItems: 'center', maxWidth: 140 },
  roleLabel: { color: colors.textMuted, fontSize: 12, marginTop: spacing.xs, textAlign: 'center' },
  roleName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  choiceRow: { flexDirection: 'row', marginTop: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginTop: spacing.lg },
  cardType: { color: colors.accent, fontWeight: '800', fontSize: 13, marginBottom: spacing.sm },
  cardText: { color: colors.text, fontSize: 18, fontWeight: '600' },
});
