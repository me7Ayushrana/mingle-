import { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Text, Heading } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { chatsService, Chat } from '@/services/chats.service';
import { useAuthStore } from '@/store/auth.store';
import { spacing } from '@/theme/spacing';
import { ChatsSkeleton } from '@/components/skeletons';

export default function ChatsListScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const data = await chatsService.getChats();
        setChats(data);
      } catch (err) {
        console.error('Failed to fetch chats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  const renderChatItem = ({ item, index }: { item: Chat; index: number }) => {
    // Find the other participant
    const otherParticipant = item.participants.find((p) => p._id !== user?.id);
    if (!otherParticipant) return null;

    // A chat is "unread" if it has a recent message we haven't explicitly dismissed
    const hasMessage = Boolean(item.lastMessageText && item.lastMessageText.trim().length > 0);

    return (
      <Animated.View entering={FadeInDown.duration(400).delay(index * 50)}>
        <Pressable style={[styles.chatCard, hasMessage && styles.chatCardActive]} onPress={() => router.push(`/(app)/chat/${item._id}`)}>
          <View style={{ position: 'relative' }}>
            <Avatar avatarId={otherParticipant.avatarId} alias={otherParticipant.alias} size={50} />
            {hasMessage && <View style={styles.unreadDot} />}
          </View>
          <View style={styles.chatInfo}>
            <View style={styles.chatTopRow}>
              <Heading level={3} style={styles.alias}>
                {otherParticipant.alias}
              </Heading>
              {item.updatedAt && (
                <Text style={styles.timeText}>
                  {new Date(item.updatedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              )}
            </View>
            <Text style={hasMessage ? styles.lastMessageUnread : styles.lastMessage} numberOfLines={1}>
              {item.lastMessageText || 'Tap to start chatting'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.2)" />
        </Pressable>
      </Animated.View>
    );
  };


  return (
    <View style={styles.mainContainer}>
      <LinearGradient colors={['#18181B', '#000000']} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Heading level={2} style={styles.title}>
            Chats
          </Heading>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
          data={chats}
          keyExtractor={(item) => item._id}
          renderItem={renderChatItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            loading ? (
              <ChatsSkeleton />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={64} color="rgba(255,255,255,0.2)" />
                <Text style={styles.emptyText}>No chats yet</Text>
                <Text style={styles.emptySubtext}>Connect with people on the Explore screen!</Text>
              </View>
            )
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 500,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: {
    padding: spacing.xs,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: spacing.md,
  },
  chatCardActive: {
    backgroundColor: 'rgba(108,99,255,0.06)',
    borderColor: 'rgba(108,99,255,0.12)',
  },
  unreadDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#6C63FF',
    borderWidth: 2,
    borderColor: '#09090B',
  },
  chatInfo: {
    flex: 1,
  },
  chatTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  alias: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  timeText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },
  lastMessage: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  lastMessageUnread: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  emptySubtext: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

