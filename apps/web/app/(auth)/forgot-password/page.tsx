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
      <Card className="border-border/50 bg-card/80 backdrop-blur w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-forma-orange/20">
            <Mail className="h-8 w-8 text-forma-orange" />
          </div>
          <CardTitle className="text-2xl">{t.auth.resetSuccess}</CardTitle>
          <CardDescription>
            {t.auth.resetSuccessDesc}{' '}
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            {t.auth.didntReceiveEmail}{' '}
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-forma-orange hover:underline"
            >
              {t.auth.tryAnotherEmail}
            </button>
          </p>

          <Button
            variant="outline"
            className="w-full"
            asChild
          >
            <Link href="/login">
              <ArrowLeft className="me-2 h-4 w-4" />
              {t.auth.backToLogin}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t.auth.forgotPasswordTitle}</CardTitle>
        <CardDescription>
          {t.auth.forgotPasswordDesc}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              {t.auth.email}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                {t.auth.sending}
              </>
            ) : (
              t.auth.sendResetLink
            )}
          </Button>

          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href="/login">
              <ArrowLeft className="me-2 h-4 w-4" />
              {t.auth.backToLogin}
            </Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
