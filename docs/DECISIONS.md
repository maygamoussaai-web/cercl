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

### 2026-09-08/09 — Build EAS : erreurs corrigées
- **CONSTAT/CORRECTION** : `@supabase/supabase-js` a retiré le support de Node 20 à partir
  de la version 2.110.0. Corrigé en fixant la dépendance exactement à `2.109.0` (dernière
  version compatible Node 20), sans avoir besoin de forcer une version Node précise dans
  `eas.json` (retour à la version par défaut d'EAS, plus prévisible qu'un override manuel).

### 2026-09-08 — Schéma Supabase complet (Social Core + Game Platform)
- **CONSTAT** : migrations `social_core` et `game_platform` appliquées. Tables, RLS,
  triggers et fonctions RPC créés — détail dans `docs/DATABASE.md`.
- **CONTRAINTE TECHNIQUE (corrigée)** : les `GRANT EXECUTE` explicites sur les fonctions
  RPC ne suffisent pas seuls — Postgres accorde `EXECUTE` à `PUBLIC` par défaut sur toute
  nouvelle fonction. Corrigé par une migration dédiée qui révoque l'accès par défaut puis
  ne l'accorde qu'au strict nécessaire. Vérifié via `get_advisors`.
- **CONTRAINTE TECHNIQUE (à vérifier)** : Supabase Auth peut exiger une confirmation par
  email avant de créer une session. Si l'inscription ne connecte pas automatiquement,
  vérifier Authentication → Providers → Email → "Confirm email" dans le dashboard.

### 2026-09-09 — Écran de jeu Action ou Vérité (lobby, tours, choix)
- **CONSTAT** : lobby, affichage cible/poseur, choix Action/Vérité par la cible,
  révélation du contenu ou question personnalisée, tour suivant. Synchronisé en temps réel
  (`games`, `game_turns`, `game_players` ajoutées à la publication `supabase_realtime`).
  Le bouton "Lancer une partie" devient "Rejoindre la partie" s'il y en a déjà une (§18).
- **CONSTAT** : la banque `game_content` étant vide, tous les tours passent par la
  question personnalisée — normal tant que la banque de 500+500 propositions n'est pas
  fournie (§19).

### 2026-09-09 — Ordre des poseurs (alphabétique)
- **CORRECTION (précision du propriétaire du projet)** : l'ordre des poseurs suit l'ordre
  **alphabétique du @identifiant**, pas l'ordre d'arrivée. `advance_turn` trie par
  `profiles.handle`. `circle_members.order_index` n'est plus utilisé par la logique de jeu
  (colonne conservée, inoffensive).

### 2026-09-09 — Chat, avatars, premières améliorations visuelles
- **CONSTAT** : chat de Cercle et chat privé, temps réel (`messages` ajoutée à la
  publication `supabase_realtime`). Composant `Avatar` réutilisable partout. Cartes avec
  ombre, bouteille redessinée, listes triées alphabétiquement.

### 2026-09-11 — Authentification par téléphone (remplacée depuis, voir 2026-09-12)
- Décision intermédiaire abandonnée : voir l'entrée du 2026-09-12 pour l'état actuel.

