'use client';

import Link from 'next/link';
import { ArrowRight, Play, Star, Sparkles, Check, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

const stats = [
  { value: '50K+', label: 'Active Users', suffix: '' },
  { value: '1M+', label: 'Workouts Done', suffix: '' },
  { value: '4.9', label: 'App Store Rating', suffix: '★' },
];

const trustedBy = [
  'Gold\'s Gym Egypt',
  'Fitness First',
  'Smart Gym',
  'Oxygen Gym',
];

export function Hero() {
  return (
    <section className="relative min-h-[100vh] overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 -z-10 bg-[#030712]">
        {/* Mesh gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,212,170,0.3),rgba(255,255,255,0))]" />

        {/* Animated orbs */}
        <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-forma-teal/20 blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-purple-600/20 blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />

        {/* Noise texture */}
        <div className="absolute inset-0 opacity-20 mix-blend-soft-light" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
      </div>

      <div className="container relative z-10 flex min-h-[100vh] flex-col items-center justify-center py-20 text-center">
        {/* Announcement Badge */}
        <div className="mb-8 animate-fade-down">
          <Link
            href="#features"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm backdrop-blur-sm transition-all hover:border-forma-teal/50 hover:bg-white/10"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-forma-teal text-[10px] font-bold text-black">
              NEW
            </span>
            <span className="text-gray-300">AI Form Checker is now FREE</span>
            <ChevronRight className="h-4 w-4 text-gray-500 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Main Headline */}
        <h1 className="max-w-4xl animate-fade-up text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          Your AI-Powered
          <br />
          <span className="relative">
            <span className="bg-gradient-to-r from-forma-teal via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Fitness Revolution
            </span>
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
              <path d="M2 10C50 4 100 2 150 6C200 10 250 4 298 8" stroke="url(#underline-gradient)" strokeWidth="3" strokeLinecap="round"/>
              <defs>
                <linearGradient id="underline-gradient" x1="0" y1="0" x2="300" y2="0">
                  <stop stopColor="#00D4AA" />
                  <stop offset="1" stopColor="#00D4AA" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-8 max-w-2xl animate-fade-up text-lg text-gray-400 sm:text-xl" style={{ animationDelay: '0.1s' }}>
          Transform your fitness journey with personalized AI workouts, real-time form correction, and smart nutrition tracking. Built for the Middle East.
        </p>

        {/* Feature Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          {['Real-time Form AI', 'Arabic & English', 'Ramadan Mode', 'Offline Ready'].map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 backdrop-blur-sm"
            >
              <Check className="h-4 w-4 text-forma-teal" />
              {feature}
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <Button
            size="lg"
            className="group relative h-14 overflow-hidden rounded-full bg-forma-teal px-8 text-lg font-semibold text-black transition-all hover:bg-forma-teal/90 hover:shadow-[0_0_40px_rgba(0,212,170,0.4)]"
            asChild
          >
            <Link href="/signup">
              Start Free Today
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14 rounded-full border-white/20 bg-white/5 px-8 text-lg text-white backdrop-blur-sm hover:bg-white/10"
            asChild
          >
            <Link href="#demo">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Link>
          </Button>
        </div>

        {/* Social Proof */}
        <div className="mt-12 animate-fade-up" style={{ animationDelay: '0.25s' }}>
          <p className="text-sm text-gray-500 mb-4">Trusted by leading gyms</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
            {trustedBy.map((name) => (
              <span key={name} className="text-sm font-medium text-gray-400">{name}</span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid w-full max-w-2xl grid-cols-3 gap-8 border-t border-white/10 pt-8 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-white sm:text-3xl">
                {stat.value}
                <span className="text-forma-teal">{stat.suffix}</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* App Preview */}
        <div className="relative mt-20 w-full max-w-5xl animate-fade-up" style={{ animationDelay: '0.35s' }}>
          {/* Glow effect */}
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-forma-teal/20 via-purple-500/20 to-forma-teal/20 opacity-50 blur-3xl" />

          {/* Preview container */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-1 backdrop-blur-xl">
            <div className="rounded-xl bg-[#0a0f1a] p-6">
              {/* Mock browser header */}
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <div className="ml-4 flex-1 rounded-full bg-white/5 px-4 py-1.5 text-xs text-gray-500">
                  forma.fitness/dashboard
                </div>
              </div>

              {/* Dashboard preview */}
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Today's workout card */}
                <div className="sm:col-span-2 rounded-xl bg-gradient-to-br from-forma-teal/20 to-forma-teal/5 p-5 border border-forma-teal/20">
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
                </div>

                {/* Stats sidebar */}
                <div className="space-y-4">
                  <div className="rounded-xl bg-white/5 p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-xs font-bold text-black">5</div>
                      <div>
                        <p className="text-white font-medium text-sm">Level 5</p>
                        <p className="text-gray-500 text-xs">1,250 XP</p>
                      </div>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[83%] bg-gradient-to-r from-forma-teal to-emerald-400 rounded-full" />
                    </div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 p-4 border border-orange-500/20">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🔥</span>
                      <div>
                        <p className="text-white font-bold text-xl">7 Days</p>
                        <p className="text-orange-300 text-xs">Streak!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating elements */}
          <div className="absolute -left-8 top-1/3 hidden animate-float lg:block" style={{ animationDelay: '0.5s' }}>
            <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">AI Form Check</p>
                  <p className="text-gray-400 text-xs">Perfect squat! 98%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -right-8 bottom-1/3 hidden animate-float lg:block" style={{ animationDelay: '1s' }}>
            <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Goal Achieved!</p>
                  <p className="text-gray-400 text-xs">+50 XP earned</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Platforms */}
        <div className="mt-16 text-center animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-sm text-gray-500 mb-4">Available on all platforms</p>
          <div className="flex items-center justify-center gap-6">
            {['iOS', 'Android', 'Web'].map((platform) => (
              <div key={platform} className="flex items-center gap-2 text-gray-400">
                <div className="h-2 w-2 rounded-full bg-forma-teal" />
                <span className="text-sm">{platform}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
