/**
 * Thème CERCL — PLACEHOLDER technique.
 *
 * Direction imposée par le cahier des charges (§3, §37) : fond sombre, surfaces sombres,
 * couleurs vibrantes utilisées avec modération, contraste élevé, typographie moderne.
 *
 * La palette définitive et les assets de marque seront réalisés séparément (§3).
 * Ne pas considérer ces valeurs comme la palette finale de CERCL.
 */
export const colors = {
  background: '#0B0B10',
  surface: '#16161D',
  surfaceElevated: '#1E1E27',
  border: '#2A2A34',
  accent: '#7C5CFC',
  text: '#F5F5F7',
  textMuted: '#9A9AA5',
  danger: '#FF4D6D',
  success: '#3DDC97',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  full: 999,
} as const;
