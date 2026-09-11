# Activer l'authentification par téléphone (SMS)

CERCL utilise maintenant l'authentification par numéro de téléphone + code de
vérification envoyé par SMS (plus d'email/mot de passe). Le code applicatif est prêt
(`app/sign-in.tsx` + `app/verify-otp.tsx`), mais **Supabase ne peut pas envoyer de SMS
lui-même** : il faut brancher un fournisseur SMS tiers. C'est une configuration à faire
une seule fois, côté dashboard Supabase, avec un compte chez ce fournisseur.

## Fournisseurs supportés par Supabase
- Twilio (le plus courant)
- Twilio Verify (variante gérée par Twilio, gère aussi le renvoi/l'expiration du code)
- Vonage
- MessageBird

## Étapes (exemple avec Twilio, depuis le navigateur du téléphone)

1. Crée un compte sur https://www.twilio.com (un crédit d'essai gratuit est généralement
   offert, l'envoi de SMS au-delà est payant à l'usage — quelques centimes par SMS).
2. Achète ou active un numéro Twilio capable d'envoyer des SMS dans les pays visés.
3. Récupère dans le dashboard Twilio : **Account SID**, **Auth Token**, et le **numéro
   Twilio**.
4. Dans le dashboard Supabase du projet CERCL : **Authentication → Providers → Phone**.
   - Active le provider.
   - Choisis Twilio, colle Account SID / Auth Token / numéro.
   - Enregistre.
5. Teste directement depuis l'app : "Recevoir le code" avec ton propre numéro (format
   international, ex. `+33612345678`).

## Points d'attention
- **Coût** : chaque SMS envoyé a un coût côté fournisseur (pas côté Supabase). À surveiller
  si l'app grandit — cohérent avec le principe "Supabase Free au lancement, surveiller les
  coûts réels" déjà appliqué au reste du projet.
- **Format du numéro** : l'app exige le format international (`+` suivi de l'indicatif
  pays). Pas de sélecteur d'indicatif pour l'instant (amélioration possible plus tard).
- **Test sans vrai SMS** : Supabase permet de configurer des numéros de test avec un code
  fixe (utile pour développer sans consommer de vrais SMS) — voir Authentication →
  Providers → Phone → "Test OTP" dans le dashboard si disponible sur le projet.

Tant que cette configuration n'est pas faite, "Recevoir le code" renverra une erreur — ce
n'est pas un bug de l'app, c'est cette étape manquante côté compte.
