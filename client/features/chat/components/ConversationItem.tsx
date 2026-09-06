import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Text } from '@/components/ui/Text';
import type { Conversation } from '@/types/chat';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { formatRelativeTime } from '@/utils/date';

interface ConversationItemProps {
  conversation: Conversation;
  onPress: (id: string) => void;
}

export const ConversationItem = memo(function ConversationItem({
  conversation,
  onPress,
}: ConversationItemProps) {
  return (
    <View style={styles.container} onTouchEnd={() => onPress(conversation.id)}>
      <Avatar
        avatarId={conversation.participantAvatarId}
        alias={conversation.participantAlias}
        size={52}
        showOnline={conversation.isOnline}
      />
      <View style={styles.content}>
        <View style={styles.row}>
          <Text variant="label">{conversation.participantAlias}</Text>
          {conversation.lastMessageAt ? (
            <Text variant="caption">{formatRelativeTime(conversation.lastMessageAt)}</Text>
          ) : null}
        </View>
        <Text variant="bodySmall" muted numberOfLines={1}>
          {conversation.lastMessage ?? 'Start a conversation'}
        </Text>
      </View>
      {conversation.unreadCount > 0 ? (
        <View style={styles.badge}>
          <Text variant="caption" style={styles.badgeText}>
            {conversation.unreadCount}
          </Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: colors.primary,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 11,
  },
});
