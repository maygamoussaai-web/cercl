# Activer la connexion Google

CERCL utilise maintenant **email + mot de passe** et **Google** pour se connecter (le
téléphone/SMS a été retiré). Le code applicatif est prêt (`app/sign-in.tsx`,
`app/sign-up.tsx`, `src/lib/api/oauth.ts`), mais **Google nécessite une configuration
externe** que je ne peux pas faire à ta place (compte Google Cloud personnel).

## Étapes (depuis le navigateur du téléphone)

### 1. Créer les identifiants OAuth Google
1. Va sur https://console.cloud.google.com/ (crée un projet si besoin, ex. "CERCL").
2. **APIs & Services → OAuth consent screen** : configure l'écran de consentement
   (type "External", nom de l'app "CERCL", email de support).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
   - Type d'application : **Web application** (c'est Supabase qui gère le callback, pas
     l'app mobile directement).
   - Dans "Authorized redirect URIs", ajoute exactement :
     `https://bwlwcmcybqyxwtqluddx.supabase.co/auth/v1/callback`
   - Récupère le **Client ID** et le **Client Secret** générés.

### 2. Configurer Supabase
1. Dashboard Supabase du projet CERCL → **Authentication → Providers → Google**.
2. Active le provider, colle le **Client ID** et le **Client Secret**.
3. Enregistre.

### 3. Autoriser le retour vers l'app
1. Dashboard Supabase → **Authentication → URL Configuration → Redirect URLs**.
2. Ajoute : `cercl://`
   (c'est l'URL que l'app utilise pour revenir depuis le navigateur après la connexion
   Google — sans cette ligne, Supabase refusera de rediriger vers l'app).

### 4. Tester
Depuis l'app : bouton "Continuer avec Google" sur l'écran de connexion. Un navigateur
s'ouvre, tu te connectes avec ton compte Google, et tu reviens automatiquement dans
CERCL déjà connecté.

## Email/mot de passe

Fonctionne sans configuration supplémentaire (Supabase envoie les emails lui-même par
défaut). Point à vérifier si l'inscription ne connecte pas automatiquement : dashboard →
**Authentication → Providers → Email → Confirm email** — désactive cette option pour les
tests si tu veux éviter l'étape de confirmation par email.

## Pourquoi pas de SDK natif Google Sign-In ?

Il existe une intégration native (`@react-native-google-signin/google-signin`) qui donne
une expérience plus fluide (pas de navigateur qui s'ouvre), mais elle demande une
configuration Android/iOS supplémentaire (SHA-1 de l'app, fichiers `google-services.json`
etc.) et un module natif à builder. Le flux web utilisé ici (navigateur + redirection)
est plus simple à mettre en place et fonctionne de la même façon sur Android et iOS —
une amélioration vers le SDK natif reste possible plus tard si l'expérience utilisateur
doit être peaufinée.
