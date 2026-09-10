import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { colors, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { fetchMessages, sendMessage, subscribeToMessages, type Message } from '@/lib/api/chat';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

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
    return subscribeToMessages(id, (m) => setMessages((prev) => [...prev, m]));
  }, [id]);

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

  const myId = session?.user.id;

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
              <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                {!mine && <Text style={styles.senderName}>{item.profiles?.display_name}</Text>}
                <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{item.content}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>Aucun message pour l'instant. Dis salut 👋</Text>}
      />
      <View style={styles.inputRow}>
        <View style={{ flex: 1 }}>
          <TextField placeholder="Écris un message" value={text} onChangeText={setText} onSubmitEditing={handleSend} />
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
  bubbleRow: { flexDirection: 'row', marginBottom: spacing.sm },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '78%', borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  bubbleMine: { backgroundColor: colors.accent, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  senderName: { color: colors.accent, fontSize: 12, fontWeight: '700', marginBottom: 2 },
  bubbleText: { color: colors.text, fontSize: 15 },
  bubbleTextMine: { color: '#0B0B10' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
});
