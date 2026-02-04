'use client';

import Link from 'next/link';
import { Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'Get started with the basics',
    features: [
      'Basic workout tracking',
      'Form checker (unlimited)',
      'Exercise library',
      'Progress photos',
      'Community access',
    ],
    cta: 'Get Started',
    href: '/signup',
    popular: false,
  },
  {
    name: 'Pro',
    price: '99',
    description: 'For dedicated fitness enthusiasts',
    features: [
      'Everything in Free',
      'Personalized workout plans',
      'Unlimited nutrition tracking',
      'Advanced analytics',
      'Squad challenges',
      'Priority support',
    ],
    cta: 'Start 7-Day Trial',
    href: '/signup?plan=pro',
    popular: true,
  },
  {
    name: 'Elite',
    price: '299',
    description: 'With personal trainer access',
    features: [
      'Everything in Pro',
      'Monthly trainer check-in',
      'Custom meal plans',
      'Video form reviews',
      'Direct messaging',
      '1-on-1 consultations',
    ],
    cta: 'Contact Us',
    href: '/contact?plan=elite',
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Simple pricing, <span className="text-coral-500">real value</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free. Upgrade when you're ready. Cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative rounded-2xl border bg-card p-8',
                plan.popular && 'border-coral-500 shadow-lg shadow-coral-500/10 scale-105'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-coral-500 px-4 py-1 text-sm font-medium text-white">
                    <Zap className="h-3.5 w-3.5" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground"> EGP/month</span>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-coral-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
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
        <p className="mt-12 text-center text-sm text-muted-foreground">
          All prices in Egyptian Pounds. Secure payments via Paymob & Fawry.
        </p>
      </div>
    </section>
  );
}
