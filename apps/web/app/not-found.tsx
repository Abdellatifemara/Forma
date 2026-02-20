'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';

export default function NotFound() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-forma-teal">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">{isAr ? 'الصفحة مش موجودة' : 'Page Not Found'}</h2>
      <p className="mt-2 text-muted-foreground">
        {isAr ? 'الصفحة اللي بتدور عليها مش موجودة.' : 'The page you are looking for does not exist.'}
      </p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-forma-teal px-6 py-2 text-white hover:bg-forma-teal/90"
      >
        {isAr ? 'الصفحة الرئيسية' : 'Go Home'}
      </Link>
    </div>
  );
}
