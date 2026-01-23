'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutsApi, type ManualWorkoutLogData } from '@/lib/api';

export const workoutKeys = {
  all: ['workouts'] as const,
  plans: () => [...workoutKeys.all, 'plans'] as const,
  plan: (id: string) => [...workoutKeys.plans(), id] as const,
  today: () => [...workoutKeys.all, 'today'] as const,
  history: (params?: { page?: number; limit?: number }) =>
    [...workoutKeys.all, 'history', params] as const,
};

export function useWorkoutPlans() {
  return useQuery({
    queryKey: workoutKeys.plans(),
    queryFn: () => workoutsApi.getPlans(),
  });
}

export function useWorkoutPlan(id: string) {
  return useQuery({
    queryKey: workoutKeys.plan(id),
    queryFn: () => workoutsApi.getPlan(id),
    enabled: !!id,
  });
}

export function useTodayWorkout() {
  return useQuery({
    queryKey: workoutKeys.today(),
    queryFn: () => workoutsApi.getTodayWorkout(),
  });
}

export function useWorkoutHistory(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: workoutKeys.history(params),
    queryFn: () => workoutsApi.getHistory(params),
  });
}

export function useLogWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ManualWorkoutLogData) => workoutsApi.logWorkout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.all });
    },
  });
}
