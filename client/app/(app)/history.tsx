import { useEffect } from 'react';
import { StyleSheet, View, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, Easing, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Text, Heading } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/colors';

const BLUE = '#3B82F6';
const EMERALD = '#10B981';

// ── Mock Chat History Data ────────────────────────────────────
interface ChatHistory {
  id: string;
  alias: string;
  avatarId: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isOnline: boolean;
  mood: string;
}

const CHAT_HISTORY: ChatHistory[] = [
  {
    id: 'match-1',
    alias: 'QuietRiver',
    avatarId: 'avatar-4',
    lastMessage: "That's cool! Tell me more about it.",
    timestamp: 'Just now',
    unread: 2,
    isOnline: true,
    mood: '🎵 Chill',
  },
  {
    id: 'match-2',
    alias: 'MidnightSky',
    avatarId: 'avatar-2',
    lastMessage: 'Yeah I totally agree! We should chat more.',
    timestamp: '2m ago',
    unread: 0,
    isOnline: true,
    mood: '💜 Calm',
  },
  {
    id: 'match-3',
    alias: 'NeonDrift',
    avatarId: 'avatar-1',
    lastMessage: 'Haha that was fun! Talk later?',
    timestamp: '15m ago',
    unread: 1,
    isOnline: false,
    mood: '🔥 Excited',
  },
  {
    id: 'match-4',
    alias: 'CosmicEcho',
    avatarId: 'avatar-5',
    lastMessage: 'Good night! ✨',
    timestamp: '1h ago',
    unread: 0,
    isOnline: false,
    mood: '🌙 Dreamy',
  },
  {
    id: 'match-5',
    alias: 'SilentWave',
    avatarId: 'avatar-3',
    lastMessage: 'This app is amazing honestly.',
    timestamp: '3h ago',
    unread: 0,
    isOnline: false,
    mood: '😊 Happy',
  },
  {
    id: 'match-6',
    alias: 'VelvetStorm',
    avatarId: 'avatar-6',
    lastMessage: 'We should do voice chat next time!',
    timestamp: 'Yesterday',
    unread: 0,
    isOnline: false,
    mood: '🎧 Vibing',
  },
  {
    id: 'match-7',
    alias: 'LunarFox',
    avatarId: 'avatar-1',
    lastMessage: 'Loved talking to you 💫',
    timestamp: 'Yesterday',
    unread: 0,
    isOnline: false,
    mood: '💜 Calm',
  },
  {
    id: 'match-8',
    alias: 'GlowEmber',
    avatarId: 'avatar-3',
    lastMessage: 'Catch you on the next match!',
    timestamp: '2 days ago',
    unread: 0,
    isOnline: false,
    mood: '🔥 Excited',
  },
];

// ── Pulse Dot ──────────────────────────────────────────────────
const PulseDot = ({ color }: { color: string }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: 2 - scale.value,
  }));

  return (
    <View style={{ width: 8, height: 8 }}>
      <Animated.View style={[{ position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: color }, animatedStyle]} />
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
    </View>
  );
};

