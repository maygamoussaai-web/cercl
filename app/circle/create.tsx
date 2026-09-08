import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { colors, spacing } from '@/constants/theme';
import { createCircle } from '@/lib/api/circles';

export default function CreateCircleScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Nom manquant', 'Donne un nom à ton Cercle.');
      return;
    }
    setLoading(true);
    try {
      const circle = await createCircle(name.trim());
      router.replace(`/circle/${circle.id}`);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nouveau Cercle</Text>
      <TextField label="Nom du Cercle" value={name} onChangeText={setName} placeholder="Les Potos 🔥" />
      <Button label="Créer" onPress={handleCreate} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center' },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: spacing.xl },
});
