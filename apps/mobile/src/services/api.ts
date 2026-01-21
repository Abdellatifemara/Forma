import { useAuthStore } from '../store/auth';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { skipAuth = false, ...fetchOptions } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    };

    // Add auth token if available and not skipped
    if (!skipAuth) {
      const accessToken = useAuthStore.getState().accessToken;
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      // Handle 401 - Unauthorized
      if (response.status === 401) {
        // Try to refresh token
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry request with new token
          const newAccessToken = useAuthStore.getState().accessToken;
          headers['Authorization'] = `Bearer ${newAccessToken}`;
          const retryResponse = await fetch(url, { ...fetchOptions, headers });
          return this.handleResponse<T>(retryResponse);
        } else {
          // Logout if refresh failed
          useAuthStore.getState().logout();
          throw new ApiError('Session expired', 401);
        }
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 0);
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ApiError(
        data?.message || 'Request failed',
        response.status,
        data?.errors
      );
    }

    return data;
  }

  private async refreshToken(): Promise<boolean> {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // HTTP methods
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Custom error class
export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

// Create API client instance
export const api = new ApiClient(API_BASE_URL);

// ============================================
// Auth API
// ============================================

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data, { skipAuth: true }),

  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data, { skipAuth: true }),

  logout: () => api.post('/auth/logout'),

  me: () => api.get('/auth/me'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }, { skipAuth: true }),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }, { skipAuth: true }),

  updateProfile: (data: Record<string, unknown>) =>
    api.patch('/auth/profile', data),
};

// ============================================
// Workouts API
// ============================================

export const workoutsApi = {
  getPlans: () => api.get('/workouts/plans'),

  getPlan: (id: string) => api.get(`/workouts/plans/${id}`),

  getTodayWorkout: () => api.get('/workouts/today'),

  getWorkout: (id: string) => api.get(`/workouts/${id}`),

  logWorkout: (data: {
    workoutId?: string;
    exercises: Array<{
      exerciseId: string;
      sets: Array<{
        reps?: number;
        weight?: number;
        duration?: number;
        completed: boolean;
      }>;
    }>;
    duration: number;
    notes?: string;
  }) => api.post('/workouts/log', data),

  getHistory: (params?: { page?: number; limit?: number }) =>
    api.get(`/workouts/history${params ? `?page=${params.page}&limit=${params.limit}` : ''}`),
};

// ============================================
// Exercises API
// ============================================

export const exercisesApi = {
  getAll: (params?: {
    muscleGroup?: string;
    equipment?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }
    return api.get(`/exercises?${queryParams}`);
  },

  getOne: (id: string) => api.get(`/exercises/${id}`),

  getMuscleGroups: () => api.get('/exercises/muscle-groups'),
};

// ============================================
// Nutrition API
// ============================================

export const nutritionApi = {
  searchFoods: (query: string) =>
    api.get(`/nutrition/foods/search?q=${encodeURIComponent(query)}`),

  getFood: (id: string) => api.get(`/nutrition/foods/${id}`),

  logMeal: (data: {
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    foods: Array<{ foodId: string; servings: number }>;
    notes?: string;
  }) => api.post('/nutrition/meals', data),

  getDailyLog: (date?: string) =>
    api.get(`/nutrition/daily${date ? `?date=${date}` : ''}`),

  getWeeklySummary: () => api.get('/nutrition/summary/weekly'),
};

// ============================================
// Progress API
// ============================================

export const progressApi = {
  logWeight: (data: { weight: number; unit?: 'kg' | 'lbs'; notes?: string }) =>
    api.post('/progress/weight', data),

  getWeightHistory: (params?: { days?: number }) =>
    api.get(`/progress/weight${params ? `?days=${params.days}` : ''}`),

  logMeasurements: (data: {
    chest?: number;
    waist?: number;
    hips?: number;
    thighs?: number;
    arms?: number;
    neck?: number;
    bodyFatPercentage?: number;
  }) => api.post('/progress/measurements', data),

  getMeasurements: () => api.get('/progress/measurements'),

  uploadPhoto: (data: FormData) =>
    api.post('/progress/photos', data),

  getPhotos: () => api.get('/progress/photos'),

  getPersonalRecords: () => api.get('/progress/records'),
};

// ============================================
// Stats API
// ============================================

export const statsApi = {
  getDashboard: () => api.get('/stats/dashboard'),

  getWeeklyStats: () => api.get('/stats/weekly'),

  getStreaks: () => api.get('/stats/streaks'),
};

// ============================================
// Trainers API
// ============================================

export const trainersApi = {
  getAll: (params?: {
    specialization?: string;
    minRating?: number;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }
    return api.get(`/trainers?${queryParams}`);
  },

  getOne: (id: string) => api.get(`/trainers/${id}`),

  getPrograms: (trainerId: string) => api.get(`/trainers/${trainerId}/programs`),

  subscribe: (trainerId: string, programId: string) =>
    api.post(`/trainers/${trainerId}/subscribe`, { programId }),
};

// ============================================
// Chat API
// ============================================

export const chatApi = {
  sendMessage: (message: string) => api.post('/ai/chat', { message }),

  getHistory: () => api.get('/ai/chat/history'),

  clearHistory: () => api.delete('/ai/chat/history'),
};
