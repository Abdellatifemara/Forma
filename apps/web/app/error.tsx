'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-red-500">500</h1>
      <h2 className="mt-4 text-2xl font-semibold">{isAr ? 'حصل مشكلة' : 'Something went wrong'}</h2>
      <p className="mt-2 text-muted-foreground">
        {isAr ? 'حصل خطأ غير متوقع. حاول تاني من فضلك.' : 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-md bg-forma-orange px-6 py-2 text-white hover:bg-forma-orange/90"
      >
        {isAr ? 'حاول تاني' : 'Try again'}
      </button>
    </div>
  );
}
