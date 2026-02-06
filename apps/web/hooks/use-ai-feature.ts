'use client';

import { useState, useCallback } from 'react';
import { useCanUseAIFeature, useTrackAIUsage, useAIUsage } from './use-research';
import type { AIQueryType } from '@/lib/api';

interface UseAIFeatureOptions {
  featureId: string;
  onLimitHit?: () => void;
}

interface AIQueryOptions {
  queryType: AIQueryType;
  queryText?: string;
}

/**
 * Hook for using AI features with automatic tracking and limit checking
 */
export function useAIFeature({ featureId, onLimitHit }: UseAIFeatureOptions) {
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const { data: canUseData, refetch: refetchCanUse } = useCanUseAIFeature(featureId);
  const { data: usageData, refetch: refetchUsage } = useAIUsage();
  const trackMutation = useTrackAIUsage();

  const canUse = canUseData?.canUse ?? true;
  const currentUsage = usageData?.currentPeriodUsage ?? { used: 0, limit: 0, remaining: 0 };

  /**
   * Execute an AI query with tracking
   * Returns true if query was allowed, false if limit hit
   */
  const executeQuery = useCallback(async <T>(
    queryFn: () => Promise<T>,
    options: AIQueryOptions
  ): Promise<{ success: boolean; result?: T; error?: Error }> => {
    // First check if user can use the feature
    await refetchCanUse();
    if (!canUseData?.canUse) {
      setIsLimitModalOpen(true);
      onLimitHit?.();
      return { success: false };
    }

    const startTime = Date.now();
    let successful = true;
    let result: T | undefined;
    let error: Error | undefined;

    try {
      result = await queryFn();
    } catch (e) {
      successful = false;
      error = e instanceof Error ? e : new Error('Unknown error');
    }

    const responseTimeMs = Date.now() - startTime;

    // Track the usage
    await trackMutation.mutateAsync({
      featureId,
      queryType: options.queryType,
      queryText: options.queryText,
      responseTimeMs,
      successful,
    });

    // Refresh usage data
    await refetchUsage();

    return { success: successful, result, error };
  }, [canUseData, featureId, onLimitHit, refetchCanUse, refetchUsage, trackMutation]);

  /**
   * Rate the last AI query
   */
  const rateSatisfaction = useCallback(async (satisfaction: number) => {
    await trackMutation.mutateAsync({
      featureId,
      queryType: 'general_question', // Will be overwritten by backend
      satisfaction,
    });
  }, [featureId, trackMutation]);

  const closeLimitModal = useCallback(() => {
    setIsLimitModalOpen(false);
  }, []);

  return {
    canUse,
    isLimitModalOpen,
    closeLimitModal,
    currentUsage,
    executeQuery,
    rateSatisfaction,
    isTracking: trackMutation.isPending,
  };
}

/**
 * Simple hook just for checking AI access
 */
export function useAIAccess(featureId: string) {
  const { data, isLoading, error } = useCanUseAIFeature(featureId);
  const { data: usageData } = useAIUsage();

  return {
    canUse: data?.canUse ?? false,
    isLoading,
    error,
    usage: usageData?.currentPeriodUsage ?? { used: 0, limit: 0, remaining: 0 },
  };
}
