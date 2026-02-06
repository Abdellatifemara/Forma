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

  checkMarketplaceAccess: () =>
    api.get<MarketplaceAccess>('/users/me/marketplace-access'),

  getMyTrainers: () => api.get<MyTrainer[]>('/users/me/trainers'),
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
  // Public endpoints
  getMarketplace: (params?: TrainerSearchParams) =>
    api.get<PaginatedResponse<Trainer>>('/trainers', params as Record<string, string>),

  getById: (id: string) => api.get<Trainer>(`/trainers/${id}`),

  apply: (data: TrainerApplicationData) =>
    api.post<TrainerProfile>('/trainers/apply', data),

  // Trainer dashboard endpoints
  getMyProfile: () => api.get<TrainerProfile>('/trainers/me/profile'),

  getDashboardStats: () => api.get<TrainerStats>('/trainers/me/stats'),

  getEarnings: (params?: { month?: number; year?: number }) =>
    api.get<TrainerEarningsBreakdown>('/trainers/me/earnings', params as Record<string, string>),

  getClients: () => api.get<TrainerClientResponse[]>('/trainers/me/clients'),

  getClientCompliance: () => api.get<ClientComplianceOverview>('/trainers/me/compliance'),

  getClientDetails: (clientId: string) =>
    api.get<ClientDetails>(`/trainers/me/clients/${clientId}`),

  // Invite system
  generateInviteCode: () => api.post<{ inviteCode: string }>('/trainers/me/invite-code'),

  createInviteLink: (grantsPremium?: boolean) =>
    api.post<InviteLinkResponse>('/trainers/me/invite-link', { grantsPremium }),

  getMyInvites: () => api.get<TrainerInvite[]>('/trainers/me/invites'),

  deactivateInvite: (inviteId: string) =>
    api.post<{ success: boolean }>(`/trainers/me/invites/${inviteId}/deactivate`),
};

