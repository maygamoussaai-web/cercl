import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getInvitePreview, joinCircleWithInvite } from '@/lib/api/circles';

export default function JoinScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { session } = useAuth();
  const router = useRouter();
  const [preview, setPreview] = useState<{ circle_name: string; inviter_name: string; is_valid: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!code) return;
    getInvitePreview(code)
      .then((data) => setPreview(data ?? null))
      .finally(() => setLoading(false));
  }, [code]);

  const handleJoin = async () => {
    if (!code) return;
    if (!session) {
      Alert.alert('Connecte-toi', "Crée un compte ou connecte-toi pour rejoindre ce Cercle.");
      router.push('/sign-up');
      return;
    }
    setJoining(true);
    try {
      const circle = await joinCircleWithInvite(code);
      router.replace(`/circle/${circle.id}`);
    } catch (e: any) {
      Alert.alert('Impossible de rejoindre', e.message ?? "Cette invitation n'est plus valide.");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!preview || !preview.is_valid) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Invitation introuvable</Text>
        <Text style={styles.subtitle}>Ce lien a expiré ou a déjà été utilisé.</Text>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <Text style={styles.title}>{preview.inviter_name} t'invite à rejoindre son Cercle</Text>
      <Text style={styles.circleName}>{preview.circle_name}</Text>
      <Button label="Rejoindre le Cercle" onPress={handleJoin} loading={joining} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center', alignItems: 'center' },
  title: { color: colors.text, fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { color: colors.textMuted, fontSize: 15, textAlign: 'center' },
  circleName: { color: colors.accent, fontSize: 28, fontWeight: '800', marginBottom: spacing.xl },
});
