'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressApi, type MeasurementsData } from '@/lib/api';

export const progressKeys = {
  all: ['progress'] as const,
  weight: (days?: number) => [...progressKeys.all, 'weight', days] as const,
  prs: () => [...progressKeys.all, 'prs'] as const,
};

export function useWeightHistory(days?: number) {
  return useQuery({
    queryKey: progressKeys.weight(days),
    queryFn: () => progressApi.getWeightHistory(days ? { days } : undefined),
  });
}

export function useStrengthPRs() {
  return useQuery({
    queryKey: progressKeys.prs(),
    queryFn: () => progressApi.getStrengthPRs(),
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
