import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressApi } from '../services/api';

// Query keys
export const progressKeys = {
  all: ['progress'] as const,
  weight: (params?: { days?: number }) => [...progressKeys.all, 'weight', params] as const,
  measurements: () => [...progressKeys.all, 'measurements'] as const,
  photos: () => [...progressKeys.all, 'photos'] as const,
  records: () => [...progressKeys.all, 'records'] as const,
};

// Get weight history
export function useWeightHistory(params?: { days?: number }) {
  return useQuery({
    queryKey: progressKeys.weight(params),
    queryFn: () => progressApi.getWeightHistory(params),
  });
}

// Get body measurements
export function useMeasurements() {
  return useQuery({
    queryKey: progressKeys.measurements(),
    queryFn: () => progressApi.getMeasurements(),
  });
}

// Get progress photos
export function useProgressPhotos() {
  return useQuery({
    queryKey: progressKeys.photos(),
    queryFn: () => progressApi.getPhotos(),
  });
}

// Get personal records
export function usePersonalRecords() {
  return useQuery({
    queryKey: progressKeys.records(),
    queryFn: () => progressApi.getPersonalRecords(),
  });
}

// Log weight mutation
export function useLogWeight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { weight: number; unit?: 'kg' | 'lbs'; notes?: string }) =>
      progressApi.logWeight(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: progressKeys.weight() });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

// Log measurements mutation
export function useLogMeasurements() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      chest?: number;
      waist?: number;
      hips?: number;
      thighs?: number;
      arms?: number;
      neck?: number;
      bodyFatPercentage?: number;
    }) => progressApi.logMeasurements(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: progressKeys.measurements() });
    },
  });
}

// Upload progress photo mutation
export function useUploadProgressPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) => progressApi.uploadPhoto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: progressKeys.photos() });
    },
  });
}
