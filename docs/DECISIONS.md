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
