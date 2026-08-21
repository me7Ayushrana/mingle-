import { memo } from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

type Variant = keyof typeof typography;

interface TextProps extends RNTextProps {
  variant?: Variant;
  muted?: boolean;
}

export const Text = memo(function Text({
  variant = 'body',
  muted,
  style,
  ...props
}: TextProps) {
  return (
    <RNText
      style={[typography[variant], muted && { color: colors.foregroundSecondary }, style]}
      {...props}
    />
  );
});

export const Heading = memo(function Heading({
  level = 2,
  ...props
}: Omit<TextProps, 'variant'> & { level?: 1 | 2 | 3 }) {
  const variant = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';
  return <Text variant={variant} {...props} />;
});
