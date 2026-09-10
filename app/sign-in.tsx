import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native';

import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { colors, spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function SignInScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    const cleaned = phone.trim();
    if (!/^\+[1-9]\d{6,14}$/.test(cleaned)) {
      Alert.alert('Numéro invalide', 'Utilise le format international, ex : +33612345678');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: cleaned });
    setLoading(false);
    if (error) {
      Alert.alert('Erreur', error.message);
      return;
    }
    router.push({ pathname: '/verify-otp', params: { phone: cleaned } });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>CERCL</Text>
      <Text style={styles.subtitle}>Retrouve tes potes.</Text>

      <TextField
        label="Numéro de téléphone"
        placeholder="+33612345678"
        keyboardType="phone-pad"
        autoCapitalize="none"
        value={phone}
        onChangeText={setPhone}
      />

      <Button label="Recevoir le code" onPress={handleSendCode} loading={loading} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center' },
  title: { color: colors.text, fontSize: 36, fontWeight: '800', marginBottom: spacing.xs },
  subtitle: { color: colors.textMuted, fontSize: 16, marginBottom: spacing.xl },
});
