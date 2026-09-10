import { supabase } from '@/lib/supabase';

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  profiles?: { display_name: string; handle: string };
};

export async function getCircleConversationId(circleId: string): Promise<string | null> {
  const { data, error } = await supabase.from('conversations').select('id').eq('circle_id', circleId).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

export async function getOrCreateDirectConversation(otherUserId: string): Promise<string> {
  const { data, error } = await supabase.rpc('get_or_create_direct_conversation', { p_other_user: otherUserId });
  if (error) throw error;
  return data as string;
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*, profiles(display_name, handle)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as unknown as Message[];
}

export async function sendMessage(conversationId: string, content: string) {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: userData.user?.id,
    content,
  });
  if (error) throw error;
}

export function subscribeToMessages(conversationId: string, onInsert: (m: Message) => void) {
  const channel = supabase
    .channel(`messages-${conversationId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      (payload) => onInsert(payload.new as Message)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}
