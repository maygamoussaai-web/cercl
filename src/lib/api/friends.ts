import { supabase } from '@/lib/supabase';
import type { FriendRequest, Profile } from '@/types';

export async function searchProfilesByHandle(query: string): Promise<Profile[]> {
  const cleaned = query.trim().replace(/^@/, '').toLowerCase();
  if (!cleaned) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('handle', `%${cleaned}%`)
    .limit(20);
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function sendFriendRequest(receiverId: string) {
  const { data: userData } = await supabase.auth.getUser();
  const senderId = userData.user?.id;
  const { error } = await supabase
    .from('friend_requests')
    .insert({ sender_id: senderId, receiver_id: receiverId });
  if (error) throw error;
}

export async function fetchIncomingRequests(): Promise<FriendRequest[]> {
  const { data, error } = await supabase
    .from('friend_requests')
    .select('*, sender:profiles!friend_requests_sender_id_fkey(*)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as FriendRequest[];
}

export async function respondToRequest(requestId: string, accept: boolean) {
  const { error } = await supabase
    .from('friend_requests')
    .update({ status: accept ? 'accepted' : 'declined' })
    .eq('id', requestId);
  if (error) throw error;
}

export async function fetchFriends(): Promise<Profile[]> {
  const { data: userData } = await supabase.auth.getUser();
  const myId = userData.user?.id;
  if (!myId) return [];
  const { data, error } = await supabase
    .from('friendships')
    .select('user_low, user_high, low:profiles!friendships_user_low_fkey(*), high:profiles!friendships_user_high_fkey(*)')
    .or(`user_low.eq.${myId},user_high.eq.${myId}`);
  if (error) throw error;
  return (data ?? []).map((row: any) => (row.user_low === myId ? row.high : row.low));
}

export async function removeFriend(otherUserId: string) {
  const { data: userData } = await supabase.auth.getUser();
  const myId = userData.user?.id;
  if (!myId) return;
  const low = myId < otherUserId ? myId : otherUserId;
  const high = myId < otherUserId ? otherUserId : myId;
  const { error } = await supabase.from('friendships').delete().eq('user_low', low).eq('user_high', high);
  if (error) throw error;
}

export async function blockUser(userId: string) {
  const { error } = await supabase.rpc('block_user', { p_user_id: userId });
  if (error) throw error;
}

export async function unblockUser(userId: string) {
  const { error } = await supabase.rpc('unblock_user', { p_user_id: userId });
  if (error) throw error;
}

export async function fetchBlockedUsers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('blocked_users')
    .select('profiles:profiles!blocked_users_blocked_id_fkey(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => row.profiles).filter(Boolean);
}
