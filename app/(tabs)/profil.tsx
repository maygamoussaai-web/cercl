import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { pickImage, uploadPublicImage } from '@/lib/api/media';
import { updateProfileAvatar } from '@/lib/api/profile';

export default function ProfilScreen() {
  const { profile, session, signOut, refreshProfile } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleChangePhoto = async () => {
    const uri = await pickImage(true);
    if (!uri || !session) return;
    setUploading(true);
    try {
      const publicUrl = await uploadPublicImage('avatars', `${session.user.id}/avatar.jpg`, uri);
      await updateProfileAvatar(publicUrl);
      await refreshProfile();
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Avatar name={profile?.display_name ?? '?'} size={88} uri={profile?.avatar_url} />
      <Text style={styles.changePhoto} onPress={handleChangePhoto}>
        {uploading ? 'Envoi…' : 'Changer la photo'}
      </Text>
      <Text style={styles.name}>{profile?.display_name ?? '…'}</Text>
      <Text style={styles.handle}>@{profile?.handle}</Text>
      {session?.user.email && <Text style={styles.email}>{session.user.email}</Text>}

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
  changePhoto: { color: colors.accent, fontSize: 13, fontWeight: '600', marginTop: spacing.sm },
  name: { color: colors.text, fontSize: 22, fontWeight: '800', marginTop: spacing.lg },
  handle: { color: colors.textMuted, fontSize: 15, marginTop: spacing.xs },
  email: { color: colors.textMuted, fontSize: 13, marginTop: spacing.xs },
});
