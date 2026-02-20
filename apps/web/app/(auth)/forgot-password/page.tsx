'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authApi } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await authApi.forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      // Always show success to prevent email enumeration
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-forma-teal/20">
            <Mail className="h-8 w-8 text-forma-teal" />
          </div>
          <CardTitle className="text-2xl text-white">{t.auth.resetSuccess}</CardTitle>
          <CardDescription className="text-white/60">
            {t.auth.resetSuccessDesc}{' '}
            <span className="text-white">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-white/50">
            {t.auth.didntReceiveEmail}{' '}
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-forma-teal hover:underline"
            >
              {t.auth.tryAnotherEmail}
            </button>
          </p>

          <Button
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10"
            asChild
          >
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.auth.backToLogin}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white">{t.auth.forgotPasswordTitle}</CardTitle>
        <CardDescription className="text-white/60">
          {t.auth.forgotPasswordDesc}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">
              {t.auth.email}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            variant="forma"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.auth.sending}
              </>
            ) : (
              t.auth.sendResetLink
            )}
          </Button>

          <Button
            variant="ghost"
            className="w-full text-white/60 hover:text-white"
            asChild
          >
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.auth.backToLogin}
            </Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
