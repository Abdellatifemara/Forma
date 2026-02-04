'use client';

import Link from 'next/link';
import { ArrowRight, Check, Dumbbell, Apple, TrendingUp, Users, Camera, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Dumbbell,
    title: 'Smart Workouts',
    description: 'Personalized programs that adapt to your schedule, equipment, and progress. 500+ exercises with video guides.',
    color: 'bg-coral-500',
  },
  {
    icon: Apple,
    title: 'Nutrition Made Simple',
    description: 'Track meals effortlessly with our Egyptian food database. Scan barcodes or search local dishes.',
    color: 'bg-green-500',
  },
  {
    icon: TrendingUp,
    title: 'Track Everything',
    description: 'Progress photos, body measurements, strength gains. See how far you\'ve come with visual charts.',
    color: 'bg-blue-500',
  },
  {
    icon: Users,
    title: 'Squad Challenges',
    description: 'Train with friends. Compete in weekly challenges. Climb the leaderboard together.',
    color: 'bg-purple-500',
  },
  {
    icon: Camera,
    title: 'Form Checker',
    description: 'Point your camera while exercising. Get instant feedback on your technique. Free and private.',
    color: 'bg-pink-500',
  },
  {
    icon: Moon,
    title: 'Ramadan Mode',
    description: 'Workouts and meals adjusted around fasting. Built for our community\'s needs.',
    color: 'bg-indigo-500',
  },
];

const stats = [
  { value: '500+', label: 'Exercises' },
  { value: '50K+', label: 'Members' },
  { value: '1M+', label: 'Workouts Done' },
  { value: '4.9★', label: 'App Rating' },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Everything you need to{' '}
            <span className="text-coral-500">succeed</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for fitness enthusiasts in Egypt. Features that actually matter for your journey.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="group rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color} text-white mb-4`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Strip */}
        <div className="mt-20 grid grid-cols-2 gap-8 sm:grid-cols-4">
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
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
