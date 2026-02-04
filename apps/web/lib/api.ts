const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Cookie utilities for auth
export function setAuthCookie(token: string, maxAge: number = 7 * 24 * 60 * 60) {
  const isProduction = window.location.protocol === 'https:';
  const secure = isProduction ? '; Secure' : '';
  document.cookie = `forma-token=${token}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

export function setRefreshCookie(token: string, maxAge: number = 30 * 24 * 60 * 60) {
  const isProduction = window.location.protocol === 'https:';
  const secure = isProduction ? '; Secure' : '';
  document.cookie = `forma-refresh=${token}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

export function removeAuthCookie() {
  document.cookie = 'forma-token=; path=/; max-age=0';
  document.cookie = 'forma-refresh=; path=/; max-age=0';
}

export function getRefreshCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )forma-refresh=([^;]*)/);
  return match ? match[1] : null;
}

export function getAuthCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )forma-token=([^;]*)/);
  return match ? match[1] : null;
}

interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { params, ...init } = config;

    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string>),
    };

    // Get token from cookie
    const token = getAuthCookie();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...init,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);

// Auth API (public endpoints - no token required)
export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Invalid credentials' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return response.json();
  },

  getMe: () => api.get<{ user: User }>('/auth/me'),
};

// Users API
export const usersApi = {
  getProfile: () => api.get<User>('/users/me'),

  updateProfile: (data: UpdateProfileData) => api.patch<User>('/users/me', data),

  updateOnboarding: (data: OnboardingData) =>
    api.patch<User>('/users/me/onboarding', data),

  getStats: () => api.get<UserStats>('/users/me/stats'),
};

// Workouts API
export const workoutsApi = {
  getPlans: () => api.get<WorkoutPlan[]>('/workouts/plans'),

  getPlan: (id: string) => api.get<WorkoutPlan>(`/workouts/plans/${id}`),

  getActivePlan: () => api.get<WorkoutPlan | null>('/workouts/plans/active'),

  activatePlan: (id: string) => api.post<WorkoutPlan>(`/workouts/plans/${id}/activate`),

  createPlan: (data: CreateWorkoutPlanData) =>
    api.post<WorkoutPlan>('/workouts/plans', data),

  getTodayWorkout: () => api.get<Workout>('/workouts/today'),

  logWorkout: (data: ManualWorkoutLogData) =>
    api.post<WorkoutLog>('/workouts/log', data),

  getHistory: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<WorkoutLog>>('/workouts/history', params as Record<string, string>),

  // What Now? Smart Recommendation
  getWhatNow: (data: WhatNowInput) =>
    api.post<WhatNowRecommendation>('/workouts/what-now', data),
};

// Exercises API
export const exercisesApi = {
  search: (params: ExerciseSearchParams) =>
    api.get<PaginatedResponse<Exercise>>('/exercises', params as Record<string, string>),

  getById: (id: string) => api.get<Exercise>(`/exercises/${id}`),

  getByMuscle: (muscle: string) =>
    api.get<Exercise[]>(`/exercises/muscle/${muscle}`),
};

// Nutrition API
export const nutritionApi = {
  searchFoods: (query: string) =>
    api.get<Food[]>('/nutrition/foods', { query }),

  logMeal: (data: MealLogData) => api.post<MealLog>('/nutrition/meals', data),

  getDailyLog: (date?: string) =>
    api.get<DailyNutritionLog>('/nutrition/daily', date ? { date } : undefined),

  getWeeklySummary: () => api.get<WeeklyNutritionSummary>('/nutrition/weekly'),
};

// Progress API
export const progressApi = {
  logWeight: (data: { weight: number; date?: string }) =>
    api.post<ProgressLog>('/progress/weight', data),

  logMeasurements: (data: MeasurementsData) =>
    api.post<ProgressLog>('/progress/measurements', data),

  getWeightHistory: (params?: { days?: number }) =>
    api.get<WeightLog[]>('/progress/weight', params as Record<string, string>),

  getMeasurementsHistory: (params?: { limit?: number }) =>
    api.get<MeasurementsLog[]>('/progress/measurements', params as Record<string, string>),

  getStrengthPRs: () => api.get<StrengthPR[]>('/progress/prs'),

  getLatest: () => api.get<LatestProgress>('/progress/latest'),
};

