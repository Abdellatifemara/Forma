'use client';

import { useQuery } from '@tanstack/react-query';
import { exercisesApi, type ExerciseSearchParams } from '@/lib/api';

export const exerciseKeys = {
  all: ['exercises'] as const,
  search: (params: ExerciseSearchParams) => [...exerciseKeys.all, 'search', params] as const,
  detail: (id: string) => [...exerciseKeys.all, 'detail', id] as const,
  byMuscle: (muscle: string) => [...exerciseKeys.all, 'muscle', muscle] as const,
};

export function useExerciseSearch(params: ExerciseSearchParams) {
  return useQuery({
    queryKey: exerciseKeys.search(params),
    queryFn: () => exercisesApi.search(params),
    enabled: !!(params.query || params.muscle || params.equipment),
  });
}

export function useExercise(id: string) {
  return useQuery({
    queryKey: exerciseKeys.detail(id),
    queryFn: () => exercisesApi.getById(id),
    enabled: !!id,
  });
}

export function useExercisesByMuscle(muscle: string) {
  return useQuery({
    queryKey: exerciseKeys.byMuscle(muscle),
    queryFn: () => exercisesApi.getByMuscle(muscle),
    enabled: !!muscle,
  });
}
