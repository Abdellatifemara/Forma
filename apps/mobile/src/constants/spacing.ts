/**
 * Forma Spacing & Layout Constants
 * Consistent spacing scale for the entire app
 */

// Base spacing unit (4px)
const BASE = 4;

// Spacing scale (4px base)
export const Spacing = {
  none: 0,
  xs: BASE, // 4
  sm: BASE * 2, // 8
  md: BASE * 3, // 12
  lg: BASE * 4, // 16
  xl: BASE * 5, // 20
  '2xl': BASE * 6, // 24
  '3xl': BASE * 8, // 32
  '4xl': BASE * 10, // 40
  '5xl': BASE * 12, // 48
  '6xl': BASE * 16, // 64
} as const;

// Screen padding
export const ScreenPadding = {
  horizontal: Spacing.lg, // 16
  vertical: Spacing.lg, // 16
  top: Spacing.xl, // 20
  bottom: Spacing['3xl'], // 32 (for bottom nav)
} as const;

// Card styling
export const CardStyle = {
  borderRadius: 16,
  borderRadiusSmall: 12,
  borderRadiusLarge: 24,
  padding: Spacing.lg,
  paddingSmall: Spacing.md,
  gap: Spacing.md,
} as const;

// Button sizing
export const ButtonSize = {
  small: {
    height: 36,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
  },
  medium: {
    height: 48,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
  },
  large: {
    height: 56,
    paddingHorizontal: Spacing.xl,
    borderRadius: 14,
  },
} as const;

// Input sizing
export const InputSize = {
  height: 52,
  borderRadius: 12,
  paddingHorizontal: Spacing.lg,
} as const;

// Icon sizes
export const IconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
} as const;

// Avatar sizes
export const AvatarSize = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  '2xl': 80,
  '3xl': 120,
} as const;

// Touch targets (minimum 44px for accessibility)
export const TouchTarget = {
  minimum: 44,
  comfortable: 48,
} as const;

// Animation durations
export const AnimationDuration = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

// Shadows (for cards, buttons)
export const Shadow = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;
