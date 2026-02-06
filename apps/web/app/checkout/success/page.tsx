'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Trigger confetti
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.1, 0.9),
          y: Math.random() - 0.2,
        },
        colors: ['#22d3ee', '#a855f7', '#3b82f6', '#ec4899'],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  // Auto redirect countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-md">
        {/* Success icon */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-400 animate-bounce" />
        </div>

        {/* Text */}
        <h1 className="text-3xl font-bold mb-4">
          Welcome to{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
            Premium
          </span>
        </h1>
        <p className="text-muted-foreground mb-8">
          Your payment was successful! You now have access to all premium features.
          Let's continue your fitness journey.
        </p>

        {/* CTA */}
        <Button
          className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-500 text-white mb-4"
          asChild
        >
          <Link href="/dashboard">
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>

        {/* Auto redirect */}
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Redirecting in {countdown} seconds...
        </p>

        {/* Quick links */}
        <div className="mt-12 grid grid-cols-2 gap-4">
          <Link
            href="/workouts"
            className="p-4 rounded-xl border border-border/50 hover:border-primary/50 transition-colors"
          >
            <p className="font-medium">Start Workout</p>
            <p className="text-xs text-muted-foreground">Use premium features</p>
          </Link>
          <Link
            href="/settings/subscription"
            className="p-4 rounded-xl border border-border/50 hover:border-primary/50 transition-colors"
          >
            <p className="font-medium">Manage Plan</p>
            <p className="text-xs text-muted-foreground">View subscription</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