// Invite verification API (public endpoints)
export const inviteApi = {
  verify: (code: string) =>
    api.get<InviteVerification>(`/trainers/invite/${code}`),

  redeem: (code: string) =>
    api.post<InviteRedemption>(`/trainers/invite/${code}/redeem`),
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

// Programs API (Trainer programs)
export const programsApi = {
  // Get all programs for current trainer
  getAll: () => api.get<TrainerProgramSummary[]>('/programs'),

  // Get single program with full details
  getById: (id: string) => api.get<TrainerProgramFull>(`/programs/${id}`),

  // Create a new program
  create: (data: CreateProgramData) => api.post<TrainerProgramFull>('/programs', data),

  // Create program from parsed PDF
  createFromPdf: (pdfUrl: string, parsedData: ParsedProgramData) =>
    api.post<TrainerProgramFull>('/programs/from-pdf', { pdfUrl, parsedData }),

  // Update a program
  update: (id: string, data: UpdateProgramData) =>
    api.patch<TrainerProgramFull>(`/programs/${id}`, data),

  // Publish a draft program
  publish: (id: string) => api.post<TrainerProgramFull>(`/programs/${id}/publish`),

  // Archive a program
  archive: (id: string) => api.post<TrainerProgramFull>(`/programs/${id}/archive`),

  // Duplicate a program
  duplicate: (id: string) => api.post<TrainerProgramFull>(`/programs/${id}/duplicate`),

  // Delete a program
  delete: (id: string) => api.delete<{ success: boolean }>(`/programs/${id}`),

  // Workout day management
  addWorkoutDay: (programId: string, data: { nameEn?: string; nameAr?: string }) =>
    api.post<ProgramWorkoutDay>(`/programs/${programId}/days`, data),

  updateWorkoutDay: (programId: string, dayId: string, data: WorkoutDayUpdate) =>
    api.patch<ProgramWorkoutDay>(`/programs/${programId}/days/${dayId}`, data),

  deleteWorkoutDay: (programId: string, dayId: string) =>
    api.delete<{ success: boolean }>(`/programs/${programId}/days/${dayId}`),

  // Exercise management
  addExercise: (programId: string, dayId: string, data: AddExerciseData) =>
    api.post<ProgramExercise>(`/programs/${programId}/days/${dayId}/exercises`, data),

  updateExercise: (programId: string, exerciseId: string, data: UpdateExerciseData) =>
    api.patch<ProgramExercise>(`/programs/${programId}/exercises/${exerciseId}`, data),

  deleteExercise: (programId: string, exerciseId: string) =>
    api.delete<{ success: boolean }>(`/programs/${programId}/exercises/${exerciseId}`),
};

// Upload API - Extended for PDF
export const uploadApiExtended = {
  ...uploadApi,

  uploadPdf: async (file: File): Promise<PdfUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthCookie();
    const response = await fetch(`${API_BASE_URL}/upload/pdf`, {
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

// Subscriptions API
export const subscriptionsApi = {
  getMySubscription: () =>
    api.get<Subscription>('/subscriptions/me'),

  getPlans: () =>
    api.get<SubscriptionPlan[]>('/subscriptions/plans'),

  createSubscription: (data: CreateSubscriptionData) =>
    api.post<SubscriptionResponse>('/subscriptions', data),

  cancelSubscription: (data?: { reason?: string; immediate?: boolean }) =>
    api.delete<Subscription>('/subscriptions/me'),

  reactivateSubscription: () =>
    api.post<Subscription>('/subscriptions/me/reactivate'),

  giftSubscription: (data: GiftSubscriptionData) =>
    api.post<GiftSubscriptionResponse>('/subscriptions/gift', data),

  checkFeatureAccess: (featureId: string) =>
    api.get<{ featureId: string; hasAccess: boolean }>(`/subscriptions/features/${featureId}/access`),

  getFeatureUsage: (featureId: string) =>
    api.get<FeatureUsage>(`/subscriptions/features/${featureId}/usage`),

  getPaymentHistory: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Payment>>('/subscriptions/payments', params as Record<string, string>),
};

// Payments API (Paymob)
export const paymentsApi = {
  getPaymentMethods: () =>
    api.get<PaymentMethodOption[]>('/payments/methods'),

  createPaymentIntent: (data: CreatePaymentIntentData) =>
    api.post<PaymentIntentResponse>('/payments/create-intent', data),

  getPaymentStatus: (paymentId: string) =>
    api.get<PaymentStatus>(`/payments/${paymentId}/status`),
};

// Research API (Surveys, Tests & AI Usage Tracking)
export const researchApi = {
  // Get all available tests
  getTests: () =>
    api.get<TestsResponse>('/research/tests'),

  // Get specific test by code
  getTest: (code: string) =>
    api.get<TestDetail>(`/research/tests/${code}`),

  // Submit test/survey response
  submitTest: (surveyId: string, responses: Record<string, unknown>) =>
    api.post<{ success: boolean }>(`/research/surveys/${surveyId}/respond`, { responses }),

  // Get available survey for user
  getAvailableSurvey: (trigger?: string) =>
    api.get<Survey | null>('/research/surveys/available', trigger ? { trigger } : undefined),

  // Submit survey response
  submitSurvey: (surveyId: string, responses: Record<string, unknown>) =>
    api.post<{ success: boolean }>(`/research/surveys/${surveyId}/respond`, { responses }),

  // Track AI usage event
  trackAIUsage: (data: AIUsageTrackData) =>
    api.post<{ success: boolean }>('/research/ai-usage', data),

  // Get user's AI usage
  getMyAIUsage: () =>
    api.get<AIUsageStats>('/research/ai-usage/me'),

  // Check if user can use AI feature
  canUseAIFeature: (featureId: string) =>
    api.get<{ canUse: boolean }>(`/research/ai-usage/can-use/${featureId}`),
};

// Admin Research API
export const adminResearchApi = {
  getSurveyResults: (code: string) =>
    api.get<SurveyResults>(`/admin/research/surveys/${code}/results`),

  getAIMetrics: (days?: number) =>
    api.get<AIMetrics>('/admin/research/ai-metrics', days ? { days: days.toString() } : undefined),

  getLimitAnalysis: () =>
    api.get<LimitAnalysis>('/admin/research/limit-analysis'),

  getQueryPatterns: () =>
    api.get<QueryPatterns>('/admin/research/query-patterns'),

  seedSurveys: () =>
    api.post<{ seededCount: number }>('/admin/research/surveys/seed'),
};

// ==========================================
// USER PROFILE API - AI Data Collection
// ==========================================
export const userProfileApi = {
  // Complete AI Profile (all data AI needs)
  getAIProfile: () =>
    api.get<UserAIProfile>('/user-profile/ai-profile'),

  // Profile completion status
  getCompletionStatus: () =>
    api.get<ProfileCompletionStatus>('/user-profile/completion-status'),

  // Equipment Inventory
  getEquipment: () =>
    api.get<EquipmentInventory>('/user-profile/equipment'),
  updateEquipment: (data: Partial<EquipmentInventory>) =>
    api.put<EquipmentInventory>('/user-profile/equipment', data),

  // Exercise Capability
  getCapability: () =>
    api.get<ExerciseCapability>('/user-profile/capability'),
  updateCapability: (data: Partial<ExerciseCapability>) =>
    api.put<ExerciseCapability>('/user-profile/capability', data),

  // Movement Screening
  getMovement: () =>
    api.get<MovementScreen>('/user-profile/movement'),
  updateMovement: (data: Partial<MovementScreen>) =>
    api.put<MovementScreen>('/user-profile/movement', data),

  // Health Profile
  getHealth: () =>
    api.get<HealthProfile>('/user-profile/health'),
  updateHealth: (data: Partial<HealthProfile>) =>
    api.put<HealthProfile>('/user-profile/health', data),
  addInjury: (data: InjuryData) =>
    api.post<UserInjury>('/user-profile/health/injuries', data),
  updateInjury: (id: string, data: Partial<InjuryData>) =>
    api.put<UserInjury>(`/user-profile/health/injuries/${id}`, data),
  deleteInjury: (id: string) =>
    api.delete(`/user-profile/health/injuries/${id}`),

  // Nutrition Profile
  getNutrition: () =>
    api.get<NutritionProfile>('/user-profile/nutrition'),
  updateNutrition: (data: Partial<NutritionProfile>) =>
    api.put<NutritionProfile>('/user-profile/nutrition', data),

  // Lifestyle Profile
  getLifestyle: () =>
    api.get<LifestyleProfile>('/user-profile/lifestyle'),
  updateLifestyle: (data: Partial<LifestyleProfile>) =>
    api.put<LifestyleProfile>('/user-profile/lifestyle', data),

  // Body Composition
  getBody: () =>
    api.get<BodyComposition>('/user-profile/body'),
  updateBody: (data: Partial<BodyComposition>) =>
    api.put<BodyComposition>('/user-profile/body', data),

  // Daily Readiness
  getTodayReadiness: () =>
    api.get<DailyReadiness | null>('/user-profile/readiness/today'),
  getReadinessHistory: () =>
    api.get<DailyReadiness[]>('/user-profile/readiness/history'),
  logReadiness: (data: DailyReadinessInput) =>
    api.post<DailyReadiness>('/user-profile/readiness', data),

  // Workout Feedback
  getWorkoutFeedback: (workoutLogId: string) =>
    api.get<WorkoutFeedbackData>(`/user-profile/feedback/${workoutLogId}`),
  logWorkoutFeedback: (workoutLogId: string, data: WorkoutFeedbackInput) =>
    api.post<WorkoutFeedbackData>(`/user-profile/feedback/${workoutLogId}`, data),

  // Muscle Recovery
  getMuscleRecovery: () =>
    api.get<MuscleRecoveryStatus[]>('/user-profile/recovery'),

  // Training History
  getTrainingHistory: () =>
    api.get<TrainingHistory>('/user-profile/training'),
  updateTrainingHistory: (data: Partial<TrainingHistory>) =>
    api.put<TrainingHistory>('/user-profile/training', data),

  // Goals Profile
  getGoals: () =>
    api.get<GoalsProfile | null>('/user-profile/goals'),
  updateGoals: (data: Partial<GoalsProfile>) =>
    api.put<GoalsProfile>('/user-profile/goals', data),

  // Fasting Profile
  getFasting: () =>
    api.get<FastingProfile>('/user-profile/fasting'),
  updateFasting: (data: Partial<FastingProfile>) =>
    api.put<FastingProfile>('/user-profile/fasting', data),
};

// User Profile Types
interface UserAIProfile {
  user: Partial<User>;
  equipment: EquipmentInventory;
  capability: ExerciseCapability;
  movement: MovementScreen;
  health: HealthProfile;
  nutrition: NutritionProfile;
  lifestyle: LifestyleProfile;
  body: BodyComposition | null;
  training: TrainingHistory;
  goals: GoalsProfile | null;
  fasting: FastingProfile;
  todayReadiness: DailyReadiness | null;
  muscleRecovery: MuscleRecoveryStatus[];
  computed: {
    age: number | null;
    bmi: number | null;
    isRamadanActive: boolean;
    currentReadiness: number | null;
  };
}

interface ProfileCompletionStatus {
  sections: Record<string, { completed: boolean; priority: number; name: string }>;
  completedCount: number;
  totalCount: number;
  completionPercent: number;
  nextToComplete: string | null;
}

interface EquipmentInventory {
  id?: string;
  primaryLocation: 'HOME' | 'COMMERCIAL_GYM' | 'HOME_GYM' | 'OUTDOOR' | 'HOTEL';
  hasGymAccess: boolean;
  gymName?: string;
  hasFloorSpace: boolean;
  hasWallSpace: boolean;
  hasPullUpBar: boolean;
  hasDipStation: boolean;
  hasDumbbells: boolean;
  dumbbellMinKg?: number;
  dumbbellMaxKg?: number;
  hasBarbell: boolean;
  barbellWeightKg?: number;
  hasPlates: boolean;
  plateMaxTotalKg?: number;
  hasKettlebells: boolean;
  kettlebellWeights: number[];
  hasBench: boolean;
  benchType?: 'FLAT' | 'INCLINE' | 'DECLINE' | 'ADJUSTABLE';
  hasSquatRack: boolean;
  hasPowerRack: boolean;
  hasCableMachine: boolean;
  hasLegPress: boolean;
  hasLatPulldown: boolean;
  hasTreadmill: boolean;
  hasStatBike: boolean;
  hasRowingMachine: boolean;
  hasResistanceBands: boolean;
  bandStrengths: string[];
  hasTRX: boolean;
  hasYogaMat: boolean;
  hasJumpRope: boolean;
  hasBox: boolean;
  boxHeightsCm: number[];
  hasFoamRoller: boolean;
  hasAbWheel: boolean;
  hasMedicineBall: boolean;
  hasStabilityBall: boolean;
}

interface ExerciseCapability {
  id?: string;
  assessedAt?: string;
  // Push
  pushUpMaxReps: number;
  pushUpFromKnees: boolean;
  wallPushUp: boolean;
  declinePushUp: boolean;
  diamondPushUp: boolean;
  pikePushUp: boolean;
  handstandPushUp: boolean;
  dipMaxReps: number;
  // Pull
  pullUpMaxReps: number;
  chinUpMaxReps: number;
  canHangFromBar: boolean;
  bodyweightRow: boolean;
  // Core
  plankHoldSeconds: number;
  sidePlankSeconds: number;
  hollowBodyHold: boolean;
  hangingLegRaise: boolean;
  abWheelRollout: boolean;
  // Legs
  bodyweightSquatMaxReps: number;
  canSquatBelowParallel: boolean;
  pistolSquat: boolean;
  bulgarianSplitSquat: boolean;
  lungeMaxReps: number;
  boxJump: boolean;
  boxJumpMaxCm?: number;
  singleLegRDL: boolean;
  hipThrust: boolean;
  nordicCurl: boolean;
  // Balance
  singleLegStandSeconds: number;
  // Cardio
  canRun5Min: boolean;
  canRun20Min: boolean;
  burpeeMaxReps: number;
  // Flexibility
  canTouchToes: boolean;
  canDeepSquatNoHeel: boolean;
  canOverheadSquat: boolean;
  // Estimated 1RMs
  benchPress1RM?: number;
  squat1RM?: number;
  deadlift1RM?: number;
  overheadPress1RM?: number;
}

interface MovementScreen {
  id?: string;
  screenedAt?: string;
  deepSquatScore: number;
  shoulderMobilityScoreL: number;
  shoulderMobilityScoreR: number;
  activeSLRScoreL: number;
  activeSLRScoreR: number;
  limitedAnkleDorsiflexion: boolean;
  limitedHipFlexion: boolean;
  limitedHipExtension: boolean;
  limitedThoracicExtension: boolean;
  limitedShoulderFlexion: boolean;
  limitedShoulderRotationInt: boolean;
  limitedShoulderRotationExt: boolean;
  limitedHamstringFlexibility: boolean;
  limitedWristExtension: boolean;
  hasLeftRightImbalance: boolean;
  strongerSide?: string;
  forwardHeadPosture: boolean;
  roundedShoulders: boolean;
  excessiveLordosis: boolean;
  anteriorPelvicTilt: boolean;
  kneeValgus: boolean;
  notes?: string;
}

interface HealthProfile {
  id?: string;
  hasHeartCondition: boolean;
  hasHighBloodPressure: boolean;
  hasLowBloodPressure: boolean;
  hasDiabetes: boolean;
  diabetesType?: number;
  hasAsthma: boolean;
  hasArthritis: boolean;
  arthritisJoints: string[];
  hasOsteoporosis: boolean;
  hasHerniaHistory: boolean;
  hasJointReplacement: boolean;
  jointReplacementDetails?: string;
  hasNerveIssues: boolean;
  nerveIssueDetails?: string;
  hasVertigoBalance: boolean;
  isPregnant: boolean;
  pregnancyTrimester?: number;
  hadRecentSurgery: boolean;
  surgeryDetails?: string;
  surgeryDate?: string;
  clearedForExercise: boolean;
  takesBloodThinners: boolean;
  takesBetaBlockers: boolean;
  takesInsulin: boolean;
  medicationNotes?: string;
  hasDoctorClearance: boolean;
  injuries: UserInjury[];
}

interface UserInjury {
  id: string;
  bodyPart: string;
  side?: string;
  injuryType: string;
  severity: string;
  occurredAt?: string;
  isCurrentlyActive: boolean;
  isFullyHealed: boolean;
  painLevel: number;
  painTriggers: string[];
  avoidMovements: string[];
  inPhysicalTherapy: boolean;
  notes?: string;
}

interface InjuryData {
  bodyPart: string;
  side?: string;
  injuryType: string;
  severity: string;
  occurredAt?: string;
  painLevel?: number;
  painTriggers?: string[];
  avoidMovements?: string[];
  inPhysicalTherapy?: boolean;
  notes?: string;
}

interface NutritionProfile {
  id?: string;
  isHalal: boolean;
  isKosher: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isPescatarian: boolean;
  isKeto: boolean;
  isLowCarb: boolean;
  isPaleo: boolean;
  isLowSodium: boolean;
  allergyPeanuts: boolean;
  allergyTreeNuts: boolean;
  allergyMilk: boolean;
  allergyEggs: boolean;
  allergyGluten: boolean;
  allergySoy: boolean;
  allergyFish: boolean;
  allergyShellfish: boolean;
  allergySesame: boolean;
  otherAllergies: string[];
  lactoseIntolerant: boolean;
  glutenSensitive: boolean;
  fodmapSensitive: boolean;
  dislikedFoods: string[];
  dislikedCategories: string[];
  cookingSkillLevel: 'NONE' | 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
  maxCookingTimeMin: number;
  willingToBatchCook: boolean;
  hasKitchenAccess: boolean;
  hasBlender: boolean;
  hasAirFryer: boolean;
  budgetLevel: 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' | 'NO_LIMIT';
  monthlyFoodBudgetEGP?: number;
  mealsPerDay: number;
  snacksPerDay: number;
  eatsBreakfast: boolean;
  breakfastTime?: string;
  lunchTime?: string;
  dinnerTime?: string;
  doesIntermittentFasting: boolean;
  fastingWindowStart?: string;
  fastingWindowEnd?: string;
  preferLocalEgyptianFood: boolean;
  preferSimpleRecipes: boolean;
  likesSpicyFood: boolean;
  takesProteinPowder: boolean;
  proteinPowderType?: string;
  takesCreatine: boolean;
  takesPreWorkout: boolean;
  otherSupplements: string[];
  useCalculatedMacros: boolean;
  customCalories?: number;
  customProteinG?: number;
  customCarbsG?: number;
  customFatG?: number;
}

interface LifestyleProfile {
  id?: string;
  occupation?: string;
  workType: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE';
  workHoursPerDay: number;
  dailyStepsEstimate: number;
  hasPhysicalHobbies: boolean;
  physicalHobbies: string[];
  averageSleepHours: number;
  sleepQuality: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
  typicalBedtime?: string;
  typicalWakeTime?: string;
  hasSleepDisorder: boolean;
  currentStressLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  mainStressors: string[];
  hasAnxiety: boolean;
  preferredWorkoutTime: 'EARLY_MORNING' | 'MORNING' | 'MIDDAY' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'ANYTIME';
  availableMonday: boolean;
  availableTuesday: boolean;
  availableWednesday: boolean;
  availableThursday: boolean;
  availableFriday: boolean;
  availableSaturday: boolean;
  availableSunday: boolean;
  maxWorkoutMinutes: number;
  minWorkoutMinutes: number;
  targetWorkoutsPerWeek: number;
  recoveryCapacity: 'LOW' | 'AVERAGE' | 'HIGH';
  doesStretching: boolean;
  doesYogaMobility: boolean;
  caffeineIntakeDaily: number;
  smoker: boolean;
  alcoholDrinksPerWeek: number;
}

interface BodyComposition {
  id?: string;
  currentWeightKg: number;
  heightCm: number;
  bmi?: number;
  bodyFatPercent?: number;
  bodyFatMethod?: string;
  leanMassKg?: number;
  fatMassKg?: number;
  neckCm?: number;
  shouldersCm?: number;
  chestCm?: number;
  waistCm?: number;
  hipsGlutesCm?: number;
  leftBicepCm?: number;
  rightBicepCm?: number;
  leftThighCm?: number;
  rightThighCm?: number;
  leftCalfCm?: number;
  rightCalfCm?: number;
  waistToHipRatio?: number;
  waistToHeightRatio?: number;
  bodyType?: string;
  frameSize?: string;
}

interface DailyReadiness {
  id: string;
  loggedAt: string;
  energyLevel: number;
  motivationLevel: number;
  moodLevel: number;
  overallReadiness: number;
  sleepHours?: number;
  sleepQuality?: number;
  anyPainToday: boolean;
  painAreas: string[];
  painIntensity?: number;
  musclesSore: boolean;
  soreAreas: string[];
  sorenessLevel?: number;
  feelingIll: boolean;
  restingHeartRate?: number;
  hrvScore?: number;
  stressYesterday?: number;
  alcoholYesterday: boolean;
  hydratedWell: boolean;
  recommendedIntensity?: string;
  shouldSkipWorkout: boolean;
  notes?: string;
}

interface DailyReadinessInput {
  energyLevel: number;
  motivationLevel: number;
  moodLevel: number;
  overallReadiness?: number;
  sleepHours?: number;
  sleepQuality?: number;
  anyPainToday?: boolean;
  painAreas?: string[];
  painIntensity?: number;
  musclesSore?: boolean;
  soreAreas?: string[];
  sorenessLevel?: number;
  feelingIll?: boolean;
  restingHeartRate?: number;
  stressYesterday?: number;
  alcoholYesterday?: boolean;
  hydratedWell?: boolean;
  notes?: string;
}

interface WorkoutFeedbackData {
  id: string;
  workoutLogId: string;
  overallRating: number;
  perceivedDifficulty: number;
  enjoymentLevel: number;
  performanceVsExpected: string;
  formQuality: number;
  anyPainDuringWorkout: boolean;
  painExercises: string[];
  feltTooEasy: boolean;
  feltTooHard: boolean;
  favoriteExercise?: string;
  leastFavoriteExercise?: string;
  wantMoreOf?: string;
  wantLessOf?: string;
  notes?: string;
}

interface WorkoutFeedbackInput {
  overallRating: number;
  perceivedDifficulty: number;
  enjoymentLevel: number;
  performanceVsExpected: string;
  formQuality: number;
  anyPainDuringWorkout?: boolean;
  painExercises?: string[];
  feltTooEasy?: boolean;
  feltTooHard?: boolean;
  favoriteExercise?: string;
  leastFavoriteExercise?: string;
  wantMoreOf?: string;
  wantLessOf?: string;
  notes?: string;
}

interface MuscleRecoveryStatus {
  id: string;
  muscleGroup: string;
  lastWorkedAt?: string;
  lastWorkoutSets: number;
  lastWorkoutRPE: number;
  recoveryPercent: number;
  estimatedFullRecoveryAt?: string;
  currentSoreness: number;
  setsThisWeek: number;
  targetSetsPerWeek: number;
}

interface TrainingHistory {
  id?: string;
  trainingStartDate?: string;
  totalYearsTraining: number;
  currentLevel: string;
  previousPrograms: string[];
  sportsBackground: string[];
  preferredTrainingStyle: string;
  preferredSplitType: string;
  preferredRepRange: string;
  bestProgressMade?: string;
  whatWorkedBest?: string;
  whatDidntWork?: string;
  totalWorkoutsLogged: number;
  longestStreak: number;
  averageWorkoutsPerWeek: number;
  consistencyScore: number;
  prBenchPressKg?: number;
  prSquatKg?: number;
  prDeadliftKg?: number;
  prPullUps?: number;
  prPushUps?: number;
  prPlankSeconds?: number;
}

interface GoalsProfile {
  id?: string;
  primaryGoal: string;
  primaryGoalTarget?: string;
  targetDate?: string;
  secondaryGoals: string[];
  targetWeightKg?: number;
  targetBodyFatPercent?: number;
  targetStrength?: string;
  targetEndurance?: string;
  mainMotivation: string;
  secondaryMotivations: string[];
  biggestBarriers: string[];
  previousFailures: string[];
  accountabilityPreference: string;
  hasWorkoutPartner: boolean;
  wantsReminders: boolean;
  confidenceLevel: number;
  commitmentLevel: number;
  patienceForResults: number;
}

interface FastingProfile {
  id?: string;
  doesIntermittentFasting: boolean;
  ifProtocol?: string;
  eatingWindowStart?: string;
  eatingWindowEnd?: string;
  observesRamadan: boolean;
  ramadanActive: boolean;
  ramadanIftarTime?: string;
  ramadanSuhoorTime?: string;
  ramadanWorkoutTiming: string;
  ramadanReduceIntensity: boolean;
  ramadanReduceVolume: boolean;
}

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
  fitnessGoal?: string;
  fitnessLevel?: string;
  activityLevel?: string;
  heightCm?: number;
  currentWeightKg?: number;
  targetWeightKg?: number;
  equipment?: string[];
  goal?: string;
  experience?: string;
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

interface MarketplaceAccess {
  canSeeMarketplace: boolean;
  reason?: string;
}

interface MyTrainer {
  id: string;
  name: string;
  avatarUrl: string | null;
  specializations: string[];
  tier: 'REGULAR' | 'TRUSTED_PARTNER';
  currentProgram: {
    id: string;
    name: string;
    nameAr: string | null;
  } | null;
  canSeeMarketplace: boolean;
  premiumGifted: boolean;
  startDate: string;
}

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  duration: number;
  frequency: number;
  goal?: string;
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
  name?: string;
  calories?: number;
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

interface TrainerStats {
  activeClients: number;
  newClientsThisMonth: number;
  clientsChange: number;
  monthlyRevenue: number;
  revenueChange: number;
  pendingPayout: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
  tier: 'REGULAR' | 'TRUSTED_PARTNER';
  commissionRate: number;
  avgCompliance: number;
  complianceBreakdown: {
    highPerformers: number;
    needAttention: number;
    atRisk: number;
  };
  inviteCode: string | null;
}

interface TrainerEarningsBreakdown {
  month: number;
  year: number;
  grossRevenue: number;
  breakdown: {
    subscriptions: number;
    programs: number;
    tips: number;
  };
  platformFee: number;
  platformFeePercentage: number;
  netEarnings: number;
  payouts: number;
  pendingPayout: number;
  nextPayoutDate: string;
  transactions: TrainerTransaction[];
}

interface TrainerTransaction {
  id: string;
  type: 'SUBSCRIPTION' | 'PROGRAM_PURCHASE' | 'TIP' | 'PAYOUT';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'PAID_OUT';
  amountEGP: number;
  platformFeeEGP: number;
  trainerEarningEGP: number;
  description: string | null;
  createdAt: string;
}

interface TrainerClientResponse {
  id: string;
  clientId: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    fitnessGoal: string | null;
    currentWeightKg: number | null;
    targetWeightKg: number | null;
    lastActiveAt: string | null;
  };
  currentProgram: {
    id: string;
    name: string;
  } | null;
  complianceRate: number;
  canSeeMarketplace: boolean;
  premiumGifted: boolean;
}

interface ClientComplianceOverview {
  averageCompliance: number;
  totalClients: number;
  breakdown: {
    highPerformers: TrainerClientResponse[];
    needAttention: TrainerClientResponse[];
    atRisk: TrainerClientResponse[];
  };
  clients: {
    id: string;
    clientId: string;
    name: string;
    avatarUrl: string | null;
    complianceRate: number;
    lastActiveAt: string | null;
    program: string;
    canSeeMarketplace: boolean;
    premiumGifted: boolean;
  }[];
}

interface ClientDetails {
  id: string;
  clientId: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    fitnessGoal: string | null;
    currentWeightKg: number | null;
    targetWeightKg: number | null;
    heightCm: number | null;
    lastActiveAt: string | null;
    createdAt: string;
  };
  program: {
    id: string;
    nameEn: string;
    descriptionEn: string | null;
    durationWeeks: number;
  } | null;
  startDate: string;
  isActive: boolean;
  canSeeMarketplace: boolean;
  premiumGifted: boolean;
  compliance: {
    overall: number;
    workout: number;
    nutrition: number;
    weeklyTrend: {
      week: string;
      compliance: number;
    }[];
  };
  stats: {
    workoutsCompleted: number;
    totalVolume: number;
    avgCalories: number;
    weightProgress: number;
    currentWeight: number | null;
    startWeight: number | null;
  };
  recentActivity: {
    lastWorkout: string | null;
    lastNutritionLog: string | null;
  };
}

interface InviteLinkResponse {
  code: string;
  grantsPremium: boolean;
  expiresAt: string;
  link: string;
}

interface TrainerInvite {
  id: string;
  code: string;
  link: string;
  uses: number;
  maxUses: number | null;
  grantsPremium: boolean;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  isExpired: boolean;
}

interface InviteVerification {
  valid: boolean;
  trainer: {
    id: string;
    name: string;
    avatarUrl: string | null;
    specializations: string[];
    tier: 'REGULAR' | 'TRUSTED_PARTNER';
  };
  grantsPremium: boolean;
  expiresAt: string | null;
}

interface InviteRedemption {
  success: boolean;
  trainerId: string;
  premiumGranted: boolean;
  canSeeMarketplace: boolean;
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

// Program types
type ProgramStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
type ProgramSourceType = 'manual' | 'pdf' | 'ai_generated';

interface ProgramExercise {
  id: string;
  exerciseId: string | null;
  customNameEn: string | null;
  customNameAr: string | null;
  order: number;
  sets: number;
  reps: string | null;
  restSeconds: number;
  notesEn: string | null;
  notesAr: string | null;
  exercise?: Exercise;
}

interface ProgramWorkoutDay {
  id: string;
  dayNumber: number;
  nameEn: string | null;
  nameAr: string | null;
  notesEn: string | null;
  notesAr: string | null;
  exercises: ProgramExercise[];
}

interface TrainerProgramSummary {
  id: string;
  nameEn: string;
  nameAr: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  durationWeeks: number;
  priceEGP: number | null;
  status: ProgramStatus;
  sourceType: ProgramSourceType | null;
  clientCount: number;
  workoutDayCount: number;
  createdAt: string;
  updatedAt: string;
}

interface TrainerProgramFull extends Omit<TrainerProgramSummary, 'clientCount' | 'workoutDayCount'> {
  sourcePdfUrl: string | null;
  workoutDays: ProgramWorkoutDay[];
  _count: {
    clients: number;
  };
}

interface CreateProgramData {
  nameEn: string;
  nameAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  durationWeeks: number;
  priceEGP?: number;
  sourceType?: ProgramSourceType;
  sourcePdfUrl?: string;
  workoutDays?: CreateWorkoutDayData[];
}

interface CreateWorkoutDayData {
  dayNumber: number;
  nameEn?: string;
  nameAr?: string;
  notesEn?: string;
  notesAr?: string;
  exercises: CreateExerciseData[];
}

interface CreateExerciseData {
  exerciseId?: string;
  customNameEn?: string;
  customNameAr?: string;
  order: number;
  sets: number;
  reps?: string;
  restSeconds?: number;
  notesEn?: string;
  notesAr?: string;
}

interface UpdateProgramData {
  nameEn?: string;
  nameAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  durationWeeks?: number;
  priceEGP?: number;
  status?: ProgramStatus;
}

interface WorkoutDayUpdate {
  nameEn?: string;
  nameAr?: string;
  notesEn?: string;
  notesAr?: string;
}

interface AddExerciseData {
  exerciseId?: string;
  customNameEn?: string;
  customNameAr?: string;
  sets: number;
  reps: string;
  restSeconds?: number;
  notesEn?: string;
}

interface UpdateExerciseData {
  sets?: number;
  reps?: string;
  restSeconds?: number;
  notesEn?: string;
  notesAr?: string;
  order?: number;
}

interface ParsedExercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds?: number;
  notes?: string;
}

interface ParsedWorkoutDay {
  name: string;
  focus?: string;
  exercises: ParsedExercise[];
}

interface ParsedProgramData {
  suggestedName: string;
  suggestedDescription: string;
  durationWeeks: number;
  frequency: number;
  workoutDays: ParsedWorkoutDay[];
  rawText?: string;
}

interface PdfUploadResponse extends UploadResponse {
  pages?: number;
}

// Subscription types
type SubscriptionTierType = 'FREE' | 'PREMIUM' | 'PREMIUM_PLUS';
type SubscriptionStatusType = 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'TRIAL';

interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTierType;
  status: SubscriptionStatusType;
  priceEGP: number;
  billingCycle: 'monthly' | 'yearly';
  startDate: string;
  endDate: string | null;
  trialEndDate: string | null;
  cancelledAt: string | null;
  pricing: {
    monthly: number;
    yearly: number;
  };
  limits: Record<string, number>;
  payments?: Payment[];
}

interface SubscriptionPlan {
  tier: SubscriptionTierType;
  name: string;
  pricing: {
    monthly: number;
    yearly: number;
  };
  limits: Record<string, number>;
}

interface CreateSubscriptionData {
  tier: SubscriptionTierType;
  billingCycle?: 'monthly' | 'yearly';
  paymentMethodId?: string;
  promoCode?: string;
}

interface SubscriptionResponse {
  subscription: Subscription;
  payment: Payment;
  paymentRequired: boolean;
  amountDue: number;
}

interface GiftSubscriptionData {
  recipientEmail: string;
  tier: SubscriptionTierType;
  billingCycle?: 'monthly' | 'yearly';
  message?: string;
}

interface GiftSubscriptionResponse {
  subscription: Subscription;
  payment: Payment;
  recipientId: string;
  amountDue: number;
}

interface FeatureUsage {
  featureId: string;
  limit: number | 'unlimited';
  used: number;
  remaining: number | 'unlimited';
  resetDate: string;
}

interface Payment {
  id: string;
  subscriptionId: string;
  amountEGP: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripePaymentId: string | null;
  createdAt: string;
  paidAt: string | null;
}

// Paymob payment types
type PaymentMethodType = 'card' | 'wallet' | 'fawry' | 'kiosk';

interface PaymentMethodOption {
  id: PaymentMethodType;
  name: string;
  nameAr: string;
  enabled: boolean;
}

interface CreatePaymentIntentData {
  amountEGP: number;
  description: string;
  paymentMethod: PaymentMethodType;
  metadata?: {
    subscriptionId?: string;
    programId?: string;
    giftRecipientId?: string;
    type: 'subscription' | 'program' | 'gift';
  };
}

interface PaymentIntentResponse {
  id: string;
  orderId: number;
  paymentKey: string;
  iframeUrl: string;
  amountEGP: number;
  status: 'pending' | 'completed' | 'failed';
  expiresAt: string;
}

interface PaymentStatus {
  id: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  amountEGP: number;
  paidAt: string | null;
}

// Research types
type AIQueryType = 'workout_suggestion' | 'nutrition_advice' | 'form_check' | 'injury_modification' | 'meal_plan' | 'progress_analysis' | 'general_question';

interface SurveyQuestion {
  id: string;
  type: 'single_choice' | 'multiple_choice' | 'scale' | 'text';
  question: string;
  questionAr?: string;
  options?: { value: string; label: string; labelAr?: string }[];
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
  required?: boolean;
}

interface Survey {
  id: string;
  code: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  questions: SurveyQuestion[];
}

interface AIUsageTrackData {
  featureId: string;
  queryType: AIQueryType;
  queryText?: string;
  responseTimeMs?: number;
  successful?: boolean;
  satisfaction?: number;
}

interface AIUsageStats {
  totalQueries: number;
  queriesByType: Record<AIQueryType, number>;
  avgSatisfaction: number;
  limitHits: number;
  currentPeriodUsage: {
    used: number;
    limit: number;
    remaining: number;
  };
}

interface SurveyResults {
  surveyId: string;
  code: string;
  title: string;
  totalResponses: number;
  questions: {
    id: string;
    question: string;
    type: string;
    responses: {
      value: unknown;
      count: number;
      percentage: number;
    }[];
  }[];
}

interface AIMetrics {
  totalQueries: number;
  uniqueUsers: number;
  avgResponseTime: number;
  avgSatisfaction: number;
  queriesByType: Record<AIQueryType, number>;
  queriesByTier: Record<string, number>;
  dailyUsage: { date: string; count: number }[];
}

interface LimitAnalysis {
  totalLimitHits: number;
  hitsByTier: Record<string, number>;
  hitsByFeature: Record<string, number>;
  conversionAfterHit: number;
  avgQueriesBeforeHit: number;
}

interface QueryPatterns {
  peakHours: { hour: number; count: number }[];
  peakDays: { day: string; count: number }[];
  avgSessionQueries: number;
  queryCategories: { category: string; count: number; percentage: number }[];
}

interface TestSummary {
  id: string;
  code: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  questionCount: number;
  completed: boolean;
}

interface TestsResponse {
  tests: TestSummary[];
  totalTests: number;
  completedTests: number;
  progress: number;
}

interface TestDetail {
  id: string;
  code: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  questions: SurveyQuestion[];
  completed: boolean;
  completedAt?: string;
}

export type {
  User,
  OnboardingData,
  UserStats,
  MarketplaceAccess,
  MyTrainer,
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
  TrainerStats,
  TrainerEarningsBreakdown,
  TrainerTransaction,
  TrainerClientResponse,
  ClientComplianceOverview,
  ClientDetails,
  InviteLinkResponse,
  TrainerInvite,
  InviteVerification,
  InviteRedemption,
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
  // Program types
  ProgramStatus,
  ProgramSourceType,
  ProgramExercise,
  ProgramWorkoutDay,
  TrainerProgramSummary,
  TrainerProgramFull,
  CreateProgramData,
  CreateWorkoutDayData,
  CreateExerciseData,
  UpdateProgramData,
  WorkoutDayUpdate,
  AddExerciseData,
  UpdateExerciseData,
  ParsedExercise,
  ParsedWorkoutDay,
  ParsedProgramData,
  PdfUploadResponse,
  // Subscription types
  SubscriptionTierType,
  SubscriptionStatusType,
  Subscription,
  SubscriptionPlan,
  CreateSubscriptionData,
  SubscriptionResponse,
  GiftSubscriptionData,
  GiftSubscriptionResponse,
  FeatureUsage,
  Payment,
  // Payment types (Paymob)
  PaymentMethodType,
  PaymentMethodOption,
  CreatePaymentIntentData,
  PaymentIntentResponse,
  PaymentStatus,
  // Research types
  AIQueryType,
  SurveyQuestion,
  Survey,
  AIUsageTrackData,
  AIUsageStats,
  SurveyResults,
  AIMetrics,
  LimitAnalysis,
  QueryPatterns,
  TestSummary,
  TestsResponse,
  TestDetail,
  // AI Profile types
  UserAIProfile,
  ProfileCompletionStatus,
  EquipmentInventory,
  ExerciseCapability,
  MovementScreen,
  HealthProfile,
  UserInjury,
  InjuryData,
  NutritionProfile,
  LifestyleProfile,
  BodyComposition,
  DailyReadiness,
  DailyReadinessInput,
  WorkoutFeedbackData,
  WorkoutFeedbackInput,
  MuscleRecoveryStatus,
  TrainingHistory,
  GoalsProfile,
  FastingProfile,
};