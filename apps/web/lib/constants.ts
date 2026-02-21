// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// App Configuration
export const APP_NAME = 'Forma';
export const APP_DESCRIPTION = "Egypt's complete fitness platform";
export const APP_TAGLINE = 'Shape Your Future';

// Brand Colors
export const COLORS = {
  primary: '#00D4AA',
  primaryLight: '#33DDBB',
  primaryDark: '#00B894',
  navy: '#0A1628',
  navyLight: '#1A2744',
  navyLighter: '#243352',
} as const;

// Muscle Groups
export const MUSCLE_GROUPS = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'core',
  'quadriceps',
  'hamstrings',
  'glutes',
  'calves',
] as const;

export const MUSCLE_COLORS = {
  chest: '#EF4444',
  back: '#3B82F6',
  shoulders: '#F97316',
  biceps: '#A855F7',
  triceps: '#EC4899',
  forearms: '#8B5CF6',
  core: '#EAB308',
  quadriceps: '#22C55E',
  hamstrings: '#14B8A6',
  glutes: '#F43F5E',
  calves: '#06B6D4',
} as const;

// Equipment Types
export const EQUIPMENT_TYPES = [
  'barbell',
  'dumbbell',
  'machine',
  'cable',
  'bodyweight',
  'kettlebell',
  'resistance_band',
  'smith_machine',
  'ez_bar',
  'medicine_ball',
] as const;

// Difficulty Levels
export const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

// Fitness Goals
export const FITNESS_GOALS = [
  { value: 'lose-weight', label: 'Lose Weight', labelAr: 'خسارة الوزن' },
  { value: 'build-muscle', label: 'Build Muscle', labelAr: 'بناء العضلات' },
  { value: 'get-stronger', label: 'Get Stronger', labelAr: 'زيادة القوة' },
  { value: 'improve-health', label: 'Improve Health', labelAr: 'تحسين الصحة' },
  { value: 'increase-endurance', label: 'Increase Endurance', labelAr: 'زيادة التحمل' },
] as const;

// Experience Levels
export const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'New to fitness' },
  { value: 'intermediate', label: 'Intermediate', description: '1-2 years experience' },
  { value: 'advanced', label: 'Advanced', description: '3+ years experience' },
] as const;

// Activity Levels (for TDEE calculation)
export const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'Sedentary', description: 'Little to no exercise' },
  { value: 1.375, label: 'Light', description: '1-3 days/week' },
  { value: 1.55, label: 'Moderate', description: '3-5 days/week' },
  { value: 1.725, label: 'Active', description: '6-7 days/week' },
  { value: 1.9, label: 'Very Active', description: 'Athlete level' },
] as const;

// Meal Types
export const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast', labelAr: 'الفطور' },
  { value: 'lunch', label: 'Lunch', labelAr: 'الغداء' },
  { value: 'dinner', label: 'Dinner', labelAr: 'العشاء' },
  { value: 'snack', label: 'Snack', labelAr: 'وجبة خفيفة' },
] as const;

// Trainer Specializations
export const TRAINER_SPECIALIZATIONS = [
  'Weight Loss',
  'Muscle Building',
  'Strength Training',
  'CrossFit',
  'Yoga & Pilates',
  'Bodybuilding',
  'Functional Fitness',
  'Sports Performance',
  'Rehabilitation',
  'Senior Fitness',
] as const;

// Date Formats
export const DATE_FORMATS = {
  display: 'MMM d, yyyy',
  input: 'yyyy-MM-dd',
  time: 'h:mm a',
  dateTime: 'MMM d, yyyy h:mm a',
} as const;

// Validation Limits
export const LIMITS = {
  minWeight: 30, // kg (body weight)
  maxWeight: 300, // kg (body weight)
  minHeight: 100, // cm
  maxHeight: 250, // cm
  minAge: 13,
  maxAge: 100,
  maxSets: 10,
  maxReps: 100,
  maxExerciseWeight: 500, // kg for exercises
  maxDuration: 300, // minutes
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  auth: 'forma-auth',
  theme: 'forma-theme',
  locale: 'forma-locale',
  onboarding: 'forma-onboarding',
} as const;

// Query Keys
export const QUERY_KEYS = {
  user: 'user',
  workouts: 'workouts',
  exercises: 'exercises',
  nutrition: 'nutrition',
  progress: 'progress',
  stats: 'stats',
  trainers: 'trainers',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  generic: 'Something went wrong. Please try again.',
  network: 'Network error. Please check your connection.',
  unauthorized: 'Please log in to continue.',
  notFound: 'Resource not found.',
  validation: 'Please check your input and try again.',
} as const;
