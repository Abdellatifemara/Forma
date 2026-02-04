'use client';

import { useState } from 'react';
import {
  Brain,
  Dumbbell,
  LineChart,
  MessageCircle,
  Salad,
  Users,
  Camera,
  Mic,
  Moon,
  Sparkles,
  Activity,
  Trophy,
  Wifi,
  Shield,
  Zap,
  ChevronRight,
  Play,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Camera,
    title: 'AI Form Checker',
    titleAr: 'مصحح الحركات',
    description: 'Real-time pose detection analyzes your exercise form using your camera. Get instant feedback on-device — completely free and private.',
    badge: 'FREE',
    badgeColor: 'bg-green-500',
    gradient: 'from-blue-500 to-cyan-500',
    video: '/demos/form-check.mp4',
  },
  {
    icon: Mic,
    title: 'Voice Coach',
    titleAr: 'المدرب الصوتي',
    description: 'Hands-free workout guidance in Arabic and English. Counts reps, announces rest periods, and motivates you through every set.',
    badge: 'FREE',
    badgeColor: 'bg-green-500',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: Sparkles,
    title: '"What Now?" AI',
    titleAr: 'ماذا أفعل الآن؟',
    description: 'Don\'t know what to train? Tell us your energy level, available time, and location — get instant personalized workout suggestions.',
    badge: 'AI',
    badgeColor: 'bg-violet-500',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Users,
    title: 'Squads & Challenges',
    titleAr: 'الفرق والتحديات',
    description: 'Create or join fitness squads with friends. Compete in weekly challenges, share workouts, and climb the leaderboard together.',
    badge: 'SOCIAL',
    badgeColor: 'bg-forma-teal',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Trophy,
    title: 'XP & Gamification',
    titleAr: 'نقاط الخبرة',
    description: 'Earn XP for every workout and achievement. Progress through 10 levels from "Beginner" to "Elite". Unlock badges and compete.',
    badge: 'FUN',
    badgeColor: 'bg-yellow-500',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Moon,
    title: 'Ramadan Mode',
    titleAr: 'وضع رمضان',
    description: 'Automatically adjusts workout timing and intensity around fasting hours. Suhoor/Iftar meal suggestions included.',
    badge: 'MENA',
    badgeColor: 'bg-indigo-500',
    gradient: 'from-indigo-500 to-purple-500',
  },
];

const additionalFeatures = [
  { icon: Shield, title: 'Injury-Aware Training', description: 'Modifies workouts based on your injuries' },
  { icon: Activity, title: 'Wearable Sync', description: 'Apple Health, Google Fit, Garmin' },
  { icon: LineChart, title: 'Body Composition', description: 'Track weight, body fat, measurements' },
  { icon: Wifi, title: 'Offline Mode', description: 'Full PWA with offline support' },
  { icon: MessageCircle, title: 'Coach Chat', description: 'Chat with your trainer anytime' },
  { icon: Brain, title: 'AI Workout Plans', description: 'Personalized plans in seconds' },
];

export function Features() {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <section id="features" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-forma-navy/50" />
        <div className="absolute top-1/2 left-1/4 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-forma-teal/5 blur-[128px]" />
        <div className="absolute top-1/2 right-1/4 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-purple-500/5 blur-[128px]" />
      </div>

      <div className="container">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-20">
          <Badge className="mb-6 bg-forma-teal/10 text-forma-teal border-forma-teal/20 hover:bg-forma-teal/20 text-sm px-4 py-1">
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            12 Powerful Features
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-forma-teal to-emerald-400 bg-clip-text text-transparent">
              transform
            </span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Built specifically for the MENA region. Arabic-first design, Ramadan mode, and features that actually matter for your fitness journey.
          </p>
        </div>

        {/* Main Features - Interactive Showcase */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-24">
          {/* Feature List */}
          <div className="space-y-3">
            {features.map((feature, index) => (
              <button
                key={feature.title}
                onClick={() => setActiveFeature(index)}
                className={cn(
                  'w-full text-left rounded-2xl p-5 transition-all duration-300',
                  activeFeature === index
                    ? 'bg-gradient-to-r from-forma-teal/10 to-transparent border-l-4 border-forma-teal'
                    : 'hover:bg-muted/50'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-all',
                    activeFeature === index
                      ? `bg-gradient-to-r ${feature.gradient}`
                      : 'bg-muted'
                  )}>
                    <feature.icon className={cn(
                      'h-6 w-6 transition-colors',
                      activeFeature === index ? 'text-white' : 'text-muted-foreground'
                    )} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={cn(
                        'font-semibold transition-colors',
                        activeFeature === index ? 'text-forma-teal' : 'text-foreground'
                      )}>
                        {feature.title}
                      </h3>
                      <Badge className={cn('text-[10px] text-white', feature.badgeColor)}>
                        {feature.badge}
                      </Badge>
                    </div>
                    <p className={cn(
                      'text-sm transition-all',
                      activeFeature === index ? 'text-muted-foreground' : 'text-muted-foreground/70 line-clamp-1'
                    )}>
                      {feature.description}
                    </p>
                  </div>
                  <ChevronRight className={cn(
                    'h-5 w-5 transition-all',
                    activeFeature === index ? 'text-forma-teal rotate-90' : 'text-muted-foreground'
                  )} />
                </div>
              </button>
            ))}
          </div>

          {/* Feature Preview */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-forma-teal/20 to-purple-500/20 opacity-50 blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-1 aspect-[4/3]">
              <div className="h-full w-full rounded-xl bg-forma-navy flex items-center justify-center">
                <div className="text-center p-8">
                  <div className={cn(
                    'mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-r',
                    features[activeFeature].gradient
                  )}>
                    {(() => {
                      const Icon = features[activeFeature].icon;
                      return <Icon className="h-10 w-10 text-white" />;
                    })()}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {features[activeFeature].title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">
                    {features[activeFeature].titleAr}
                  </p>
                  <p className="text-gray-300 max-w-md mx-auto">
                    {features[activeFeature].description}
                  </p>
                  {features[activeFeature].video && (
                    <button className="mt-6 inline-flex items-center gap-2 text-forma-teal hover:underline">
                      <Play className="h-4 w-4" />
                      Watch Demo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Features Grid */}
        <div className="border-t border-border/50 pt-16">
          <h3 className="text-center text-lg font-semibold mb-8">And so much more...</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {additionalFeatures.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border/50 bg-card/50 p-4 text-center transition-all hover:border-forma-teal/50 hover:bg-forma-teal/5"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted group-hover:bg-forma-teal/20 transition-colors">
                  <feature.icon className="h-5 w-5 text-muted-foreground group-hover:text-forma-teal transition-colors" />
                </div>
                <h4 className="font-medium text-sm mb-1">{feature.title}</h4>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <p className="text-muted-foreground mb-4">
            Ready to experience all these features?
          </p>
          <a
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-forma-teal px-8 py-3 font-semibold text-black transition-all hover:bg-forma-teal/90 hover:shadow-[0_0_30px_rgba(0,212,170,0.3)]"
          >
            <Zap className="h-5 w-5" />
            Start Free Today
          </a>
        </div>
      </div>
    </section>
  );
}
