'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Building2,
  Store,
  Check,
  Loader2,
  Shield,
  Zap,
  Crown,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { paymentsApi } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import {
  SUBSCRIPTION_TIERS,
  TIER_COMPARISON_HIGHLIGHTS,
  type SubscriptionTier,
} from '@/lib/subscription-features';

const PAYMENT_METHOD_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  card: CreditCard,
  wallet: Smartphone,
  fawry: Store,
  kiosk: Building2,
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const plan = (searchParams.get('plan')?.toUpperCase() || 'PREMIUM') as SubscriptionTier;
  const billing = (searchParams.get('billing') || 'monthly') as 'monthly' | 'yearly';

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showIframe, setShowIframe] = useState(false);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const tierInfo = SUBSCRIPTION_TIERS[plan] || SUBSCRIPTION_TIERS.PREMIUM;
  const price = billing === 'yearly' ? tierInfo.pricing.yearly : tierInfo.pricing.monthly;
  const highlights = TIER_COMPARISON_HIGHLIGHTS[plan] || TIER_COMPARISON_HIGHLIGHTS.PREMIUM;

  // Fetch payment methods
  const { data: paymentMethods, isLoading: methodsLoading } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: paymentsApi.getPaymentMethods,
  });

  // Create payment intent mutation
  const createPaymentMutation = useMutation({
    mutationFn: paymentsApi.createPaymentIntent,
    onSuccess: (data) => {
      setPaymentId(data.id);
      setIframeUrl(data.iframeUrl);
      setShowIframe(true);
    },
  });

  // Poll payment status when iframe is shown
  const { data: paymentStatus } = useQuery({
    queryKey: ['paymentStatus', paymentId],
    queryFn: () => paymentsApi.getPaymentStatus(paymentId!),
    enabled: !!paymentId && showIframe,
    refetchInterval: 3000, // Poll every 3 seconds
  });

  // Handle successful payment
  useEffect(() => {
    if (paymentStatus?.status === 'completed') {
      router.push('/checkout/success');
    } else if (paymentStatus?.status === 'failed') {
      setShowIframe(false);
      setIframeUrl(null);
    }
  }, [paymentStatus, router]);

  const handleProceedToPayment = () => {
    if (!selectedMethod) return;

    createPaymentMutation.mutate({
      amountEGP: price,
      description: `${tierInfo.name} Subscription (${billing})`,
      paymentMethod: selectedMethod as 'card' | 'wallet' | 'fawry' | 'kiosk',
      metadata: {
        type: 'subscription',
      },
    });
  };

  if (plan === 'FREE') {
    router.push('/signup');
    return null;
  }

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
            href="/pricing"
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{t.checkout.title}</h1>
            <p className="text-muted-foreground">{t.checkout.subtitle}</p>
          </div>
        </div>

        {showIframe && iframeUrl ? (
          // Payment iframe
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">{t.checkout.securePayment}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowIframe(false);
                  setIframeUrl(null);
                }}
              >
                {t.checkout.cancel}
              </Button>
            </div>
            <iframe
              src={iframeUrl}
              className="w-full h-[600px] border-0"
              title="Payment"
            />
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div
              className={cn(
                'rounded-2xl border p-6 h-fit',
                plan === 'PREMIUM' && 'border-blue-500/50 bg-blue-500/5',
                plan === 'PREMIUM_PLUS' && 'border-purple-500/50 bg-purple-500/5'
              )}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={cn(
                    'p-3 rounded-xl',
                    plan === 'PREMIUM' && 'bg-blue-500/20',
                    plan === 'PREMIUM_PLUS' && 'bg-purple-500/20'
                  )}
                >
                  {plan === 'PREMIUM_PLUS' ? (
                    <Crown className="h-6 w-6 text-purple-500" />
                  ) : (
                    <Zap className="h-6 w-6 text-blue-500" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{tierInfo.name}</h2>
                  <p className="text-sm text-muted-foreground">{tierInfo.tagline}</p>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-6">
                {highlights.slice(0, 6).map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <Check
                      className={cn(
                        'h-4 w-4',
                        plan === 'PREMIUM' && 'text-blue-500',
                        plan === 'PREMIUM_PLUS' && 'text-purple-500'
                      )}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Billing toggle */}
              <div className="p-4 rounded-xl bg-background/50 mb-6">
                <p className="text-sm font-medium mb-3">{t.checkout.billingPeriod}</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/checkout?plan=${plan.toLowerCase()}&billing=monthly`}
                    className={cn(
                      'p-3 rounded-lg border text-center transition-all',
                      billing === 'monthly'
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 hover:border-border'
                    )}
                  >
                    <p className="font-bold">{tierInfo.pricing.monthly} {t.checkout.currency}</p>
                    <p className="text-xs text-muted-foreground">{t.checkout.monthly}</p>
                  </Link>
                  <Link
                    href={`/checkout?plan=${plan.toLowerCase()}&billing=yearly`}
                    className={cn(
                      'p-3 rounded-lg border text-center transition-all relative',
                      billing === 'yearly'
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 hover:border-border'
                    )}
                  >
                    <span className="absolute -top-2 right-2 px-2 py-0.5 rounded-full bg-green-500 text-white text-xs">
                      {plan === 'PREMIUM' ? t.checkout.savePremium : t.checkout.savePremiumPlus}
                    </span>
                    <p className="font-bold">{tierInfo.pricing.yearly} {t.checkout.currency}</p>
                    <p className="text-xs text-muted-foreground">{t.checkout.yearly}</p>
                  </Link>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                <span className="font-medium">{t.checkout.total}</span>
                <div className="text-right">
                  <p className="text-2xl font-bold">{price} {t.checkout.currency}</p>
                  <p className="text-xs text-muted-foreground">
                    {billing === 'yearly' ? t.checkout.perYear : t.checkout.perMonth}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="rounded-2xl border border-border/50 p-6">
              <h3 className="text-lg font-bold mb-6">{t.checkout.paymentMethod}</h3>

              {methodsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : paymentMethods && paymentMethods.length > 0 ? (
                <>
                  <div className="space-y-3 mb-6">
                    {paymentMethods.map((method) => {
                      const Icon = PAYMENT_METHOD_ICONS[method.id] || CreditCard;
                      return (
                        <button
                          key={method.id}
                          onClick={() => setSelectedMethod(method.id)}
                          className={cn(
                            'w-full flex items-center gap-4 p-4 rounded-xl border transition-all',
                            selectedMethod === method.id
                              ? 'border-primary bg-primary/10'
                              : 'border-border/50 hover:border-border'
                          )}
                        >
                          <div className="p-2 rounded-lg bg-muted">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium">{method.name}</p>
                            <p className="text-xs text-muted-foreground">{method.nameAr}</p>
                          </div>
                          <div
                            className={cn(
                              'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                              selectedMethod === method.id
                                ? 'border-primary'
                                : 'border-muted-foreground/30'
                            )}
                          >
                            {selectedMethod === method.id && (
                              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {createPaymentMutation.isError && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-6">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-500">{t.checkout.paymentError}</p>
                        <p className="text-sm text-muted-foreground">
                          {t.checkout.paymentErrorDesc}
                        </p>
                      </div>
                    </div>
                  )}

                  <Button
                    className={cn(
                      'w-full h-12',
                      plan === 'PREMIUM' && 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
                      plan === 'PREMIUM_PLUS' && 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    )}
                    onClick={handleProceedToPayment}
                    disabled={!selectedMethod || createPaymentMutation.isPending}
                  >
                    {createPaymentMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t.checkout.processing}
                      </>
                    ) : (
                      `${t.checkout.payButton} ${price} ${t.checkout.currency}`
                    )}
                  </Button>

                  <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>{t.checkout.securedBy}</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {t.checkout.noPaymentMethods}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Terms */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          {t.checkout.termsPrefix}{' '}
          <Link href="/terms" className="text-primary hover:underline">
            {t.checkout.termsLink}
          </Link>
          . {t.checkout.termsSuffix}
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
