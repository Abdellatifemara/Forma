/**
 * Forma Design System Constants
 * Export all design tokens from a single entry point
 */

export * from './colors';
export * from './typography';
export * from './spacing';

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 10000,
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: 'Forma',
  TAGLINE_EN: 'Shape Your Future',
  TAGLINE_AR: 'شكّل مستقبلك',
  VERSION: '1.0.0',
  DEFAULT_LANGUAGE: 'en',
  SUPPORTED_LANGUAGES: ['en', 'ar'] as const,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'forma_auth_token',
  REFRESH_TOKEN: 'forma_refresh_token',
  USER_DATA: 'forma_user_data',
  THEME: 'forma_theme',
  LANGUAGE: 'forma_language',
  ONBOARDING_COMPLETED: 'forma_onboarding_completed',
} as const;

// Query Keys for React Query
export const QUERY_KEYS = {
  USER: 'user',
  EXERCISES: 'exercises',
  WORKOUTS: 'workouts',
  WORKOUT_PLAN: 'workout-plan',
  TODAYS_WORKOUT: 'todays-workout',
  FOODS: 'foods',
  MEAL_LOGS: 'meal-logs',
  NUTRITION_SUMMARY: 'nutrition-summary',
  STATS_WEEKLY: 'stats-weekly',
  STATS_WEIGHT: 'stats-weight',
  TRAINERS: 'trainers',
} as const;