// Stats API
export const statsApi = {
  getWeeklySummary: () => api.get<WeeklySummary>('/stats/weekly'),

  getMuscleBalance: (weeks?: number) =>
    api.get<MuscleBalance>('/stats/muscle-balance', weeks ? { weeks: weeks.toString() } : undefined),

  getVolumeLoad: (weeks?: number) =>
    api.get<VolumeLoadData>('/stats/volume', weeks ? { weeks: weeks.toString() } : undefined),
};

// Trainers API
export const trainersApi = {
  getMarketplace: (params?: TrainerSearchParams) =>
    api.get<PaginatedResponse<Trainer>>('/trainers', params as Record<string, string>),

  getById: (id: string) => api.get<Trainer>(`/trainers/${id}`),

  apply: (data: TrainerApplicationData) =>
    api.post<TrainerProfile>('/trainers/apply', data),

  // For trainers
  getClients: () => api.get<Client[]>('/trainers/me/clients'),

  getEarnings: (params?: { month?: string }) =>
    api.get<EarningsData>('/trainers/me/earnings', params as Record<string, string>),
    
  getDashboardStats: () => api.get<TrainerDashboardStats>('/trainers/me/dashboard-stats'),
  
  getUpcomingSessions: () => api.get<TrainerSession[]>('/trainers/me/sessions/upcoming'),
  
  getRecentMessages: () => api.get<TrainerMessage[]>('/trainers/me/messages/recent'),
};

// Achievements API
export const achievementsApi = {
  getAll: () => api.get<Achievement[]>('/achievements'),
  checkProgress: () => api.post<{ newlyUnlocked: string[] }>('/achievements/check'),
};

// Admin API
export const adminApi = {
  getDashboardStats: () => api.get<AdminDashboardStats>('/admin/stats'),
  getRecentActivity: () => api.get<AdminActivity[]>('/admin/activity'),
  getPendingApprovals: () => api.get<AdminApproval[]>('/admin/approvals'),
  getSystemHealth: () => api.get<SystemHealthMetric[]>('/admin/health'),
  getUsers: (params?: { page?: number; limit?: number; query?: string }) =>
    api.get<PaginatedResponse<User>>('/admin/users', params as Record<string, string>),
  updateUser: (userId: string, data: Partial<User>) =>
    api.patch<User>(`/admin/users/${userId}`, data),
};

// Upload API
export const uploadApi = {
  uploadImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthCookie();
    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  },

  uploadVoice: async (blob: Blob): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', blob, 'voice-message.webm');

    const token = getAuthCookie();
    const response = await fetch(`${API_BASE_URL}/upload/voice`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  },
};

// Squads API
export const squadsApi = {
  create: (data: CreateSquadData) => api.post<Squad>('/squads', data),
  getMySquads: () => api.get<SquadWithMeta[]>('/squads'),
  discover: (search?: string) => api.get<Squad[]>('/squads/discover', search ? { search } : undefined),
  getSquad: (id: string) => api.get<SquadDetails>(`/squads/${id}`),
  join: (id: string) => api.post<{ success: boolean }>(`/squads/${id}/join`),
  leave: (id: string) => api.delete<{ success: boolean }>(`/squads/${id}/leave`),
  createChallenge: (squadId: string, data: CreateChallengeData) =>
    api.post<SquadChallenge>(`/squads/${squadId}/challenges`, data),
  getLeaderboard: (squadId: string) => api.get<LeaderboardEntry[]>(`/squads/${squadId}/leaderboard`),
  getChallengeLeaderboard: (challengeId: string) =>
    api.get<ChallengeLeaderboardEntry[]>(`/squads/challenges/${challengeId}/leaderboard`),
  shareWorkout: (squadId: string, workoutLogId: string) =>
    api.post<{ success: boolean }>(`/squads/${squadId}/share-workout`, { workoutLogId }),
};

