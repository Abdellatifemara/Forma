'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Lock, Zap, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFeatureAccess, useSubscription } from '@/hooks/use-subscription';
import { SUBSCRIPTION_TIERS, type SubscriptionTier } from '@/lib/subscription-features';

interface FeatureGateProps {
  featureId: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
  className?: string;
  blurContent?: boolean;
}

/**
 * Component to gate features based on subscription tier
 *
 * Usage:
 * <FeatureGate featureId="ai_form_checker">
 *   <FormCheckerComponent />
 * </FeatureGate>
 */
export function FeatureGate({
  featureId,
  children,
  fallback,
  showUpgrade = true,
  className,
  blurContent = false,
}: FeatureGateProps) {
  const { isAvailable, isLoading, minimumTier, minimumTierInfo } = useFeatureAccess(featureId);

  if (isLoading) {
    return (
      <div className={cn('animate-pulse bg-muted/50 rounded-lg', className)}>
        {blurContent ? children : null}
      </div>
    );
  }

  if (isAvailable) {
    return <>{children}</>;
  }

  // Feature not available
  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  // Show upgrade prompt
  return (
    <div className={cn('relative', className)}>
      {blurContent && (
        <div className="blur-sm pointer-events-none select-none opacity-50">
          {children}
        </div>
      )}
      <UpgradeOverlay tier={minimumTier || 'PREMIUM'} blurred={blurContent} />
    </div>
  );
}

interface UpgradeOverlayProps {
  tier: SubscriptionTier;
  blurred?: boolean;
}

function UpgradeOverlay({ tier, blurred }: UpgradeOverlayProps) {
  const tierInfo = SUBSCRIPTION_TIERS[tier];
  const isPremiumPlus = tier === 'PREMIUM_PLUS';

  return (
    <div
      className={cn(
        'rounded-xl border p-6 text-center',
        blurred && 'absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm',
        !blurred && 'bg-muted/30',
        isPremiumPlus ? 'border-purple-500/30' : 'border-cyan-500/30'
      )}
    >
      <div
        className={cn(
          'mx-auto mb-4 p-3 rounded-full w-fit',
          isPremiumPlus ? 'bg-purple-500/10' : 'bg-cyan-500/10'
        )}
      >
        {isPremiumPlus ? (
          <Crown className="h-8 w-8 text-purple-500" />
        ) : (
          <Zap className="h-8 w-8 text-cyan-500" />
        )}
      </div>
      <h3 className="font-bold text-lg mb-2">Upgrade to {tierInfo.name}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
        {tierInfo.tagline}
      </p>
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Button
          className={cn(
            isPremiumPlus
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
          )}
          asChild
        >
          <Link href={`/pricing?highlight=${tier.toLowerCase()}`}>
            <Sparkles className="h-4 w-4 mr-2" />
            Upgrade Now
          </Link>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Starting at {tierInfo.pricing.monthly} EGP/month
      </p>
    </div>
  );
}

/**
 * Simple component to show feature limit status
 */
interface FeatureLimitBadgeProps {
  featureId: string;
  className?: string;
}

export function FeatureLimitBadge({ featureId, className }: FeatureLimitBadgeProps) {
  const { isAvailable, limit } = useFeatureAccess(featureId);

  if (!isAvailable) {
    return (
      <span className={cn('text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground', className)}>
        <Lock className="h-3 w-3 inline mr-1" />
        Locked
      </span>
    );
  }

  if (limit === 'unlimited') {
    return (
      <span className={cn('text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500', className)}>
        Unlimited
      </span>
    );
  }

  if (typeof limit === 'number') {
    return (
      <span className={cn('text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary', className)}>
        {limit}/mo
      </span>
    );
  }

  return null;
}

/**
 * Component to render different content based on tier
 */
interface TierContentProps {
  free?: ReactNode;
  premium?: ReactNode;
  premiumPlus?: ReactNode;
  fallback?: ReactNode;
}

export function TierContent({ free, premium, premiumPlus, fallback }: TierContentProps) {
  const { tier, isLoading } = useSubscription();

  if (isLoading) {
    return <>{fallback}</>;
  }

  switch (tier) {
    case 'PREMIUM_PLUS':
      return <>{premiumPlus || premium || free || fallback}</>;
    case 'PREMIUM':
      return <>{premium || free || fallback}</>;
    case 'FREE':
    default:
      return <>{free || fallback}</>;
  }
}
