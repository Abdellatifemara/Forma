'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nutritionApi, type MealLogData } from '@/lib/api';

export const nutritionKeys = {
  all: ['nutrition'] as const,
  foods: (query: string, category?: string) => [...nutritionKeys.all, 'foods', query, category] as const,
  categories: () => [...nutritionKeys.all, 'categories'] as const,
  daily: (date?: string) => [...nutritionKeys.all, 'daily', date] as const,
  weekly: () => [...nutritionKeys.all, 'weekly'] as const,
};

export function useFoodSearch(query: string, category?: string) {
  return useQuery({
    queryKey: nutritionKeys.foods(query, category),
    queryFn: () => nutritionApi.searchFoods(query, category),
    enabled: query.length >= 2 || !!category,
  });
}

export function useFoodCategories() {
  return useQuery({
    queryKey: nutritionKeys.categories(),
    queryFn: () => nutritionApi.getCategories(),
    staleTime: 60 * 60 * 1000, // 1 hour
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
