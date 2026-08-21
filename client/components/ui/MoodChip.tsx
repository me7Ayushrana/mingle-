import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { MoodOption } from '@/constants/moods';
import { moodGradients } from '@/theme/gradients';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface MoodChipProps {
  mood: MoodOption;
  selected?: boolean;
  onPress?: (id: MoodOption['id']) => void;
  compact?: boolean;
}

export const MoodChip = memo(function MoodChip({ mood, selected, onPress, compact }: MoodChipProps) {
  const handlePress = useCallback(() => {
    Haptics.selectionAsync();
    onPress?.(mood.id);
  }, [mood.id, onPress]);

  const content = (
    <>
      <Text style={styles.emoji}>{mood.emoji}</Text>
      {!compact && (
        <Text variant="label" style={[styles.label, selected && styles.labelSelected]}>
          {mood.label}
        </Text>
      )}
    </>
  );

  if (selected) {
    return (
      <Pressable onPress={handlePress} accessibilityRole="button" accessibilityState={{ selected }}>
        <LinearGradient
          colors={[...moodGradients[mood.id]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.chip, styles.chipSelected]}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.chip, styles.chipDefault]}
      accessibilityRole="button"
    >
      {content}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  chipDefault: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    borderWidth: 0,
  },
  emoji: {
    fontSize: 18,
  },
  label: {
    color: colors.foregroundSecondary,
  },
  labelSelected: {
    color: colors.white,
    fontWeight: '600',
  },
});
