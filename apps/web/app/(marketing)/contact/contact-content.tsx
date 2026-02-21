'use client';

import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';

export default function ContactContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-8">{isAr ? 'تواصل معانا' : 'Contact Us'}</h1>
      {plan && (
        <p className="text-center text-forma-orange mb-4">
          {isAr
            ? `مهتم بباقة ${plan.charAt(0).toUpperCase() + plan.slice(1)}`
            : `Interested in the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan`}
        </p>
      )}
      <p className="text-center text-muted-foreground mb-8">
        {isAr ? 'عندك أسئلة؟ يسعدنا نسمع منك.' : "Have questions? We'd love to hear from you."}
      </p>
      <div className="max-w-md mx-auto text-center">
        <p className="text-muted-foreground">
          {isAr ? 'الإيميل' : 'Email'}: support@formaeg.com
        </p>
      </div>
    </div>
  );
}
