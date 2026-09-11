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

### 2026-09-09 — Correction du build EAS (vraie cause)
- **CONSTAT/CORRECTION** : le build a continué d'échouer quasi instantanément malgré le
  fix Node précédent — la vraie cause est que Supabase a **retiré le support de Node 20**
  dans `@supabase/supabase-js` à partir de la version 2.110.0 (Node 20 atteint sa fin de
  vie le 30/04/2026). Le `"node": "22.9.0"` fixé manuellement dans `eas.json` était par
  ailleurs une version non vérifiée, potentiellement absente des images EAS.
  Correction plus robuste : `@supabase/supabase-js` fixé exactement à `2.109.0` (dernière
  version officiellement compatible Node 20, confirmé par le changelog Supabase), et
  retrait de l'override `"node"` dans `eas.json` pour revenir à la version par défaut
  d'EAS, plus prévisible.

### 2026-09-09 — Écran de jeu Action ou Vérité (lobby, tours, choix)
- **CONSTAT** : lobby (liste des joueurs, rejoindre, commencer), affichage cible/poseur,
  choix Action/Vérité par la cible, révélation du contenu si la banque en a un, sinon
  question personnalisée, bouton "Tour suivant". Synchronisé en temps réel entre joueurs
  via Supabase Realtime (`games`, `game_turns`, `game_players` ajoutées à la publication
  `supabase_realtime`, ce qui n'était pas fait par défaut). Le bouton "Lancer une
  partie"/"Rejoindre la partie" dans le Cercle applique maintenant littéralement §18 :
  désactivé/remplacé par l'accès à la partie active s'il y en a déjà une.
- **AMBIGUÏTÉ DU CAHIER DES CHARGES SIGNALÉE (pas tranchée silencieusement)** : le §31
  dit que c'est "le joueur ciblé" qui peut écrire une question personnalisée. C'est ce qui
  est implémenté littéralement (la cible écrit sa propre question quand la banque n'a
  rien). Mais on peut aussi lire ça comme visant le *poseur* (qui pose la question à la
  cible) — l'interprétation inverse serait tout aussi défendable. À confirmer : qui doit
  pouvoir écrire la question personnalisée ?
- **CONSTAT** : la banque `game_content` étant vide, tous les tours passeront pour
  l'instant par la question personnalisée — normal tant que la banque de 500+500
  propositions n'est pas fournie (§19).

### 2026-09-09 — Correction de la règle d'ordre des poseurs (alphabétique)
- **CORRECTION (précision apportée par le propriétaire du projet)** : l'ordre utilisé pour
  désigner le poseur suit l'ordre **alphabétique du @identifiant (nom d'utilisateur)**, pas
  l'ordre d'arrivée dans le Cercle. `advance_turn` a été corrigé pour trier par
  `profiles.handle` au lieu de `circle_members.order_index`. La colonne `order_index`
  reste en base (inoffensive) mais n'est plus utilisée par la logique de jeu — elle
  pourrait être supprimée dans un futur nettoyage si aucun autre usage n'apparaît.
- Confirmation du fonctionnement déjà en place : poseur = n'a pas encore posé ce cycle,
  n'est pas la cible du tour, et a le plus petit rang alphabétique parmi les joueurs
  éligibles (§24). Cible = celui qui doit répondre, tiré aléatoirement côté serveur (§23).

### 2026-09-09 — Amélioration app : chat, avatars, design
- **CONSTAT** : ajout du chat de Cercle (conversation déjà créée à la création du Cercle)
  et du chat privé (bouton "Message" sur chaque ami, via `get_or_create_direct_conversation`),
  avec synchronisation temps réel (`messages` ajoutée à la publication `supabase_realtime`,
  ne l'était pas). Ajout d'un composant `Avatar` (initiale + couleur dérivée du nom) utilisé
  partout où un profil est affiché (Cercles, membres, amis, lobby, écran de jeu, profil).
  Amélioration visuelle : cartes avec ombre légère, bouteille du jeu redessinée (silhouette
  simple via des vues plutôt qu'un simple rectangle), rôles Cible/Poseur affichés côte à
  côte avec avatar. Liste des membres du Cercle et des joueurs du lobby désormais triée
  par ordre alphabétique, cohérent avec la vraie règle du jeu.
- **PROPOSITION (report explicite)** : il ne s'agit pas encore de l'identité visuelle
  définitive de CERCL (§3, à faire séparément) — c'est une amélioration de cohérence et de
  lisibilité avec les mêmes couleurs placeholder. Une vraie passe design (typographie,
  micro-animations, photos de profil réelles) reste à faire.

### 2026-09-11 — Authentification par téléphone + Social Core complété
- **EXIGENCE (décision du propriétaire du projet, remplace l'auth email précédente)** :
  authentification par numéro de téléphone + code de vérification SMS. Implémenté :
  `sign-in` (saisie du numéro, format international) → `verify-otp` (saisie du code) via
  `supabase.auth.signInWithOtp` / `verifyOtp`. L'ancien écran `sign-up` (email/mot de
  passe) a été supprimé : avec le téléphone, une seule fonction gère à la fois inscription
  et connexion.
- **CONTRAINTE TECHNIQUE (bloquante, pas encore levée)** : Supabase n'envoie pas de SMS
  lui-même. Il faut configurer un fournisseur tiers (Twilio recommandé, ou Vonage/
  MessageBird) dans le dashboard Supabase (Authentication → Providers → Phone), avec un
  compte et des identifiants propres au propriétaire du projet — je ne peux pas le faire
  depuis ici. Tant que ce n'est pas fait, "Recevoir le code" échouera. Étapes détaillées :
  `docs/AUTH_PHONE_SETUP.md`.
- **CORRECTION (précision du propriétaire du projet)** : c'est le **poseur**, pas la
  cible, qui écrit la question personnalisée quand la banque est vide (§31). Corrige la
  décision du 2026-09-09 qui avait implémenté l'inverse par lecture littérale ambiguë du
  texte — l'ambiguïté est maintenant tranchée.
- **CONSTAT — Social Core complété** :
  - Présence en ligne par Cercle (Supabase Realtime Presence, point vert sur l'avatar),
    sans écriture en base par utilisateur/seconde (§6 des directives complémentaires).
  - Réglages de Cercle : renommer (créateur uniquement), quitter le Cercle (non-créateur),
    retirer un membre (créateur uniquement) — ces règles existaient déjà en RLS, seule
    l'interface manquait.
  - Retirer un ami (suppression de la relation d'amitié).
  - Les notifications mènent maintenant à l'écran concerné au clic (partie lancée → écran
    de jeu, demande d'ami → onglet Amis, sinon → Cercle concerné), conformément au §33.
- **LIMITE CONNUE (non traitée, hors périmètre demandé pour cette étape)** : pas de
  transfert de propriété d'un Cercle — un créateur ne peut pas encore quitter son propre
  Cercle (bouton "Quitter" masqué pour lui). Pas de blocage/signalement (modération, §21,
  distinct de "retirer un ami"). Build EAS et banque de contenu volontairement laissés de
  côté à la demande du propriétaire du projet, à traiter dans une étape suivante.