// Settings API
export const settingsApi = {
  getPreferences: () => api.get<UserPreferences>('/settings/preferences'),

  updatePreferences: (data: Partial<UserPreferences>) =>
    api.put<UserPreferences>('/settings/preferences', data),

  // Ramadan Mode
  getRamadanSettings: () => api.get<RamadanSettings>('/settings/ramadan'),

  enableRamadanMode: (data: RamadanModeData) =>
    api.post<UserPreferences>('/settings/ramadan/enable', data),

  disableRamadanMode: () => api.post<UserPreferences>('/settings/ramadan/disable'),

  // Injuries
  getInjuries: () => api.get<string[]>('/settings/injuries'),

  updateInjuries: (injuries: string[]) =>
    api.put<UserPreferences>('/settings/injuries', { injuries }),

  // Equipment
  updateEquipment: (equipment: string[]) =>
    api.put<UserPreferences>('/settings/equipment', { equipment }),
};

// Chat API
export const chatApi = {
  createConversation: (participantId: string) =>
    api.post<Conversation>('/chat/conversations', { participantId }),

  getConversations: () => api.get<Conversation[]>('/chat/conversations'),

  getMessages: (conversationId: string, params?: { cursor?: string; limit?: number }) =>
    api.get<MessagesResponse>(`/chat/conversations/${conversationId}/messages`, params as Record<string, string>),

  sendMessage: (data: SendMessageData) =>
    api.post<ChatMessage>('/chat/messages', data),

  markAsRead: (conversationId: string) =>
    api.post<{ success: boolean }>(`/chat/conversations/${conversationId}/read`),

  getUnreadCount: () => api.get<{ unreadCount: number }>('/chat/unread-count'),
};

// Types
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'trainer' | 'admin';
  subscription?: 'free' | 'pro' | 'elite';
  createdAt: string;
  displayName?: string;
  language?: string;
  measurementUnit?: string;
}

interface OnboardingData {
  goal: string;
  experience: string;
  weight?: number;
  height?: number;
  targetWeight?: number;
}

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatarUrl?: string;
  language?: string;
  measurementUnit?: string;
  notificationsEnabled?: boolean;
}

interface UserStats {
  totalWorkouts: number;
  currentStreak: number;
  totalVolume: number;
  weeklyGoalProgress: number;
}

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  duration: number;
  frequency: number;
  workouts: Workout[];
}

interface Workout {
  id: string;
  name: string;
  day: number;
  exercises: WorkoutExercise[];
}

interface WorkoutExercise {
  exerciseId: string;
  exercise: Exercise;
  sets: number;
  reps: string;
  restSeconds: number;
}

interface WorkoutLogData {
  workoutId: string;
  exercises: ExerciseLogData[];
  duration: number;
  notes?: string;
}

interface ExerciseLogData {
  exerciseId: string;
  sets: SetLogData[];
}

interface SetLogData {
  reps: number;
  weight: number;
  rpe?: number;
}

// Create Workout Plan types
interface CreateWorkoutPlanData {
  name: string;
  description?: string;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  goal?: 'LOSE_WEIGHT' | 'BUILD_MUSCLE' | 'MAINTAIN' | 'IMPROVE_HEALTH' | 'INCREASE_STRENGTH' | 'IMPROVE_ENDURANCE';
  workouts: {
    name: string;
    exercises: {
      exerciseId: string;
      sets: { reps: string; weight?: string }[];
    }[];
  }[];
}

// Manual Workout Log types
interface ManualWorkoutLogData {
  name: string;
  durationMinutes: number;
  exercises: {
    name: string;
    exerciseId?: string;
    sets: { reps: number; weightKg?: number }[];
  }[];
  notes?: string;
}

interface WorkoutLog {
  id: string;
  workoutId: string;
  date: string;
  duration: number;
  totalVolume: number;
}

interface Exercise {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  muscleGroup: string;
  secondaryMuscles: string[];
  equipment: string;
  difficulty: string;
  instructions: string[];
  tips?: string[];
  videoUrl?: string;
  imageUrl?: string;
}

interface ExerciseSearchParams {
  query?: string;
  muscle?: string;
  equipment?: string;
  difficulty?: string;
  page?: number;
  limit?: number;
}

interface Food {
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
}

interface MealLogData {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: { foodId: string; servings: number }[];
  date?: string;
}

interface MealLog {
  id:string;
  mealType: string;
  foods: { food: Food; servings: number }[];
  totalCalories: number;
  date: string;
}

