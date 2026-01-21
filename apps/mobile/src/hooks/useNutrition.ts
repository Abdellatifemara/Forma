import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nutritionApi } from '../services/api';

// Query keys
export const nutritionKeys = {
  all: ['nutrition'] as const,
  foods: () => [...nutritionKeys.all, 'foods'] as const,
  food: (id: string) => [...nutritionKeys.foods(), id] as const,
  search: (query: string) => [...nutritionKeys.foods(), 'search', query] as const,
  daily: (date?: string) => [...nutritionKeys.all, 'daily', date] as const,
  weekly: () => [...nutritionKeys.all, 'weekly'] as const,
};

// Search foods
export function useFoodSearch(query: string) {
  return useQuery({
    queryKey: nutritionKeys.search(query),
    queryFn: () => nutritionApi.searchFoods(query),
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

// Get single food
export function useFood(id: string) {
  return useQuery({
    queryKey: nutritionKeys.food(id),
    queryFn: () => nutritionApi.getFood(id),
    enabled: !!id,
  });
}

// Get daily nutrition log
export function useDailyNutrition(date?: string) {
  return useQuery({
    queryKey: nutritionKeys.daily(date),
    queryFn: () => nutritionApi.getDailyLog(date),
  });
}

// Get weekly summary
export function useWeeklyNutrition() {
  return useQuery({
    queryKey: nutritionKeys.weekly(),
    queryFn: () => nutritionApi.getWeeklySummary(),
  });
}

// Log meal mutation
export function useLogMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      foods: Array<{ foodId: string; servings: number }>;
      notes?: string;
    }) => nutritionApi.logMeal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutritionKeys.daily() });
      queryClient.invalidateQueries({ queryKey: nutritionKeys.weekly() });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
