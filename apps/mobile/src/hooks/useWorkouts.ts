import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutsApi } from '../services/api';

// Query keys
export const workoutKeys = {
  all: ['workouts'] as const,
  plans: () => [...workoutKeys.all, 'plans'] as const,
  plan: (id: string) => [...workoutKeys.plans(), id] as const,
  today: () => [...workoutKeys.all, 'today'] as const,
  workout: (id: string) => [...workoutKeys.all, id] as const,
  history: (params?: { page?: number; limit?: number }) =>
    [...workoutKeys.all, 'history', params] as const,
};

// Get all workout plans
export function useWorkoutPlans() {
  return useQuery({
    queryKey: workoutKeys.plans(),
    queryFn: () => workoutsApi.getPlans(),
  });
}

// Get single workout plan
export function useWorkoutPlan(id: string) {
  return useQuery({
    queryKey: workoutKeys.plan(id),
    queryFn: () => workoutsApi.getPlan(id),
    enabled: !!id,
  });
}

// Get today's workout
export function useTodayWorkout() {
  return useQuery({
    queryKey: workoutKeys.today(),
    queryFn: () => workoutsApi.getTodayWorkout(),
  });
}

// Get single workout
export function useWorkout(id: string) {
  return useQuery({
    queryKey: workoutKeys.workout(id),
    queryFn: () => workoutsApi.getWorkout(id),
    enabled: !!id,
  });
}

// Get workout history
export function useWorkoutHistory(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: workoutKeys.history(params),
    queryFn: () => workoutsApi.getHistory(params),
  });
}

// Log workout mutation
export function useLogWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
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
    }) => workoutsApi.logWorkout(data),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: workoutKeys.today() });
      queryClient.invalidateQueries({ queryKey: workoutKeys.history() });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
