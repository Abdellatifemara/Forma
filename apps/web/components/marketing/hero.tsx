'use client';

import Link from 'next/link';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

const words = ['Transform', 'Strengthen', 'Energize', 'Evolve'];

export function Hero() {
  const [wordIndex, setWordIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % words.length);
        setIsVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-white dark:bg-black">
      {/* Geometric Background Pattern */}
      <div className="absolute inset-0 -z-10">
        {/* Large gradient circle - top right */}
        <div className="absolute -top-1/4 -right-1/4 h-[800px] w-[800px] rounded-full bg-gradient-to-br from-coral-200/40 to-coral-400/20 blur-3xl dark:from-coral-500/10 dark:to-coral-600/5" />

        {/* Medium gradient circle - bottom left */}
        <div className="absolute -bottom-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-purple-200/30 to-purple-400/10 blur-3xl dark:from-purple-500/10 dark:to-purple-600/5" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container relative z-10">
        <div className="flex min-h-screen flex-col items-center justify-center py-20">
          {/* Floating Badge */}
          <div className="mb-8 animate-fade-down">
            <div className="inline-flex items-center gap-2 rounded-full border border-coral-200 bg-coral-50 px-4 py-2 text-sm font-medium text-coral-600 dark:border-coral-500/30 dark:bg-coral-500/10 dark:text-coral-400">
              <Sparkles className="h-4 w-4" />
              <span>50,000+ Active Members in Egypt</span>
            </div>
          </div>

          {/* Main Headline with Animated Word */}
          <h1 className="max-w-4xl text-center text-5xl font-black tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl">
            <span
              className={`inline-block bg-gradient-to-r from-coral-500 to-coral-600 bg-clip-text text-transparent transition-all duration-300 ${
                isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
              }`}
            >
              {words[wordIndex]}
            </span>
            <br />
            <span className="text-foreground">Your Body</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-8 max-w-2xl text-center text-lg text-muted-foreground sm:text-xl animate-fade-up">
            The complete fitness platform built for you. Personalized workouts, nutrition tracking, and a community that keeps you going.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row animate-fade-up">
            <Button
              size="lg"
              className="h-14 rounded-full bg-coral-500 px-8 text-lg font-semibold text-white shadow-lg shadow-coral-500/30 transition-all hover:bg-coral-600 hover:shadow-xl hover:shadow-coral-500/40"
              asChild
            >
              <Link href="/signup">
                Start Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 rounded-full px-8 text-lg"
              asChild
            >
              <Link href="#how-it-works">
                <Play className="mr-2 h-5 w-5" />
                See How It Works
              </Link>
            </Button>
          </div>

          {/* Social Proof Strip */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 animate-fade-up">
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">4.9 rating</span>
            </div>

            <div className="h-8 w-px bg-border" />

            {/* Users */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-coral-400 to-purple-400 dark:border-black"
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">50K+ users</span>
            </div>

            <div className="h-8 w-px bg-border hidden sm:block" />

            {/* Workouts */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">1M+</span>
              <span className="text-sm text-muted-foreground">workouts done</span>
            </div>
          </div>

          {/* App Preview */}
          <div className="relative mt-20 w-full max-w-4xl animate-fade-up">
            {/* Glow behind preview */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-coral-500/20 to-transparent blur-3xl" />

            {/* Phone mockup */}
            <div className="relative mx-auto w-full max-w-sm">
              <div className="rounded-[2.5rem] border-8 border-gray-900 bg-gray-900 p-2 shadow-2xl dark:border-gray-700">
                <div className="overflow-hidden rounded-[2rem] bg-white dark:bg-gray-900">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-6 py-2 text-xs">
                    <span className="font-medium">9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-4 rounded-sm border border-current" />
                    </div>
                  </div>

                  {/* App content preview */}
                  <div className="px-4 pb-8 pt-4">
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">Good morning</p>
                      <h2 className="text-2xl font-bold">Ready to train?</h2>
                    </div>

                    {/* Today's workout card */}
                    <div className="rounded-2xl bg-gradient-to-br from-coral-500 to-coral-600 p-4 text-white shadow-lg">
                      <p className="text-sm opacity-80">Today&apos;s Workout</p>
                      <h3 className="mt-1 text-xl font-bold">Upper Body Power</h3>
                      <p className="mt-2 text-sm opacity-80">6 exercises • 45 min</p>
                      <button className="mt-4 rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                        Start Now →
                      </button>
                    </div>

                    {/* Quick stats */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-muted/50 p-3">
                        <p className="text-2xl font-bold">7</p>
                        <p className="text-xs text-muted-foreground">Day Streak 🔥</p>
                      </div>
                      <div className="rounded-xl bg-muted/50 p-3">
                        <p className="text-2xl font-bold">2,450</p>
                        <p className="text-xs text-muted-foreground">Calories</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
