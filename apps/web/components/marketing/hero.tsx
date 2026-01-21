'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Smartphone, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 py-20 md:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-forma-teal/10 blur-[100px]" />
      </div>

      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 inline-flex items-center rounded-full border bg-muted px-4 py-1.5">
              <Star className="mr-2 h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">
                Rated 4.9/5 by 10,000+ users in Egypt
              </span>
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Shape Your{' '}
            <span className="bg-gradient-to-r from-forma-teal to-forma-teal-light bg-clip-text text-transparent">
              Future
            </span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Egypt's premier AI-powered fitness platform. Get personalized workouts,
            track your nutrition, and connect with certified trainers—all in one app.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button size="xl" variant="forma" asChild>
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href="#demo">
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Link>
            </Button>
          </motion.div>

          <motion.div
            className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center">
              <Smartphone className="mr-2 h-4 w-4" />
              iOS & Android
            </div>
            <div className="hidden h-4 w-px bg-border sm:block" />
            <div>No credit card required</div>
            <div className="hidden h-4 w-px bg-border sm:block" />
            <div>Cancel anytime</div>
          </motion.div>
        </div>

        {/* App Preview */}
        <motion.div
          className="mx-auto mt-16 max-w-5xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-forma-teal/20 to-transparent blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl border bg-card shadow-2xl">
              <div className="aspect-[16/9] bg-gradient-to-br from-forma-navy to-forma-navy-light p-8">
                <div className="grid h-full grid-cols-3 gap-4">
                  {/* Mock dashboard preview */}
                  <div className="rounded-xl bg-white/5 p-4">
                    <div className="h-3 w-20 rounded-full bg-white/20" />
                    <div className="mt-4 h-24 rounded-lg bg-forma-teal/20" />
                    <div className="mt-4 space-y-2">
                      <div className="h-2 w-full rounded-full bg-white/10" />
                      <div className="h-2 w-3/4 rounded-full bg-white/10" />
                    </div>
                  </div>
                  <div className="col-span-2 rounded-xl bg-white/5 p-4">
                    <div className="h-3 w-32 rounded-full bg-white/20" />
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="h-20 rounded-lg bg-gradient-to-br from-forma-teal/30 to-forma-teal/10"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
