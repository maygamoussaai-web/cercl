# CERCL — Rapport d'état (10/09/2026)

## A. Vue d'ensemble

Le Social Core (priorités 1-2 du cahier des charges) est largement en place et branché sur
la vraie base de données. La Game Platform (priorités 4-5) a un premier jet jouable. Ce qui
manque le plus : présence en ligne, notifications push, contenu du jeu (bank vide), design
définitif, et **tests réels avec plusieurs comptes** — rien de tout ça n'a encore été
vérifié en conditions réelles avec plusieurs utilisateurs simultanés.

---

## B. État par écran

| Écran | Statut | Détail |
|---|---|---|
| `sign-in` | ✅ Fonctionnel | Email/mot de passe. Pas de "mot de passe oublié". |
| `sign-up` | ✅ Fonctionnel | À vérifier : confirmation email activée par défaut sur Supabase ? (voir section E) |
| `onboarding` | ✅ Fonctionnel | Nom + @identifiant, vérifie l'unicité. |
| `join/[code]` | ✅ Fonctionnel | Aperçu avant connexion + rejoindre. Fonctionne en navigation interne ; le vrai lien `cercl.app/join/xxx` cliqué depuis l'extérieur n'ouvrira pas l'app tant qu'il n'y a pas de domaine réel configuré (universal links) — actuellement juste un schéma `cercl://`. |
| Cercles (liste) | ✅ Fonctionnel | Liste + création. Pas de recherche/tri manuel, pas de nombre de membres affiché dans la liste. |
| `circle/create` | ✅ Fonctionnel | Nom uniquement (pas d'image, pas de description). |
| `circle/[id]` | ✅ Fonctionnel | Membres (triés alphabétique), invite (partage natif), accès chat, lancer/rejoindre partie. **Manque** : présence en ligne (§13), pas de réglages (renommer, image), pas de bouton "quitter le Cercle" ni "retirer un membre" côté UI (la règle existe déjà en base). |
| Amis | ✅ Fonctionnel | Recherche, demandes envoyées/reçues, liste, bouton message. **Manque** : retirer un ami, bloquer quelqu'un (§21). |
| Notifications | 🟡 Basique | Liste + marquer lu. **Manque** : taper une notification n'ouvre pas le Cercle/la partie concernée (§33 le demande), pas de compteur/badge, pas de push. |
| Profil | 🟡 Minimal | Nom, @identifiant, déconnexion. **Manque** : changer sa photo, son nom, son mot de passe. |
| `game/[id]` | ✅ Jouable | Lobby, cible/poseur en temps réel, choix Action/Vérité, question personnalisée (banque vide), tour suivant. **Manque** : animation de tirage (§30), choix du mode (chill/chaos/etc. — le champ existe en base mais aucune UI pour le choisir), classement (§32), fin de partie propre (pas d'écran "partie terminée"). |
| `conversation/[id]` | ✅ Fonctionnel | Chat privé + Cercle, temps réel. **Manque** : pas de suppression de messages, pas de nettoyage auto après 1 mois (§16), pas d'indicateur "en train d'écrire", pas de photos/médias. |

---

## C. Backend (Supabase) — ce qui est solide

- **Tables** : Social Core complet + Game Platform complet (détail dans `docs/DATABASE.md`).
- **RLS** activé partout, testé via l'advisor de sécurité (aucune alerte inattendue).
- **Règles critiques déjà garanties côté serveur** : limite 10 membres/Cercle, invitation à usage unique et expirant à 48h, une seule partie active par Cercle (index unique, résiste à la concurrence), amitié empêchée en double, poseur/cible calculés côté serveur.
- **Realtime** activé sur `games`, `game_turns`, `game_players`, `messages`.
- **Fonctions RPC** : tout écriture sensible passe par des fonctions serveur, jamais par une écriture directe du client.

## D. Backend — ce qui manque ou est fragile

- `advance_turn` et la logique de cycle n'ont **jamais été testés avec de vrais comptes concurrents** — c'est un premier jet, pas une implémentation validée par des tests (le cahier des charges §17 exige explicitement des tests sur cette logique).
- Pas de nettoyage automatique des messages après 1 mois (§16).
- Pas de suivi de présence en ligne (§6 des directives complémentaires — Supabase Presence non branché).
- `game_content` est **vide** — en attente de la banque de 500+500 propositions.
- Pas de notifications push (Expo push tokens non configurés) — seulement des notifications internes.
- Pas de modération (signalement, blocage) — §21.
- Pas d'analytics (§27-28 des directives complémentaires).

---

## E. Points ouverts nécessitant ta décision ou action

1. **Confirmation email Supabase** : à vérifier dans le dashboard (Authentication → Providers → Email) si "Confirm email" bloque la connexion après inscription. Pas encore confirmé si c'est un problème réel.
2. **Ambiguïté §31** (déjà signalée) : qui écrit la question personnalisée, la cible ou le poseur ? Actuellement implémenté "la cible", à confirmer.
3. **Build EAS** : dernier statut inconnu de mon côté — dis-moi si le dernier build (déclenché après les derniers commits) est passé.
4. **Banque de contenu** : toujours en attente des 500 Actions + 500 Vérités annoncées.
5. **Identifiants d'app** (`com.cercl.app`) et **comptes développeur** Apple/Google : pas encore créés, nécessaires avant toute publication sur les stores.

---

## F. Ce qu'il reste à faire, par priorité (aligné sur §43 du cahier des charges)

**Priorité 1-2 (Social) — à compléter**
- Présence en ligne
- Réglages de Cercle (renommer, image, quitter, retirer un membre — UI seulement, la règle serveur existe déjà)
- Gérer ses amis (retirer, bloquer)

**Priorité 3 (Chat/présence) — à compléter**
- Nettoyage auto des messages (>1 mois)
- Indicateurs de présence dans le chat

**Priorité 4-5 (Jeu) — à compléter**
- Choix du mode de jeu à l'écran
- Animation de tirage de la bouteille (actuellement instantané)
- Écran de fin de partie
- Classement des Cercles (§32)
- **Tests réels de la logique de tours avec plusieurs comptes**

**Priorité 6 (Contenu)**
- Intégrer la banque de questions dès qu'elle est fournie (aucun changement de code nécessaire, juste insérer les lignes dans `game_content`)

**Priorité 7 (Design)**
- Identité visuelle définitive (logo, palette, typographie) — actuellement 100% placeholder
- Animations soignées (§38)
- Vraies photos de profil (upload)

**Priorité 8 (Pub)**
- Non commencé, normal (dernière priorité du cahier des charges)

**Transverse**
- Notifications push
- Universal links réels pour `cercl.app/join/xxx`
- Modération/signalement
- Analytics
- Compte développeur Apple/Google + soumission stores

---

## G. En résumé

L'app a une vraie fondation Social Core + un jeu jouable de bout en bout, tout branché sur
une base sécurisée. Ce qui sépare ça d'un produit prêt pour de vrais utilisateurs : contenu
du jeu, présence en ligne, notifications push, design définitif, et surtout des **tests
réels avec plusieurs téléphones/comptes en simultané** — rien n'a encore été validé au-delà
de mon propre raisonnement sur le code.
