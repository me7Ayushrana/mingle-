import { View, StyleSheet } from 'react-native';
import { SkeletonBox } from './SkeletonBox';
import { spacing } from '@/theme/spacing';

/**
 * Skeleton for the Chats list screen.
 * Mimics chat row: avatar + alias + last message preview.
 */
export const ChatsSkeleton = () => {
  const Row = ({ index }: { index: number }) => (
    <View style={styles.row} key={index}>
      <SkeletonBox width={50} height={50} borderRadius={25} />
      <View style={styles.info}>
        <View style={styles.topRow}>
          <SkeletonBox width={120} height={15} borderRadius={4} />
          <SkeletonBox width={40} height={12} borderRadius={4} />
        </View>
        <SkeletonBox width="75%" height={13} borderRadius={4} style={{ marginTop: 8 }} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Row key={i} index={i} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  info: { flex: 1, marginLeft: spacing.md },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
