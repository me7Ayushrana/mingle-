import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { GroupsSkeleton } from '@/components/skeletons';
import { BlurView } from 'expo-blur';

import { Text, Heading } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { groupsService } from '@/services/groups.service';
import type { Group } from '@/types/groups';

export default function GroupsScreen() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Modal State
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const data = await groupsService.getGroups();
      setGroups(data);
    } catch (error) {
      console.error('Failed to fetch groups', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    setIsCreating(true);
    try {
      const newGroup = await groupsService.createGroup({
        name: newGroupName,
        description: newGroupDesc,
      });
      setGroups([newGroup, ...groups]);
      setShowCreate(false);
      setNewGroupName('');
      setNewGroupDesc('');
    } catch (error) {
      console.error('Failed to create group', error);
    } finally {
      setIsCreating(false);
    }
  };

  const renderGroupItem = ({ item }: { item: Group }) => (
    <Pressable style={styles.groupCard} onPress={() => router.push(`/(app)/groups/${item._id}`)}>
      <View style={styles.groupIcon}>
        <Ionicons name="people" size={24} color={colors.primary} />
      </View>
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{item.name}</Text>
        {item.description ? (
          <Text style={styles.groupDesc} numberOfLines={1}>
            {item.description}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
    </Pressable>
  );

  return (
    <View style={styles.mainContainer}>
      <LinearGradient colors={['#18181B', '#000000']} style={StyleSheet.absoluteFillObject} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Heading level={1} style={styles.title}>
            Groups
          </Heading>
          <View style={styles.headerRight}>
            <Pressable style={styles.iconBtn} onPress={() => router.push('/(app)/groups/requests')}>
              <Ionicons name="notifications-outline" size={24} color="white" />
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={() => setShowCreate(true)}>
              <Ionicons name="add" size={24} color="white" />
            </Pressable>
          </View>
        </View>

        {loading ? (
          <GroupsSkeleton />
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(item) => item._id}
            renderItem={renderGroupItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="chatbubbles-outline" size={48} color="rgba(255,255,255,0.2)" />
                <Text style={styles.emptyTitle}>No Groups Yet</Text>
                <Text style={styles.emptyDesc}>
                  Create a group or join one using an invite link.
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>

      {/* ── Create Group Modal ────────────────────────────── */}
      {showCreate && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.overlayWrapper}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <BlurView intensity={60} tint="dark" style={styles.overlay}>
              <Pressable style={styles.overlayDismiss} onPress={() => setShowCreate(false)} />
              <Animated.View entering={SlideInDown.duration(350)} style={styles.sheet}>
                <View style={styles.sheetHandle} />
                <Heading level={2} style={styles.sheetTitle}>
                  New Group
                </Heading>

                <Text style={styles.inputLabel}>Group Name</Text>
                <TextInput
                  style={styles.input}
                  value={newGroupName}
                  onChangeText={setNewGroupName}
                  placeholder="e.g. Weekend Vibes"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  autoFocus
                />

                <Text style={styles.inputLabel}>Description (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newGroupDesc}
                  onChangeText={setNewGroupDesc}
                  placeholder="What's this group about?"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  multiline
                />

                <Pressable
                  style={[styles.saveBtn, (!newGroupName.trim() || isCreating) && { opacity: 0.5 }]}
                  onPress={handleCreateGroup}
                  disabled={!newGroupName.trim() || isCreating}
                >
                  <LinearGradient
                    colors={colors.primaryGradient}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Text style={styles.saveBtnText}>
                    {isCreating ? 'Creating...' : 'Create Group'}
                  </Text>
                </Pressable>
              </Animated.View>
            </BlurView>
          </KeyboardAvoidingView>
        </Animated.View>
      )}
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: { fontSize: 32, fontWeight: '800', color: colors.white },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: { padding: spacing.lg, gap: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  groupInfo: { flex: 1, marginRight: spacing.md },
  groupName: { fontSize: 16, fontWeight: '700', color: colors.white, marginBottom: 2 },
  groupDesc: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },

  emptyState: { alignItems: 'center', marginTop: 100, padding: spacing.xl },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyDesc: { fontSize: 14, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },

  // Modal
  overlayWrapper: { ...StyleSheet.absoluteFillObject, zIndex: 100 },
  overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  overlayDismiss: { ...StyleSheet.absoluteFillObject },
  sheet: {
    backgroundColor: '#111115',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    paddingBottom: 40,
    width: '100%',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 16,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  saveBtn: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    overflow: 'hidden',
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: 'white' },
});
