# Architecture CERCL

## Deux couches (cahier des charges §5)

**Social Core** : comptes, profils, amis, recherche, conversations privées, Cercles, membres,
invitations, notifications, présence en ligne, statistiques.

**Game Platform** : création de parties, lobby, joueurs, état de partie, tours, sélection des
joueurs, questions, actions, synchronisation temps réel, historique de partie.

Action ou Vérité est le premier jeu connecté à la Game Platform. La Game Platform doit rester
assez découplée du Social Core pour qu'un futur deuxième jeu ne nécessite pas de reconstruire
le Social Core (§29 des directives complémentaires).

## Traduction en dossiers de code

À ce stade (fondation), le code n'est pas encore découpé en `features/social` et
`features/game` car aucune fonctionnalité n'a encore été implémentée. Cette séparation sera
introduite au fur et à mesure de l'implémentation (à partir du Social Core, priorité 1 du
cahier des charges §43), pas anticipée artificiellement avant d'avoir du vrai code à organiser.

## Backend

Supabase (projet `bwlwcmcybqyxwtqluddx`, région eu-west-1) : Auth, PostgreSQL, Realtime,
Storage. Toutes les règles critiques (limite de 10 membres, permissions créateur, une seule
partie active par Cercle, sélection de la cible, ordre des poseurs) doivent être garanties
côté serveur (SQL/RLS/contraintes), jamais uniquement côté app (§40).

Aucune table n'existe encore : le schéma sera proposé, discuté et validé avant toute création
(cf. rapport d'initialisation du projet).
