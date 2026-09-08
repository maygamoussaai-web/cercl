import { useState } from 'react';
import { Link } from 'expo-router';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native';

import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { colors, spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (password.length < 6) {
      Alert.alert('Mot de passe trop court', 'Utilise au moins 6 caractères.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      Alert.alert('Inscription impossible', error.message);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Créer un compte</Text>

      <TextField label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextField label="Mot de passe" secureTextEntry value={password} onChangeText={setPassword} />

      <Button label="Créer mon compte" onPress={handleSignUp} loading={loading} />

      <Link href="/sign-in" style={styles.link}>
        <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
      </Link>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center' },
  title: { color: colors.text, fontSize: 32, fontWeight: '800', marginBottom: spacing.xl },
  link: { marginTop: spacing.lg, alignSelf: 'center' },
  linkText: { color: colors.accent, fontSize: 14 },
});
