import { supabase } from '@/lib/supabase';

export async function updateProfileAvatar(avatarUrl: string) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return;
  const { error } = await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', userId);
  if (error) throw error;
}

export async function savePushToken(token: string) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return;
  // Best-effort : si le profil n'existe pas encore (onboarding pas terminé),
  // la mise à jour touche simplement 0 ligne, sans erreur.
  await supabase.from('profiles').update({ push_token: token }).eq('id', userId);
}
