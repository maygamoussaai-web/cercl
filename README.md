# CERCL — App mobile (Expo / React Native / TypeScript)

Application sociale mobile CERCL — Android + iOS. Voir le cahier des charges du projet pour la vision produit complète.

## ⚠️ État de ce scaffold

Ce code a été écrit directement (pas de `npx create-expo-app`, pas de `npm install`) car l'environnement qui l'a généré n'a pas d'accès réseau. **Il n'a donc pas encore été installé ni exécuté.** Avant de coder dessus :

```bash
npm install
npx expo install --fix   # aligne les versions des packages avec le SDK Expo installé
cp .env.example .env
npx expo start
```

Si `expo install --fix` change des versions dans `package.json`, c'est normal et attendu : les versions dans ce scaffold sont une base raisonnable, pas une vérité figée.

## Stack

- TypeScript strict
- Expo (React Native) — app native, buildable pour l'App Store et le Play Store via **EAS Build** (pas un site, pas une PWA)
- Expo Router (navigation par fichiers)
- Supabase (Auth, PostgreSQL, Realtime, Storage) — projet déjà provisionné, voir `.env.example`

## Structure

```
app/                  → écrans et navigation (Expo Router)
  _layout.tsx         → layout racine
  (tabs)/              → navigation par onglets (PLACEHOLDER, structure à valider — voir docs/DECISIONS.md)
src/
  lib/supabase.ts     → client Supabase
  constants/theme.ts  → palette/thème (placeholder, identité visuelle définitive à venir séparément)
  types/              → types partagés (à enrichir avec le schéma DB une fois validé)
docs/
  ARCHITECTURE.md     → séparation Social Core / Game Platform
  DECISIONS.md        → journal des décisions (exigence / contrainte technique / proposition)
assets/               → icônes et splash (pas encore fournies, voir assets/README.md)
eas.json              → profils de build EAS (dev/preview/production)
```

## Pourquoi pas Lovable ?

Lovable génère du React web (React DOM), pas du React Native/Expo — il ne peut pas produire une vraie app store-ready. Décision documentée dans `docs/DECISIONS.md`.

## Prochaines étapes

Voir `docs/DECISIONS.md` et le rapport d'initialisation du projet pour le plan de développement (Social Core d'abord, puis Game Platform, puis Action ou Vérité).
