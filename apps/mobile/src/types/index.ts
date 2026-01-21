/**
 * Forma Type Definitions
 */

// User types
export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE';
  fitnessGoal?: FitnessGoal;
  activityLevel?: ActivityLevel;
  heightCm?: number;
  currentWeightKg?: number;
  targetWeightKg?: number;
  fitnessLevel?: DifficultyLevel;
  language: string;
  measurementUnit: 'metric' | 'imperial';
  notificationsEnabled: boolean;
  onboardingCompletedAt?: string;
}

export type FitnessGoal =
  | 'LOSE_WEIGHT'
  | 'BUILD_MUSCLE'
  | 'MAINTAIN'
  | 'IMPROVE_HEALTH'
  | 'INCREASE_STRENGTH'
  | 'IMPROVE_ENDURANCE';

export type ActivityLevel =
  | 'SEDENTARY'
  | 'LIGHTLY_ACTIVE'
  | 'MODERATELY_ACTIVE'
  | 'VERY_ACTIVE'
  | 'EXTREMELY_ACTIVE';

export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export type MuscleGroup =
  | 'CHEST'
  | 'BACK'
  | 'SHOULDERS'
  | 'BICEPS'
  | 'TRICEPS'
  | 'FOREARMS'
  | 'ABS'
  | 'OBLIQUES'
  | 'LOWER_BACK'
  | 'GLUTES'
  | 'QUADRICEPS'
  | 'HAMSTRINGS'
  | 'CALVES'
  | 'FULL_BODY'
  | 'CARDIO';

export type EquipmentType =
  | 'NONE'
  | 'BODYWEIGHT'
  | 'DUMBBELLS'
  | 'BARBELL'
  | 'KETTLEBELL'
  | 'CABLES'
  | 'MACHINES'
  | 'RESISTANCE_BANDS'
  | 'TRX'
  | 'PULL_UP_BAR'
  | 'BENCH';

// Exercise types
export interface Exercise {
  id: string;
  externalId: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  category: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: EquipmentType[];
  difficulty: DifficultyLevel;
  thumbnailUrl?: string;
  videoUrl?: string;
  instructionsEn: string[];
  instructionsAr: string[];
  tipsEn: string[];
  tipsAr: string[];
  isTimeBased: boolean;
  defaultSets: number;
  defaultReps?: number;
  defaultDuration?: number;
  defaultRest: number;
  tags: string[];
}

// Workout types
export interface WorkoutPlan {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  durationWeeks: number;
  daysPerWeek: number;
  difficulty: DifficultyLevel;
  goal: FitnessGoal;
  isActive: boolean;
  isAIGenerated: boolean;
  startDate?: string;
  workouts: Workout[];
}

export interface Workout {
  id: string;
  weekNumber: number;
  dayOfWeek: number;
  nameEn: string;
  nameAr: string;
  focusMuscles: MuscleGroup[];
  estimatedMinutes: number;
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  order: number;
  sets: number;
  reps?: number;
  duration?: number;
  restSeconds: number;
  notesEn?: string;
  notesAr?: string;
}

export interface WorkoutLog {
  id: string;
  workoutId: string;
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  totalVolume?: number;
  durationMinutes?: number;
  caloriesBurned?: number;
  rating?: number;
  notes?: string;
}

// Nutrition types
export interface Food {
  id: string;
  nameEn: string;
  nameAr: string;
  brandEn?: string;
  brandAr?: string;
  isEgyptian: boolean;
  category: string;
  servingSizeG: number;
  servingUnit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  imageUrl?: string;
  barcode?: string;
}

export interface MealLog {
  id: string;
  loggedAt: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'PRE_WORKOUT' | 'POST_WORKOUT';
  notes?: string;
  photoUrl?: string;
  totalCalories?: number;
  totalProteinG?: number;
  totalCarbsG?: number;
  totalFatG?: number;
  foods: MealFood[];
}

export interface MealFood {
  id: string;
  foodId: string;
  food: Food;
  servings: number;
}

// Stats types
export interface WeeklySummary {
  workouts: {
    completed: number;
    target: number;
    completionRate: number;
  };
  volume: {
    total: number;
    byMuscle: Record<string, number>;
    unit: string;
  };
  nutrition: {
    averageCalories: number;
    averageProtein: number;
    averageCarbs: number;
    averageFat: number;
    daysLogged: number;
  };
  weight: {
    current: number | null;
    change: number | null;
    trend: 'up' | 'down' | null;
  };
  streak: {
    current: number;
    longest: number;
  };
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}
