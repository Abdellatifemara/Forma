'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Award, Shield, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const benefits = [
  {
    icon: Users,
    title: 'Reach More Clients',
    description: 'Access thousands of fitness enthusiasts across Egypt looking for professional guidance.',
  },
  {
    icon: Shield,
    title: 'Verified Credentials',
    description: 'Stand out with our certification verification. Build trust with verified badges.',
  },
  {
    icon: TrendingUp,
    title: 'Grow Your Business',
    description: 'Use our tools to manage clients, track progress, and scale your coaching practice.',
  },
  {
    icon: Award,
    title: 'Competitive Commission',
    description: 'Keep 85% of your earnings. No hidden fees, no surprises. Get paid weekly.',
  },
];

export function TrainersSection() {
  return (
    <section id="trainers" className="py-20 md:py-32">
      <div className="container">
        <div className="grid gap-8 md:gap-12 md:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Are you a{' '}
              <span className="text-forma-teal">fitness professional</span>?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join Egypt's growing community of certified trainers. Build your
              online coaching business with Forma's powerful tools and reach
              clients nationwide.
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  className="flex gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="shrink-0 rounded-lg bg-forma-teal/10 p-2 text-forma-teal">
                    <benefit.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{benefit.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-10">
              <Button variant="forma" size="lg" asChild>
                <Link href="/trainer/apply">
                  Apply as a Trainer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-forma-navy to-forma-navy-light p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,212,170,0.15),transparent)]" />

              {/* Stats Cards */}
              <div className="relative space-y-4">
                <div className="rounded-xl bg-white/10 p-6 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Active Clients</span>
                    <span className="text-2xl font-bold text-white">47</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/20">
                    <div className="h-full w-3/4 rounded-full bg-forma-teal" />
                  </div>
                </div>

                <div className="rounded-xl bg-white/10 p-6 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Monthly Revenue</span>
                    <span className="text-2xl font-bold text-white">12,450 EGP</span>
                  </div>
                  <p className="mt-1 text-xs text-forma-teal">+23% from last month</p>
                </div>

                <div className="rounded-xl bg-white/10 p-6 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Client Satisfaction</span>
                    <span className="text-2xl font-bold text-white">4.9/5</span>
                  </div>
                  <div className="mt-2 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${
                          i < 5 ? 'bg-yellow-400' : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
