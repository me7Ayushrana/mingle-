import { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Text, Heading } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { groupsService } from '@/services/groups.service';
import type { Group } from '@/types/groups';

export default function GroupInviteScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();

  const [group, setGroup] = useState<(Group & { isMember: boolean }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const data = await groupsService.getInvitePreview(code);
        setGroup(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Invalid or expired invite link');
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchPreview();
    }
  }, [code]);
  const handleJoin = async () => {
    if (group?.isMember) {
      router.replace(`/(app)/groups/${group._id}`);
      return;
    }

    setJoining(true);
    try {
      await groupsService.joinGroup(code);
      router.replace(`/(app)/groups/${group?._id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to join group');
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <LinearGradient colors={['#18181B', '#000000']} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="close" size={28} color="white" />
          </Pressable>
        </View>

        <View style={styles.content}>
          {error ? (
            <Animated.View entering={FadeIn.duration(400)} style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={64} color={colors.primary} />
              <Heading level={2} style={styles.errorTitle}>
                Oops!
              </Heading>
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : group ? (
            <Animated.View entering={FadeInDown.duration(500)} style={styles.previewContainer}>
              <View style={styles.groupIcon}>
                <Ionicons name="people" size={48} color={colors.primary} />
              </View>

              <Heading level={2} style={styles.groupName}>
                {group.name}
              </Heading>
              {group.description ? <Text style={styles.groupDesc}>{group.description}</Text> : null}

              <View style={styles.adminBadge}>
                <Text style={styles.adminText}>Created by {group.adminId?.alias || 'Someone'}</Text>
              </View>

              <Pressable
                style={[styles.joinBtn, joining && { opacity: 0.5 }]}
                onPress={handleJoin}
                disabled={joining}
              >
                <LinearGradient
                  colors={colors.primaryGradient}
                  style={StyleSheet.absoluteFillObject}
                />
                <Text style={styles.joinBtnText}>
                  {joining ? 'Joining...' : group.isMember ? 'Open Group' : 'Join Group'}
                </Text>
              </Pressable>
            </Animated.View>
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#000' },
  safeArea: { flex: 1 },
  center: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  header: { padding: spacing.md, alignItems: 'flex-end' },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 22,
  },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },

  errorContainer: { alignItems: 'center' },
  errorTitle: { fontSize: 24, fontWeight: '800', color: colors.white, marginTop: spacing.md },
  errorText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  previewContainer: { alignItems: 'center', width: '100%' },
  groupIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  groupName: { fontSize: 28, fontWeight: '800', color: colors.white, textAlign: 'center' },
  groupDesc: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  adminBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: spacing.lg,
  },
  adminText: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: '600' },

  joinBtn: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    overflow: 'hidden',
  },
  joinBtnText: { fontSize: 18, fontWeight: '700', color: 'white' },
});
