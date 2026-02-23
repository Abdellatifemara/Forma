'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, authApi } from '@/lib/api';

export const userKeys = {
  all: ['user'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
  me: () => [...userKeys.all, 'me'] as const,
};

export function useUser() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: () => authApi.getMe(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useUserProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => usersApi.getProfile(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => usersApi.getStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useAssessment() {
  return useQuery({
    queryKey: [...userKeys.all, 'assessment'] as const,
    queryFn: () => usersApi.getAssessment(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useSaveAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.saveAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...userKeys.all, 'assessment'] });
    },
  });
}
