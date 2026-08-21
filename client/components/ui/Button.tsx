import * as Haptics from 'expo-haptics';
import { memo, useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  View,
} from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

const sizeStyles: Record<ButtonSize, { height: number; paddingHorizontal: number; fontSize: number }> = {
  sm: { height: 40, paddingHorizontal: spacing.lg, fontSize: 14 },
  md: { height: 48, paddingHorizontal: spacing.xl, fontSize: 16 },
  lg: { height: 56, paddingHorizontal: spacing['2xl'], fontSize: 16 },
};

export const Button = memo(function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  icon,
  onPress,
  style,
  ...props
}: ButtonProps) {
  const handlePress = useCallback(
    (e: Parameters<NonNullable<PressableProps['onPress']>>[0]) => {
      if (!disabled && !loading) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress?.(e);
    },
    [disabled, loading, onPress],
  );

  const isDisabled = disabled || loading;
  const sizeStyle = sizeStyles[size];

  const variantStyle = 
    variant === 'primary' 
      ? styles.primary 
      : variant === 'secondary'
      ? styles.secondary
      : variant === 'danger'
      ? styles.danger
      : styles.ghost;

  const textStyle = 
    variant === 'primary' 
      ? styles.primaryText 
      : variant === 'danger'
      ? styles.dangerText
      : variant === 'ghost'
      ? styles.ghostText
      : styles.secondaryText;

  const loadingColor = variant === 'primary' ? colors.black : colors.white;

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={(state) => [
        styles.base,
        variantStyle,
        { height: sizeStyle.height, paddingHorizontal: sizeStyle.paddingHorizontal },
        state.pressed && styles.pressed,
        isDisabled && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={loadingColor} />
      ) : (
        <View style={styles.row}>
          {icon}
          <Text variant="label" style={[textStyle, { fontSize: sizeStyle.fontSize }]}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  primary: {
    backgroundColor: colors.white,
  },
  primaryText: {
    color: colors.black,
    fontWeight: '700',
  },
  secondary: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: {
    color: colors.white,
    fontWeight: '600',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: colors.foregroundSecondary,
    fontWeight: '600',
  },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  dangerText: {
    color: colors.danger,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
});
