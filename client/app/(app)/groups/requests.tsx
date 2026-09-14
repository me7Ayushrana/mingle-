import { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { RequestsSkeleton } from '@/components/skeletons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Text, Heading } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { groupsService } from '@/services/groups.service';
import type { GroupInvite } from '@/types/groups';

export default function GroupRequestsScreen() {
  const router = useRouter();
  const [invites, setInvites] = useState<GroupInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const data = await groupsService.getInvites();
      setInvites(data);
    } catch (error) {
      console.error('Failed to fetch invites', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (inviteId: string) => {
    setProcessing(inviteId);
    try {
      await groupsService.acceptInvite(inviteId);
      setInvites((prev) => prev.filter((inv) => inv._id !== inviteId));
      router.replace('/(app)/(tabs)/groups'); // Go back to groups list which will now show it
    } catch (error) {
      console.error('Failed to accept', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (inviteId: string) => {
    setProcessing(inviteId);
    try {
      await groupsService.declineInvite(inviteId);
      setInvites((prev) => prev.filter((inv) => inv._id !== inviteId));
    } catch (error) {
      console.error('Failed to decline', error);
    } finally {
      setProcessing(null);
    }
  };

  const renderInviteItem = ({ item }: { item: GroupInvite }) => (
    <View style={styles.inviteCard}>
      <View style={styles.inviteHeader}>
        <Avatar avatarId={item.inviterId?.avatarId || 'avatar-1'} size={48} />
        <View style={styles.inviteInfo}>
          <Text style={styles.inviterName}>{item.inviterId?.alias || 'Unknown User'}</Text>
          <Text style={styles.inviteText}>invited you to join</Text>
          <Text style={styles.groupName}>{item.groupId?.name || 'Deleted Group'}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          style={styles.declineBtn}
          onPress={() => handleDecline(item._id)}
          disabled={processing === item._id}
        >
          <Text style={styles.declineText}>Decline</Text>
        </Pressable>
        <Pressable
          style={styles.acceptBtn}
          onPress={() => handleAccept(item._id)}
          disabled={processing === item._id}
        >
          <LinearGradient colors={colors.primaryGradient} style={StyleSheet.absoluteFillObject} />
          {processing === item._id ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.acceptText}>Accept</Text>
          )}
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <LinearGradient colors={['#18181B', '#000000']} style={StyleSheet.absoluteFillObject} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Heading level={2} style={styles.title}>
            Group Requests
          </Heading>
          <View style={{ width: 44 }} />
        </View>

        {loading ? (
          <RequestsSkeleton />
        ) : (
          <FlatList
            data={invites}
            keyExtractor={(item) => item._id}
            renderItem={renderInviteItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="mail-open-outline" size={48} color="rgba(255,255,255,0.2)" />
                <Text style={styles.emptyTitle}>No Pending Requests</Text>
                <Text style={styles.emptyDesc}>
                  When someone invites you to a group, it will appear here.
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#000' },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '700', color: colors.white },
  listContent: { padding: spacing.lg, gap: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  inviteCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  inviteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  inviteInfo: { flex: 1, marginLeft: spacing.md },
  inviterName: { fontSize: 16, fontWeight: '700', color: colors.white },
  inviteText: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginVertical: 2 },
  groupName: { fontSize: 18, fontWeight: '800', color: colors.primary },

  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  declineBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineText: { fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  acceptBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  acceptText: { fontSize: 15, fontWeight: '700', color: 'white' },

  emptyState: { alignItems: 'center', marginTop: 100, padding: spacing.xl },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyDesc: { fontSize: 14, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
});
