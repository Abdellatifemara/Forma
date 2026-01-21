'use client';

import { motion } from 'framer-motion';
import {
  Brain,
  Dumbbell,
  LineChart,
  MessageCircle,
  Salad,
  Users,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Workouts',
    description:
      'Get personalized workout plans that adapt to your progress, equipment, and goals. Our AI learns from your performance.',
  },
  {
    icon: Salad,
    title: 'Smart Nutrition Tracking',
    description:
      'Track your meals with our Egyptian food database. Scan barcodes, search local dishes, and hit your macros effortlessly.',
  },
  {
    icon: LineChart,
    title: 'Progress Analytics',
    description:
      'Visualize your journey with beautiful charts. Track weight, measurements, strength gains, and body composition.',
  },
  {
    icon: Dumbbell,
    title: '3,000+ Exercises',
    description:
      'Access our comprehensive exercise library with video demonstrations, muscle targeting, and proper form guidance.',
  },
  {
    icon: Users,
    title: 'Certified Trainers',
    description:
      'Connect with vetted Egyptian fitness professionals. Get personalized coaching and accountability.',
  },
  {
    icon: MessageCircle,
    title: 'AI Coach Chat',
    description:
      'Ask questions anytime. Get instant answers about exercises, nutrition, and training from our AI assistant.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            className="text-3xl font-bold tracking-tight md:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Everything you need to{' '}
            <span className="text-forma-teal">transform</span>
          </motion.h2>
          <motion.p
            className="mt-4 text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Forma combines cutting-edge AI with Egyptian fitness expertise to
            deliver a complete health platform.
          </motion.p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group relative rounded-2xl border bg-card p-8 transition-colors hover:border-forma-teal/50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="mb-4 inline-flex rounded-xl bg-forma-teal/10 p-3 text-forma-teal">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
