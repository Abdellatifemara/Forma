import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainersApi } from '../services/api';

// Query keys
export const trainerKeys = {
  all: ['trainers'] as const,
  list: (params?: {
    specialization?: string;
    minRating?: number;
    page?: number;
    limit?: number;
  }) => [...trainerKeys.all, 'list', params] as const,
  detail: (id: string) => [...trainerKeys.all, 'detail', id] as const,
  programs: (trainerId: string) => [...trainerKeys.all, 'programs', trainerId] as const,
};

// Get all trainers
export function useTrainers(params?: {
  specialization?: string;
  minRating?: number;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: trainerKeys.list(params),
    queryFn: () => trainersApi.getAll(params),
  });
}

// Get single trainer
export function useTrainer(id: string) {
  return useQuery({
    queryKey: trainerKeys.detail(id),
    queryFn: () => trainersApi.getOne(id),
    enabled: !!id,
  });
}

// Get trainer programs
export function useTrainerPrograms(trainerId: string) {
  return useQuery({
    queryKey: trainerKeys.programs(trainerId),
    queryFn: () => trainersApi.getPrograms(trainerId),
    enabled: !!trainerId,
  });
}

// Subscribe to trainer mutation
export function useSubscribeToTrainer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ trainerId, programId }: { trainerId: string; programId: string }) =>
      trainersApi.subscribe(trainerId, programId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainerKeys.all });
    },
  });
}
