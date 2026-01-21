// Re-export API types
export type {
  User,
  OnboardingData,
  UserStats,
  WorkoutPlan,
  Workout,
  WorkoutExercise,
  WorkoutLogData,
  WorkoutLog,
  Exercise,
  ExerciseSearchParams,
  Food,
  MealLogData,
  MealLog,
  DailyNutritionLog,
  WeeklyNutritionSummary,
  ProgressLog,
  MeasurementsData,
  WeightLog,
  StrengthPR,
  WeeklySummary,
  MuscleBalance,
  VolumeLoadData,
  Trainer,
  TrainerSearchParams,
  TrainerApplicationData,
  TrainerProfile,
  Client,
  EarningsData,
  Transaction,
  PaginatedResponse,
} from '@/lib/api';

// Additional Types

export type Theme = 'light' | 'dark' | 'system';

export type Locale = 'en' | 'ar';

export type UserRole = 'user' | 'trainer' | 'admin';

export type SubscriptionPlan = 'free' | 'pro' | 'elite';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'kettlebell'
  | 'resistance_band'
  | 'smith_machine'
  | 'ez_bar'
  | 'medicine_ball';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type FitnessGoal =
  | 'lose-weight'
  | 'build-muscle'
  | 'get-stronger'
  | 'improve-health'
  | 'increase-endurance';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type SessionType = 'video' | 'check-in' | 'form-review' | 'consultation';

export type SessionStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface NavigationItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

export interface WorkoutSession {
  id: string;
  workoutId: string;
  workout: Workout;
  startTime: Date;
  endTime?: Date;
  exercises: ExerciseSession[];
  notes?: string;
  mood?: number;
}

export interface ExerciseSession {
  exerciseId: string;
  exercise: Exercise;
  sets: SetSession[];
  notes?: string;
}

export interface SetSession {
  setNumber: number;
  targetReps: number;
  actualReps?: number;
  targetWeight: number;
  actualWeight?: number;
  rpe?: number;
  completed: boolean;
}

export interface MealEntry {
  id: string;
  mealType: MealType;
  time: string;
  foods: FoodEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface FoodEntry {
  food: Food;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface WeeklyGoals {
  workouts: { target: number; completed: number };
  calories: { target: number; daysOnTarget: number };
  protein: { target: number; avgIntake: number };
  steps: { target: number; daysOnTarget: number };
}

export interface TrainerSession {
  id: string;
  clientId: string;
  client: Client;
  type: SessionType;
  status: SessionStatus;
  scheduledAt: string;
  duration: number;
  notes?: string;
}

export interface TrainerStats {
  totalClients: number;
  activeClients: number;
  totalSessions: number;
  completionRate: number;
  avgRating: number;
  totalEarnings: number;
  pendingPayout: number;
}

// Utility Types

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type ValueOf<T> = T[keyof T];

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];
