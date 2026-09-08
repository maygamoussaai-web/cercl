import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function OnboardingScreen() {
  const { session, refreshProfile } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!session) return;
    const cleanedHandle = handle.trim().toLowerCase().replace(/^@/, '');
    if (!/^[a-z0-9_]{3,20}$/.test(cleanedHandle)) {
      Alert.alert('Identifiant invalide', 'Entre 3 et 20 caractères : lettres, chiffres, underscore.');
      return;
    }
    if (!displayName.trim()) {
      Alert.alert('Nom manquant', 'Choisis un nom à afficher.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('profiles').insert({
      id: session.user.id,
      display_name: displayName.trim(),
      handle: cleanedHandle,
    });
    setLoading(false);
    if (error) {
      if (error.code === '23505') {
        Alert.alert('Identifiant pris', 'Cet @identifiant est déjà utilisé, choisis-en un autre.');
      } else {
        Alert.alert('Erreur', error.message);
      }
      return;
    }
    await refreshProfile();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Presque prêt</Text>
      <Text style={styles.subtitle}>Choisis ton nom et ton @identifiant.</Text>

      <TextField label="Nom affiché" value={displayName} onChangeText={setDisplayName} placeholder="Moussa" />
      <TextField label="@identifiant" value={handle} onChangeText={setHandle} autoCapitalize="none" placeholder="moussa20210" />

      <Button label="C'est parti" onPress={handleSubmit} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center' },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: spacing.xs },
  subtitle: { color: colors.textMuted, fontSize: 15, marginBottom: spacing.xl },
});
