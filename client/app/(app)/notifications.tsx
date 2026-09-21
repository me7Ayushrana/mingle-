import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

import { Text, Heading } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { notificationsService } from '@/services/notifications.service';
import { spacing } from '@/theme/spacing';
import type { InAppNotification } from '@/types/discovery';

const NOTIF_ICONS: Record<string, { name: any; color: string }> = {
  match: { name: 'heart', color: '#FF6B8A' },
  like: { name: 'star', color: '#F59E0B' },
  message: { name: 'chatbubble', color: '#6C63FF' },
  system: { name: 'information-circle', color: '#4DA1A9' },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const { notifications: data } = await notificationsService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAllRead = async () => {
    await notificationsService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotifPress = (notif: InAppNotification) => {
    // Mark individual notification read
    setNotifications((prev) =>
      prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
    );
    // Navigate based on type
    if ((notif.type === 'match' || notif.type === 'message') && notif.data?.chatId) {
      router.push(`/(app)/chat/${notif.data.chatId}` as any);
    } else if (notif.type === 'like') {
      router.push('/(app)/(tabs)/matching' as any);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderItem = ({ item, index }: { item: InAppNotification; index: number }) => {
    const icon = NOTIF_ICONS[item.type] ?? NOTIF_ICONS['system']!;
    return (
      <Animated.View entering={FadeInDown.duration(350).delay(index * 40)}>
        <Pressable
          style={[styles.notifCard, !item.read && styles.notifCardUnread]}
          onPress={() => handleNotifPress(item)}
        >
          {/* Left: avatar or icon */}
          <View style={styles.notifLeft}>
            {item.data?.fromAvatarId ? (
              <Avatar
                avatarId={item.data.fromAvatarId}
                alias={item.data.fromName || '?'}
                size={46}
              />
            ) : (
              <View style={[styles.notifIconCircle, { backgroundColor: icon.color + '22' }]}>
                <Ionicons name={icon.name} size={22} color={icon.color} />
              </View>
            )}
            {/* Unread dot */}
            {!item.read && <View style={[styles.unreadDot, { backgroundColor: icon.color }]} />}
          </View>

          {/* Content */}
          <View style={styles.notifContent}>
            <Text style={styles.notifTitle}>{item.title}</Text>
            <Text style={styles.notifMessage} numberOfLines={2}>
              {item.message}
            </Text>
            <Text style={styles.notifTime}>{timeAgo(item.createdAt)}</Text>
          </View>

          {/* Chevron */}
          <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.25)" />
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <View style={styles.headerCenter}>
            <Heading level={2} style={styles.headerTitle}>Notifications</Heading>
            {unreadCount > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          {unreadCount > 0 ? (
            <Pressable onPress={handleMarkAllRead} style={styles.markAllBtn}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </Pressable>
          ) : (
            <View style={{ width: 80 }} />
          )}
        </Animated.View>

        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadNotifications();
              }}
              tintColor="rgba(255,255,255,0.4)"
            />
          }
          ListEmptyComponent={
            loading ? null : (
              <View style={styles.emptyState}>
                <Ionicons name="notifications-off-outline" size={60} color="rgba(255,255,255,0.15)" />
                <Text style={styles.emptyTitle}>All caught up!</Text>
                <Text style={styles.emptySubtitle}>No notifications yet. Start connecting with people.</Text>
              </View>
            )
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  safe: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 520,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: {
    padding: spacing.xs,
    width: 40,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  headerBadge: {
    backgroundColor: '#FF6B8A',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  headerBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  markAllBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    width: 80,
    alignItems: 'flex-end',
  },
  markAllText: {
    color: '#6C63FF',
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 120,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: spacing.md,
  },
  notifCardUnread: {
    backgroundColor: 'rgba(108,99,255,0.07)',
    borderColor: 'rgba(108,99,255,0.15)',
  },
  notifLeft: {
    position: 'relative',
  },
  notifIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#09090B',
  },
  notifContent: {
    flex: 1,
    gap: 3,
  },
  notifTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  notifMessage: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    lineHeight: 18,
  },
  notifTime: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
