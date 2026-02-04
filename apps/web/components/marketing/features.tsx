'use client';

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
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: Camera,
    title: 'AI Form Checker',
    titleAr: 'مصحح الحركات',
    description: 'Real-time pose detection analyzes your exercise form using your camera. Get instant feedback on-device — completely free and private.',
    badge: 'FREE',
    badgeColor: 'bg-green-500',
    gradient: 'from-blue-500 to-cyan-500',
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
    badge: 'SMART',
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
    title: 'XP & Levels',
    titleAr: 'نقاط الخبرة',
    description: 'Earn XP for every workout and achievement. Progress through 10 levels from "Beginner" to "Elite". Compete on leaderboards.',
    badge: 'GAMIFIED',
    badgeColor: 'bg-yellow-500',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Shield,
    title: 'Injury-Aware Training',
    titleAr: 'تدريب مراعي للإصابات',
    description: 'Got a shoulder injury? Knee pain? The app automatically modifies your workouts and suggests safe alternatives.',
    badge: 'SAFE',
    badgeColor: 'bg-red-500',
    gradient: 'from-red-500 to-pink-500',
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
  {
    icon: Activity,
    title: 'Wearable Sync',
    titleAr: 'مزامنة الأجهزة',
    description: 'Connect Apple Health, Google Fit, or Garmin. Your HRV and sleep data create a daily "Readiness Score" to optimize training.',
    badge: 'SMART',
    badgeColor: 'bg-forma-teal',
    gradient: 'from-forma-teal to-cyan-500',
  },
  {
    icon: LineChart,
    title: 'Body Composition',
    titleAr: 'تركيب الجسم',
    description: 'Track weight, body fat, and measurements. Get BMI analysis, progress visualization, and AI-powered recommendations.',
    badge: 'TRACK',
    badgeColor: 'bg-blue-500',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    icon: Wifi,
    title: 'Offline Mode',
    titleAr: 'بدون إنترنت',
    description: 'Full PWA with offline support. Log workouts without internet — they sync automatically when you\'re back online.',
    badge: 'FREE',
    badgeColor: 'bg-green-500',
    gradient: 'from-gray-500 to-slate-500',
  },
  {
    icon: MessageCircle,
    title: 'Coach Chat',
    titleAr: 'محادثة المدرب',
    description: 'Chat with your trainer using text, voice notes, and images. Share progress, ask questions, get personalized guidance.',
    badge: 'PRO',
    badgeColor: 'bg-violet-500',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Brain,
    title: 'AI Workout Plans',
    titleAr: 'خطط بالذكاء الاصطناعي',
    description: 'Tell us your goals, experience, and equipment. Our AI creates a complete personalized workout plan in seconds.',
    badge: 'AI',
    badgeColor: 'bg-violet-500',
    gradient: 'from-violet-500 to-fuchsia-500',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/30">
      <div className="container">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <Badge className="mb-4 bg-forma-teal/10 text-forma-teal border-forma-teal/20 hover:bg-forma-teal/20">
            12 Powerful Features
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Everything you need to{' '}
            <span className="text-gradient">transform</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Built specifically for the MENA region. Arabic-first design, Ramadan mode,
            and features that actually matter for your fitness journey.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border bg-card p-6 transition-all duration-300 hover:border-forma-teal/50 hover:shadow-xl hover:shadow-forma-teal/5 hover:-translate-y-1 animate-fade-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Badge */}
              <Badge
                className={`absolute top-4 right-4 text-[10px] text-white ${feature.badgeColor}`}
              >
                {feature.badge}
              </Badge>

              {/* Icon */}
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${feature.gradient} text-white shadow-lg`}>
                <feature.icon className="h-6 w-6" />
              </div>

              {/* Content */}
              <h3 className="mb-1 text-lg font-semibold group-hover:text-forma-teal transition-colors">
                {feature.title}
              </h3>
              <p className="text-xs text-muted-foreground mb-2 font-cairo">
                {feature.titleAr}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Ready to experience all these features?
          </p>
          <a
            href="/signup"
            className="inline-flex items-center gap-2 btn-premium px-8 py-3 rounded-xl font-semibold"
          >
            <Zap className="h-5 w-5" />
            Start Free Today
          </a>
        </div>
      </div>
    </section>
  );
}
