import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function ProfilScreen() {
  const { profile, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.avatar} />
      <Text style={styles.name}>{profile?.display_name ?? '…'}</Text>
      <Text style={styles.handle}>@{profile?.handle}</Text>

      <View style={{ height: spacing.xl }} />
      <Button
        label="Se déconnecter"
        variant="secondary"
        onPress={() => {
          Alert.alert('Se déconnecter ?', undefined, [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Se déconnecter', style: 'destructive', onPress: signOut },
          ]);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 88, height: 88, borderRadius: radius.full, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
  name: { color: colors.text, fontSize: 22, fontWeight: '800' },
  handle: { color: colors.textMuted, fontSize: 15, marginTop: spacing.xs },
});
