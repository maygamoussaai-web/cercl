import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/constants/theme';

const PALETTE = ['#7C5CFC', '#FF4D6D', '#3DDC97', '#FFB020', '#4CC9F0', '#F72585'];

function colorForName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

type Props = { name: string; size?: number; online?: boolean; uri?: string | null };

// Avatar : affiche la vraie photo (uri) si disponible, sinon une initiale + couleur
// dérivée du nom. Le point vert optionnel indique la présence en ligne (§13).
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
              backgroundColor: online ? colors.success : colors.textMuted,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  text: { color: '#0B0B10', fontWeight: '800' },
  dot: { position: 'absolute', right: -1, bottom: -1, borderWidth: 2, borderColor: colors.background },
});
