// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  subscription: SubscriptionPlan;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile;
}

export type UserRole = 'user' | 'trainer' | 'admin';

export type SubscriptionPlan = 'free' | 'pro' | 'elite';

export interface UserProfile {
  id: string;
  userId: string;
  age?: number;
  gender?: Gender;
  height?: number;
  weight?: number;
  targetWeight?: number;
  activityLevel?: ActivityLevel;
  fitnessGoal?: FitnessGoal;
  experienceLevel?: ExperienceLevel;
  dietaryPreferences?: string[];
  healthConditions?: string[];
  onboardingCompleted: boolean;
}

export type Gender = 'male' | 'female' | 'other';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type FitnessGoal = 'lose_weight' | 'build_muscle' | 'maintain' | 'improve_fitness' | 'gain_strength';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

// ============================================
// Authentication Types
// ============================================

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ============================================
// Exercise Types
// ============================================

export interface Exercise {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  equipment: EquipmentType;
  difficulty: DifficultyLevel;
  instructions?: string[];
  tips?: string[];
  videoUrl?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

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
  | 'calves'
  | 'full_body';

export type EquipmentType =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'kettlebell'
  | 'resistance_band'
  | 'other'
  | 'none';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// ============================================
// Workout Types
// ============================================

export interface WorkoutPlan {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  difficulty: DifficultyLevel;
  durationWeeks: number;
  daysPerWeek: number;
  goal: FitnessGoal;
  imageUrl?: string;
  workouts: Workout[];
  createdBy?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Workout {
  id: string;
  planId?: string;
  name: string;
  nameAr?: string;
  description?: string;
  dayOfWeek?: number;
  weekNumber?: number;
  exercises: WorkoutExercise[];
  estimatedDuration: number;
  targetMuscles: MuscleGroup[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutExercise {
  id: string;
  workoutId: string;
  exerciseId: string;
  exercise?: Exercise;
  order: number;
  sets: number;
  reps?: string;
  weight?: number;
  duration?: number;
  restSeconds: number;
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  workoutId?: string;
  workout?: Workout;
  completedAt: string;
  duration: number;
  caloriesBurned?: number;
  notes?: string;
  exercises: ExerciseLog[];
}

export interface ExerciseLog {
  id: string;
  workoutLogId: string;
  exerciseId: string;
  exercise?: Exercise;
  sets: SetLog[];
}

export interface SetLog {
  id: string;
  exerciseLogId: string;
  setNumber: number;
  reps?: number;
  weight?: number;
  duration?: number;
  completed: boolean;
  notes?: string;
}

// ============================================
// Nutrition Types
// ============================================

export interface Food {
  id: string;
  name: string;
  nameAr?: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  barcode?: string;
  imageUrl?: string;
  isVerified: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MealLog {
  id: string;
  userId: string;
  date: string;
  mealType: MealType;
  foods: MealFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  notes?: string;
  createdAt: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealFood {
  id: string;
  mealLogId: string;
  foodId: string;
  food?: Food;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DailyNutrition {
  date: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  consumedCalories: number;
  consumedProtein: number;
  consumedCarbs: number;
  consumedFat: number;
  meals: MealLog[];
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  water?: number;
}

// ============================================
// Progress Types
// ============================================

export interface WeightLog {
  id: string;
  userId: string;
  weight: number;
  unit: 'kg' | 'lbs';
  date: string;
  notes?: string;
  createdAt: string;
}

export interface BodyMeasurement {
  id: string;
  userId: string;
  date: string;
  chest?: number;
  waist?: number;
  hips?: number;
  thighs?: number;
  arms?: number;
  neck?: number;
  bodyFatPercentage?: number;
  notes?: string;
  createdAt: string;
}

export interface ProgressPhoto {
  id: string;
  userId: string;
  imageUrl: string;
  type: PhotoType;
  date: string;
  notes?: string;
  createdAt: string;
}

export type PhotoType = 'front' | 'back' | 'side';

export interface PersonalRecord {
  id: string;
  userId: string;
  exerciseId: string;
  exercise?: Exercise;
  weight: number;
  reps: number;
  date: string;
  notes?: string;
  createdAt: string;
}

// ============================================
// Trainer Types
// ============================================

export interface Trainer {
  id: string;
  userId: string;
  user?: User;
  bio?: string;
  bioAr?: string;
  specializations: string[];
  certifications: Certification[];
  experience: number;
  rating: number;
  reviewCount: number;
  hourlyRate?: number;
  isAvailable: boolean;
  isVerified: boolean;
  clients?: TrainerClient[];
  programs?: TrainerProgram[];
  createdAt: string;
  updatedAt: string;
}

export interface Certification {
  id: string;
  trainerId: string;
  name: string;
  issuer: string;
  dateObtained: string;
  expiryDate?: string;
  verificationUrl?: string;
}

export interface TrainerClient {
  id: string;
  trainerId: string;
  clientId: string;
  client?: User;
  status: ClientStatus;
  startDate: string;
  endDate?: string;
  program?: TrainerProgram;
  notes?: string;
}

export type ClientStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export interface TrainerProgram {
  id: string;
  trainerId: string;
  trainer?: Trainer;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  durationWeeks: number;
  price: number;
  currency: string;
  features: string[];
  workoutPlan?: WorkoutPlan;
  mealPlan?: MealPlan;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MealPlan {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  days: MealPlanDay[];
}

export interface MealPlanDay {
  dayNumber: number;
  meals: PlannedMeal[];
}

export interface PlannedMeal {
  mealType: MealType;
  foods: { food: Food; servings: number }[];
  notes?: string;
}

export interface TrainerReview {
  id: string;
  trainerId: string;
  clientId: string;
  client?: User;
  rating: number;
  comment?: string;
  createdAt: string;
}

// ============================================
// Chat & Messaging Types
// ============================================

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: User;
  content: string;
  type: MessageType;
  attachments?: Attachment[];
  readAt?: string;
  createdAt: string;
}

export type MessageType = 'text' | 'image' | 'file' | 'workout' | 'meal';

export interface Attachment {
  id: string;
  messageId: string;
  type: AttachmentType;
  url: string;
  name: string;
  size: number;
}

export type AttachmentType = 'image' | 'video' | 'document';

// ============================================
// AI Chat Types
// ============================================

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIConversation {
  id: string;
  userId: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Notification Types
// ============================================

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export type NotificationType =
  | 'workout_reminder'
  | 'meal_reminder'
  | 'achievement'
  | 'trainer_message'
  | 'subscription'
  | 'system';

// ============================================
// Subscription & Payment Types
// ============================================

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing' | 'expired';

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  description?: string;
  createdAt: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type PaymentMethod = 'card' | 'mobile_wallet' | 'bank_transfer';

// ============================================
// Stats & Analytics Types
// ============================================

export interface UserStats {
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  totalCaloriesBurned: number;
  totalWeightLifted: number;
  averageWorkoutDuration: number;
  personalRecords: number;
}

export interface NutritionStats {
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  daysLogged: number;
  streakDays: number;
}

export interface ProgressStats {
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  weightChange: number;
  measurementsCount: number;
  photosCount: number;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// ============================================
// Form Types
// ============================================

export interface OnboardingData {
  step1: {
    fitnessGoal: FitnessGoal;
  };
  step2: {
    experienceLevel: ExperienceLevel;
    workoutDaysPerWeek: number;
  };
  step3: {
    gender: Gender;
    age: number;
    height: number;
    weight: number;
    targetWeight?: number;
  };
  step4: {
    activityLevel: ActivityLevel;
    dietaryPreferences: string[];
    healthConditions: string[];
  };
}

export interface WorkoutLogInput {
  workoutId?: string;
  exercises: {
    exerciseId: string;
    sets: {
      reps?: number;
      weight?: number;
      duration?: number;
      completed: boolean;
    }[];
  }[];
  duration: number;
  notes?: string;
}

export interface MealLogInput {
  mealType: MealType;
  foods: {
    foodId: string;
    servings: number;
  }[];
  notes?: string;
}
