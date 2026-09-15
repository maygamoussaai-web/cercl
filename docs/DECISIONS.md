- philosophie Ponytail active depuis le 2026-09-14 (voir note finale) -

### 2026-09-14 — Icônes de navigation
- **CONSTAT** : icônes ajoutées aux 4 onglets via `@expo/vector-icons` (Ionicons),
  déjà inclus dans Expo — aucune dépendance ajoutée.

### 2026-09-15 — Bug critique corrigé : récursion infinie RLS sur circle_members
- **BUG CORRIGÉ (bloquant, signalé par le propriétaire du projet avec capture d'écran)** :
  créer un Cercle échouait avec "infinite recursion detected in policy for relation
  circle_members" dès que l'app tentait de lire la liste des membres. Cause : les policies
  `circle_members_select` et `conversation_members_select` se référençaient elles-mêmes
  (sous-requête sur leur propre table dans leur clause USING), ce que Postgres ne supporte
  pas — un classique piège RLS. Corrigé en passant par deux fonctions `SECURITY DEFINER`
  (`is_circle_member`, `is_conversation_member`) qui contournent RLS en interne au lieu de
  la sous-requête directe. Audit complet de toutes les policies de toutes les tables
  effectué après coup : aucune autre occurrence de ce problème.

### 2026-09-14 — Philosophie "Ponytail" adoptée pour tout le développement
- **EXIGENCE (règle de travail imposée par le propriétaire du projet, s'applique à toute
  demande future)** : privilégier la solution la plus simple qui fonctionne ; vérifier
  qu'un code est réellement nécessaire avant de l'ajouter ; réutiliser fonctionnalités
  natives/code existant/dépendances déjà installées avant d'en ajouter de nouvelles ;
  éviter sur-ingénierie, abstractions inutiles, fichiers superflus ; toujours chercher une
  librairie de composants adaptée avant de coder un équivalent à la main ; ne jamais
  sacrifier sécurité, robustesse ou accessibilité. Enregistré dans la mémoire persistante
  de Claude (pas seulement ce document) pour s'appliquer à toutes les conversations futures
  sur ce projet.
