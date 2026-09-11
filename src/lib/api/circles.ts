import { supabase } from '@/lib/supabase';
import type { Circle, CircleInvite, CircleMember } from '@/types';

export async function fetchMyCircles(): Promise<Circle[]> {
  const { data, error } = await supabase
    .from('circle_members')
    .select('circles(*)')
    .order('joined_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => row.circles).filter(Boolean) as Circle[];
}

export async function createCircle(name: string): Promise<Circle> {
  const { data, error } = await supabase.rpc('create_circle', { p_name: name });
  if (error) throw error;
  return data as Circle;
}

export async function fetchCircle(circleId: string): Promise<Circle> {
  const { data, error } = await supabase.from('circles').select('*').eq('id', circleId).single();
  if (error) throw error;
  return data as Circle;
}

export async function fetchCircleMembers(circleId: string): Promise<CircleMember[]> {
  const { data, error } = await supabase
    .from('circle_members')
    .select('*, profiles(*)')
    .eq('circle_id', circleId)
    .order('order_index', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as CircleMember[];
}

export async function createCircleInvite(circleId: string): Promise<CircleInvite> {
  const { data, error } = await supabase.rpc('create_circle_invite', { p_circle_id: circleId });
  if (error) throw error;
  return data as CircleInvite;
}

export async function getInvitePreview(code: string) {
  const { data, error } = await supabase.rpc('get_invite_preview', { p_code: code });
  if (error) throw error;
  return data?.[0] as { circle_name: string; inviter_name: string; is_valid: boolean } | undefined;
}

export async function joinCircleWithInvite(code: string): Promise<Circle> {
  const { data, error } = await supabase.rpc('join_circle_with_invite', { p_code: code });
  if (error) throw error;
  return data as Circle;
}

export async function launchGame(circleId: string, mode = 'chill') {
  const { data, error } = await supabase.rpc('create_game', { p_circle_id: circleId, p_mode: mode });
  if (error) throw error;
  return data;
}

export async function renameCircle(circleId: string, name: string) {
  const { error } = await supabase.from('circles').update({ name }).eq('id', circleId);
  if (error) throw error;
}

export async function removeCircleMember(circleId: string, userId: string) {
  const { error } = await supabase.from('circle_members').delete().eq('circle_id', circleId).eq('user_id', userId);
  if (error) throw error;
}

// Ajout direct d'un membre par le créateur (§9 : "ajouter des membres"), sans
// passer par une invitation. Autorisé par la policy RLS circle_members_insert_by_creator.
export async function addMemberDirect(circleId: string, userId: string) {
  const { error } = await supabase.from('circle_members').insert({ circle_id: circleId, user_id: userId });
  if (error) throw error;
}

export async function fetchCircleInvites(circleId: string): Promise<CircleInvite[]> {
  const { data, error } = await supabase
    .from('circle_invites')
    .select('*')
    .eq('circle_id', circleId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as CircleInvite[];
}

export async function revokeCircleInvite(inviteId: string) {
  const { error } = await supabase.from('circle_invites').delete().eq('id', inviteId);
  if (error) throw error;
}
