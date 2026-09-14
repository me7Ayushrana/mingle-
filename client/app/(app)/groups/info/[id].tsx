import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInDown, SlideInDown } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import { GroupInfoSkeleton } from '@/components/skeletons';

import { Text, Heading } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { groupsService } from '@/services/groups.service';
import { usersService } from '@/services/users.service';
import { useAuthStore } from '@/store/auth.store';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_BG = '#111115';
const SHEET_SURFACE = 'rgba(255,255,255,0.06)';

interface MemberInfo {
  _id: string;
  alias: string;
  username: string;
  avatarId: string;
  mood?: string;
}

interface GroupInfoData {
  _id: string;
  name: string;
  description?: string;
  inviteCode: string;
  adminId: MemberInfo;
  members: MemberInfo[];
  createdAt: string;
}

export default function GroupInfoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [info, setInfo] = useState<GroupInfoData | null>(null);
  const [loading, setLoading] = useState(true);

  // Drawer State
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [invitingId, setInvitingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const data = await groupsService.getGroupInfo(id);
        setInfo(data);
      } catch (error) {
        console.error('Failed to load group info', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [id]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await usersService.searchUsers(searchQuery.trim());
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleDelete = async () => {
    Alert.alert('Delete Group', 'Are you sure you want to delete this group?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await groupsService.deleteGroup(id);
          router.replace('/(app)/(tabs)/groups');
        },
      },
    ]);
  };

  const handleLeave = async () => {
    Alert.alert('Leave Group', 'Are you sure you want to leave?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            await groupsService.leaveGroup(id);
            router.replace('/(app)/(tabs)/groups');
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Could not leave group');
          }
        },
      },
    ]);
  };

  const handleInvite = async (username: string, userId: string) => {
    setInvitingId(userId);
    try {
      await groupsService.addMember(id, username);
      Alert.alert('Success', `Invite sent to ${username}`);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not send invite');
    } finally {
      setInvitingId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.mainContainer}>
        <LinearGradient colors={['#18181B', '#000000']} style={StyleSheet.absoluteFillObject} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>
            <Heading level={2} style={styles.headerTitle}>
              Group Info
            </Heading>
            <View style={{ width: 44 }} />
          </View>
          <GroupInfoSkeleton />
        </SafeAreaView>
      </View>
    );
  }

  if (!info) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'rgba(255,255,255,0.5)' }}>Could not load group info.</Text>
      </View>
    );
  }

  const renderMember = ({ item, index }: { item: MemberInfo; index: number }) => {
    const isAdmin = item._id === info.adminId._id;
    return (
      <Animated.View entering={FadeInDown.delay(index * 60).duration(300)} style={styles.memberRow}>
        <Avatar avatarId={item.avatarId} size={44} />
        <View style={styles.memberInfo}>
          <View style={styles.memberNameRow}>
            <Text style={styles.memberAlias}>{item.alias}</Text>
            {isAdmin && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            )}
          </View>
          <Text style={styles.memberUsername}>@{item.username}</Text>
        </View>
        {item.mood && (
          <View style={styles.moodChip}>
            <Text style={styles.moodText}>{item.mood}</Text>
          </View>
        )}
      </Animated.View>
    );
  };

  const ListHeader = () => (
    <Animated.View entering={FadeIn.duration(400)}>
      {/* Group Icon & Name */}
      <View style={styles.heroSection}>
        <View style={styles.groupIconLg}>
          <Ionicons name="people" size={56} color={colors.primary} />
        </View>
        <Heading level={1} style={styles.groupName}>
          {info.name}
        </Heading>
        {info.description ? <Text style={styles.groupDesc}>{info.description}</Text> : null}
        <Text style={styles.memberCount}>
          {info.members.length} member{info.members.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <Pressable style={styles.actionBtn} onPress={() => setShowAddMember(true)}>
          <View style={[styles.actionIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
            <Ionicons name="person-add" size={20} color="#3b82f6" />
          </View>
          <Text style={styles.actionLabel}>Add</Text>
        </Pressable>

        <Pressable
          style={styles.actionBtn}
          onPress={() => {
            Clipboard.setStringAsync(`mingle://groups/invite/${info.inviteCode}`);
            Alert.alert('Copied!', 'Invite link copied to clipboard.');
          }}
        >
          <View style={[styles.actionIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Ionicons name="link" size={20} color="#10b981" />
          </View>
          <Text style={styles.actionLabel}>Copy Link</Text>
        </Pressable>

        {info.adminId._id === user?.id ? (
          <Pressable style={styles.actionBtn} onPress={handleDelete}>
            <View style={[styles.actionIconBg, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <Ionicons name="trash" size={20} color="#ef4444" />
            </View>
            <Text style={styles.actionLabel}>Delete</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.actionBtn} onPress={handleLeave}>
            <View style={[styles.actionIconBg, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <Ionicons name="log-out" size={20} color="#ef4444" />
            </View>
            <Text style={styles.actionLabel}>Leave</Text>
          </Pressable>
        )}
      </View>

      {/* Admin Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Created by</Text>
      </View>
      <View style={styles.adminCard}>
        <Avatar avatarId={info.adminId.avatarId} size={48} />
        <View style={styles.adminInfo}>
          <Text style={styles.adminName}>{info.adminId.alias}</Text>
          <Text style={styles.adminUsername}>@{info.adminId.username}</Text>
        </View>
        <View style={styles.crownBadge}>
          <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
        </View>
      </View>

      {/* Members Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Members</Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.mainContainer}>
      <LinearGradient colors={['#18181B', '#000000']} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Heading level={2} style={styles.headerTitle}>
            Group Info
          </Heading>
          <View style={{ width: 44 }} />
        </View>

        <FlatList
          data={info.members}
          keyExtractor={(item) => item._id}
          renderItem={renderMember}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {/* ─── Add Member Sheet ───────────────────────────── */}
        {showAddMember && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.overlayWrapper}>
            <BlurView intensity={60} tint="dark" style={styles.overlay}>
              <Pressable style={styles.overlayDismiss} onPress={() => setShowAddMember(false)} />
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ width: '100%' }}
              >
                <Animated.View entering={SlideInDown.duration(350)} style={styles.drawerSheet}>
                  <View style={styles.sheetHandle} />
                  <View style={styles.drawerHeader}>
                    <Heading level={3} style={styles.drawerTitle}>
                      Add Members
                    </Heading>
                    <Pressable onPress={() => setShowAddMember(false)}>
                      <Ionicons name="close" size={24} color="rgba(255,255,255,0.6)" />
                    </Pressable>
                  </View>

                  <View style={styles.searchInputWrapper}>
                    <Ionicons name="search" size={20} color="rgba(255,255,255,0.4)" />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search by username..."
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      autoCapitalize="none"
                      autoFocus
                    />
                  </View>

                  {isSearching ? (
                    <View style={styles.searchEmpty}>
                      <ActivityIndicator color={colors.primary} />
                    </View>
                  ) : searchResults.length > 0 ? (
                    <FlatList
                      data={searchResults}
                      keyExtractor={(item) => item._id}
                      style={styles.searchList}
                      keyboardShouldPersistTaps="handled"
                      renderItem={({ item }) => {
                        const isMember = info.members.some((m) => m._id === item._id);
                        return (
                          <View style={styles.searchResultItem}>
                            <Avatar avatarId={item.avatarId} alias={item.alias} size={36} />
                            <View style={styles.searchResultInfo}>
                              <Text style={styles.searchResultAlias}>{item.alias}</Text>
                              <Text style={styles.searchResultUsername}>@{item.username}</Text>
                            </View>
                            {isMember ? (
                              <Text style={styles.alreadyMemberText}>Joined</Text>
                            ) : (
                              <Pressable
                                style={styles.inviteBtn}
                                onPress={() => handleInvite(item.username, item._id)}
                                disabled={invitingId === item._id}
                              >
                                {invitingId === item._id ? (
                                  <ActivityIndicator size="small" color="white" />
                                ) : (
                                  <Text style={styles.inviteBtnText}>Invite</Text>
                                )}
                              </Pressable>
                            )}
                          </View>
                        );
                      }}
                    />
                  ) : searchQuery.trim() !== '' ? (
                    <View style={styles.searchEmpty}>
                      <Text style={styles.searchEmptyText}>No users found.</Text>
                    </View>
                  ) : null}
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
  center: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },

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
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.white },

  listContent: { paddingBottom: 40 },

  // Hero
  heroSection: { alignItems: 'center', paddingVertical: 32 },
  groupIconLg: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: 'rgba(236, 72, 153, 0.2)',
  },
  groupName: { fontSize: 28, fontWeight: '800', color: colors.white, textAlign: 'center' },
  groupDesc: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xl,
  },
  memberCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.3)',
    marginTop: spacing.sm,
    fontWeight: '600',
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing['2xl'],
    marginBottom: spacing.xl,
  },
  actionBtn: { alignItems: 'center', gap: 8 },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },

  // Section
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Admin card
  adminCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    backgroundColor: 'rgba(236, 72, 153, 0.08)',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.15)',
  },
  adminInfo: { flex: 1, marginLeft: spacing.md },
  adminName: { fontSize: 16, fontWeight: '700', color: colors.white },
  adminUsername: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  crownBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Members
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  memberInfo: { flex: 1, marginLeft: spacing.md },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  memberAlias: { fontSize: 16, fontWeight: '600', color: colors.white },
  memberUsername: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  adminBadge: {
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  adminBadgeText: { fontSize: 11, color: colors.primary, fontWeight: '700' },
  moodChip: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moodText: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },

  // Drawer
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
  drawerSheet: {
    backgroundColor: SHEET_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing['4xl'],
    maxHeight: SCREEN_HEIGHT * 0.7,
    minHeight: 400,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  drawerTitle: { fontSize: 20, fontWeight: '800', color: 'white' },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SHEET_SURFACE,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 15,
    marginLeft: spacing.sm,
  },
  searchList: { flexGrow: 0 },
  searchEmpty: { paddingVertical: 40, alignItems: 'center' },
  searchEmptyText: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  searchResultInfo: { flex: 1, marginLeft: spacing.md },
  searchResultAlias: { fontSize: 15, fontWeight: '700', color: 'white' },
  searchResultUsername: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  inviteBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 70,
    alignItems: 'center',
  },
  inviteBtnText: { color: 'white', fontSize: 13, fontWeight: '700' },
  alreadyMemberText: { color: 'rgba(255,255,255,0.3)', fontSize: 13, fontWeight: '600' },
});
