/**
 * Forma Color Palette
 * Based on BRAND_IDENTITY.md
 */

export const Colors = {
  // Primary
  primary: '#00D4AA', // Forma Teal
  primaryLight: '#33DDBB',
  primaryDark: '#00B894',

  // Background
  background: {
    dark: '#0A1628', // Deep Navy
    darkSecondary: '#1A2744',
    darkTertiary: '#243352',
    light: '#FFFFFF',
    lightSecondary: '#F5F5F7',
    lightTertiary: '#E5E7EB',
  },

  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#A0AEC0',
    tertiary: '#718096',
    inverse: '#0A1628',
    inverseSecondary: '#4A5568',
  },

  // Semantic
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Data Visualization - Macros
  macro: {
    protein: '#3B82F6', // Blue
    carbs: '#F97316', // Orange
    fat: '#EAB308', // Yellow
    fiber: '#22C55E', // Green
  },

  // Muscle Groups
  muscle: {
    chest: '#EF4444', // Red
    back: '#3B82F6', // Blue
    shoulders: '#F97316', // Orange
    arms: '#A855F7', // Purple
    legs: '#22C55E', // Green
    core: '#EAB308', // Yellow
  },

  // UI Elements
  border: {
    dark: '#374151',
    light: '#E5E7EB',
  },

  skeleton: {
    dark: '#1A2744',
    light: '#E5E7EB',
  },

  // Overlays
  overlay: {
    black50: 'rgba(0, 0, 0, 0.5)',
    black70: 'rgba(0, 0, 0, 0.7)',
    white10: 'rgba(255, 255, 255, 0.1)',
    white20: 'rgba(255, 255, 255, 0.2)',
  },

  // Gradients (as arrays for LinearGradient)
  gradient: {
    primary: ['#00D4AA', '#00B894'],
    dark: ['#0A1628', '#1A2744'],
    card: ['#1A2744', '#243352'],
  },
} as const;

// Theme type
export type ThemeMode = 'dark' | 'light';

// Get colors based on theme
export const getThemeColors = (theme: ThemeMode) => ({
  background: theme === 'dark' ? Colors.background.dark : Colors.background.light,
  backgroundSecondary: theme === 'dark' ? Colors.background.darkSecondary : Colors.background.lightSecondary,
  backgroundTertiary: theme === 'dark' ? Colors.background.darkTertiary : Colors.background.lightTertiary,
  text: theme === 'dark' ? Colors.text.primary : Colors.text.inverse,
  textSecondary: theme === 'dark' ? Colors.text.secondary : Colors.text.inverseSecondary,
  border: theme === 'dark' ? Colors.border.dark : Colors.border.light,
  skeleton: theme === 'dark' ? Colors.skeleton.dark : Colors.skeleton.light,
});
