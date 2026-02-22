'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, AlertCircle, Mail, Lock, ChevronRight, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { authApi, setAuthCookie, setRefreshCookie } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function LoginForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const isEmailValid = formData.email ? emailRegex.test(formData.email) : true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.password) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.login({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      });

      // Store tokens in cookies
      setAuthCookie(response.accessToken);
      if (response.refreshToken) {
        setRefreshCookie(response.refreshToken);
      }

      // Redirect based on user role
      const userRole = response.user?.role?.toUpperCase();
      let destination = redirectTo;

      // Only override redirect if going to generic dashboard
      if (redirectTo === '/dashboard') {
        if (userRole === 'TRAINER') {
          destination = '/trainer/dashboard';
        } else if (userRole === 'ADMIN') {
          destination = '/admin/dashboard';
        }
      }

      router.push(destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo with icon */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-block">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-primary">FORMA</span>
          </h1>
        </Link>
        <p className="text-muted-foreground mt-1.5 text-sm">Your fitness journey starts here</p>
      </div>

      {/* Card with enhanced styling */}
      <div className="relative rounded-3xl border border-border/40 bg-card/80 backdrop-blur-xl p-8 shadow-xl shadow-black/5">
        {/* Subtle top accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-gradient-to-r from-primary to-forma-orange" />

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">{t.auth.login}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Continue your fitness journey
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">{t.auth.email}</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setError(null);
                }}
                className={cn(
                  "pl-10 h-11 rounded-xl bg-muted/40 border-border/50 focus:border-primary/50 focus:ring-primary/20",
                  formData.email && !isEmailValid && "border-destructive"
                )}
                required
              />
            </div>
            {formData.email && !isEmailValid && (
              <p className="text-xs text-destructive">Please enter a valid email address</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">{t.auth.password}</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                {t.auth.forgotPassword}
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setError(null);
                }}
                className="pl-10 pr-10 h-11 rounded-xl bg-muted/40 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/25 transition-all"
            disabled={isLoading || !formData.email || !formData.password}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.common.loading}
              </>
            ) : (
              <>
                {t.auth.login}
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/40" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-3 text-muted-foreground">{t.auth.orContinueWith}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-11 rounded-xl border-border/40 bg-muted/20 hover:bg-muted/40" disabled>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {t.auth.google}
          </Button>
          <Button variant="outline" className="h-11 rounded-xl border-border/40 bg-muted/20 hover:bg-muted/40" disabled>
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            {t.auth.apple}
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t.auth.noAccount}{' '}
          <Link href="/signup" className="text-primary hover:underline font-semibold">
            {t.auth.signup}
          </Link>
        </p>
      </div>

      {/* Terms */}
      <p className="mt-6 text-center text-xs text-muted-foreground/70">
        By signing in, you agree to our{' '}
        <Link href="/terms" className="underline hover:text-foreground">Terms</Link>
        {' '}&{' '}
        <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
      </p>
    </div>
  );
}
