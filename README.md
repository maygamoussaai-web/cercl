# CERCL — App mobile (Expo / React Native / TypeScript)

Application sociale mobile CERCL — Android + iOS. Voir le cahier des charges du projet pour la vision produit complète.

## État d'avancement

**Implémenté et branché sur Supabase (pas de données factices) :**
- Authentification email/mot de passe (`sign-in`, `sign-up`)
- Onboarding (choix du nom et du `@identifiant`)
- Cercles : liste, création, détail (membres, invite partageable), lancement de partie (règle "1 partie active/Cercle" déjà appliquée côté serveur)
- Invitations : aperçu public avant connexion (`/join/[code]`), rejoindre un Cercle
- Amis : recherche par `@identifiant`, demandes envoyées/reçues, liste d'amis
- Notifications : liste simple, marquage lu
- Profil : infos de base, déconnexion

**Pas encore fait (volontairement, prochaines étapes) :**
- Écran de jeu Action ou Vérité (lobby, bouteille, animations) — la base de données est prête (`docs/DATABASE.md`), pas l'interface
- Chat (privé et de Cercle) et présence en ligne temps réel
- Banque de contenu Action/Vérité (table vide en attendant les questions)
- Design/identité visuelle définitive (palette actuelle = placeholder technique)

Voir `docs/DECISIONS.md` pour le détail classé EXIGENCE / CONTRAINTE TECHNIQUE / PROPOSITION.

## Installer et lancer en local

```bash
npm install
npx expo install --fix   # aligne les versions des packages avec le SDK Expo installé
cp .env.example .env
npx expo start
```

## Builds Android sans ordinateur

Chaque push sur `main` déclenche automatiquement un build cloud (EAS Build) qui produit un
`.apk` installable directement sur Android — voir `docs/BUILD_SANS_ORDINATEUR.md`.

## Stack

- TypeScript strict
- Expo (React Native) — app native, buildable pour l'App Store et le Play Store via **EAS Build** (pas un site, pas une PWA)
- Expo Router (navigation par fichiers)
- Supabase (Auth, PostgreSQL, Realtime, Storage) — schéma Social Core + Game Platform déjà en place, voir `docs/DATABASE.md`

## Structure

```
app/
  _layout.tsx         → layout racine, routage selon session/profil
  sign-in.tsx, sign-up.tsx, onboarding.tsx
  join/[code].tsx     → aperçu + rejoindre une invitation
  circle/create.tsx, circle/[id].tsx
  (tabs)/              → Cercles / Amis / Notifs / Profil (placeholder de structure, §36 à valider)
src/
  context/AuthContext.tsx → session + profil courant
  lib/supabase.ts     → client Supabase
  lib/api/            → appels Supabase (circles, friends, notifications)
  components/         → Button, TextField
  constants/theme.ts  → palette/thème (placeholder, identité visuelle définitive à venir séparément)
  types/              → types partagés, alignés sur le schéma réel
docs/
  ARCHITECTURE.md     → séparation Social Core / Game Platform
  DATABASE.md         → résumé du schéma Supabase
  DECISIONS.md        → journal des décisions (exigence / contrainte technique / proposition)
  BUILD_SANS_ORDINATEUR.md → comment construire et installer l'app sans ordinateur
assets/               → icônes et splash (pas encore fournies, voir assets/README.md)
eas.json              → profils de build EAS (dev/preview/production)
```

## Pourquoi pas Lovable ?

Lovable génère du React web (React DOM), pas du React Native/Expo — il ne peut pas produire une vraie app store-ready. Décision documentée dans `docs/DECISIONS.md`.
