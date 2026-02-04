'use client';

import Link from 'next/link';
import { ArrowRight, Play, Star, Sparkles, Check, Users, Trophy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

const stats = [
  { value: '50K+', label: 'Active Users' },
  { value: '1M+', label: 'Workouts Completed' },
  { value: '4.9', label: 'App Rating', icon: Star },
];

const features = [
  'AI-Powered Workouts',
  'Real-time Form Correction',
  'Arabic & English Support',
  'Ramadan Mode',
];

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-forma-navy via-forma-navy-light to-background pt-16">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-1/4 h-[600px] w-[600px] rounded-full bg-forma-teal/20 blur-[120px] animate-pulse-soft" />
        <div className="absolute bottom-20 right-1/4 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[100px] animate-pulse-soft" style={{ animationDelay: '1s' }} />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="container relative z-10 py-20 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-forma-teal/30 bg-forma-teal/10 px-4 py-2 animate-fade-down">
            <Sparkles className="h-4 w-4 text-forma-teal" />
            <span className="text-sm font-medium text-forma-teal">
              #1 Fitness App in MENA Region
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl animate-fade-up">
            Transform Your Body.
            <br />
            <span className="text-gradient">Transform Your Life.</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300 sm:text-xl animate-fade-up" style={{ animationDelay: '0.1s' }}>
            The AI-powered fitness platform built for the Middle East. Personalized workouts,
            smart nutrition tracking, and real-time form correction — all in Arabic and English.
          </p>

          {/* Feature Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-gray-300 border border-white/10"
              >
                <Check className="h-4 w-4 text-forma-teal" />
                {feature}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Button
              size="lg"
              className="btn-premium h-14 px-8 text-lg w-full sm:w-auto"
              asChild
            >
              <Link href="/signup">
                Start Free — No Credit Card
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg border-white/20 bg-white/5 hover:bg-white/10 text-white w-full sm:w-auto"
              asChild
            >
              <Link href="#demo">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-8 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-bold text-white sm:text-3xl">
                    {stat.value}
                  </span>
                  {stat.icon && <stat.icon className="h-5 w-5 text-yellow-400 fill-yellow-400" />}
                </div>
                <p className="mt-1 text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* App Preview - Floating Cards */}
        <div className="relative mt-20 mx-auto max-w-5xl animate-fade-up" style={{ animationDelay: '0.5s' }}>
          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-forma-teal/30 to-purple-500/20 blur-3xl scale-95" />

          {/* Main Preview Container */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-1 backdrop-blur-xl">
            <div className="rounded-[22px] bg-forma-navy/80 p-6 sm:p-8">
              {/* Mock Dashboard */}
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Left Column - Today's Workout */}
                <div className="sm:col-span-2 rounded-2xl bg-gradient-to-br from-forma-teal/20 to-forma-teal/5 p-5 border border-forma-teal/20">
                  <div className="flex items-center gap-2 text-forma-teal text-sm font-medium mb-3">
                    <Zap className="h-4 w-4" />
                    Today&apos;s Workout
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Upper Body Power</h3>
                  <p className="text-gray-400 text-sm mb-4">6 exercises • 45 min</p>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">Chest</span>
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs">Back</span>
                    <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs">Shoulders</span>
                  </div>
                  <Button className="mt-4 bg-forma-teal hover:bg-forma-teal-dark text-forma-navy font-semibold">
                    <Play className="mr-2 h-4 w-4" />
                    Start Workout
                  </Button>
                </div>

                {/* Right Column - Stats */}
                <div className="space-y-4">
                  {/* XP Progress */}
                  <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-xs font-bold text-forma-navy">
                        5
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">Committed</p>
                        <p className="text-gray-500 text-xs">1,250 / 1,500 XP</p>
                      </div>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[83%] bg-gradient-to-r from-forma-teal to-forma-teal-light rounded-full" />
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="rounded-2xl bg-gradient-to-r from-orange-500/20 to-red-500/20 p-4 border border-orange-500/20">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🔥</span>
                      <div>
                        <p className="text-white font-bold text-xl">7 Days</p>
                        <p className="text-orange-300 text-xs">Workout Streak!</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stat */}
                  <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        <span className="text-gray-400 text-sm">This Week</span>
                      </div>
                      <span className="text-white font-bold">4 Workouts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute -left-4 top-1/4 animate-float hidden lg:block">
            <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">AI Form Check</p>
                  <p className="text-gray-400 text-xs">Perfect squat form!</p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -right-4 bottom-1/4 animate-float hidden lg:block" style={{ animationDelay: '1s' }}>
            <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Squad Challenge</p>
                  <p className="text-gray-400 text-xs">You&apos;re in 2nd place!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center animate-fade-up" style={{ animationDelay: '0.6s' }}>
          <p className="text-sm text-gray-500 mb-4">Available on</p>
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span className="text-sm">iOS</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
              </svg>
              <span className="text-sm">Android</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              <span className="text-sm">Web</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
