/**
 * Types partagés — volontairement minimal pour l'instant.
 *
 * Le schéma de base de données (tables, colonnes, relations) n'a pas encore été
 * créé dans Supabase : il doit d'abord être validé (voir le rapport d'initialisation
 * et docs/ARCHITECTURE.md). Ces types seront générés/complétés une fois le schéma réel
 * en place, idéalement via `supabase gen types typescript` pour rester synchronisés
 * avec la vraie base plutôt que maintenus à la main.
 */

export type UUID = string;
