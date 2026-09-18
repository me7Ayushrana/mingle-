import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, SlideInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { AVATAR_OPTIONS, Avatar } from '@/components/ui/Avatar';
import { MoodChip } from '@/components/ui/MoodChip';
import { MOOD_OPTIONS, type MoodType } from '@/constants/moods';
import { Text, Heading } from '@/components/ui/Text';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/colors';

// ════════════════════════════════════════════════════════════════
import { useState } from 'react';

const BLUE = '#3B82F6';
const EMERALD = '#10B981';
const AMBER = '#F59E0B';

// ── Menu Row Component ─────────────────────────────────────────
const MenuRow = ({
  icon,
  iconColor,
  label,
  value,
  onPress,
  showChevron = true,
  danger = false,
}: {
  icon: any;
  iconColor: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  danger?: boolean;
}) => (
  <Pressable style={styles.menuRow} onPress={onPress}>
    <View style={[styles.menuIconBg, { backgroundColor: `${iconColor}18` }]}>
      <Ionicons name={icon} size={20} color={iconColor} />
    </View>
    <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
    <View style={styles.menuRight}>
      {value ? <Text style={styles.menuValue}>{value}</Text> : null}
      {showChevron && <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.2)" />}
    </View>
  </Pressable>
);
export default function AboutScreen() {
  const { user, setUser } = useAuthStore();
  const logout = useLogout();
  const router = useRouter();

  // Edit Modal State
  const [showEdit, setShowEdit] = useState(false);
  const [editAlias, setEditAlias] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editLanguage, setEditLanguage] = useState('');
  const [editMood, setEditMood] = useState('');
  const [editAvatarId, setEditAvatarId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    Alert.alert(
      'End Session',
      'This will destroy your current alias and disconnect you completely. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => logout.mutate() },
      ],
    );
  };

  const openEditModal = () => {
    setEditAlias(user.alias || '');
    setEditUsername(user.username || '');
    setEditLanguage(user.language || '');
    setEditMood(user.mood || '');
    setEditAvatarId(user.avatarId || 'avatar-1');
    setShowEdit(true);
  };

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      const updatedUser = await authService.updateProfile({
        alias: editAlias,
        username: editUsername,
        language: editLanguage,
        mood: (editMood as MoodType) || undefined,
        avatarId: editAvatarId,
      });
      setUser(updatedUser);
      setShowEdit(false);
    } catch {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <LinearGradient colors={['#18181B', '#000000']} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* ── Profile Header ──────────────────────────────── */}
          <Animated.View entering={FadeIn.duration(600)} style={styles.profileHeader}>
            <Pressable style={styles.topRightEditBtn} onPress={openEditModal}>
              <Ionicons
                name="pencil"
                size={14}
                color="rgba(255,255,255,0.8)"
                style={{ marginRight: 4 }}
              />
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' }}>
                Edit
              </Text>
            </Pressable>

            <View style={styles.avatarRing}>
              <Avatar avatarId={user.avatarId} alias={user.alias} size={84} />
            </View>
            <Heading level={1} style={styles.aliasText}>
              {user.alias}
            </Heading>
            <Text style={styles.usernameText}>@{user.username || 'unavailable'}</Text>
          </Animated.View>

          {/* ── Badges & Reputation Section ──────────────────── */}
          <Animated.View entering={FadeInDown.duration(500).delay(100)}>
            <Text style={styles.sectionLabel}>REPUTATION & BADGES</Text>
            <View style={styles.menuCard}>
              <View style={{ padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="sparkles-outline" size={20} color={colors.primary} />
                  <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 15 }}>Vibe Score</Text>
                </View>
                <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 18 }}>{user.reputation || 50} pts</Text>
              </View>
              <View style={styles.menuDivider} />
              <View style={{ padding: spacing.md }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 8 }}>Unlocked Badges:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {(user.badges || ['Newcomer', 'Great Listener', 'Kind Soul']).map((badge) => (
                    <View key={badge} style={{ backgroundColor: 'rgba(255, 45, 85, 0.15)', borderColor: 'rgba(255, 45, 85, 0.4)', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="ribbon-outline" size={12} color={colors.primary} />
                      <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600' }}>{badge}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </Animated.View>

          {/* ── Account Section ─────────────────────────────── */}
          <Animated.View entering={FadeInDown.duration(500).delay(150)}>
            <Text style={styles.sectionLabel}>ACCOUNT</Text>
            <View style={styles.menuCard}>
              <MenuRow
                icon="person-outline"
                iconColor={BLUE}
                label="Name"
                value={user.alias || 'NA'}
                showChevron={false}
              />
              <View style={styles.menuDivider} />
              <MenuRow
                icon="at-circle-outline"
                iconColor={BLUE}
                label="Username"
                value={`@${user.username?.toLowerCase().replace(/\s/g, '') || 'unavailable'}`}
                showChevron={false}
              />
              <View style={styles.menuDivider} />
              <MenuRow
                icon="language-outline"
                iconColor={colors.primary}
                label="Language"
                value={user.language || 'Any'}
                showChevron={false}
              />
              <View style={styles.menuDivider} />
              <MenuRow
                icon="color-palette-outline"
                iconColor={colors.primary}
                label="Change Avatar"
                showChevron={false}
              />
              <View style={styles.menuDivider} />
              <MenuRow
                icon="sparkles-outline"
                iconColor={AMBER}
                label="Current Mood"
                value={user.mood || 'Not set'}
                showChevron={false}
              />
              <View style={styles.menuDivider} />
              <MenuRow
                icon="heart-outline"
                iconColor={colors.primary}
                label="Anonymous Feedbacks"
                value="3 New"
                onPress={() => router.push('/(app)/feedbacks')}
              />
            </View>
          </Animated.View>

          {/* ── Privacy & Safety Section ─────────────────────── */}
          <Animated.View entering={FadeInDown.duration(500).delay(350)}>
            <Text style={styles.sectionLabel}>PRIVACY & SAFETY</Text>
            <View style={styles.menuCard}>
              <MenuRow
                icon="shield-checkmark-outline"
                iconColor={EMERALD}
                label="Privacy Policy"
                onPress={() => alert('Privacy Policy coming soon!')}
              />
              <View style={styles.menuDivider} />
              <MenuRow
                icon="trash-outline"
                iconColor={colors.primary}
                label="Delete Account"
                onPress={() =>
                  Alert.alert(
                    'Delete Account',
                    'This will permanently erase your data. This action cannot be undone.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => alert('Account deletion coming soon!'),
                      },
                    ],
                  )
                }
              />
            </View>
          </Animated.View>

          {/* ── About Section ───────────────────────────────── */}
          <Animated.View entering={FadeInDown.duration(500).delay(450)}>
            <Text style={styles.sectionLabel}>ABOUT</Text>
            <View style={styles.menuCard}>
              <MenuRow
                icon="star-outline"
                iconColor={AMBER}
                label="Rate Mingle"
                onPress={() => alert('Rate on App Store coming soon!')}
              />
              <View style={styles.menuDivider} />
              <MenuRow
                icon="share-social-outline"
                iconColor={colors.primary}
                label="Share Mingle"
                onPress={() => alert('Share link coming soon!')}
              />
              <View style={styles.menuDivider} />
              <MenuRow
                icon="information-circle-outline"
                iconColor="rgba(255,255,255,0.5)"
                label="Version"
                value="1.0.0"
                showChevron={false}
              />
            </View>
          </Animated.View>

          {/* ── Logout Button ───────────────────────────────── */}
          <Animated.View entering={FadeInDown.duration(500).delay(550)}>
            <Pressable style={styles.logoutCard} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color={colors.primary} />
              <Text style={styles.logoutText}>End Session & Log Out</Text>
            </Pressable>
          </Animated.View>

          {/* ── Footer ──────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.duration(500).delay(600)} style={styles.footer}>
            <Text style={styles.footerText}>Made with 💜 for real connections</Text>
            <Text style={styles.footerVersion}>Mingle v1.0.0</Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* ── Edit Profile Modal ────────────────────────────── */}
      {showEdit && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.overlayWrapper}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <BlurView intensity={60} tint="dark" style={styles.overlay}>
              <Pressable style={styles.overlayDismiss} onPress={() => setShowEdit(false)} />
              <Animated.View entering={SlideInDown.duration(350)} style={styles.editSheet}>
                <View style={styles.sheetHandle} />
                <Heading level={2} style={styles.sheetTitle}>
                  Edit Profile
                </Heading>

                <ScrollView style={styles.editForm} showsVerticalScrollIndicator={false}>
                  <Text style={styles.inputLabel}>Name (Alias)</Text>
                  <TextInput
                    style={styles.input}
                    value={editAlias}
                    onChangeText={setEditAlias}
                    placeholder="Your display name"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />

                  <Text style={styles.inputLabel}>Username</Text>
                  <TextInput
                    style={styles.input}
                    value={editUsername}
                    onChangeText={setEditUsername}
                    placeholder="Your handle (e.g. mohitxcodes)"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    autoCapitalize="none"
                  />

                  <Text style={styles.inputLabel}>Language</Text>
                  <TextInput
                    style={styles.input}
                    value={editLanguage}
                    onChangeText={setEditLanguage}
                    placeholder="e.g. English, Spanish"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />

                  <Text style={styles.inputLabel}>Current Mood</Text>
                  <View style={styles.chips}>
                    {MOOD_OPTIONS.map((option) => (
                      <MoodChip
                        key={option.id}
                        mood={option}
                        selected={editMood === option.id}
                        onPress={(id) => setEditMood(id as string)}
                      />
                    ))}
                  </View>

                  <Text style={styles.inputLabel}>Choose Avatar</Text>
                  <View style={styles.avatarGrid}>
                    {AVATAR_OPTIONS.map((item) => (
                      <Pressable
                        key={item}
                        onPress={() => setEditAvatarId(item)}
                        style={[styles.avatarItem, editAvatarId === item && styles.avatarSelected]}
                      >
                        <Avatar avatarId={item} alias={editAlias || 'You'} size={72} />
                        {editAvatarId === item && (
                          <View style={styles.avatarCheck}>
                            <Ionicons name="checkmark" size={14} color="white" />
                          </View>
                        )}
                      </Pressable>
                    ))}
                  </View>

                  <Pressable
                    style={[styles.saveBtn, isSaving && { opacity: 0.5 }]}
                    onPress={saveProfile}
                    disabled={isSaving}
                  >
                    <LinearGradient
                      colors={colors.primaryGradient}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <Text style={styles.saveBtnText}>
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Text>
                  </Pressable>
                  <View style={{ height: 40 }} />
                </ScrollView>
              </Animated.View>
            </BlurView>
          </KeyboardAvoidingView>
        </Animated.View>
      )}
    </View>
  );
}

