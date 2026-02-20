'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, Crown, Sparkles, ArrowRight, User2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { inviteApi, type InviteVerification } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';

type VerificationState =
  | { status: 'loading' }
  | { status: 'valid'; data: InviteVerification }
  | { status: 'error'; message: string };

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const code = params.code as string;

  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [verification, setVerification] = useState<VerificationState>({ status: 'loading' });
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemResult, setRedeemResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    async function verifyCode() {
      try {
        const result = await inviteApi.verify(code);
        setVerification({ status: 'valid', data: result });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid invite code';
        setVerification({ status: 'error', message });
      }
    }

    if (code) {
      verifyCode();
    }
  }, [code]);

  const handleRedeem = async () => {
    if (!user) {
      // Redirect to signup with the invite code
      router.push(`/signup?invite=${code}`);
      return;
    }

    try {
      setIsRedeeming(true);
      const result = await inviteApi.redeem(code);
      setRedeemResult({
        success: true,
        message: result.premiumGranted
          ? isAr ? 'أهلاً! تم تفعيل وصول بريميوم ليك.' : 'Welcome! You have been granted Premium access.'
          : isAr ? 'أهلاً! اتوصلت بالمدرب بتاعك.' : 'Welcome! You are now connected with your trainer.',
      });
      // Redirect to dashboard after success
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to redeem invite';
      setRedeemResult({ success: false, message });
    } finally {
      setIsRedeeming(false);
    }
  };

  // Loading state
  if (verification.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{isAr ? 'جاري التحقق من كود الدعوة...' : 'Verifying invite code...'}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (verification.status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center">
          <div className="glass rounded-2xl p-8">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">{isAr ? 'كود دعوة غير صالح' : 'Invalid Invite'}</h1>
            <p className="text-muted-foreground mb-6">{verification.message}</p>
            <Button asChild>
              <Link href="/">{isAr ? 'الصفحة الرئيسية' : 'Go Home'}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { trainer, grantsPremium } = verification.data;

  // Success state - show trainer info and join button
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-secondary/15 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-md w-full">
        {redeemResult ? (
          // Redeem result
          <div className="glass rounded-2xl p-8 text-center animate-fade-up">
            {redeemResult.success ? (
              <>
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">{isAr ? 'تم بنجاح!' : 'Success!'}</h1>
                <p className="text-muted-foreground mb-4">{redeemResult.message}</p>
                <p className="text-sm text-muted-foreground">{isAr ? 'جاري التحويل...' : 'Redirecting to dashboard...'}</p>
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">{isAr ? 'حصل مشكلة' : 'Something went wrong'}</h1>
                <p className="text-muted-foreground mb-6">{redeemResult.message}</p>
                <Button onClick={() => setRedeemResult(null)}>{isAr ? 'حاول تاني' : 'Try Again'}</Button>
              </>
            )}
          </div>
        ) : (
          // Invite card
          <div className="glass rounded-2xl overflow-hidden animate-fade-up">
            {/* Header with gradient */}
            <div className="bg-gradient-to-br from-cyan-500 via-cyan-600 to-purple-600 p-6 text-white">
              <p className="text-sm opacity-80 mb-2">{isAr ? 'أنت مدعو للتدريب مع' : "You've been invited to train with"}</p>
              <div className="flex items-center gap-4">
                {trainer.avatarUrl ? (
                  <img
                    src={trainer.avatarUrl}
                    alt={trainer.name}
                    className="w-16 h-16 rounded-full border-2 border-white/30"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center">
                    <User2 className="h-8 w-8" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold">{trainer.name}</h1>
                  {trainer.tier === 'TRUSTED_PARTNER' && (
                    <div className="flex items-center gap-1 text-yellow-300 text-sm">
                      <Crown className="h-4 w-4" />
                      <span>{isAr ? 'شريك موثوق' : 'Trusted Partner'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Specializations */}
              {trainer.specializations.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{isAr ? 'التخصصات' : 'Specializations'}</p>
                  <div className="flex flex-wrap gap-2">
                    {trainer.specializations.map((spec, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Premium badge */}
              {grantsPremium && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                  <div>
                    <p className="font-semibold text-yellow-500">{isAr ? 'وصول بريميوم مجاني' : 'Premium Access Included'}</p>
                    <p className="text-sm text-muted-foreground">
                      {isAr ? 'هتاخد مميزات بريميوم مجاناً مع الدعوة دي' : "You'll get free Premium features with this invite"}
                    </p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-3">
                {authLoading ? (
                  <Button disabled className="w-full h-12">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    {isAr ? 'جاري التحميل...' : 'Loading...'}
                  </Button>
                ) : user ? (
                  <Button
                    onClick={handleRedeem}
                    disabled={isRedeeming}
                    className="w-full h-12 btn-primary"
                  >
                    {isRedeeming ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        {isAr ? 'جاري الانضمام...' : 'Joining...'}
                      </>
                    ) : (
                      <>
                        {isAr ? 'انضم دلوقتي' : 'Join Now'}
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleRedeem}
                      className="w-full h-12 btn-primary"
                    >
                      {isAr ? 'سجل حساب وانضم' : 'Create Account & Join'}
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                      {isAr ? 'عندك حساب بالفعل?' : 'Already have an account?'}{' '}
                      <Link href={`/login?redirect=/join/${code}`} className="text-primary hover:underline">
                        {isAr ? 'سجل دخول' : 'Log in'}
                      </Link>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
