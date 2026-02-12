'use client';

import Link from 'next/link';
import { ArrowRight, Play, Sparkles, Zap, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function Hero() {
  const { t, isRTL } = useLanguage();
  const [wordIndex, setWordIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const words = t.hero.words;

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % words.length);
        setIsVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 -z-10">
        {/* Primary glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
        {/* Secondary glow */}
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-secondary/15 rounded-full blur-[100px]" />
        {/* Accent glow */}
        <div className="absolute top-1/2 left-0 w-[400px] h-[300px] bg-accent/10 rounded-full blur-[80px]" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid opacity-20" />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      </div>

      {/* Floating Orbs Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-[20%] w-3 h-3 bg-primary rounded-full animate-float opacity-60" />
        <div className="absolute top-40 left-[15%] w-2 h-2 bg-secondary rounded-full animate-float delay-300 opacity-40" />
        <div className="absolute bottom-40 right-[30%] w-4 h-4 bg-accent rounded-full animate-float delay-500 opacity-50" />
        <div className="absolute top-60 right-[10%] w-2 h-2 bg-primary rounded-full animate-float delay-700 opacity-30" />
      </div>

      <div className="container relative z-10">
        <div className="flex min-h-screen flex-col items-center justify-center py-20">
          {/* Floating Badge */}
          <div className="mb-8 animate-fade-down">
            <div className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium">
              <div className="relative">
                <Sparkles className="h-4 w-4 text-primary" />
                <div className="absolute inset-0 animate-ping">
                  <Sparkles className="h-4 w-4 text-primary opacity-50" />
                </div>
              </div>
              <span className="text-foreground/90">{t.hero.badge}</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className={cn(
            'max-w-5xl text-center text-5xl font-black tracking-tight sm:text-6xl md:text-7xl lg:text-8xl',
            isRTL && 'font-cairo'
          )}>
            <span
              className={cn(
                'inline-block text-gradient transition-all duration-300',
                isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'
              )}
            >
              {words[wordIndex]}
            </span>
            <br />
            <span className="text-foreground">{t.hero.headline}</span>
          </h1>

          {/* Subheadline */}
          <p className={cn(
            'mt-8 max-w-2xl text-center text-lg text-muted-foreground sm:text-xl animate-fade-up delay-200',
            isRTL && 'font-cairo'
          )}>
            {t.hero.subheadline}
          </p>

          {/* CTA Buttons */}
          <div className={cn(
            'mt-10 flex flex-col items-center gap-4 sm:flex-row animate-fade-up delay-300',
            isRTL && 'sm:flex-row-reverse'
          )}>
            <Button
              size="lg"
              className="group h-14 rounded-xl px-8 text-lg font-semibold btn-primary"
              asChild
            >
              <Link href="/signup" className={cn('flex items-center', isRTL && 'flex-row-reverse')}>
                {t.hero.cta}
                <ArrowRight className={cn(
                  'h-5 w-5 transition-transform group-hover:translate-x-1',
                  isRTL ? 'mr-2 rotate-180 group-hover:-translate-x-1' : 'ml-2'
                )} />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 rounded-xl px-8 text-lg border-primary/30 hover:bg-primary/10 hover:border-primary/50"
              asChild
            >
              <Link href="#features" className={cn('flex items-center', isRTL && 'flex-row-reverse')}>
                <Play className={cn('h-5 w-5', isRTL ? 'ml-2' : 'mr-2')} fill="currentColor" />
                {t.hero.watchDemo}
              </Link>
            </Button>
          </div>

          {/* Stats Strip */}
          <div className={cn(
            'mt-16 flex flex-wrap items-center justify-center gap-6 md:gap-10 animate-fade-up delay-400',
            isRTL && 'flex-row-reverse'
          )}>
            {/* Rating */}
            <div className="flex items-center gap-3 glass rounded-xl px-5 py-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    className="h-5 w-5 fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-medium">{t.hero.rating}</span>
            </div>

            {/* Users */}
            <div className="flex items-center gap-3 glass rounded-xl px-5 py-3">
              <div className="flex -space-x-2">
                {[
                  'from-cyan-400 to-cyan-600',
                  'from-purple-400 to-purple-600',
                  'from-green-400 to-green-600',
                  'from-orange-400 to-orange-600',
                ].map((gradient, i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br',
                      gradient
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{t.hero.users}</span>
            </div>

            {/* Workouts */}
            <div className="hidden sm:flex items-center gap-3 glass rounded-xl px-5 py-3">
              <Zap className="h-5 w-5 text-primary" />
              <div>
                <span className="text-lg font-bold">1M+</span>
                <span className="text-sm text-muted-foreground ml-1">{t.hero.workoutsDone}</span>
              </div>
            </div>
          </div>

          {/* App Preview - Futuristic Phone Mockup */}
          <div className="relative mt-20 w-full max-w-5xl animate-fade-up delay-500">
            {/* Glow behind phone */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[400px] h-[400px] bg-primary/30 rounded-full blur-[100px]" />
            </div>

            <div className="relative mx-auto w-full max-w-sm">
              {/* Phone Frame */}
              <div className="relative rounded-[3rem] border border-border/50 bg-card/80 backdrop-blur-xl p-3 shadow-2xl">
                {/* Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-background rounded-full" />

                {/* Screen */}
                <div className="overflow-hidden rounded-[2.5rem] bg-background">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between px-8 py-3 text-xs">
                    <span className="font-semibold">9:41</span>
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        <div className="w-1 h-2 bg-foreground rounded-sm" />
                        <div className="w-1 h-3 bg-foreground rounded-sm" />
                        <div className="w-1 h-2.5 bg-foreground rounded-sm" />
                        <div className="w-1 h-1.5 bg-foreground/50 rounded-sm" />
                      </div>
                      <div className="w-6 h-3 rounded-sm border border-foreground relative">
                        <div className="absolute inset-0.5 bg-green-500 rounded-sm" style={{ width: '70%' }} />
                      </div>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className={cn('px-5 pb-10 pt-2', isRTL && 'text-right')}>
                    <div className="mb-5">
                      <p className="text-sm text-muted-foreground">
                        {t.dashboard.greetings.morning}
                      </p>
                      <h2 className="text-2xl font-bold mt-1">
                        {isRTL ? 'جاهز تتمرن؟' : 'Ready to train?'}
                      </h2>
                    </div>

                    {/* Workout Card */}
                    <div className="rounded-2xl bg-gradient-to-br from-cyan-500 via-cyan-600 to-purple-600 p-5 text-white shadow-lg shadow-cyan-500/20 relative overflow-hidden">
                      {/* Animated bg */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl" />

                      <p className="text-sm opacity-80">{t.dashboard.todayWorkout}</p>
                      <h3 className="mt-1 text-xl font-bold">
                        {isRTL ? 'تمرين الجزء العلوي' : 'Upper Body Power'}
                      </h3>
                      <p className="mt-2 text-sm opacity-80">
                        6 {t.dashboard.exercises} • 45 min
                      </p>
                      <button className="mt-4 flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-semibold backdrop-blur-sm hover:bg-white/30 transition-colors">
                        <Play className="h-4 w-4" fill="currentColor" />
                        {t.dashboard.startWorkout}
                      </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="stat-card">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-orange-500/20">
                            <Zap className="h-4 w-4 text-orange-500" />
                          </div>
                          <span className="text-xl font-bold">7</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t.dashboard.stats.streak}
                        </p>
                      </div>
                      <div className="stat-card">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-green-500/20">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          </div>
                          <span className="text-xl font-bold">2,450</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t.dashboard.nutrition.calories}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reflection effect */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-20 bg-gradient-to-b from-primary/10 to-transparent rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
