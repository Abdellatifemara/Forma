'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  useEffect(() => {
    console.error('[App Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-3 mb-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h2 className="text-xl font-bold mb-2">
        {isAr ? 'حصلت مشكلة' : 'Something went wrong'}
      </h2>
      <p className="text-muted-foreground max-w-md mb-6">
        {isAr
          ? 'حصل خطأ غير متوقع. جرب تاني أو ارجع للرئيسية.'
          : 'An unexpected error occurred. Try again or go back to the dashboard.'}
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          {isAr ? 'حاول تاني' : 'Try Again'}
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          <Home className="h-4 w-4" />
          {isAr ? 'الرئيسية' : 'Dashboard'}
        </Link>
      </div>
    </div>
  );
}