// ════════════════════════════════════════════════════════════════
export default function HistoryScreen() {
  const router = useRouter();

  const onlineCount = CHAT_HISTORY.filter(c => c.isOnline).length;
  const totalMatches = CHAT_HISTORY.length;

  const handleOpenChat = (chatId: string) => {
    router.push({ pathname: '/(app)/chat/[id]', params: { id: chatId } });
  };

  const renderChatItem = ({ item, index }: { item: ChatHistory; index: number }) => {
    return (
      <Animated.View entering={FadeInDown.duration(400).delay(index * 80)}>
        <Pressable 
          style={styles.chatItem}
          onPress={() => handleOpenChat(item.id)}
        >
          {/* Avatar with online indicator */}
          <View style={styles.avatarContainer}>
            <Avatar avatarId={item.avatarId} alias={item.alias} size={52} />
            {item.isOnline && <View style={styles.onlineDot} />}
          </View>

          {/* Chat info */}
          <View style={styles.chatInfo}>
            <View style={styles.chatTopRow}>
              <Text style={styles.chatAlias}>{item.alias}</Text>
              <Text style={[styles.chatTime, item.unread > 0 && styles.chatTimeActive]}>
                {item.timestamp}
              </Text>
            </View>
            <View style={styles.chatBottomRow}>
              <Text style={styles.chatMood}>{item.mood}</Text>
            </View>
            <Text 
              style={[styles.chatLastMessage, item.unread > 0 && styles.chatLastMessageUnread]}
              numberOfLines={1}
            >
              {item.lastMessage}
            </Text>
          </View>

          {/* Unread badge */}
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <LinearGradient colors={colors.primaryGradient} style={StyleSheet.absoluteFillObject} />
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </Pressable>
      </Animated.View>
    );
  };

  const ListHeader = () => (
    <View style={styles.listHeader}>
      {/* Title */}
      <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
        </View>
        <View style={styles.headerCenter}>
          <Heading level={1} style={styles.title}>Connections</Heading>
          <Text style={styles.subtitle}>Your chat history</Text>
        </View>
        <View style={styles.headerRight} />
      </Animated.View>

      {/* Compact Stats Row */}
      <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.compactStatsRow}>
        <View style={styles.compactStat}>
          <Ionicons name="people" size={16} color={colors.primary} />
          <Text style={styles.compactStatText}><Text style={styles.compactStatValue}>{totalMatches}</Text> Matches</Text>
        </View>
        <View style={styles.compactStatDivider} />
        <View style={styles.compactStat}>
          <PulseDot color={EMERALD} />
          <Text style={styles.compactStatText}><Text style={styles.compactStatValue}>{onlineCount}</Text> Online Now</Text>
        </View>
      </Animated.View>

      {/* Section Label */}
      <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.sectionLabelRow}>
        <Text style={styles.sectionLabel}>Recent Chats</Text>
        <View style={styles.filterPill}>
          <Ionicons name="filter" size={14} color="rgba(255,255,255,0.5)" />
          <Text style={styles.filterText}>All</Text>
        </View>
      </Animated.View>
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="chatbubble-ellipses-outline" size={48} color="rgba(255,255,255,0.2)" />
      </View>
      <Text style={styles.emptyTitle}>No connections yet</Text>
      <Text style={styles.emptySubtitle}>
        Start matching to find your first connection!
      </Text>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        colors={['#18181B', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={CHAT_HISTORY}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#000' },
  safeArea: { flex: 1 },
  container: {
    paddingBottom: spacing['4xl'],
  },

  // ── List Header ────────────────────────────────────────────
  listHeader: {
    paddingHorizontal: spacing['2xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  headerLeft: {
    width: 48,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 48,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },

  // ── Compact Stats Row ─────────────────────────────────────
  compactStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    paddingHorizontal: spacing.sm,
  },
  compactStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactStatText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  compactStatValue: {
    color: colors.white,
    fontWeight: '700',
  },
  compactStatDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: spacing.lg,
  },

  // ── Section Label ─────────────────────────────────────────
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },

  // ── Chat Item ─────────────────────────────────────────────
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: EMERALD,
    borderWidth: 2.5,
    borderColor: '#18181B',
  },
  chatInfo: {
    flex: 1,
    gap: 2,
  },
  chatTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatAlias: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  chatTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '500',
  },
  chatTimeActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  chatBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  chatMood: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  chatLastMessage: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  chatLastMessageUnread: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },

  // ── Unread Badge ──────────────────────────────────────────
  unreadBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },

  // ── Separator ─────────────────────────────────────────────
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  // ── Empty State ───────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing['4xl'],
    paddingHorizontal: spacing['2xl'],
    gap: spacing.md,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    lineHeight: 22,
  },
});
