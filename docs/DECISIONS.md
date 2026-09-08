# Journal des décisions — CERCL

Chaque entrée est classée : **EXIGENCE** (déjà décidé dans le cahier des charges),
**CONTRAINTE TECHNIQUE** (nécessité liée à la sécurité/plateformes/Supabase/architecture),
ou **PROPOSITION** (recommandation de Claude, non validée tant que ce n'est pas indiqué).

---

### 2026-09-08 — Stack applicatif
- **EXIGENCE** : TypeScript, React Native, Expo, Supabase, PostgreSQL, Supabase Auth,
  Supabase Realtime, GitHub (cahier des charges §4).
- **CONTRAINTE TECHNIQUE** : Lovable génère du React web (React DOM), pas du React
  Native/Expo. Il ne peut pas produire une app native store-ready sans passer par un
  wrapper webview (Capacitor), ce qui contredit l'exigence "app native publiable sur les
  stores, pas un site ni une PWA". Décision : l'app est développée directement en
  Expo/React Native/TypeScript dans ce repository, sans passer par Lovable. Lovable reste
  disponible plus tard pour un usage annexe et optionnel (ex. page web d'aperçu
  d'invitation `cercl.app/join/XXXXXXXX`, qui est légitimement une page web selon le
  cahier des charges §11) — non implémenté à ce stade.

### 2026-09-08 — Supabase
- **CONSTAT** : projet Supabase `bwlwcmcybqyxwtqluddx` (eu-west-1, Postgres 17.6) existant,
  vide (aucune table, aucune fonction, extensions par défaut uniquement). Sain, prêt à
  recevoir un schéma.
- **CONTRAINTE TECHNIQUE** : aucune table n'a été créée à ce stade. Le schéma proposé dans
  le rapport d'initialisation est une base de réflexion, pas une implémentation validée.

### 2026-09-08 — Scaffold initial du repo
- **PROPOSITION** : navigation à 4 onglets (Cercles / Amis / Notifs / Profil) dans
  `app/(tabs)/`. Le cahier des charges (§36) indique explicitement que la structure exacte
  des 4 pages principales doit être validée avant implémentation définitive — cette
  structure est donc un placeholder de départ, pas une décision finale.
- **PROPOSITION** : palette de couleurs dans `src/constants/theme.ts` (accent violet
  `#7C5CFC`). Le cahier des charges (§3) précise que la conception graphique définitive du
  logo et des assets sera réalisée séparément — cette palette est un placeholder technique
  pour pouvoir styler des écrans en attendant, pas l'identité visuelle finale.
- **PROPOSITION** : identifiants d'app `com.cercl.app` (iOS `bundleIdentifier` / Android
  `package`) dans `app.json`. À remplacer par les vrais identifiants une fois les comptes
  développeur Apple Developer Program et Google Play Console créés.

### 2026-09-08 — Environnement de développement sans ordinateur
- **CONTRAINTE (contexte projet)** : le propriétaire du projet n'a pas d'ordinateur. Le
  workflow standard Expo (`npx expo start` + Expo Go) nécessite un ordinateur faisant tourner
  le serveur de développement et est donc écarté comme méthode principale.
- **PROPOSITION** : utiliser EAS Build (service cloud Expo) pour construire un `.apk`
  Android installable directement, déclenché automatiquement à chaque push via GitHub
  Actions (`.github/workflows/eas-build-preview.yml`). Voir `docs/BUILD_SANS_ORDINATEUR.md`
  pour la configuration (compte Expo + secret GitHub `EXPO_TOKEN`, à faire une seule fois).
  Limite connue : ne couvre que l'installation Android pour l'instant ; iOS nécessitera un
  compte Apple Developer et une distribution TestFlight, à traiter plus tard.

### 2026-09-08 — Premier build EAS : erreur Node
- **CONSTAT/CORRECTION** : le premier build a échoué (`@supabase/supabase-js` exige
  Node ≥ 22, l'image de build utilisait Node 20). Corrigé en fixant `"node": "22.9.0"`
  dans les 3 profils de `eas.json`.

### 2026-09-08 — Schéma Supabase complet (Social Core + Game Platform)
- **CONSTAT** : migrations `social_core` et `game_platform` appliquées sur le projet
  Supabase. Tables, RLS, triggers et fonctions RPC créés — détail dans `docs/DATABASE.md`.
- **CONTRAINTE TECHNIQUE (corrigée)** : les `GRANT EXECUTE` explicites sur les fonctions
  RPC ne suffisent pas à eux seuls — Postgres accorde `EXECUTE` à `PUBLIC` par défaut sur
  toute nouvelle fonction, ce qui aurait laissé `anon` (visiteurs non connectés) appeler
  `create_circle`, `advance_turn`, etc. Corrigé par une migration dédiée
  (`lock_down_function_execute_grants`) qui révoque l'accès par défaut puis ne l'accorde
  qu'au strict nécessaire. Vérifié via `get_advisors` (aucune alerte de sécurité
  inattendue restante).
- **PROPOSITION** : `advance_turn` (cible + poseur, §24) est un premier jet fonctionnel
  mais non testé en conditions réelles (concurrence, 2 joueurs, fin de cycle). À tester
  avant de s'y fier pour une vraie partie.
- **CONTRAINTE TECHNIQUE (à vérifier)** : Supabase Auth peut exiger une confirmation par
  email avant de créer une session (comportement par défaut). Si `sign-up` ne connecte pas
  automatiquement l'utilisateur, vérifier Authentication → Providers → Email dans le
  dashboard Supabase et désactiver "Confirm email" pour les tests si besoin.

### 2026-09-08 — App Social Core (auth, profils, Cercles, amis, invitations)
- **CONSTAT** : implémentation de l'authentification (email/mot de passe), de l'onboarding
  (choix nom + @identifiant), de la liste/création/détail des Cercles, du partage
  d'invitation, de l'écran Amis (recherche, demandes, liste), des notifications (lecture
  simple) et du profil (déconnexion). Le tout branché sur les vraies fonctions RPC/tables
  Supabase, pas de données factices.
- **PROPOSITION (report explicite, pas un oubli)** : l'écran de jeu lui-même (lobby,
  bouteille, animations de tirage, choix Action/Vérité) n'est pas implémenté. Le bouton
  "Lancer une partie" appelle bien `create_game` (donc la règle "1 partie active par
  Cercle" est déjà testable), mais affiche une confirmation simple en attendant l'écran
  dédié — cf. cahier des charges §43, priorités 4-6 traitées après le Social Core (priorité
  1-2). Présence en ligne et chat (§13-15) également non implémentés à ce stade.
