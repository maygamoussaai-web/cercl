import { useState } from 'react';
import { Link } from 'expo-router';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native';

import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { colors, spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) Alert.alert('Connexion impossible', error.message);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>CERCL</Text>
      <Text style={styles.subtitle}>Retrouve tes potes.</Text>

      <TextField label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextField label="Mot de passe" secureTextEntry value={password} onChangeText={setPassword} />

      <Button label="Se connecter" onPress={handleSignIn} loading={loading} />

      <Link href="/sign-up" style={styles.link}>
        <Text style={styles.linkText}>Pas encore de compte ? Créer un compte</Text>
      </Link>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center' },
  title: { color: colors.text, fontSize: 36, fontWeight: '800', marginBottom: spacing.xs },
  subtitle: { color: colors.textMuted, fontSize: 16, marginBottom: spacing.xl },
  link: { marginTop: spacing.lg, alignSelf: 'center' },
  linkText: { color: colors.accent, fontSize: 14 },
});
