import { View, StyleSheet } from 'react-native';
import { SkeletonBox } from './SkeletonBox';
import { spacing } from '@/theme/spacing';

/**
 * Skeleton for the Group Requests screen.
 * Mimics invite cards: avatar + inviter name + group name + action buttons.
 */
export const RequestsSkeleton = () => {
  const Card = ({ index }: { index: number }) => (
    <View style={styles.card} key={index}>
      <View style={styles.headerRow}>
        <SkeletonBox width={48} height={48} borderRadius={24} />
        <View style={styles.info}>
          <SkeletonBox width={100} height={14} borderRadius={4} />
          <SkeletonBox width={130} height={12} borderRadius={4} style={{ marginTop: 6 }} />
          <SkeletonBox width={150} height={14} borderRadius={4} style={{ marginTop: 6 }} />
        </View>
      </View>
      <View style={styles.actionsRow}>
        <SkeletonBox width={100} height={36} borderRadius={18} />
        <SkeletonBox width={100} height={36} borderRadius={18} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {[0, 1, 2].map((i) => (
        <Card key={i} index={i} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md },
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1, marginLeft: spacing.md },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});
