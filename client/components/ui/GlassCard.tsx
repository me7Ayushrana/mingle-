import { BlurView } from 'expo-blur';
import { memo, ReactNode } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface GlassCardProps extends ViewProps {
  children: ReactNode;
  intensity?: number;
}

export const GlassCard = memo(function GlassCard({
  children,
  intensity = 40,
  style,
  ...props
}: GlassCardProps) {
  return (
    <View style={[styles.wrapper, style]} {...props}>
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.overlay} />
      <View style={styles.content}>{children}</View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceGlass,
  },
  content: {
    padding: spacing.lg,
  },
});
