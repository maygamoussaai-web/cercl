import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { brandGradient, colors, radius, spacing } from '@/constants/theme';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
};

// primary : dégradé bleu→rouge (action principale, la signature visuelle de CERCL).
// secondary : neutre (transparent + bordure) — la partie "noir/blanc" de l'identité.
// danger : rouge plein (actions destructives : retirer, bloquer, quitter…).
export function Button({ label, onPress, loading, disabled, variant = 'primary' }: Props) {
  const isDisabled = disabled || loading;

  const content = loading ? (
    <ActivityIndicator color={variant === 'secondary' ? colors.text : '#FFFFFF'} />
  ) : (
    <Text style={variant === 'secondary' ? styles.secondaryText : styles.filledText}>{label}</Text>
  );

  if (variant === 'primary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [isDisabled && styles.disabled, pressed && styles.pressed]}
      >
        <LinearGradient colors={brandGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.base}>
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'danger' ? styles.danger : styles.secondary,
        isDisabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center', justifyContent: 'center' },
  secondary: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.border },
  danger: { backgroundColor: colors.red },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  filledText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  secondaryText: { color: colors.text, fontWeight: '600', fontSize: 16 },
});
