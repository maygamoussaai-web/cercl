import { supabase } from '@/lib/supabase';

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  media_url?: string | null;
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

export async function sendImageMessage(conversationId: string, localUri: string) {
  const { data: userData } = await supabase.auth.getUser();
  const senderId = userData.user?.id;
  const ext = (localUri.split('.').pop() || 'jpg').toLowerCase();
  const path = `${conversationId}/${Date.now()}.${ext}`;

  const response = await fetch(localUri);
  const arrayBuffer = await response.arrayBuffer();
  const { error: uploadError } = await supabase.storage.from('chat-media').upload(path, arrayBuffer, {
    contentType: `image/${ext}`,
  });
  if (uploadError) throw uploadError;

  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: senderId,
    content: '',
    media_url: path,
  });
  if (error) throw error;
}

// chat-media est un bucket privé : on résout une URL signée temporaire à l'affichage
// plutôt que de stocker une URL qui expirerait un jour dans la base.
export async function getSignedMediaUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from('chat-media').createSignedUrl(path, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}

export async function deleteMessage(messageId: string) {
  const { error } = await supabase.from('messages').delete().eq('id', messageId);
  if (error) throw error;
}

export function subscribeToMessages(
  conversationId: string,
  onInsert: (m: Message) => void,
  onDelete?: (id: string) => void
) {
  const channel = supabase
    .channel(`messages-${conversationId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      (payload) => onInsert(payload.new as Message)
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      (payload) => onDelete?.((payload.old as any).id)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

// Indicateur "est en train d'écrire" via un canal Realtime broadcast (aucune
// écriture en base, léger — cf. principe §6 des directives complémentaires).
export function subscribeToTyping(conversationId: string, onTyping: (userId: string) => void) {
  const channel = supabase.channel(`typing-${conversationId}`);
  channel.on('broadcast', { event: 'typing' }, (payload: any) => onTyping(payload.payload.userId)).subscribe();
  return channel;
}

export function broadcastTyping(channel: ReturnType<typeof supabase.channel>, userId: string) {
  channel.send({ type: 'broadcast', event: 'typing', payload: { userId } });
}
