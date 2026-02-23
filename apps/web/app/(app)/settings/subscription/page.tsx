'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Crown,
  Zap,
  Check,
  X,
  CreditCard,
  Calendar,
  AlertCircle,
  Loader2,
  Gift,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { subscriptionsApi } from '@/lib/api';
import {
  SUBSCRIPTION_TIERS,
  TIER_COMPARISON_HIGHLIGHTS,
  type SubscriptionTier,
} from '@/lib/subscription-features';
import { useLanguage } from '@/lib/i18n';

export default function SubscriptionSettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: subscriptionsApi.getMySubscription,
  });

  const cancelMutation = useMutation({
    mutationFn: (data: { reason?: string; immediate?: boolean }) =>
      subscriptionsApi.cancelSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      setShowCancelDialog(false);
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: subscriptionsApi.reactivateSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });

  const { data: payments } = useQuery({
    queryKey: ['paymentHistory'],
    queryFn: () => subscriptionsApi.getPaymentHistory({ page: 1, limit: 5 }),
    enabled: !!subscription && subscription.tier !== 'FREE',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const tier = (subscription?.tier || 'FREE') as SubscriptionTier;
  const tierInfo = SUBSCRIPTION_TIERS[tier];
  const isPaid = tier !== 'FREE';
  const isCancelled = subscription?.status === 'CANCELLED';
  const highlights = TIER_COMPARISON_HIGHLIGHTS[tier];

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 container max-w-4xl py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/settings"
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{isAr ? 'الاشتراك' : 'Subscription'}</h1>
            <p className="text-muted-foreground">{isAr ? 'إدارة خطتك والفواتير' : 'Manage your plan and billing'}</p>
          </div>
        </div>

        {/* Current Plan Card */}
        <div
          className={cn(
            'rounded-2xl border p-6 mb-8',
            tier === 'PREMIUM' && 'border-blue-500/50 bg-blue-500/5',
            tier === 'PREMIUM_PLUS' && 'border-purple-500/50 bg-purple-500/5',
            tier === 'FREE' && 'border-border/50 bg-muted/20'
          )}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'p-3 rounded-xl',
                  tier === 'PREMIUM' && 'bg-blue-500/20',
                  tier === 'PREMIUM_PLUS' && 'bg-purple-500/20',
                  tier === 'FREE' && 'bg-muted'
                )}
              >
                {tier === 'PREMIUM_PLUS' ? (
                  <Crown className="h-6 w-6 text-purple-500" />
                ) : tier === 'PREMIUM' ? (
                  <Zap className="h-6 w-6 text-blue-500" />
                ) : (
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">{tierInfo.name}</h2>
                <p className="text-sm text-muted-foreground">{tierInfo.tagline}</p>
              </div>
            </div>
            {isPaid && (
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {subscription?.priceEGP || tierInfo.pricing.monthly} {isAr ? 'ج.م' : 'EGP'}
                </p>
                <p className="text-sm text-muted-foreground">
                  /{subscription?.billingCycle === 'yearly' ? (isAr ? 'سنة' : 'year') : (isAr ? 'شهر' : 'month')}
                </p>
              </div>
            )}
          </div>

          {/* Status badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span
              className={cn(
                'px-3 py-1 rounded-full text-sm font-medium',
                subscription?.status === 'ACTIVE' && 'bg-green-500/20 text-green-500',
                subscription?.status === 'CANCELLED' && 'bg-yellow-500/20 text-yellow-500',
                subscription?.status === 'EXPIRED' && 'bg-red-500/20 text-red-500',
                subscription?.status === 'TRIAL' && 'bg-blue-500/20 text-blue-500'
              )}
            >
              {subscription?.status || 'ACTIVE'}
            </span>
            {subscription?.billingCycle && (
              <span className="px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground">
                {subscription.billingCycle === 'yearly'
                  ? (isAr ? 'فوترة سنوية' : 'Annual billing')
                  : (isAr ? 'فوترة شهرية' : 'Monthly billing')}
              </span>
            )}
          </div>

          {/* Dates */}
          {isPaid && (
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-background/50 mb-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{isAr ? 'بدأ' : 'Started'}</p>
                <p className="font-medium">{formatDate(subscription?.startDate || null)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {isCancelled ? (isAr ? 'ينتهي' : 'Ends') : (isAr ? 'يتجدد' : 'Renews')}
                </p>
                <p className="font-medium">{formatDate(subscription?.endDate || null)}</p>
              </div>
            </div>
          )}

          {/* Cancelled warning */}
          {isCancelled && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 mb-6">
              <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-500">{isAr ? 'تم إلغاء الاشتراك' : 'Subscription Cancelled'}</p>
                <p className="text-sm text-muted-foreground">
                  {isAr
                    ? <>وصولك مستمر لحد {formatDate(subscription?.endDate || null)}. تقدر تعيد تفعيل أي وقت قبل كده.</>
                    : <>Your access continues until {formatDate(subscription?.endDate || null)}. You can reactivate anytime before then.</>}
                </p>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="mb-6">
            <p className="text-sm font-medium mb-3">{isAr ? 'مميزاتك:' : 'Your features:'}</p>
            <ul className="space-y-2">
              {highlights.slice(0, 5).map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <Check
                    className={cn(
                      'h-4 w-4',
                      tier === 'PREMIUM' && 'text-blue-500',
                      tier === 'PREMIUM_PLUS' && 'text-purple-500',
                      tier === 'FREE' && 'text-muted-foreground'
                    )}
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {tier === 'FREE' && (
              <Button
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                asChild
              >
                <Link href="/pricing">
                  <Zap className="h-4 w-4 me-2" />
                  {isAr ? 'ترقية لبريميوم' : 'Upgrade to Premium'}
                </Link>
              </Button>
            )}
            {tier === 'PREMIUM' && (
              <Button
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                asChild
              >
                <Link href="/pricing?highlight=premium_plus">
                  <Crown className="h-4 w-4 me-2" />
                  {isAr ? 'ترقية لبريميوم+' : 'Upgrade to Premium+'}
                </Link>
              </Button>
            )}
            {isCancelled && (
              <Button
                onClick={() => reactivateMutation.mutate()}
                disabled={reactivateMutation.isPending}
              >
                {reactivateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 me-2" />
                )}
                {isAr ? 'إعادة تفعيل الاشتراك' : 'Reactivate Subscription'}
              </Button>
            )}
            {isPaid && !isCancelled && (
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(true)}
              >
                {isAr ? 'إلغاء الاشتراك' : 'Cancel Subscription'}
              </Button>
            )}
          </div>
        </div>

        {/* Payment History */}
        {isPaid && payments && payments.data.length > 0 && (
          <div className="rounded-2xl border border-border/50 p-6 mb-8">
            <h3 className="text-lg font-bold mb-4">{isAr ? 'سجل المدفوعات' : 'Payment History'}</h3>
            <div className="space-y-3">
              {payments.data.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{payment.amountEGP} {isAr ? 'ج.م' : 'EGP'}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(payment.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-1 rounded-full text-xs',
                      payment.status === 'completed' && 'bg-green-500/20 text-green-500',
                      payment.status === 'pending' && 'bg-yellow-500/20 text-yellow-500',
                      payment.status === 'failed' && 'bg-red-500/20 text-red-500'
                    )}
                  >
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4" asChild>
              <Link href="/settings/payments">
                {isAr ? 'عرض كل المدفوعات' : 'View all payments'}
                <ChevronRight className="h-4 w-4 ms-1" />
              </Link>
            </Button>
          </div>
        )}

        {/* Gift subscription */}
        <div className="rounded-2xl border border-border/50 p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Gift className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-1">{isAr ? 'إهداء بريميوم' : 'Gift Premium'}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isAr
                  ? 'ساعد صاحبك يوصل لأهدافه بهدية اشتراك بريميوم.'
                  : 'Help a friend achieve their fitness goals with a Premium subscription gift.'}
              </p>
              <Button variant="outline" asChild>
                <Link href="/gift">{isAr ? 'إرسال هدية' : 'Send a Gift'}</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Help */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            {isAr ? 'عندك أسئلة عن اشتراكك؟' : 'Questions about your subscription?'}{' '}
            <Link href="/support" className="text-primary hover:underline">
              {isAr ? 'تواصل مع الدعم' : 'Contact support'}
            </Link>
          </p>
        </div>

        {/* Cancel Dialog */}
        {showCancelDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
              <h3 className="text-lg font-bold mb-2">{isAr ? 'إلغاء الاشتراك؟' : 'Cancel Subscription?'}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isAr
                  ? 'وصولك هيفضل مستمر لحد نهاية فترة الفوترة. تقدر تعيد تفعيل أي وقت قبل كده.'
                  : 'Your access will continue until the end of your billing period. You can reactivate anytime before then.'}
              </p>

              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">
                  {isAr ? 'ساعدنا نتحسن - ليه بتلغي؟ (اختياري)' : 'Help us improve - why are you cancelling? (optional)'}
                </label>
                <textarea
                  className="w-full p-3 rounded-xl bg-muted/50 border border-border/50 text-sm resize-none"
                  rows={3}
                  placeholder={isAr ? 'قولنا نقدر نعمل إيه أحسن...' : 'Tell us what we could do better...'}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCancelDialog(false)}
                >
                  {isAr ? 'الإبقاء على الاشتراك' : 'Keep Subscription'}
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() =>
                    cancelMutation.mutate({ reason: cancelReason })
                  }
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    isAr ? 'إلغاء الاشتراك' : 'Cancel Subscription'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
