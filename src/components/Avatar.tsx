import { StyleSheet, Text, View } from 'react-native';

import { radius } from '@/constants/theme';

const PALETTE = ['#7C5CFC', '#FF4D6D', '#3DDC97', '#FFB020', '#4CC9F0', '#F72585'];

function colorForName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

type Props = { name: string; size?: number };

// Avatar temporaire (initiale + couleur dérivée du nom) tant qu'il n'y a pas de vraies
// photos de profil (à remplacer par la vraie image dès que l'upload sera implémenté).
export function Avatar({ name, size = 40 }: Props) {
  const safeName = name?.trim() || '?';
  const initial = safeName[0]?.toUpperCase() ?? '?';
  const bg = colorForName(safeName);
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: radius.full, backgroundColor: bg }]}>
      <Text style={[styles.text, { fontSize: size * 0.42 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  text: { color: '#0B0B10', fontWeight: '800' },
});
