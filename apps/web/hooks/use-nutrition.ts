'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nutritionApi, type MealLogData } from '@/lib/api';

export const nutritionKeys = {
  all: ['nutrition'] as const,
  foods: (query: string) => [...nutritionKeys.all, 'foods', query] as const,
  daily: (date?: string) => [...nutritionKeys.all, 'daily', date] as const,
  weekly: () => [...nutritionKeys.all, 'weekly'] as const,
};

export function useFoodSearch(query: string) {
  return useQuery({
    queryKey: nutritionKeys.foods(query),
    queryFn: () => nutritionApi.searchFoods(query),
    enabled: query.length >= 2,
  });
}

export function useDailyNutrition(date?: string) {
  return useQuery({
    queryKey: nutritionKeys.daily(date),
    queryFn: () => nutritionApi.getDailyLog(date),
  });
}

export function useWeeklyNutrition() {
  return useQuery({
    queryKey: nutritionKeys.weekly(),
    queryFn: () => nutritionApi.getWeeklySummary(),
  });
}

export function useLogMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MealLogData) => nutritionApi.logMeal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutritionKeys.all });
    },
  });
}
