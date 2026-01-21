'use client';

import { useQuery } from '@tanstack/react-query';
import { statsApi } from '@/lib/api';

export const statsKeys = {
  all: ['stats'] as const,
  weekly: () => [...statsKeys.all, 'weekly'] as const,
  muscleBalance: (weeks?: number) => [...statsKeys.all, 'muscle-balance', weeks] as const,
  volume: (weeks?: number) => [...statsKeys.all, 'volume', weeks] as const,
};

export function useWeeklySummary() {
  return useQuery({
    queryKey: statsKeys.weekly(),
    queryFn: () => statsApi.getWeeklySummary(),
  });
}

export function useMuscleBalance(weeks?: number) {
  return useQuery({
    queryKey: statsKeys.muscleBalance(weeks),
    queryFn: () => statsApi.getMuscleBalance(weeks),
  });
}

export function useVolumeLoad(weeks?: number) {
  return useQuery({
    queryKey: statsKeys.volume(weeks),
    queryFn: () => statsApi.getVolumeLoad(weeks),
  });
}
