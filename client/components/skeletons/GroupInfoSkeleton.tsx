import { View, StyleSheet } from 'react-native';
import { SkeletonBox } from './SkeletonBox';
import { spacing } from '@/theme/spacing';

/**
 * Skeleton for the Group Info screen.
 * Mimics hero section + admin card + member list.
 */
export const GroupInfoSkeleton = () => (
  <View style={styles.container}>
    {/* Hero */}
    <View style={styles.hero}>
      <SkeletonBox width={110} height={110} borderRadius={55} />
      <SkeletonBox width={180} height={22} borderRadius={6} style={{ marginTop: 16 }} />
      <SkeletonBox width={100} height={14} borderRadius={4} style={{ marginTop: 8 }} />
    </View>

    {/* Action buttons */}
    <View style={styles.actionsRow}>
      <SkeletonBox width={48} height={48} borderRadius={24} />
      <SkeletonBox width={48} height={48} borderRadius={24} />
      <SkeletonBox width={48} height={48} borderRadius={24} />
    </View>

    {/* Section label */}
    <SkeletonBox
      width={80}
      height={12}
      borderRadius={4}
      style={{ marginLeft: spacing.lg, marginTop: spacing.xl }}
    />

    {/* Admin card */}
    <View style={styles.adminCard}>
      <SkeletonBox width={48} height={48} borderRadius={24} />
      <View style={styles.adminInfo}>
        <SkeletonBox width={120} height={14} borderRadius={4} />
        <SkeletonBox width={80} height={12} borderRadius={4} style={{ marginTop: 6 }} />
      </View>
    </View>

    {/* Section label */}
    <SkeletonBox
      width={70}
      height={12}
      borderRadius={4}
      style={{ marginLeft: spacing.lg, marginTop: spacing.xl }}
    />

    {/* Member rows */}
    {[0, 1, 2, 3].map((i) => (
      <View style={styles.memberRow} key={i}>
        <SkeletonBox width={44} height={44} borderRadius={22} />
        <View style={styles.memberInfo}>
          <SkeletonBox width={110} height={14} borderRadius={4} />
          <SkeletonBox width={70} height={12} borderRadius={4} style={{ marginTop: 6 }} />
        </View>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  hero: { alignItems: 'center', paddingVertical: 32 },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing['2xl'],
    marginBottom: spacing.xl,
  },
  adminCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: spacing.md,
    borderRadius: 16,
    marginTop: spacing.sm,
  },
  adminInfo: { flex: 1, marginLeft: spacing.md },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  memberInfo: { flex: 1, marginLeft: spacing.md },
});
