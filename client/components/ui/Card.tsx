import { memo, ReactNode } from 'react';
import { Pressable, PressableProps, StyleSheet, View, ViewProps } from 'react-native';

import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface CardProps extends ViewProps {
  children: ReactNode;
  onPress?: PressableProps['onPress'];
}

export const Card = memo(function Card({ children, onPress, style, ...props }: CardProps) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.9,
  },
});
