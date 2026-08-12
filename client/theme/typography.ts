import { TextStyle } from 'react-native';

import { colors } from './colors';

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const typography: Record<string, TextStyle> = {
  h1: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    color: colors.foreground,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.foreground,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.foreground,
  },
  body: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.regular,
    color: colors.foreground,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.foregroundSecondary,
    lineHeight: 20,
  },
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.foregroundMuted,
    lineHeight: 16,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.foregroundSecondary,
  },
};
