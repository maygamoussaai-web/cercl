import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/constants/theme';

export default function AmisScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Amis</Text>
      <Text style={styles.subtitle}>Recherche, demandes et liste d'amis arrivent ici (§7).</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center' },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', marginBottom: spacing.sm },
  subtitle: { color: colors.textMuted, fontSize: 15 },
});
