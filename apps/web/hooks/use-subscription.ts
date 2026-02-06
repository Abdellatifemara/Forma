import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import {
  hasFeature,
  getFeatureLimit,
  canUpgrade,
  getNextTier,
  getMinimumTierForFeature,
  SUBSCRIPTION_TIERS,
  type SubscriptionTier,
} from '@/lib/subscription-features';

interface UserSubscription {
  tier: SubscriptionTier;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'TRIAL';
  currentPeriodEnd?: string;
}

/**
 * Hook to manage subscription state and feature access
 */
export function useSubscription() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: usersApi.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Map old subscription format to new, or default to FREE
  const mapTier = (sub: string | undefined): SubscriptionTier => {
    if (!sub) return 'FREE';
    const tierMap: Record<string, SubscriptionTier> = {
      'free': 'FREE',
      'pro': 'PREMIUM',
      'elite': 'PREMIUM_PLUS',
      'FREE': 'FREE',
      'PREMIUM': 'PREMIUM',
      'PREMIUM_PLUS': 'PREMIUM_PLUS',
    };
    return tierMap[sub] || 'FREE';
  };

  const tier = mapTier(user?.subscription as string | undefined);
  const tierInfo = SUBSCRIPTION_TIERS[tier];
  const subscription: UserSubscription = {
    tier,
    status: 'ACTIVE',
  };

  return {
    tier,
    tierInfo,
    subscription,
    isLoading,
    isPremium: tier === 'PREMIUM' || tier === 'PREMIUM_PLUS',
    isPremiumPlus: tier === 'PREMIUM_PLUS',
    isFree: tier === 'FREE',
    canUpgrade: canUpgrade(tier),
    nextTier: getNextTier(tier),
    nextTierInfo: getNextTier(tier) ? SUBSCRIPTION_TIERS[getNextTier(tier)!] : null,
  };
}

/**
 * Hook to check if user has access to a specific feature
 */
export function useFeatureAccess(featureId: string) {
  const { tier, isLoading } = useSubscription();

  const isAvailable = hasFeature(featureId, tier);
  const limit = getFeatureLimit(featureId, tier);
  const minimumTier = getMinimumTierForFeature(featureId);
  const upgradeRequired = !isAvailable && minimumTier;

  return {
    isAvailable,
    isLoading,
    limit,
    minimumTier,
    upgradeRequired,
    minimumTierInfo: minimumTier ? SUBSCRIPTION_TIERS[minimumTier] : null,
  };
}

/**
 * Hook to check multiple features at once
 */
export function useFeatureAccessBulk(featureIds: string[]) {
  const { tier, isLoading } = useSubscription();

  const features = featureIds.reduce(
    (acc, featureId) => {
      acc[featureId] = {
        isAvailable: hasFeature(featureId, tier),
        limit: getFeatureLimit(featureId, tier),
        minimumTier: getMinimumTierForFeature(featureId),
      };
      return acc;
    },
    {} as Record<
      string,
      {
        isAvailable: boolean;
        limit: number | 'unlimited' | null;
        minimumTier: SubscriptionTier | null;
      }
    >
  );

  return {
    features,
    isLoading,
    tier,
  };
}

/**
 * Check if user can use a limited feature (hasn't hit their limit)
 * This would need backend tracking of usage - just a placeholder interface
 */
export function useFeatureUsage(featureId: string) {
  const { tier, isLoading: tierLoading } = useSubscription();
  const limit = getFeatureLimit(featureId, tier);

  // TODO: Fetch actual usage from API
  const { data: usage, isLoading: usageLoading } = useQuery({
    queryKey: ['featureUsage', featureId],
    queryFn: async () => {
      // Placeholder - would fetch from API
      return { used: 0, resetDate: new Date().toISOString() };
    },
    enabled: limit !== null && limit !== 'unlimited',
    staleTime: 60 * 1000, // 1 minute
  });

  const isUnlimited = limit === 'unlimited';
  const remaining = isUnlimited
    ? Infinity
    : typeof limit === 'number'
      ? Math.max(0, limit - (usage?.used || 0))
      : 0;
  const canUse = isUnlimited || remaining > 0;

  return {
    isLoading: tierLoading || usageLoading,
    limit,
    used: usage?.used || 0,
    remaining,
    canUse,
    isUnlimited,
    resetDate: usage?.resetDate,
  };
}
