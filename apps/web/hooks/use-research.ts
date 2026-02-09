'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { researchApi, adminResearchApi, AIUsageTrackData } from '@/lib/api';

// ============ Research Tests Hooks ============

/**
 * Hook to get all available tests
 */
export function useResearchTests() {
  return useQuery({
    queryKey: ['researchTests'],
    queryFn: () => researchApi.getTests(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get a specific test by code
 */
export function useResearchTest(code: string) {
  return useQuery({
    queryKey: ['researchTest', code],
    queryFn: () => researchApi.getTest(code),
    enabled: !!code,
  });
}

/**
 * Hook to submit test responses
 */
export function useSubmitTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ testId, responses }: { testId: string; responses: Record<string, unknown> }) =>
      researchApi.submitTest(testId, responses),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['researchTests'] });
      queryClient.invalidateQueries({ queryKey: ['researchTest'] });
    },
  });
}

// ============ Survey Hooks ============

/**
 * Hook to get available survey for a trigger event
 */
export function useAvailableSurvey(trigger?: string) {
  return useQuery({
    queryKey: ['availableSurvey', trigger],
    queryFn: () => trigger ? researchApi.getAvailableSurvey(trigger) : null,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    enabled: !!trigger, // Only run when trigger exists
  });
}

/**
 * Hook to submit survey responses
 */
export function useSubmitSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ surveyId, responses }: { surveyId: string; responses: Record<string, unknown> }) =>
      researchApi.submitSurvey(surveyId, responses),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableSurvey'] });
    },
  });
}

/**
 * Hook to track AI usage events
 */
export function useTrackAIUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AIUsageTrackData) => researchApi.trackAIUsage(data),
    onSuccess: () => {
      // Refresh AI usage stats after tracking
      queryClient.invalidateQueries({ queryKey: ['aiUsage'] });
    },
  });
}

/**
 * Hook to get user's AI usage statistics
 */
export function useAIUsage() {
  return useQuery({
    queryKey: ['aiUsage'],
    queryFn: () => researchApi.getMyAIUsage(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to check if user can use a specific AI feature
 */
export function useCanUseAIFeature(featureId: string) {
  return useQuery({
    queryKey: ['canUseAI', featureId],
    queryFn: () => researchApi.canUseAIFeature(featureId),
    staleTime: 1000 * 60, // 1 minute
    enabled: !!featureId,
  });
}

// ============ Admin Hooks ============

/**
 * Hook to get survey results (admin only)
 */
export function useSurveyResults(code: string) {
  return useQuery({
    queryKey: ['surveyResults', code],
    queryFn: () => adminResearchApi.getSurveyResults(code),
    enabled: !!code,
  });
}

/**
 * Hook to get AI metrics (admin only)
 */
export function useAIMetrics(days: number = 30) {
  return useQuery({
    queryKey: ['aiMetrics', days],
    queryFn: () => adminResearchApi.getAIMetrics(days),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get limit hit analysis (admin only)
 */
export function useLimitAnalysis() {
  return useQuery({
    queryKey: ['limitAnalysis'],
    queryFn: () => adminResearchApi.getLimitAnalysis(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to get query patterns (admin only)
 */
export function useQueryPatterns() {
  return useQuery({
    queryKey: ['queryPatterns'],
    queryFn: () => adminResearchApi.getQueryPatterns(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to seed surveys (admin only)
 */
export function useSeedSurveys() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => adminResearchApi.seedSurveys(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableSurvey'] });
    },
  });
}
