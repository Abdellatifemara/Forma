'use client';

import Link from 'next/link';
import { Check, Zap, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  SUBSCRIPTION_TIERS,
  TIER_COMPARISON_HIGHLIGHTS,
  TIER_COMPARISON_HIGHLIGHTS_AR,
  type SubscriptionTier,
} from '@/lib/subscription-features';

export function Pricing() {
  const { t, isRTL, language } = useLanguage();

  const highlights = language === 'ar' ? TIER_COMPARISON_HIGHLIGHTS_AR : TIER_COMPARISON_HIGHLIGHTS;

  const plans = [
    {
      tier: SUBSCRIPTION_TIERS.PREMIUM,
      features: highlights.PREMIUM,
      cta: language === 'ar' ? 'ابدأ تجربة 7 أيام' : 'Start 7-Day Trial',
      href: '/signup?plan=premium',
      icon: Zap,
      gradient: 'from-forma-orange to-forma-orange-dark',
      savings: language === 'ar' ? 'وفر 38% سنوياً' : 'Save 38% yearly',
    },
    {
      tier: SUBSCRIPTION_TIERS.PREMIUM_PLUS,
      features: highlights.PREMIUM_PLUS,
      cta: language === 'ar' ? 'انضم لـ VIP' : 'Join VIP',
      href: '/signup?plan=premium_plus',
      icon: Crown,
      gradient: 'from-forma-navy to-forma-navy-light',
    },
  ];

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="container relative">
        {/* Section Header */}
        <div className={cn('text-center mb-16', isRTL && 'font-cairo')}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {language === 'ar' ? 'أسعار بسيطة' : 'Simple Pricing'}
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {language === 'ar' ? 'اختر خطتك ' : 'Choose Your '}
            <span className="text-primary">
              {language === 'ar' ? 'المثالية' : 'Perfect Plan'}
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'ar'
              ? 'ابدأ بتجربة مجانية لمدة 7 أيام. بدون عقود، إلغاء في أي وقت.'
              : 'Start with a 7-day free trial. No contracts, cancel anytime.'}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const isPremium = plan.tier.id === 'PREMIUM';
            const isPremiumPlus = plan.tier.id === 'PREMIUM_PLUS';
            const Icon = plan.icon;

            return (
              <div
                key={plan.tier.id}
                className={cn(
                  'relative rounded-2xl border bg-card/50 backdrop-blur-sm p-6 transition-all duration-300',
                  isPremium && 'border-primary/50 shadow-lg shadow-primary/10 md:scale-[1.02] lg:scale-105',
                  isPremiumPlus && 'border-forma-navy/30',
                  !isPremium && !isPremiumPlus && 'border-border/50',
                  isRTL && 'text-right'
                )}
              >
                {/* Badge */}
                {plan.tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-sm font-semibold text-white',
                      isPremium && 'bg-gradient-to-r from-forma-orange to-forma-orange-dark',
                      isPremiumPlus && 'bg-gradient-to-r from-forma-navy to-forma-navy-light',
                      isRTL && 'flex-row-reverse'
                    )}>
                      {Icon && <Icon className="h-3.5 w-3.5" />}
                      {language === 'ar' ? plan.tier.badgeAr : plan.tier.badge}
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="mb-6 pt-2">
                  <h3 className={cn('text-xl font-bold', isRTL && 'font-cairo')}>
                    {language === 'ar' ? plan.tier.nameAr : plan.tier.name}
                  </h3>
                  <p className={cn('text-sm text-muted-foreground mt-1', isRTL && 'font-cairo')}>
                    {language === 'ar' ? plan.tier.taglineAr : plan.tier.tagline}
                  </p>
                </div>

                {/* Price */}
                <div className={cn('mb-6', isRTL && 'flex flex-row-reverse items-baseline gap-1')}>
                  {plan.tier.pricing.monthly === 0 ? (
                    <span className="text-4xl font-bold">
                      {language === 'ar' ? 'مجاني' : 'Free'}
                    </span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">{plan.tier.pricing.monthly}</span>
                      <span className="text-muted-foreground text-lg"> EGP</span>
                      <span className="text-muted-foreground">
                        /{language === 'ar' ? 'شهر' : 'mo'}
                      </span>
                    </>
                  )}
                </div>

                {/* Yearly savings */}
                {plan.savings && (
                  <div className={cn(
                    'mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg',
                    'bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-medium'
                  )}>
                    <Check className="h-4 w-4" />
                    {plan.savings}
                  </div>
                )}

                {/* Yearly price note for Premium+ */}
                {isPremiumPlus && (
                  <div className="mb-6 text-sm text-muted-foreground">
                    {language === 'ar'
                      ? `أو ${plan.tier.pricing.yearly} جنيه/سنة`
                      : `or ${plan.tier.pricing.yearly} EGP/year`}
                  </div>
                )}

                {/* Features */}
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className={cn(
                      'flex items-start gap-3 text-sm',
                      isRTL && 'flex-row-reverse',
                      idx === 0 && 'font-medium text-primary'
                    )}>
                      <Check className={cn(
                        'h-5 w-5 flex-shrink-0 mt-0.5',
                        isPremium && 'text-primary',
                        isPremiumPlus && 'text-forma-navy dark:text-forma-navy-light',
                        !isPremium && !isPremiumPlus && 'text-muted-foreground'
                      )} />
                      <span className={isRTL ? 'font-cairo' : ''}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  className={cn(
                    'w-full h-12 rounded-xl font-semibold transition-all',
                    isPremium && 'bg-gradient-to-r from-forma-orange to-forma-orange-dark hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-primary/25',
                    isPremiumPlus && 'bg-gradient-to-r from-forma-navy to-forma-navy-light hover:from-forma-navy-light hover:to-forma-navy text-white',
                    !isPremium && !isPremiumPlus && 'bg-muted hover:bg-muted/80'
                  )}
                  asChild
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </div>
            );
          })}
        </div>

        {/* Comparison note */}
        <div className="mt-12 text-center">
          <p className={cn('text-sm text-muted-foreground', isRTL && 'font-cairo')}>
            {language === 'ar'
              ? 'جميع الأسعار بالجنيه المصري. الاشتراكات تجدد تلقائياً.'
              : 'All prices in Egyptian Pounds. Subscriptions auto-renew.'}
          </p>
          <Link
            href="/pricing"
            className="inline-block mt-4 text-sm text-primary hover:underline"
          >
            {language === 'ar' ? 'عرض مقارنة الميزات الكاملة ←' : 'View full feature comparison →'}
          </Link>
        </div>
      </div>
    </section>
  );
}
