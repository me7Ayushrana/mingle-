import * as Haptics from 'expo-haptics';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { MoodOption } from '@/constants/moods';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface MoodChipProps {
  mood: MoodOption;
  selected?: boolean;
  onPress?: (id: MoodOption['id']) => void;
  compact?: boolean;
}

export const MoodChip = memo(function MoodChip({ mood, selected, onPress }: MoodChipProps) {
  const handlePress = useCallback(() => {
    Haptics.selectionAsync();
    onPress?.(mood.id);
  }, [mood.id, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.chip, selected ? styles.chipSelected : styles.chipDefault]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <View style={[styles.dot, selected && styles.dotSelected]} />
      <Text style={[styles.label, selected && styles.labelSelected]}>{mood.label}</Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipDefault: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotSelected: {
    backgroundColor: colors.white,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  labelSelected: {
    color: colors.white,
    fontWeight: '700',
  },
});
