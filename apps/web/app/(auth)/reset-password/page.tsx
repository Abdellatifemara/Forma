'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.formaeg.com';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <Card className="border-border/50 bg-card/80 backdrop-blur w-full max-w-md">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError(isAr ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to reset password');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || (isAr ? 'حدث خطأ. حاول مرة أخرى.' : 'Something went wrong. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {isAr ? 'رابط غير صالح' : 'Invalid Link'}
          </CardTitle>
          <CardDescription>
            {isAr ? 'رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية.' : 'This password reset link is invalid or has expired.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="forma" className="w-full" asChild>
            <Link href="/forgot-password">
              {isAr ? 'طلب رابط جديد' : 'Request New Link'}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <CardTitle className="text-2xl">
            {isAr ? 'تم تغيير كلمة المرور' : 'Password Reset'}
          </CardTitle>
          <CardDescription>
            {isAr ? 'تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.' : 'Your password has been reset successfully. You can now log in.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="forma" className="w-full" asChild>
            <Link href="/login">
              {isAr ? 'تسجيل الدخول' : 'Log In'}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {isAr ? 'كلمة مرور جديدة' : 'New Password'}
        </CardTitle>
        <CardDescription>
          {isAr ? 'أدخل كلمة المرور الجديدة' : 'Enter your new password'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">
              {isAr ? 'كلمة المرور الجديدة' : 'New Password'}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">
              {isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}
            </Label>
            <Input
              id="confirm"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            variant="forma"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isAr ? 'جاري التغيير...' : 'Resetting...'}
              </>
            ) : (
              isAr ? 'تغيير كلمة المرور' : 'Reset Password'
            )}
          </Button>

          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {isAr ? 'العودة لتسجيل الدخول' : 'Back to Login'}
            </Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
