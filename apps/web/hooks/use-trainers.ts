'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainersApi, type TrainerSearchParams, type TrainerApplicationData } from '@/lib/api';

export const trainerKeys = {
  all: ['trainers'] as const,
  marketplace: (params?: TrainerSearchParams) => [...trainerKeys.all, 'marketplace', params] as const,
  detail: (id: string) => [...trainerKeys.all, 'detail', id] as const,
  clients: () => [...trainerKeys.all, 'clients'] as const,
  earnings: (month?: string) => [...trainerKeys.all, 'earnings', month] as const,
};

export function useTrainerMarketplace(params?: TrainerSearchParams) {
  return useQuery({
    queryKey: trainerKeys.marketplace(params),
    queryFn: () => trainersApi.getMarketplace(params),
  });
}

export function useTrainer(id: string) {
  return useQuery({
    queryKey: trainerKeys.detail(id),
    queryFn: () => trainersApi.getById(id),
    enabled: !!id,
  });
}

export function useTrainerClients() {
  return useQuery({
    queryKey: trainerKeys.clients(),
    queryFn: () => trainersApi.getClients(),
  });
}

export function useTrainerEarnings(month?: number, year?: number) {
  return useQuery({
    queryKey: trainerKeys.earnings(month?.toString()),
    queryFn: () => trainersApi.getEarnings({ month, year }),
  });
}

export function useApplyAsTrainer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TrainerApplicationData) => trainersApi.apply(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainerKeys.all });
    },
  });
}
