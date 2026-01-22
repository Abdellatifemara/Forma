'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { api, type User } from '@/lib/api';
import { Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.session) {
          const { data: userProfile } = await supabase
            .from('User')
            .select('*')
            .eq('id', data.user.id)
            .single();

          set({ user: userProfile, session: data.session, isAuthenticated: true });
        }
      },

      register: async (name: string, email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.session) {
            set({ session: data.session, isAuthenticated: true });
        }

      },

      logout: () => {
        supabase.auth.signOut();
        set({
          user: null,
          session: null,
          isAuthenticated: false,
        });
      },

      setUser: (user) => set({ user }),

      setSession: (session) => {
        set({ session });
      },

      checkAuth: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }

        try {
            const { data: userProfile } = await supabase
            .from('User')
            .select('*')
            .eq('id', session.user.id)
            .single();
          set({ user: userProfile, session, isAuthenticated: true, isLoading: false });
        } catch {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'forma-auth',
      partialize: (state) => ({ session: state.session }),
    }
  )
);