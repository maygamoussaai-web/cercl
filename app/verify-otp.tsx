import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native';

import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { colors, spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function VerifyOtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (!phone || code.trim().length < 4) return;
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ phone, token: code.trim(), type: 'sms' });
    setLoading(false);
    if (error) {
      Alert.alert('Code invalide', error.message);
    }
    // Pas de navigation manuelle : AuthContext capte le changement de session
    // et app/_layout.tsx redirige automatiquement (onboarding ou app).
  };

  const handleResend = async () => {
    if (!phone) return;
    setResending(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setResending(false);
    if (error) Alert.alert('Erreur', error.message);
    else Alert.alert('Code renvoyé');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Code reçu par SMS</Text>
      <Text style={styles.subtitle}>Envoyé au {phone}</Text>

      <TextField label="Code à 6 chiffres" keyboardType="number-pad" value={code} onChangeText={setCode} />

      <Button label="Valider" onPress={handleVerify} loading={loading} />
      <Button label="Renvoyer le code" onPress={handleResend} loading={resending} variant="secondary" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center' },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: spacing.xs },
  subtitle: { color: colors.textMuted, fontSize: 15, marginBottom: spacing.xl },
});