interface DailyNutritionLog {
  date: string;
  meals: MealLog[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface WeeklyNutritionSummary {
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  daysOnTarget: number;
}

interface ProgressLog {
  id: string;
  type: string;
  value: number;
  date: string;
}

interface MeasurementsData {
  weight?: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
}

interface WeightLog {
  date: string;
  weight: number;
}

interface StrengthPR {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
}

interface MeasurementsLog {
  id: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
}

interface LatestProgress {
  weight?: { value: number; change: number; date: string };
  measurements?: MeasurementsData & { date: string };
  benchPR?: { weight: number; change: number };
}

interface Achievement {
  id: string;
  code: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  icon: string;
  category: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  total: number;
}

interface WeeklySummary {
  workoutsCompleted: number;
  workoutsTarget: number;
  totalVolume: number;
  caloriesAvg: number;
  proteinAvg: number;
  weightChange: number;
  streakDays: number;
  daysOnCalorieTarget: number;
  daysWithMeals: number;
}

interface MuscleBalance {
  data: { muscle: string; volume: number; percentage: number }[];
  laggingMuscles: string[];
}

interface VolumeLoadData {
  weekly: { week: string; volume: number }[];
  byMuscle: { muscle: string; volume: number }[];
}

interface Trainer {
  id: string;
  userId: string;
  user: User;
  bio: string;
  specializations: string[];
  certifications: string[];
  experience: number;
  rating: number;
  reviewCount: number;
  clientCount: number;
  hourlyRate: number;
  verified: boolean;
}

interface TrainerSearchParams {
  specialization?: string;
  minRating?: number;
  maxRate?: number;
  page?: number;
  limit?: number;
}

interface TrainerApplicationData {
  bio: string;
  specializations: string[];
  certifications: string[];
  experience: number;
  hourlyRate: number;
}

interface TrainerProfile extends Trainer {
  earnings: number;
  pendingPayout: number;
}

interface Client {
  id: string;
  user: User;
  plan: string;
  startDate: string;
  progress: number;
  lastActive: string;
}

interface EarningsData {
  total: number;
  pending: number;
  transactions: Transaction[];
}

interface Transaction {
  id: string;
  client: string;
  type: string;
  amount: number;
  date: string;
  status: string;
}

interface TrainerDashboardStats {
  activeClients: { value: number; change: number };
  monthlyRevenue: { value: number; change: number };
  sessionCompletionRate: { value: number; change: number };
  averageRating: { value: number; reviewCount: number };
}

interface TrainerSession {
  id: string;
  clientName: string;
  time: string;
  type: 'Video Call' | 'Check-in' | 'Form Review';
}

interface TrainerMessage {
  id: string;
  from: string;
  message: string;
  time: string;
}

interface AdminDashboardStats {
  totalUsers: { value: number; change: number };
  activeTrainers: { value: number; change: number };
  monthlyRevenue: { value: number; change: number };
  activeSessions: { value: number; };
}

interface AdminActivity {
  id: string;
  action: string;
  user: string;
  target?: string;
  createdAt: string;
  type: 'user' | 'trainer' | 'payment' | 'content' | 'system';
}

interface AdminApproval {
  id: string;
  name: string;
  type: 'Trainer Application' | 'Content Review';
  submittedAt: string;
}

interface SystemHealthMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit?: number;
    totalPages: number;
  };
}


// Auth types
interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Upload types
interface UploadResponse {
  success: boolean;
  url: string;
  publicId: string;
  duration?: number;
}

// Chat types
type MessageType = 'TEXT' | 'IMAGE' | 'VOICE' | 'WORKOUT_SHARE' | 'PROGRESS_SHARE';

interface ChatParticipant {
  id: string;
  name: string;
  avatarUrl: string | null;
  isOnline: boolean;
}

interface ConversationLastMessage {
  content: string;
  createdAt: string;
  isMine: boolean;
}

interface Conversation {
  id: string;
  participant: ChatParticipant | null;
  lastMessage: ConversationLastMessage | null;
  unreadCount: number;
  createdAt: string;
}

interface ChatMessageSender {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  isEdited: boolean;
  sender: ChatMessageSender;
  isMine: boolean;
}

interface MessagesResponse {
  messages: ChatMessage[];
  nextCursor: string | null;
}

