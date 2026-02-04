'use client';

import Link from 'next/link';
import { Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function Pricing() {
  const { t, isRTL } = useLanguage();

  const plans = [
    {
      name: t.pricing.free.name,
      price: '0',
      description: t.pricing.free.description,
      features: [
        t.pricing.features.basicTracking,
        t.pricing.features.formChecker,
        t.pricing.features.exerciseLibrary,
        t.pricing.features.progressPhotos,
        t.pricing.features.community,
      ],
      cta: t.pricing.free.cta,
      href: '/signup',
      popular: false,
    },
    {
      name: t.pricing.pro.name,
      price: '99',
      description: t.pricing.pro.description,
      features: [
        t.pricing.features.everythingFree,
        t.pricing.features.personalizedPlans,
        t.pricing.features.unlimitedNutrition,
        t.pricing.features.analytics,
        t.pricing.features.squadChallenges,
        t.pricing.features.prioritySupport,
      ],
      cta: t.pricing.pro.cta,
      href: '/signup?plan=pro',
      popular: true,
    },
    {
      name: t.pricing.elite.name,
      price: '299',
      description: t.pricing.elite.description,
      features: [
        t.pricing.features.everythingPro,
        t.pricing.features.trainerCheckin,
        t.pricing.features.mealPlans,
        t.pricing.features.videoReviews,
        t.pricing.features.directMessaging,
        t.pricing.features.consultations,
      ],
      cta: t.pricing.elite.cta,
      href: '/contact?plan=elite',
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24">
      <div className="container">
        {/* Section Header */}
        <div className={cn('text-center mb-16', isRTL && 'font-cairo')}>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t.pricing.title}{' '}
            <span className="text-coral-500">{t.pricing.titleHighlight}</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.pricing.subtitle}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative rounded-2xl border bg-card p-8',
                plan.popular && 'border-coral-500 shadow-lg shadow-coral-500/10 scale-105',
                isRTL && 'text-right'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className={cn(
                    'inline-flex items-center gap-1 rounded-full bg-coral-500 px-4 py-1 text-sm font-medium text-white',
                    isRTL && 'flex-row-reverse'
                  )}>
                    <Zap className="h-3.5 w-3.5" />
                    {t.pricing.pro.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={cn('text-xl font-semibold', isRTL && 'font-cairo')}>
                  {plan.name}
                </h3>
                <p className={cn('text-sm text-muted-foreground', isRTL && 'font-cairo')}>
                  {plan.description}
                </p>
              </div>

              <div className={cn('mb-6', isRTL && 'flex flex-row-reverse items-baseline gap-1')}>
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground"> EGP{t.pricing.perMonth}</span>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className={cn(
                    'flex items-start gap-3',
                    isRTL && 'flex-row-reverse'
                  )}>
                    <Check className="h-5 w-5 text-coral-500 flex-shrink-0 mt-0.5" />
                    <span className={cn('text-sm', isRTL && 'font-cairo')}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={cn(
                  'w-full h-12 rounded-xl font-semibold',
                  plan.popular
                    ? 'bg-coral-500 text-white hover:bg-coral-600'
                    : 'bg-muted hover:bg-muted/80'
                )}
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Trust note */}
        <p className={cn('mt-12 text-center text-sm text-muted-foreground', isRTL && 'font-cairo')}>
          {t.pricing.trustNote}
        </p>
      </div>
    </section>
  );
}