### 2026-09-11 — Correction : c'est le poseur qui écrit la question personnalisée
- **CORRECTION (précision du propriétaire du projet)** : c'est le **poseur**, pas la
  cible, qui écrit la question personnalisée quand la banque est vide (§31 — le texte du
  cahier des charges était ambigu sur ce point, l'ambiguïté est maintenant tranchée).

### 2026-09-11 — Social Core complété (présence, réglages de Cercle, retirer un ami)
- Présence en ligne par Cercle (Supabase Realtime Presence). Renommer/quitter un
  Cercle/retirer un membre (règles déjà en RLS, interface ajoutée). Retirer un ami. Les
  notifications ouvrent l'écran concerné au clic (§33).

### 2026-09-11 — Capacités du créateur complétées + bouteille animée (première version)
- Ajouter un membre directement depuis ses amis, gérer/révoquer les invitations (§9).
- Bouteille animée : joueurs disposés en cercle, la bouteille tourne puis s'arrête sur la
  cible réellement tirée côté serveur (§23) — jamais recalculée côté client. Un tour déjà
  ancien (réouverture de l'écran) place la bouteille sans rejouer l'animation (heuristique :
  moins de 8s depuis la création du tour).

### 2026-09-11 — Photos, blocage, transfert de propriété, chat avancé, push
- **Stockage** : buckets `avatars`/`circle-images` (publics), `chat-media` (privé, RLS par
  membre de conversation). Upload réel de photo de profil et d'image de Cercle.
- **Blocage (§21)** : table `blocked_users` + RPC `block_user`/`unblock_user` — supprime
  l'amitié, décline les demandes en attente, empêche nouvelles demandes/messages entre les
  deux comptes. Écran "Utilisateurs bloqués".
- **Transfert de propriété de Cercle** : RPC `transfer_circle_ownership`, permet ensuite au
  créateur de quitter son Cercle.
- **Chat avancé** : suppression de ses messages, envoi de photos (URL signée résolue à
  l'affichage), indicateur "Quelqu'un écrit…" (Realtime broadcast, pas d'écriture en base).
- **Nettoyage automatique (§16)** : `pg_cron`, suppression quotidienne des messages de plus
  de 30 jours.
- **Notifications push** : `pg_net` activé, trigger sur `notifications` appelant l'API push
  Expo directement (pas d'Edge Function). Token enregistré à la connexion
  (`expo-notifications`/`expo-device`). Nécessite un vrai appareil + build EAS pour tester.
- **Limite acceptée** : `pg_net` s'installe dans le schéma `public` sans possibilité de le
  déplacer (limitation connue de l'extension chez Supabase) — sévérité faible, accepté.
- **Non fait (dépendance externe hors de portée, pas un oubli)** : vrais liens web
  `cercl.app/join/xxx` cliquables depuis l'extérieur — nécessite un domaine réel, une page
  hébergée et les identifiants Apple/Google, mis de côté par le propriétaire du projet.

### 2026-09-12 — Authentification : téléphone → email + Google
- **EXIGENCE (décision du propriétaire du projet)** : email + mot de passe et Google,
  remplaçant le téléphone/SMS. Deuxième changement de méthode d'authentification en une
  semaine — vigilance recommandée avant un nouveau changement.
- **PROPOSITION** : mot de passe classique plutôt que lien magique (plus simple, pas de
  deep-linking supplémentaire à gérer). À signaler si un lien magique est préféré.
- **CONSTAT — Google OAuth** : flux web standard de Supabase (navigateur système via
  `expo-web-browser`, tokens récupérés depuis l'URL de retour puis posés avec
  `setSession`) plutôt qu'un SDK natif Google Sign-In (plus simple à mettre en place,
  fonctionne pareil sur Android et iOS).
- **CONTRAINTE TECHNIQUE (bloquante, pas encore levée)** : client OAuth Google à créer sur
  Google Cloud Console (compte propre au propriétaire du projet), à renseigner dans
  Supabase, et `cercl://` à autoriser comme Redirect URL. Étapes : `docs/AUTH_GOOGLE_SETUP.md`.

### 2026-09-12 — Identité visuelle définitive : bleu + rouge (+ noir/blanc)
- **EXIGENCE (décision du propriétaire du projet, remplace le placeholder violet)** :
  les couleurs de marque de CERCL sont désormais **le bleu** (`#2F5CFF`) et **le rouge**
  (`#FF3B3B`), le reste de l'interface restant en noir/blanc/gris (fond quasi noir, texte
  blanc cassé, bordures grises). Ce n'est plus un placeholder : c'est la palette adoptée.
  `colors.accent`/`colors.danger` restent comme alias de `blue`/`red` dans le code pour ne
  pas casser les écrans déjà écrits — toute l'app en hérite automatiquement.
- **PROPOSITION — usage fonctionnel des deux couleurs** : bleu = action principale/lien
  (bouton "primary", V\u00e9rit\u00e9, poseur, pr\u00e9sence en ligne) ; rouge = destructif/attention
  (retirer, bloquer, quitter, Action, cible d\u00e9sign\u00e9e par la bouteille). Un d\u00e9grad\u00e9
  bleu\u2192rouge (`brandGradient`) est utilis\u00e9 sur le bouton principal de toute l'app et sur
  la bouteille du jeu, comme signature visuelle qui r\u00e9unit les deux couleurs plut\u00f4t que de
  les juxtaposer platement. Ajout de la d\u00e9pendance `expo-linear-gradient` (module Expo
  standard, faible risque).
- **CONSTAT — palette avatar/pr\u00e9sence retravaill\u00e9e** : l'ancienne palette d'avatars
  (violet/vert/orange/cyan/rose) est remplac\u00e9e par des nuances de bleu et de rouge
  uniquement. Le point de pr\u00e9sence en ligne, auparavant vert, est maintenant bleu (plus de
  vert dans l'app, conform\u00e9ment \u00e0 la consigne des deux couleurs strictes).
- **NON FAIT (report d\u00e9lib\u00e9r\u00e9)** : les ic\u00f4nes/splash de l'app restent le placeholder
  g\u00e9n\u00e9rique pos\u00e9 en tout d\u00e9but de projet (non committ\u00e9, cf. `assets/README.md`), pas
  encore mis \u00e0 jour avec les vraies couleurs de marque \u2014 une r\u00e9g\u00e9n\u00e9ration rapide serait
  possible si souhait\u00e9e, mais n'\u00e9tait pas dans le p\u00e9rim\u00e8tre explicite de cette \u00e9tape.

### 2026-09-12 — Trous du jeu combl\u00e9s : fin de partie, mode, classement
- **CONSTAT \u2014 fin de partie** : nouveau statut `finished` r\u00e9ellement atteignable via la
  fonction RPC `finish_game` (bouton "Terminer la partie", visible \u00e0 tout joueur pendant une
  partie en cours \u2014 **PROPOSITION**, le cahier des charges ne pr\u00e9cise pas qui peut terminer
  une partie, \u00e0 confirmer si \u00e7a doit \u00eatre r\u00e9serv\u00e9 \u00e0 quelqu'un en particulier). \u00c9cran de fin
  simple ("Partie termin\u00e9e \ud83c\udf89") avec retour au Cercle.
- **CONSTAT \u2014 correction d'un oubli** : `started_at` n'\u00e9tait en fait jamais renseign\u00e9 sur une
  partie (oubli\u00e9 lors de la premi\u00e8re impl\u00e9mentation d'`advance_turn`), ce qui aurait fauss\u00e9
  tout calcul de dur\u00e9e. Corrig\u00e9 : renseign\u00e9 au premier tour de la partie.
- **CONSTAT \u2014 classement (\u00a732)** : `circles.total_play_seconds` cumule la dur\u00e9e \u00e0 chaque
  partie termin\u00e9e (calcul\u00e9 c\u00f4t\u00e9 serveur dans `finish_game`, jamais c\u00f4t\u00e9 client). Nouvel
  \u00e9cran `/leaderboard` accessible depuis la liste des Cercles, tri\u00e9 par temps de jeu cumul\u00e9
  d\u00e9croissant. Pas encore de d\u00e9coupage par p\u00e9riode (jour/semaine/mois, mentionn\u00e9 comme
  possible au \u00a732) \u2014 seul le cumul total est affich\u00e9 pour l'instant.
- **CONSTAT \u2014 choix du mode** : s\u00e9lecteur de mode (Chill / Entre nous / Ambiance / Chaos /
  Couple) ajout\u00e9 dans l'\u00e9cran du Cercle avant de lancer une partie, transmis \u00e0 `create_game`.
  Le champ existait d\u00e9j\u00e0 en base sans interface pour le choisir.
- **RESTE CONNU** : `advance_turn` (logique de tours) toujours non test\u00e9 avec plusieurs
  vrais comptes simultan\u00e9s \u2014 c'est un premier jet fonctionnel, pas une logique valid\u00e9e en
  conditions r\u00e9elles (\u00a717 du cahier des charges demande explicitement des tests sur les
  r\u00e8gles critiques).
