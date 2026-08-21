import { View, StyleSheet } from 'react-native';
import { SkeletonBox } from './SkeletonBox';
import { spacing } from '@/theme/spacing';

/**
 * Skeleton for the Home (Moments feed) screen.
 * Mimics the moment card layout: avatar + name row, content lines, action row.
 */
export const HomeSkeleton = () => {
  const Card = () => (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <SkeletonBox width={40} height={40} borderRadius={20} />
        <View style={styles.headerText}>
          <SkeletonBox width={120} height={14} borderRadius={4} />
          <SkeletonBox width={80} height={12} borderRadius={4} style={{ marginTop: 6 }} />
        </View>
      </View>
      <SkeletonBox width="100%" height={14} borderRadius={4} style={{ marginTop: 16 }} />
      <SkeletonBox width="85%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
      <SkeletonBox width="60%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
      <View style={styles.actionsRow}>
        <SkeletonBox width={50} height={20} borderRadius={10} />
        <SkeletonBox width={50} height={20} borderRadius={10} />
        <SkeletonBox width={50} height={20} borderRadius={10} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Card />
      <View style={styles.separator} />
      <Card />
      <View style={styles.separator} />
      <Card />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingTop: spacing.md },
  card: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerText: { marginLeft: spacing.md, flex: 1 },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
    marginTop: spacing.lg,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});
