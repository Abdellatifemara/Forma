'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressApi, type MeasurementsData } from '@/lib/api';

export const progressKeys = {
  all: ['progress'] as const,
  weight: (days?: number) => [...progressKeys.all, 'weight', days] as const,
  measurements: (limit?: number) => [...progressKeys.all, 'measurements', limit] as const,
  prs: () => [...progressKeys.all, 'prs'] as const,
  latest: () => [...progressKeys.all, 'latest'] as const,
};

export function useWeightHistory(days?: number) {
  return useQuery({
    queryKey: progressKeys.weight(days),
    queryFn: () => progressApi.getWeightHistory(days ? { days } : undefined),
  });
}

export function useMeasurementsHistory(limit?: number) {
  return useQuery({
    queryKey: progressKeys.measurements(limit),
    queryFn: () => progressApi.getMeasurementsHistory(limit ? { limit } : undefined),
  });
}

export function useStrengthPRs() {
  return useQuery({
    queryKey: progressKeys.prs(),
    queryFn: () => progressApi.getStrengthPRs(),
  });
}

export function useLatestProgress() {
  return useQuery({
    queryKey: progressKeys.latest(),
    queryFn: () => progressApi.getLatest(),
  });
}

export function useLogWeight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { weight: number; date?: string }) =>
      progressApi.logWeight(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: progressKeys.all });
    },
  });
}

export function useLogMeasurements() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MeasurementsData) => progressApi.logMeasurements(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: progressKeys.all });
    },
  });
}
