import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/constants/theme';

// Écran placeholder — sera remplacé par la vraie page des Cercles (§12 du cahier des charges).
export default function CerclesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cercles</Text>
      <Text style={styles.subtitle}>
        Fondation posée — la vraie page des Cercles arrive à la prochaine étape.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
  },
});
