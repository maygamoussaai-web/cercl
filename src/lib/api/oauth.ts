import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

function extractParamsFromUrl(url: string): Record<string, string> {
  const hashIndex = url.indexOf('#');
  const queryIndex = url.indexOf('?');
  const start = hashIndex !== -1 ? hashIndex + 1 : queryIndex !== -1 ? queryIndex + 1 : -1;
  if (start === -1) return {};
  const params = new URLSearchParams(url.substring(start));
  return Object.fromEntries(params.entries());
}

// Connexion Google via le flux OAuth web de Supabase (pas de SDK natif Google
// Sign-In). Nécessite : (1) un client OAuth Google configuré dans Supabase
// (Authentication → Providers → Google), (2) le redirect exact ci-dessous
// ajouté dans Authentication → URL Configuration → Redirect URLs.
// Voir docs/AUTH_GOOGLE_SETUP.md pour la configuration complète.
export async function signInWithGoogle() {
  const redirectTo = makeRedirectUri({ scheme: 'cercl' });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data.url) throw new Error("Pas d'URL de connexion Google renvoyée par Supabase.");

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success' || !('url' in result)) {
    throw new Error('Connexion Google annulée.');
  }

  const params = extractParamsFromUrl(result.url);
  if (params.error) throw new Error(params.error_description || params.error);
  if (!params.access_token || !params.refresh_token) {
    throw new Error('Réponse Google invalide (tokens manquants).');
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: params.access_token,
    refresh_token: params.refresh_token,
  });
  if (sessionError) throw sessionError;
}
