import { View, StyleSheet } from 'react-native';
import { SkeletonBox } from './SkeletonBox';
import { spacing } from '@/theme/spacing';

/**
 * Skeleton for the Groups list screen.
 * Mimics group card rows: icon circle + name + member count.
 */
export const GroupsSkeleton = () => {
  const Card = ({ index }: { index: number }) => (
    <View style={styles.card} key={index}>
      <SkeletonBox width={52} height={52} borderRadius={26} />
      <View style={styles.info}>
        <SkeletonBox width={140} height={16} borderRadius={4} />
        <SkeletonBox width={90} height={12} borderRadius={4} style={{ marginTop: 6 }} />
      </View>
      <SkeletonBox width={24} height={24} borderRadius={12} />
    </View>
  );

  return (
    <View style={styles.container}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Card key={i} index={i} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  info: { flex: 1, marginLeft: spacing.md },
});
