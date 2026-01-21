'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'Get started with basic tracking',
    features: [
      'Basic workout tracking',
      'Food logging (limited)',
      'Progress photos',
      'Exercise library access',
      'Community forums',
    ],
    cta: 'Get Started',
    href: '/signup',
    popular: false,
  },
  {
    name: 'Pro',
    price: '99',
    description: 'Full AI-powered experience',
    features: [
      'Everything in Free',
      'AI workout generation',
      'Unlimited food logging',
      'Advanced analytics',
      'AI Coach chat',
      'Export data',
      'Priority support',
    ],
    cta: 'Start Free Trial',
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
      'Video form checks',
      'Direct messaging',
      '1-on-1 consultations',
    ],
    cta: 'Contact Sales',
    href: '/contact?plan=elite',
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-muted/30 py-20 md:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            className="text-3xl font-bold tracking-tight md:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Simple, transparent pricing
          </motion.h2>
          <motion.p
            className="mt-4 text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Choose the plan that fits your fitness journey. All plans include a
            7-day free trial.
          </motion.p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={cn(
                'relative rounded-2xl border bg-card p-8',
                plan.popular && 'border-forma-teal shadow-lg shadow-forma-teal/10'
              )}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {plan.popular && (
                <Badge
                  variant="forma"
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                >
                  Most Popular
                </Badge>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground"> EGP/month</span>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="mr-3 h-5 w-5 shrink-0 text-forma-teal" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.popular ? 'forma' : 'outline'}
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="mt-12 text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          All prices are in Egyptian Pounds. VAT included where applicable.
        </motion.p>
      </div>
    </section>
  );
}
