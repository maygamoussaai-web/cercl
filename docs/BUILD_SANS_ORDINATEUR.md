# Construire et installer CERCL sans ordinateur

Tu n'as pas d'ordinateur : `npx expo start` + Expo Go ne fonctionnera pas (il faut un ordi qui
fait tourner le serveur de dév). À la place, on utilise **EAS Build**, le service cloud
d'Expo : il construit un vrai fichier `.apk` sur les serveurs d'Expo, à chaque push sur GitHub.
Tu le télécharges et l'installes directement sur ton Android, comme une vraie app.

## Configuration à faire une seule fois (depuis le navigateur de ton téléphone)

1. **Crée un compte Expo** (gratuit) sur https://expo.dev/signup
2. **Génère un token d'accès** :
   - Va sur https://expo.dev/accounts/[ton-compte]/settings/access-tokens
   - « Create token » → donne-lui un nom (ex. `github-actions`) → copie le token affiché
     (il ne sera plus jamais visible ensuite, copie-le tout de suite)
3. **Ajoute ce token comme secret sur GitHub** :
   - Va sur https://github.com/maygamoussaai-web/cercl/settings/secrets/actions
   - « New repository secret »
   - Nom : `EXPO_TOKEN`
   - Valeur : le token copié à l'étape 2
   - Enregistrer

C'est tout. Cette configuration ne se fait qu'une seule fois.

## À chaque nouvelle version à tester

1. Le code est modifié et poussé sur la branche `main` du repo `cercl`.
2. Ça déclenche automatiquement un build sur les serveurs Expo (visible sur
   https://expo.dev/accounts/[ton-compte]/projects/cercl/builds).
3. Le build prend généralement 5 à 15 minutes. Une fois terminé, la page du build affiche
   un QR code et un bouton de téléchargement du `.apk`.
4. Depuis ton téléphone : ouvre cette page, télécharge le `.apk`, installe-le (Android te
   demandera d'autoriser l'installation depuis une source inconnue la première fois — normal
   pour une app en cours de développement, pas encore sur le Play Store).

## Limite à connaître

Cette méthode ne teste que **Android** pour l'instant (un `.apk` ne s'installe pas sur iPhone).
Pour tester sur iOS sans Mac ni ordinateur, il faudra passer par EAS Build avec un compte
Apple Developer (payant, 99$/an) et une distribution TestFlight — à prévoir plus tard, pas
urgent tant que le développement se concentre sur les fondations.
