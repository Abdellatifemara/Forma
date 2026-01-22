import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'trainer' | 'admin';
  subscription: 'free' | 'pro' | 'elite';
  profile?: UserProfile;
}

export interface UserProfile {
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  targetWeight?: number;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  fitnessGoal?: 'lose_weight' | 'build_muscle' | 'maintain' | 'improve_fitness' | 'gain_strength';
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  onboardingCompleted: boolean;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  login: (user: User, accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      setSession: (session) => {
        set({ session, isAuthenticated: !!session });
      },

      login: (user, accessToken, refreshToken) => {
        const session = get().session;
        set({
          user,
          session: session,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          user: null,
          session: null,
          isAuthenticated: false,
        });
      },

      updateProfile: (profile) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              profile: {
                ...currentUser.profile,
                ...profile,
                onboardingCompleted: currentUser.profile?.onboardingCompleted ?? false,
              },
            },
          });
        }
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setHydrated: (hydrated) => {
        set({ isHydrated: hydrated });
      },
    }),
    {
      name: 'forma-auth',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectAccessToken = (state: AuthState) => state.session?.access_token;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectProfile = (state: AuthState) => state.user?.profile;