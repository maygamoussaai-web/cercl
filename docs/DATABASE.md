# CERCL — Schéma de base de données (Supabase)

Résumé du schéma appliqué (migrations `social_core` et `game_platform` sur le projet
`bwlwcmcybqyxwtqluddx`). Le détail exact vit dans les migrations Supabase (source de
vérité) ; ce document sert de repère rapide.

## Social Core
- `profiles(id, display_name, handle unique, avatar_url)`
- `friendships(user_low, user_high)` — paire ordonnée, une ligne = amitié acceptée
- `friend_requests(sender_id, receiver_id, status)` — 1 demande "pending" max par paire
  (index unique partiel), déclenche `friendships` + `notifications` via triggers
- `circles(id, name, creator_id)`
- `circle_members(circle_id, user_id, order_index)` — max 10/Cercle (trigger avec verrou
  de ligne pour gérer la concurrence), `order_index` auto-assigné
- `circle_invites(code, expires_at 48h, used_at)` — usage unique
- `conversations` / `conversation_members` / `direct_conversation_pairs` / `messages`
- `notifications(recipient_id, type, payload, read_at)`

## Game Platform
- `games(circle_id, status, mode, current_target_id, current_poser_id, cycle_number)` —
  **index unique partiel** : une seule partie `lobby`/`in_progress` par Cercle, garanti
  par Postgres même en cas de double clic simultané (§18 du cahier des charges)
- `game_players(game_id, user_id, has_posed_this_cycle)`
- `game_turns(game_id, cycle_number, target_id, poser_id, choice, content_id, custom_question)`
- `game_content(type, mode, intensity, language, text_content, is_active)` — **vide pour
  l'instant**, en attente de la banque de questions (§27/§19)

## Fonctions RPC (écritures server-authoritative)
Toutes les écritures sensibles passent par des fonctions Postgres `SECURITY DEFINER`,
jamais par des `INSERT`/`UPDATE` directs du client sur `games`, `game_players`, `game_turns` :
- `create_circle`, `create_circle_invite`, `join_circle_with_invite`,
  `get_invite_preview` (seule fonction ouverte aux visiteurs non connectés, `anon`),
  `get_or_create_direct_conversation`
- `create_game`, `join_game`, `advance_turn`

⚠️ **`advance_turn` est un premier jet** (cible aléatoire + poseur par ordre du Cercle,
cf. §24 du cahier des charges) : à tester sérieusement (2 joueurs, montée en charge, cas
limites de fin de cycle) avant de s'appuyer dessus en production.

## RLS
RLS activé sur toutes les tables. Règle générale : un utilisateur ne voit que les
Cercles/conversations/parties dont il est membre, ne peut modifier que ses propres
données, et les actions "créateur uniquement" sont vérifiées dans les policies ou dans
les fonctions RPC. Les GRANT EXECUTE par défaut de Postgres (accordés à `public` sur
toute nouvelle fonction) ont été explicitement révoqués puis reservés au strict
nécessaire (`authenticated` pour la plupart, `anon` uniquement pour `get_invite_preview`).

## Pas encore fait
- Peupler `game_content` avec la banque de 500 Actions + 500 Vérités — en attente du
  contenu (§19 des directives complémentaires : "je te donnerai la banque de questions").
- Nettoyage automatique des messages de plus d'un mois (pg_cron ou tâche planifiée).
- Présence en ligne (Supabase Realtime Presence).
- UI du jeu (lobby, bouteille, animations) — la DB est prête, l'écran ne l'est pas encore.
