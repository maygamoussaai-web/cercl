import { Alert, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function ProfilScreen() {
  const { profile, session, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Avatar name={profile?.display_name ?? '?'} size={88} />
      <Text style={styles.name}>{profile?.display_name ?? '…'}</Text>
      <Text style={styles.handle}>@{profile?.handle}</Text>
      {session?.user.phone && <Text style={styles.phone}>{session.user.phone}</Text>}

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
  name: { color: colors.text, fontSize: 22, fontWeight: '800', marginTop: spacing.lg },
  handle: { color: colors.textMuted, fontSize: 15, marginTop: spacing.xs },
  phone: { color: colors.textMuted, fontSize: 13, marginTop: spacing.xs },
});
