'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, authApi, type User } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const response = await authApi.login({ email, password });
        api.setToken(response.accessToken);
        set({
          user: response.user,
          token: response.accessToken,
          isAuthenticated: true,
        });
      },

      register: async (name: string, email: string, password: string) => {
        const response = await authApi.register({ name, email, password });
        api.setToken(response.accessToken);
        set({
          user: response.user,
          token: response.accessToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        api.setToken(null);
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setUser: (user) => set({ user }),

      setToken: (token) => {
        api.setToken(token);
        set({ token });
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }

        try {
          api.setToken(token);
          const user = await authApi.me();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'forma-auth',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
