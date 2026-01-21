import { useQuery } from '@tanstack/react-query';
import { statsApi } from '../services/api';

// Query keys
export const statsKeys = {
  all: ['stats'] as const,
  dashboard: () => [...statsKeys.all, 'dashboard'] as const,
  weekly: () => [...statsKeys.all, 'weekly'] as const,
  streaks: () => [...statsKeys.all, 'streaks'] as const,
};

// Get dashboard stats
export function useDashboardStats() {
  return useQuery({
    queryKey: statsKeys.dashboard(),
    queryFn: () => statsApi.getDashboard(),
  });
}

// Get weekly stats
export function useWeeklyStats() {
  return useQuery({
    queryKey: statsKeys.weekly(),
    queryFn: () => statsApi.getWeeklyStats(),
  });
}

// Get streaks
export function useStreaks() {
  return useQuery({
    queryKey: statsKeys.streaks(),
    queryFn: () => statsApi.getStreaks(),
  });
}
