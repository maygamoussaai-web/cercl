import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Alert, Animated, Easing, StyleSheet, Text, View } from 'react-native';

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

const WHEEL_SIZE = 260;
const WHEEL_RADIUS = 96;
const CENTER = WHEEL_SIZE / 2;
const AVATAR_SIZE = 44;

function positionFor(index: number, total: number) {
  const angle = (360 / total) * index;
  const rad = (angle * Math.PI) / 180;
  const x = CENTER + WHEEL_RADIUS * Math.sin(rad) - AVATAR_SIZE / 2;
  const y = CENTER - WHEEL_RADIUS * Math.cos(rad) - AVATAR_SIZE / 2;
  return { left: x, top: y };
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
  const [spinning, setSpinning] = useState(false);

  const rotation = useRef(new Animated.Value(0)).current;
  const rotationBase = useRef(0);
  const animatedTurnId = useRef<string | null>(null);

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

  useEffect(() => {
    if (!turn || !turn.target_id || players.length < 2) return;
    if (animatedTurnId.current === turn.id) return;

    const idx = players.findIndex((p) => p.user_id === turn.target_id);
    if (idx === -1) return;

    animatedTurnId.current = turn.id;
    const targetAngle = (360 / players.length) * idx;
    const ageMs = Date.now() - new Date(turn.created_at).getTime();

    if (ageMs > 8000) {
      rotation.setValue(targetAngle);
      rotationBase.current = targetAngle;
      return;
    }

    const currentMod = ((rotationBase.current % 360) + 360) % 360;
    let delta = targetAngle - currentMod;
    delta = ((delta % 360) + 360) % 360;
    const nextValue = rotationBase.current + 4 * 360 + delta;

    setSpinning(true);
    Animated.timing(rotation, {
      toValue: nextValue,
      duration: 2600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      rotationBase.current = nextValue;
      setSpinning(false);
    });
  }, [turn, players, rotation]);

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

  const rotateStyle = {
    transform: [
      { rotate: rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '1deg'], extrapolate: 'extend' }) },
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Action ou Vérité</Text>

      {game.status === 'lobby' && (
        <View>
          <Text style={styles.subtitle}>{players.length} joueur(s) dans le lobby</Text>
          {players.map((p) => (
            <View key={p.user_id} style={styles.playerRow}>
              <Avatar name={p.profiles?.display_name ?? '?'} size={32} uri={p.profiles?.avatar_url} />
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
        <View style={{ alignItems: 'center' }}>
          <View style={styles.wheel}>
            {players.map((p, i) => {
              const pos = positionFor(i, players.length);
              const isRevealedTarget = !spinning && p.user_id === turn.target_id;
              const isPoserAvatar = p.user_id === turn.poser_id;
              return (
                <View key={p.user_id} style={[styles.wheelSlot, pos]}>
                  <View style={[styles.avatarRing, isPoserAvatar && styles.ringPoser, isRevealedTarget && styles.ringTarget]}>
                    <Avatar name={p.profiles?.display_name ?? '?'} size={AVATAR_SIZE} uri={p.profiles?.avatar_url} />
                  </View>
                </View>
              );
            })}
            <Animated.View style={[styles.bottleWrap, rotateStyle]}>
              <View style={styles.bottleNeck} />
              <View style={styles.bottleBody} />
            </Animated.View>
          </View>

          {spinning ? (
            <Text style={styles.spinningText}>La bouteille tourne…</Text>
          ) : (
            <View style={styles.rolesRow}>
              <Text style={styles.roleText}>
                Cible : <Text style={styles.roleName}>{targetPlayer?.profiles?.display_name ?? '…'}</Text>
              </Text>
              <Text style={styles.roleText}>
                Pose la question : <Text style={styles.roleName}>{poserPlayer?.profiles?.display_name ?? '…'}</Text>
              </Text>
            </View>
          )}

          {!spinning && isTarget && !turn.choice && (
            <View style={styles.choiceRow}>
              <Button label="Action" onPress={() => handleChoice('action')} loading={busy} />
              <View style={{ width: spacing.sm }} />
              <Button label="Vérité" onPress={() => handleChoice('verite')} loading={busy} variant="secondary" />
            </View>
          )}

          {!spinning && !turn.choice && !isTarget && (
            <Text style={styles.hint}>En attente du choix Action/Vérité de {targetPlayer?.profiles?.display_name}…</Text>
          )}

          {!spinning && isPoser && turn.choice && !revealedText && (
            <View style={{ marginTop: spacing.lg, width: '100%' }}>
              <Text style={styles.subtitle}>
                Pas de question dans la banque pour l'instant — écris-en une pour {targetPlayer?.profiles?.display_name} :
              </Text>
              <TextField placeholder="Ta question" value={customText} onChangeText={setCustomText} multiline />
              <Button label="Valider" onPress={handleCustomSubmit} loading={busy} />
            </View>
          )}

          {!spinning && !isPoser && turn.choice && !revealedText && (
            <Text style={styles.hint}>En attente que {poserPlayer?.profiles?.display_name} écrive sa question…</Text>
          )}

          {!spinning && revealedText && (
            <View style={styles.card}>
              <Text style={styles.cardType}>{turn.choice === 'action' ? 'ACTION' : 'VÉRITÉ'}</Text>
              <Text style={styles.cardText}>{revealedText}</Text>
            </View>
          )}

          {!spinning && turn.completed_at && <Button label="Tour suivant" onPress={handleAdvance} loading={busy} />}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', marginTop: spacing.lg, marginBottom: spacing.lg, textAlign: 'center' },
  subtitle: { color: colors.textMuted, fontSize: 14, marginBottom: spacing.sm },
  playerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  playerName: { color: colors.text, fontSize: 16 },
  hint: { color: colors.textMuted, fontSize: 13, marginTop: spacing.sm, textAlign: 'center' },
  wheel: { width: WHEEL_SIZE, height: WHEEL_SIZE, marginBottom: spacing.lg },
  wheelSlot: { position: 'absolute', width: AVATAR_SIZE, height: AVATAR_SIZE },
  avatarRing: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ringPoser: { borderColor: colors.textMuted },
  ringTarget: { borderColor: colors.accent },
  bottleWrap: {
    position: 'absolute',
    left: CENTER - 17,
    top: CENTER - 45,
    width: 34,
    height: 90,
    alignItems: 'center',
  },
  bottleNeck: { width: 14, height: 22, backgroundColor: colors.accent, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  bottleBody: { width: 34, height: 68, backgroundColor: colors.accent, borderRadius: 14, marginTop: -2 },
  spinningText: { color: colors.accent, fontSize: 15, fontWeight: '700', marginBottom: spacing.lg },
  rolesRow: { alignItems: 'center', marginBottom: spacing.lg },
  roleText: { color: colors.textMuted, fontSize: 14, marginBottom: spacing.xs },
  roleName: { color: colors.text, fontWeight: '700' },
  choiceRow: { flexDirection: 'row', marginTop: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginTop: spacing.lg, width: '100%' },
  cardType: { color: colors.accent, fontWeight: '800', fontSize: 13, marginBottom: spacing.sm },
  cardText: { color: colors.text, fontSize: 18, fontWeight: '600' },
});
