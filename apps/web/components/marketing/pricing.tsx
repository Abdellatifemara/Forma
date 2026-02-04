'use client';

import Link from 'next/link';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Free',
    icon: Zap,
    price: '0',
    period: 'forever',
    description: 'Perfect to get started',
    features: [
      'AI Form Checker (unlimited)',
      'Voice Coach (unlimited)',
      'Basic workout tracking',
      'Exercise library (500+)',
      'Progress photos',
      'Community access',
    ],
    cta: 'Get Started Free',
    href: '/signup',
    popular: false,
    gradient: 'from-gray-500 to-gray-600',
  },
  {
    name: 'Pro',
    icon: Sparkles,
    price: '99',
    period: '/month',
    description: 'For serious fitness enthusiasts',
    features: [
      'Everything in Free',
      '"What Now?" AI suggestions',
      'AI workout plan generation',
      'Unlimited food logging',
      'Advanced analytics & insights',
      'Squads & challenges',
      'Wearable sync',
      'Priority support',
    ],
    cta: 'Start 7-Day Free Trial',
    href: '/signup?plan=pro',
    popular: true,
    gradient: 'from-forma-teal to-emerald-500',
  },
  {
    name: 'Elite',
    icon: Crown,
    price: '299',
    period: '/month',
    description: 'With personal trainer access',
    features: [
      'Everything in Pro',
      'Monthly trainer check-in',
      'Custom meal plans',
      'Video form reviews',
      'Direct messaging with coach',
      '1-on-1 consultations',
      'VIP badge & perks',
    ],
    cta: 'Contact Sales',
    href: '/contact?plan=elite',
    popular: false,
    gradient: 'from-yellow-500 to-orange-500',
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-forma-navy/30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-forma-teal/5 blur-[128px]" />
      </div>

      <div className="container">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge className="mb-6 bg-forma-teal/10 text-forma-teal border-forma-teal/20">
            Pricing
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Simple,{' '}
            <span className="bg-gradient-to-r from-forma-teal to-emerald-400 bg-clip-text text-transparent">
              transparent
            </span>{' '}
            pricing
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Start free, upgrade when you need. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={cn(
                'relative rounded-2xl border bg-card/50 backdrop-blur-sm p-8 transition-all duration-300',
                plan.popular
                  ? 'border-forma-teal shadow-[0_0_40px_rgba(0,212,170,0.15)] scale-105 lg:scale-110 z-10'
                  : 'border-border/50 hover:border-border',
                'animate-fade-up'
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-forma-teal text-black font-semibold px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <div className={cn(
                  'inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r mb-4',
                  plan.gradient
                )}>
                  <plan.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-border/50">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">
                    {plan.price === '0' ? '' : 'EGP'}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {plan.period}
                  </span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className={cn(
                      'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full',
                      plan.popular ? 'bg-forma-teal/20' : 'bg-muted'
                    )}>
                      <Check className={cn(
                        'h-3 w-3',
                        plan.popular ? 'text-forma-teal' : 'text-muted-foreground'
                      )} />
                    </div>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className={cn(
                  'w-full h-12 rounded-xl font-semibold transition-all',
                  plan.popular
                    ? 'bg-forma-teal text-black hover:bg-forma-teal/90 hover:shadow-[0_0_20px_rgba(0,212,170,0.3)]'
                    : 'bg-muted hover:bg-muted/80'
                )}
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Secure payments powered by
          </p>
          <div className="flex items-center justify-center gap-8 opacity-50">
            <span className="text-sm font-medium">Stripe</span>
            <span className="text-sm font-medium">Paymob</span>
            <span className="text-sm font-medium">Fawry</span>
          </div>
        </div>

        {/* FAQ teaser */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Have questions?{' '}
            <Link href="/contact" className="text-forma-teal hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
