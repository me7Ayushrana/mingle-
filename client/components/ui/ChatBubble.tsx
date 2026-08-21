import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { formatMessageTime } from '@/utils/date';

interface ChatBubbleProps {
  content: string;
  isMine: boolean;
  timestamp: string;
  status?: string;
}

export const ChatBubble = memo(function ChatBubble({
  content,
  isMine,
  timestamp,
}: ChatBubbleProps) {
  return (
    <View style={[styles.row, isMine && styles.rowMine]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text variant="body" style={isMine ? styles.textMine : undefined}>
          {content}
        </Text>
        <Text variant="caption" style={styles.time}>
          {formatMessageTime(timestamp)}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  bubbleMine: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: spacing.xs,
  },
  bubbleTheirs: {
    backgroundColor: colors.surfaceElevated,
    borderBottomLeftRadius: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textMine: {
    color: colors.white,
  },
  time: {
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
    opacity: 0.7,
  },
});