// ═════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.xs,
    paddingBottom: 120,
    gap: spacing.md,
  },

  // ── Top Bar ────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Profile Header ───────────────────────────────────────
  profileHeader: {
    alignItems: 'center',
  },
  avatarRing: {
    padding: 3,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: spacing.sm,
  },
  aliasText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 2,
  },
  usernameText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  topRightEditBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },

  // ── Section Labels ───────────────────────────────────────
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 1.5,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },

  // ── Menu Card ────────────────────────────────────────────
  menuCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  menuLabelDanger: {
    color: colors.primary,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuValue: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'capitalize',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginLeft: 60,
  },

  // ── Logout ───────────────────────────────────────────────
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,45,85,0.08)',
    borderRadius: 22,
    paddingVertical: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,45,85,0.15)',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },

  // ── Edit Profile Modal ───────────────────────────────────
  overlayWrapper: { ...StyleSheet.absoluteFillObject, zIndex: 100 },
  overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  overlayDismiss: { ...StyleSheet.absoluteFillObject },
  editSheet: {
    backgroundColor: '#111115',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    paddingBottom: 40,
    width: '100%',
    maxHeight: '90%',
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
  editForm: {
    width: '100%',
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  avatarItem: {
    padding: 4,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatarSelected: {
    borderColor: colors.primary,
  },
  avatarCheck: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  saveBtn: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    overflow: 'hidden',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },

  // ── Footer ───────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    gap: spacing.xs,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.3)',
  },
  footerVersion: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.15)',
  },
});
