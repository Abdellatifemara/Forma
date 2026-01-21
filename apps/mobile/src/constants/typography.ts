/**
 * Forma Typography
 * Primary Font: Cairo (supports Arabic and Latin)
 */

import { TextStyle } from 'react-native';

// Font family names (must match loaded fonts)
export const FontFamily = {
  regular: 'Cairo-Regular',
  medium: 'Cairo-Medium',
  semiBold: 'Cairo-SemiBold',
  bold: 'Cairo-Bold',
} as const;

// Font sizes following mobile design guidelines
export const FontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

// Line heights
export const LineHeight = {
  xs: 16,
  sm: 20,
  base: 24,
  lg: 28,
  xl: 28,
  '2xl': 32,
  '3xl': 36,
  '4xl': 40,
  '5xl': 52,
} as const;

// Letter spacing
export const LetterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
} as const;

// Pre-defined text styles
export const Typography: Record<string, TextStyle> = {
  // Headings
  h1: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['3xl'],
    lineHeight: LineHeight['3xl'],
    letterSpacing: LetterSpacing.tight,
  },
  h2: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    lineHeight: LineHeight['2xl'],
    letterSpacing: LetterSpacing.tight,
  },
  h3: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xl,
    lineHeight: LineHeight.xl,
  },
  h4: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.lg,
    lineHeight: LineHeight.lg,
  },

  // Body
  bodyLarge: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.lg,
    lineHeight: LineHeight.lg,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: LineHeight.base,
  },
  bodySmall: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
  },

  // Labels
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    letterSpacing: LetterSpacing.wide,
  },
  labelSmall: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    letterSpacing: LetterSpacing.wide,
  },

  // Special
  button: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
    lineHeight: LineHeight.base,
    letterSpacing: LetterSpacing.wide,
  },
  buttonSmall: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
  },
  caption: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
  },

  // Numbers (for stats, timers)
  statLarge: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['5xl'],
    lineHeight: LineHeight['5xl'],
    letterSpacing: LetterSpacing.tight,
  },
  statMedium: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['4xl'],
    lineHeight: LineHeight['4xl'],
  },
  stat: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize['2xl'],
    lineHeight: LineHeight['2xl'],
  },
} as const;