interface SendMessageData {
  conversationId: string;
  type: MessageType;
  content: string;
  mediaUrl?: string;
}

// Settings types
interface UserPreferences {
  id: string;
  userId: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isKeto: boolean;
  isPescatarian: boolean;
  allergies: string[];
  dislikes: string[];
  healthConditions: string[];
  preferLocalFoods: boolean;
  budgetLevel: string;
  cookingSkillLevel: string;
  maxCookingTime: number | null;
  ramadanModeEnabled: boolean;
  ramadanIftarTime: string | null;
  ramadanSuhoorTime: string | null;
  ramadanWorkoutTiming: string;
  injuries: string[];
  preferredWorkoutTime: string | null;
  availableEquipment: string[];
  workoutDurationMins: number;
}

interface RamadanSettings {
  enabled: boolean;
  iftarTime: string | null;
  suhoorTime: string | null;
  workoutTiming: string | null;
  recommendedWorkoutTime: string;
  nutritionAdvice: string;
  hydrationReminder: string | null;
}

interface RamadanModeData {
  iftarTime: string;
  suhoorTime: string;
  workoutTiming: 'before_iftar' | 'after_iftar' | 'after_taraweeh' | 'before_suhoor';
}

// What Now types
interface WhatNowInput {
  availableMinutes?: number;
  energyLevel?: 'low' | 'medium' | 'high';
  location?: 'gym' | 'home' | 'outdoor';
}

interface WhatNowExercise {
  id: string;
  name: string;
  nameAr?: string;
  sets: number;
  reps: string;
  equipment: string;
}

interface WhatNowRecommendation {
  type: 'quick_workout' | 'full_workout' | 'rest' | 'active_recovery';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  durationMinutes: number;
  targetMuscles: string[];
  exercises: WhatNowExercise[];
  reason: string;
  reasonAr: string;
}

// Squad types
interface CreateSquadData {
  name: string;
  description?: string;
  isPublic?: boolean;
  maxMembers?: number;
}

interface Squad {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isPublic: boolean;
  maxMembers: number;
  createdById: string;
  createdAt: string;
  members: SquadMember[];
}

interface SquadMember {
  id: string;
  squadId: string;
  userId: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

interface SquadWithMeta extends Squad {
  myRole: string;
  memberCount: number;
  activeChallenges: number;
}

interface SquadChallenge {
  id: string;
  squadId: string;
  name: string;
  description?: string;
  type: string;
  target: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface SquadActivity {
  id: string;
  squadId: string;
  userId: string;
  type: string;
  description: string;
  createdAt: string;
}

interface SquadDetails extends Squad {
  challenges: SquadChallenge[];
  activities: SquadActivity[];
  myRole: string | null;
  isMember: boolean;
  leaderboard: LeaderboardEntry[];
}

interface CreateChallengeData {
  name: string;
  description?: string;
  type: 'workout_count' | 'total_volume' | 'streak_days' | 'calories_burned';
  target: number;
  durationDays: number;
}

interface LeaderboardEntry {
  userId: string;
  name: string;
  avatarUrl?: string;
  role: string;
  workoutCount: number;
  totalVolume: number;
  score: number;
}

interface ChallengeLeaderboardEntry {
  userId: string;
  name: string;
  avatarUrl?: string;
  progress: number;
  percentage: number;
  completed: boolean;
}

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
  MeasurementsLog,
  LatestProgress,
  Achievement,
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
  RegisterData,
  LoginData,
  AuthResponse,
  CreateWorkoutPlanData,
  ManualWorkoutLogData,
  AdminDashboardStats,
  AdminActivity,
  AdminApproval,
  SystemHealthMetric,
  UploadResponse,
  MessageType,
  ChatParticipant,
  Conversation,
  ChatMessage,
  MessagesResponse,
  SendMessageData,
  UserPreferences,
  RamadanSettings,
  RamadanModeData,
  WhatNowInput,
  WhatNowExercise,
  WhatNowRecommendation,
  CreateSquadData,
  Squad,
  SquadMember,
  SquadWithMeta,
  SquadChallenge,
  SquadActivity,
  SquadDetails,
  CreateChallengeData,
  LeaderboardEntry,
  ChallengeLeaderboardEntry,
};