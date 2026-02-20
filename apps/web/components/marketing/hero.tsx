'use client';

import Link from 'next/link';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
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
      {/* Subtle Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      </div>

      <div className="container relative z-10">
        <div className="flex min-h-screen flex-col items-center justify-center py-20">
          {/* Badge */}
          <div className="mb-8 animate-fade-down">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-5 py-2.5 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-foreground/90">{t.hero.badge}</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className={cn(
            'max-w-5xl text-center text-4xl font-black tracking-tight sm:text-5xl md:text-6xl lg:text-8xl',
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
              <Link href="/#features" className={cn('flex items-center', isRTL && 'flex-row-reverse')}>
                <Play className={cn('h-5 w-5', isRTL ? 'ml-2' : 'mr-2')} fill="currentColor" />
                {t.hero.watchDemo}
              </Link>
            </Button>
          </div>

          {/* App Preview - Phone Mockup (Dark Flexcore Style) */}
          <div className="relative mt-20 w-full max-w-5xl animate-fade-up delay-500">
            <div className="relative mx-auto w-full max-w-sm">
              {/* Phone Frame — Dark */}
              <div className="relative rounded-[3rem] border border-white/10 bg-[#1a1a1a] p-3 shadow-2xl">
                {/* Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full" />

                {/* Screen */}
                <div className="overflow-hidden rounded-[2.5rem] bg-[#0d0d0d]">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between px-8 py-3 text-xs text-white/80">
                    <span className="font-semibold">9:41</span>
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        <div className="w-1 h-2 bg-white/80 rounded-sm" />
                        <div className="w-1 h-3 bg-white/80 rounded-sm" />
                        <div className="w-1 h-2.5 bg-white/80 rounded-sm" />
                        <div className="w-1 h-1.5 bg-white/30 rounded-sm" />
                      </div>
                      <div className="w-6 h-3 rounded-sm border border-white/60 relative">
                        <div className="absolute inset-0.5 bg-green-500 rounded-sm" style={{ width: '70%' }} />
                      </div>
                    </div>
                  </div>

                  {/* App Content — Dark Theme */}
                  <div className={cn('px-5 pb-10 pt-2', isRTL && 'text-right')}>
                    <div className="mb-5">
                      <p className="text-sm text-white/50">
                        {t.dashboard.greetings.morning}
                      </p>
                      <h2 className="text-2xl font-bold mt-1 text-white">
                        {isRTL ? 'جاهز تتمرن؟' : 'Ready to train?'}
                      </h2>
                    </div>

                    {/* Workout Card — Dark */}
                    <div className="rounded-2xl bg-[#1e1e1e] border border-white/10 p-5 relative overflow-hidden">
                      <p className="text-sm text-white/50">{t.dashboard.todayWorkout}</p>
                      <h3 className="mt-1 text-xl font-bold text-white">
                        {isRTL ? 'تمرين الجزء العلوي' : 'Upper Body Power'}
                      </h3>
                      <p className="mt-2 text-sm text-white/50">
                        6 {t.dashboard.exercises} {'\u2022'} 45 min
                      </p>
                      <button className="mt-4 flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white">
                        <Play className="h-4 w-4" fill="currentColor" />
                        {t.dashboard.startWorkout}
                      </button>
                    </div>

                    {/* Mini Bar Chart — Weekly Activity */}
                    <div className="mt-4 rounded-2xl bg-[#1e1e1e] border border-white/10 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-white/50 font-medium">
                          {isRTL ? 'النشاط' : 'Activity'}
                        </p>
                        <p className="text-xs text-orange-400 font-semibold">
                          {isRTL ? 'هذا الأسبوع' : 'This Week'}
                        </p>
                      </div>
                      {/* SVG Mini Bar Chart */}
                      <div className="flex items-end justify-between gap-1.5 h-16">
                        {[40, 65, 35, 80, 55, 90, 20].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t-md transition-all"
                            style={{
                              height: `${h}%`,
                              background: i === 5 ? '#f97316' : 'rgba(255,255,255,0.1)',
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between mt-2">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                          <span key={i} className={cn(
                            'text-[10px] flex-1 text-center',
                            i === 5 ? 'text-orange-400 font-semibold' : 'text-white/30'
                          )}>{d}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtle reflection */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-20 bg-gradient-to-b from-orange-500/10 to-transparent rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
