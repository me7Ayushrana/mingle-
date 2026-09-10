import { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  RefreshControl,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

import { Text, Heading } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/colors';
import { useAuthStore } from '@/store/auth.store';
import { momentsService } from '@/services/moments.service';
import { socketService } from '@/services/socket.service';
import type { Moment } from '@/types/moment';
import { HomeSkeleton } from '@/components/skeletons';

const SHEET_BG = '#111115';
const SHEET_SURFACE = 'rgba(255,255,255,0.06)';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MyMomentCard = ({
  item,
  onLike,
  onComment,
}: {
  item: Moment;
  onLike: () => void;
  onComment: () => void;
}) => {
  const scale = useSharedValue(1);

  const handleLike = () => {
    scale.value = withSequence(withSpring(1.3, { damping: 2, stiffness: 150 }), withSpring(1));
    onLike();
  };

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Avatar avatarId={item.authorAvatarId || item.author?.avatarId || 'avatar-1'} alias={item.authorAlias || item.author?.name || 'Me'} size={36} />
        <View style={styles.cardAuthorInfo}>
          <Text style={styles.cardAuthorName}>{item.authorAlias || item.author?.name || 'Me'}</Text>
          <Text style={styles.cardTimestamp}>
            {item.timestamp || item.createdAt ? new Date(item.timestamp || item.createdAt || '').toLocaleDateString() : 'Just now'}
          </Text>
        </View>
      </View>

      <Text style={styles.cardContent}>{item.content}</Text>

      <View style={styles.cardActions}>
        <Pressable style={styles.actionBtn} onPress={handleLike}>
          <Animated.View style={heartStyle}>
            <Ionicons
              name={item.isLiked ? 'heart' : 'heart-outline'}
              size={18}
              color={item.isLiked ? colors.primary : 'rgba(255,255,255,0.45)'}
            />
          </Animated.View>
          <Text style={[styles.actionCount, item.isLiked && { color: colors.primary }]}>
            {typeof item.likes === 'number' ? item.likes : 0}
          </Text>
        </Pressable>

        <Pressable style={styles.actionBtn} onPress={onComment}>
          <Ionicons name="chatbubble-outline" size={17} color="rgba(255,255,255,0.45)" />
          <Text style={styles.actionCount}>{Array.isArray(item.comments) ? item.comments.length : 0}</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default function MyMomentsScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [moments, setMoments] = useState<Moment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Comment sheet state
  const [commentMomentId, setCommentMomentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const commentInputRef = useRef<TextInput>(null);

  const myName = user?.alias || user?.username || 'Me';
  const myAvatar = user?.avatarId || 'avatar-1';

  const fetchMyMoments = useCallback(async () => {
    try {
      const data = await momentsService.getFeed();
      // Filter for only the current user's moments
      setMoments(data.filter((m) => m.isMine));
    } catch (error) {
      console.error('Failed to fetch my moments', error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchMyMoments();
    setIsRefreshing(false);
  }, [fetchMyMoments]);

  useEffect(() => {
    setIsLoading(true);
    fetchMyMoments().finally(() => setIsLoading(false));
  }, [fetchMyMoments]);

  useEffect(() => {
    if (!socketService.isConnected) {
      useAuthStore.getState().token && socketService.connect(useAuthStore.getState().token!);
    }

    const handleMomentCreated = (newMoment: Moment) => {
      setMoments((prev) => {
        if (!newMoment.isMine || prev.find((m) => m.id === newMoment.id)) return prev;
        return [newMoment, ...prev];
      });
    };

    const handleMomentUpdated = (update: { id: string; likes: number; comments: any[] }) => {
      setMoments((prev) =>
        prev.map((m) => {
          if (m.id === update.id) {
            return { ...m, likes: update.likes, comments: update.comments };
          }
          return m;
        }),
      );
    };

    socketService.on('moment:created', handleMomentCreated);
    socketService.on('moment:updated', handleMomentUpdated);

    return () => {
      socketService.off('moment:created', handleMomentCreated);
      socketService.off('moment:updated', handleMomentUpdated);
    };
  }, []);

  const toggleLike = async (id: string) => {
    setMoments((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const curLikes = typeof m.likes === 'number' ? m.likes : 0;
          return { ...m, isLiked: !m.isLiked, likes: m.isLiked ? curLikes - 1 : curLikes + 1 };
        }
        return m;
      }),
    );
    try {
      await momentsService.toggleLike(id);
    } catch (error) {
      console.error('Failed to toggle like', error);
      setMoments((prev) =>
        prev.map((m) => {
          if (m.id === id) {
            const curLikes = typeof m.likes === 'number' ? m.likes : 0;
            return { ...m, isLiked: !m.isLiked, likes: m.isLiked ? curLikes - 1 : curLikes + 1 };
          }
          return m;
        }),
      );
    }
  };

  const openComments = (id: string) => {
    setCommentMomentId(id);
    setCommentText('');
    setTimeout(() => commentInputRef.current?.focus(), 400);
  };

  const postComment = async () => {
    if (!commentText.trim() || !commentMomentId || isCommenting) return;
    setIsCommenting(true);
    try {
      const updatedMoment = await momentsService.addComment(commentMomentId, commentText.trim());
      setMoments((prev) => prev.map((m) => (m.id === commentMomentId ? updatedMoment : m)));
      setCommentText('');
    } catch (error) {
      console.error('Failed to post comment', error);
    } finally {
      setIsCommenting(false);
    }
  };

  const myMomentCount = moments.length;
  const totalLikes = moments.reduce((sum, m) => sum + (typeof m.likes === 'number' ? m.likes : 0), 0);

  // ─── Comment Sheet (current moment) ─────────────────
  const commentMoment = moments.find((m) => m.id === commentMomentId);

  return (
    <View style={styles.mainContainer}>
      <LinearGradient colors={['#18181B', '#000000']} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={moments}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="rgba(255,255,255,0.5)"
            />
          }
          ListHeaderComponent={
            <Animated.View entering={FadeIn.duration(500)}>
              {/* Back + Title */}
              <View style={styles.headerBar}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                  <Ionicons name="arrow-back" size={24} color="white" />
                </Pressable>
                <Heading level={1} style={styles.title}>
                  My Moments
                </Heading>
                <View style={{ width: 40 }} />
              </View>

              {/* Profile summary */}
              <View style={styles.profileSection}>
                <Avatar avatarId={myAvatar} alias={myName} size={56} />
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{myName}</Text>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{myMomentCount}</Text>
                      <Text style={styles.statLabel}>Posts</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{totalLikes}</Text>
                      <Text style={styles.statLabel}>Likes</Text>
                    </View>
                  </View>
                </View>
              </View>
            </Animated.View>
          }
          ListEmptyComponent={
            isLoading ? (
              <HomeSkeleton />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="albums-outline" size={48} color="rgba(255,255,255,0.15)" />
                <Text style={styles.emptyText}>You haven&apos;t posted any moments yet</Text>
              </View>
            )
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.duration(400).delay(index * 80)}>
              <MyMomentCard
                item={item}
                onLike={() => toggleLike(item.id)}
                onComment={() => openComments(item.id)}
              />
            </Animated.View>
          )}
        />

        {/* ─── Comment Sheet ───────────────────────────── */}
        {commentMomentId && commentMoment && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.overlayWrapper}>
            <BlurView intensity={60} tint="dark" style={styles.overlay}>
              <Pressable style={styles.overlayDismiss} onPress={() => setCommentMomentId(null)} />
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ width: '100%' }}
              >
                <Animated.View entering={SlideInDown.duration(350)} style={styles.commentSheet}>
                  <View style={styles.sheetHandle} />
                  <View style={styles.commentSheetHeader}>
                    <Heading level={3} style={styles.sheetTitle}>
                      Comments
                    </Heading>
                    <Pressable onPress={() => setCommentMomentId(null)}>
                      <Ionicons name="close" size={24} color="rgba(255,255,255,0.6)" />
                    </Pressable>
                  </View>

                  {/* Existing comments */}
                  <FlatList
                    data={Array.isArray(commentMoment.comments) ? commentMoment.comments : []}
                    keyExtractor={(c) => c.id}
                    style={styles.commentList}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                      <View style={styles.noComments}>
                        <Text style={styles.noCommentsText}>No comments yet. Be the first!</Text>
                      </View>
                    }
                    renderItem={({ item: c }) => (
                      <View style={styles.commentItem}>
                        <Avatar avatarId={c.avatarId} alias={c.author} size={28} />
                        <View style={styles.commentBody}>
                          <View style={styles.commentNameRow}>
                            <Text style={styles.commentAuthor}>{c.author}</Text>
                            <Text style={styles.commentTime}>
                              {c.timestamp
                                ? new Date(c.timestamp).toLocaleDateString()
                                : 'Just now'}
                            </Text>
                          </View>
                          <Text style={styles.commentText}>{c.text}</Text>
                        </View>
                      </View>
                    )}
                  />

                  {/* Input */}
                  <View style={styles.commentInputRow}>
                    <Avatar avatarId={myAvatar} alias={myName} size={28} />
                    <TextInput
                      ref={commentInputRef}
                      style={styles.commentInput}
                      placeholder="Add a comment..."
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={commentText}
                      onChangeText={setCommentText}
                      maxLength={200}
                    />
                    <Pressable
                      onPress={postComment}
                      disabled={!commentText.trim() || isCommenting}
                      style={[
                        styles.commentSendBtn,
                        (!commentText.trim() || isCommenting) && { opacity: 0.3 },
                      ]}
                    >
                      <Ionicons name="send" size={20} color={colors.primary} />
                    </Pressable>
                  </View>
                </Animated.View>
              </KeyboardAvoidingView>
            </BlurView>
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#000' },
  safeArea: { flex: 1 },
  listContent: { paddingBottom: spacing['4xl'] * 2 },

  // Header
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', color: 'white' },

  // Profile
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing.xl,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    marginBottom: spacing.sm,
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: '700', color: 'white', marginBottom: 10 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: '800', color: 'white' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  statDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.08)' },

  // Card
  card: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: 10,
  },
  cardAuthorInfo: { flex: 1 },
  cardAuthorName: { fontSize: 15, fontWeight: '700', color: 'white' },
  cardTimestamp: { fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 1 },
  cardContent: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionCount: { fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: '500' },

  separator: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },

  // Empty
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, color: 'rgba(255,255,255,0.3)' },

  // Overlay shared
  overlayWrapper: { ...StyleSheet.absoluteFillObject, zIndex: 100 },
  overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  overlayDismiss: { ...StyleSheet.absoluteFillObject },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  sheetTitle: { fontSize: 22, fontWeight: '800', color: 'white', textAlign: 'center' },

  commentSheet: {
    backgroundColor: SHEET_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    maxHeight: SCREEN_HEIGHT * 0.65,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  commentSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  commentList: { maxHeight: SCREEN_HEIGHT * 0.35 },
  noComments: { paddingVertical: 30, alignItems: 'center' },
  noCommentsText: { fontSize: 14, color: 'rgba(255,255,255,0.25)' },

  commentItem: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  commentBody: { flex: 1 },
  commentNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  commentAuthor: { fontSize: 14, fontWeight: '700', color: 'white' },
  commentTime: { fontSize: 12, color: 'rgba(255,255,255,0.25)' },
  commentText: { fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20, marginTop: 3 },

  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    marginTop: spacing.sm,
  },
  commentInput: {
    flex: 1,
    color: 'white',
    fontSize: 15,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: SHEET_SURFACE,
  },
  commentSendBtn: { padding: 6 },
});
