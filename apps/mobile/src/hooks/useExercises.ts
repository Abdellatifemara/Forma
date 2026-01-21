import { useQuery } from '@tanstack/react-query';
import { exercisesApi } from '../services/api';

// Query keys
export const exerciseKeys = {
  all: ['exercises'] as const,
  list: (params?: {
    muscleGroup?: string;
    equipment?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => [...exerciseKeys.all, 'list', params] as const,
  detail: (id: string) => [...exerciseKeys.all, 'detail', id] as const,
  muscleGroups: () => [...exerciseKeys.all, 'muscleGroups'] as const,
};

// Get all exercises with filters
export function useExercises(params?: {
  muscleGroup?: string;
  equipment?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: exerciseKeys.list(params),
    queryFn: () => exercisesApi.getAll(params),
  });
}

// Get single exercise
export function useExercise(id: string) {
  return useQuery({
    queryKey: exerciseKeys.detail(id),
    queryFn: () => exercisesApi.getOne(id),
    enabled: !!id,
  });
}

// Get muscle groups
export function useMuscleGroups() {
  return useQuery({
    queryKey: exerciseKeys.muscleGroups(),
    queryFn: () => exercisesApi.getMuscleGroups(),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}
