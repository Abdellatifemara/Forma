'use client';

import Link from 'next/link';
import { ArrowRight, Dumbbell, Apple, TrendingUp, Users, Camera, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function Features() {
  const { t, isRTL } = useLanguage();

  const features = [
    {
      icon: Dumbbell,
      title: t.features.smartWorkouts.title,
      description: t.features.smartWorkouts.description,
      color: 'bg-coral-500',
    },
    {
      icon: Apple,
      title: t.features.nutrition.title,
      description: t.features.nutrition.description,
      color: 'bg-green-500',
    },
    {
      icon: TrendingUp,
      title: t.features.tracking.title,
      description: t.features.tracking.description,
      color: 'bg-blue-500',
    },
    {
      icon: Users,
      title: t.features.squads.title,
      description: t.features.squads.description,
      color: 'bg-purple-500',
    },
    {
      icon: Camera,
      title: t.features.formChecker.title,
      description: t.features.formChecker.description,
      color: 'bg-pink-500',
    },
    {
      icon: Moon,
      title: t.features.ramadan.title,
      description: t.features.ramadan.description,
      color: 'bg-indigo-500',
    },
  ];

  const stats = [
    { value: '500+', label: t.features.stats.exercises },
    { value: '50K+', label: t.features.stats.members },
    { value: '1M+', label: t.features.stats.workoutsDone },
    { value: '4.9★', label: t.features.stats.appRating },
  ];

  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container">
        {/* Section Header */}
        <div className={cn('text-center mb-16', isRTL && 'font-cairo')}>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t.features.title}{' '}
            <span className="text-coral-500">{t.features.titleHighlight}</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.features.subtitle}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={cn(
                'group rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
                isRTL && 'text-right'
              )}
            >
              <div className={cn(
                'inline-flex h-12 w-12 items-center justify-center rounded-xl text-white mb-4',
                feature.color
              )}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className={cn('text-xl font-semibold mb-2', isRTL && 'font-cairo')}>
                {feature.title}
              </h3>
              <p className={cn('text-muted-foreground', isRTL && 'font-cairo')}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Strip */}
        <div className={cn('mt-20 grid grid-cols-2 gap-8 sm:grid-cols-4', isRTL && 'font-cairo')}>
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-coral-500 sm:text-4xl">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Button
            size="lg"
            className="h-14 rounded-full bg-coral-500 px-8 text-lg font-semibold text-white shadow-lg shadow-coral-500/30 hover:bg-coral-600"
            asChild
          >
            <Link href="/signup">
              {t.features.cta}
              <ArrowRight className={cn('h-5 w-5', isRTL ? 'mr-2 rotate-180' : 'ml-2')} />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
