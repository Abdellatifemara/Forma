import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore, User } from '../store/auth';
import { authApi, ApiError } from '../services/api';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
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
  } = useAuthStore();

  const login = useCallback(async (data: LoginData) => {
    try {
      setLoading(true);
      const response = await authApi.login(data) as AuthResponse;
      storeLogin(response.user, response.accessToken, response.refreshToken);

      // Navigate based on onboarding status
      if (!response.user.profile?.onboardingCompleted) {
        router.replace('/(auth)/onboarding');
      } else {
        router.replace('/(tabs)');
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
  }, [router, storeLogin, setLoading]);

  const register = useCallback(async (data: RegisterData) => {
    try {
      setLoading(true);
      const response = await authApi.register(data) as AuthResponse;
      storeLogin(response.user, response.accessToken, response.refreshToken);
      router.replace('/(auth)/onboarding');
      return { success: true };
    } catch (error) {
      if (error instanceof ApiError) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Registration failed' };
    } finally {
      setLoading(false);
    }
  }, [router, storeLogin, setLoading]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout API errors
    } finally {
      storeLogout();
      router.replace('/(auth)/welcome');
    }
  }, [router, storeLogout]);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      setLoading(true);
      await authApi.forgotPassword(email);
      return { success: true };
    } catch (error) {
      if (error instanceof ApiError) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Failed to send reset email' };
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const completeOnboarding = useCallback(async (data: Record<string, unknown>) => {
    try {
      setLoading(true);
      await authApi.updateProfile({
        ...data,
        onboardingCompleted: true,
      });
      updateProfile({ ...data, onboardingCompleted: true });
      router.replace('/(tabs)');
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
