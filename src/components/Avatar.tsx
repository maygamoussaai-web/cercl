import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/constants/theme';

// Nuances de bleu et de rouge uniquement (identité CERCL à deux couleurs).
const PALETTE = ['#2F5CFF', '#FF3B3B', '#6C87FF', '#FF6B6B', '#1B3FCC', '#CC2E2E'];

function colorForName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

type Props = { name: string; size?: number; online?: boolean; uri?: string | null };

// Avatar : affiche la vraie photo (uri) si disponible, sinon une initiale + couleur
// dérivée du nom (nuance de bleu/rouge). Le point bleu optionnel indique la
// présence en ligne (§13) — pas de vert, pour rester dans la palette à deux couleurs.
export function Avatar({ name, size = 40, online, uri }: Props) {
  const safeName = name?.trim() || '?';
  const initial = safeName[0]?.toUpperCase() ?? '?';
  const bg = colorForName(safeName);
  const dotSize = Math.max(10, size * 0.28);
  return (
    <View style={{ width: size, height: size }}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: radius.full }} />
      ) : (
        <View style={[styles.container, { width: size, height: size, borderRadius: radius.full, backgroundColor: bg }]}>
          <Text style={[styles.text, { fontSize: size * 0.42 }]}>{initial}</Text>
        </View>
      )}
      {online !== undefined && (
        <View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: online ? colors.blue : colors.textMuted,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  text: { color: '#FFFFFF', fontWeight: '800' },
  dot: { position: 'absolute', right: -1, bottom: -1, borderWidth: 2, borderColor: colors.background },
});
