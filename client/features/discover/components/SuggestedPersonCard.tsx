import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Text } from '@/components/ui/Text';
import { MOOD_OPTIONS } from '@/constants/moods';
import type { PublicUser } from '@/types/user';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface SuggestedPersonCardProps {
  user: PublicUser;
  index: number;
  onConnect: (id: string, index: number) => void;
}

export const SuggestedPersonCard = memo(function SuggestedPersonCard({
  user,
  index,
  onConnect,
}: SuggestedPersonCardProps) {
  const mood = MOOD_OPTIONS.find((m) => m.id === user.mood);

  return (
    <GlassCard style={styles.card}>
      <View style={styles.row}>
        <Avatar
          avatarId={user.avatarId}
          alias={user.alias}
          mood={user.mood}
          size={52}
          showOnline={user.isOnline}
        />
        <View style={styles.info}>
          <Text variant="label">{user.alias}</Text>
          <Text variant="caption">
            {mood?.emoji} {mood?.label} · {user.matchScore}% match
          </Text>
          <Text variant="caption" style={styles.reputation}>
            Rep {user.reputation}
          </Text>
        </View>
      </View>
      <Button title="Say hey" size="sm" variant="secondary" onPress={() => onConnect(user.id, index)} />
    </GlassCard>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 280,
    marginRight: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  reputation: {
    color: colors.primaryLight,
  },
});
