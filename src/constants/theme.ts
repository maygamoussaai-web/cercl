/**
 * Thème CERCL.
 *
 * Identité : fond quasi noir, deux couleurs de marque — BLEU et ROUGE — et du
 * noir/blanc pour le reste (bordures, texte, surfaces neutres). Le bleu est la
 * couleur "primaire" (actions principales, liens, Vérité), le rouge la couleur
 * "forte" (danger/destructif, Action). Pas d'autre teinte dans l'app.
 *
 * `accent` et `danger` sont conservés comme alias de `blue`/`red` pour ne pas
 * casser tous les écrans existants qui les référencent déjà.
 */
export const colors = {
  background: '#07070B',
  surface: '#111116',
  surfaceElevated: '#191920',
  border: '#2A2A33',

  blue: '#2F5CFF',
  red: '#FF3B3B',

  accent: '#2F5CFF', // alias = blue
  danger: '#FF3B3B', // alias = red

  text: '#F7F7FA',
  textMuted: '#9A9AA8',
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

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 32,
} as const;

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
} as const;

// Dégradé signature de la marque (bleu → rouge), utilisé sur le bouton
// principal et la bouteille du jeu.
export const brandGradient = [colors.blue, colors.red] as const;
