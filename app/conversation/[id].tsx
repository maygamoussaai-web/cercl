import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { colors, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import {
  broadcastTyping,
  deleteMessage,
  fetchMessages,
  getSignedMediaUrl,
  sendImageMessage,
  sendMessage,
  subscribeToMessages,
  subscribeToTyping,
  type Message,
} from '@/lib/api/chat';
import { pickImage } from '@/lib/api/media';
import { supabase } from '@/lib/supabase';

function ChatImage({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    getSignedMediaUrl(path).then(setUrl).catch(() => {});
  }, [path]);
  if (!url) return <View style={styles.imagePlaceholder} />;
  return <Image source={{ uri: url }} style={styles.image} />;
}

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [typingUsers, setTypingUsers] = useState<Record<string, number>>({});
  const listRef = useRef<FlatList>(null);
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const myId = session?.user.id;

  const load = useCallback(async () => {
    if (!id) return;
    const data = await fetchMessages(id);
    setMessages(data);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!id) return undefined;
    return subscribeToMessages(
      id,
      (m) => setMessages((prev) => [...prev, m]),
      (deletedId) => setMessages((prev) => prev.filter((m) => m.id !== deletedId))
    );
  }, [id]);

  useEffect(() => {
    if (!id) return undefined;
    const channel = subscribeToTyping(id, (userId) => {
      if (userId === myId) return;
      setTypingUsers((prev) => ({ ...prev, [userId]: Date.now() }));
    });
    typingChannelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, myId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers((prev) => {
        const now = Date.now();
        const next = { ...prev };
        let changed = false;
        for (const [uid, ts] of Object.entries(next)) {
          if (now - ts > 3000) {
            delete next[uid];
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTextChange = (t: string) => {
    setText(t);
    if (typingChannelRef.current && myId) {
      broadcastTyping(typingChannelRef.current, myId);
    }
  };

  const handleSend = async () => {
    if (!id || !text.trim()) return;
    const content = text.trim();
    setText('');
    try {
      await sendMessage(id, content);
    } catch {
      setText(content);
    }
  };

  const handlePickImage = async () => {
    if (!id) return;
    const uri = await pickImage(false);
    if (!uri) return;
    try {
      await sendImageMessage(id, uri);
    } catch {
      // silencieux pour l'instant
    }
  };

  const handleDelete = (messageId: string) => {
    deleteMessage(messageId).catch(() => {});
  };

  const isTyping = Object.keys(typingUsers).length > 0;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: spacing.lg }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const mine = item.sender_id === myId;
          return (
            <View style={[styles.bubbleRow, mine && styles.bubbleRowMine]}>
              <Pressable onLongPress={() => mine && handleDelete(item.id)}>
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                  {!mine && <Text style={styles.senderName}>{item.profiles?.display_name}</Text>}
                  {item.media_url ? (
                    <ChatImage path={item.media_url} />
                  ) : (
                    <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{item.content}</Text>
                  )}
                  {mine && (
                    <Text style={styles.deleteLink} onPress={() => handleDelete(item.id)}>
                      Supprimer
                    </Text>
                  )}
                </View>
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>Aucun message pour l'instant. Dis salut 👋</Text>}
      />
      {isTyping && <Text style={styles.typing}>Quelqu'un écrit…</Text>}
      <View style={styles.inputRow}>
        <Text style={styles.attachButton} onPress={handlePickImage}>
          📷
        </Text>
        <View style={{ flex: 1 }}>
          <TextField placeholder="Écris un message" value={text} onChangeText={handleTextChange} onSubmitEditing={handleSend} />
        </View>
        <View style={{ width: spacing.sm }} />
        <Button label="Envoyer" onPress={handleSend} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
  typing: { color: colors.textMuted, fontSize: 12, paddingHorizontal: spacing.lg, paddingBottom: spacing.xs },
  bubbleRow: { flexDirection: 'row', marginBottom: spacing.sm },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '78%', borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  bubbleMine: { backgroundColor: colors.accent, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  senderName: { color: colors.accent, fontSize: 12, fontWeight: '700', marginBottom: 2 },
  bubbleText: { color: colors.text, fontSize: 15 },
  bubbleTextMine: { color: '#0B0B10' },
  deleteLink: { color: '#0B0B10', opacity: 0.6, fontSize: 10, marginTop: 4, textAlign: 'right' },
  image: { width: 200, height: 200, borderRadius: radius.md },
  imagePlaceholder: { width: 200, height: 200, borderRadius: radius.md, backgroundColor: colors.surfaceElevated },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  attachButton: { fontSize: 22, marginRight: spacing.sm },
});
