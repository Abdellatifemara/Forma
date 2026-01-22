import { useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore, User } from '../store/auth';
import { supabase } from '../services/supabase';
import { api, ApiError } from '../services/api';
import { Session } from '@supabase/supabase-js';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export function useAuth() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading,
    login: storeLogin,
    logout: storeLogout,
    updateProfile,
    setLoading,
    setSession,
  } = useAuthStore();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session) {
          // Fetch user profile
          const { data: userProfile, error } = await supabase
            .from('User')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userProfile) {
            storeLogin(userProfile, session.access_token, session.refresh_token);
          } else if (error) {
            console.error('Error fetching user profile:', error);
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [storeLogin, setSession]);

  const login = useCallback(
    async (data: LoginData) => {
      try {
        setLoading(true);
        const { data: sessionData, error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (sessionData.session) {
          const { data: userProfile } = await supabase
            .from('User')
            .select('*')
            .eq('id', sessionData.user.id)
            .single();

          if (userProfile?.onboardingCompletedAt) {
            router.replace('/(tabs)');
          } else {
            router.replace('/(auth)/onboarding');
          }
        }

        return { success: true };
      } catch (error) {
        if (error instanceof ApiError) {
          return { success: false, error: error.message };
        }
        return { success: false, error: 'Login failed' };
      } finally {
        setLoading(false);
      }
    },
    [router, setLoading]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      try {
        setLoading(true);
        const { data: sessionData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.name,
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }
        
        if (sessionData.session) {
            router.replace('/(auth)/onboarding');
        }


        return { success: true };
      } catch (error) {
        if (error instanceof ApiError) {
          return { success: false, error: error.message };
        }
        return { success: false, error: 'Registration failed' };
      } finally {
        setLoading(false);
      }
    },
    [router, setLoading]
  );

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore logout errors
    } finally {
      storeLogout();
      router.replace('/(auth)/welcome');
    }
  }, [router, storeLogout]);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to send reset email' };
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const completeOnboarding = useCallback(async (data: Record<string, unknown>) => {
    try {
      setLoading(true);
      const { data: user, error } = await supabase.auth.updateUser({
        data: { ...data, onboardingCompleted: true },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (user) {
        updateProfile({ ...data, onboardingCompleted: true });
        router.replace('/(tabs)');
      }

      return { success: true };
    } catch (error) {
      if (error instanceof ApiError) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Failed to save profile' };
    } finally {
      setLoading(false);
    }
  }, [router, updateProfile, setLoading]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    completeOnboarding,
    updateProfile,
  };
}