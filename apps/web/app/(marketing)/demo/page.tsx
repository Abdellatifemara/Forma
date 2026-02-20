'use client';

import { Play } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function DemoPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-8">
        {isAr ? 'شاهد العرض' : 'Watch Demo'}
      </h1>
      <div className="max-w-3xl mx-auto">
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Play className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground">
              {isAr ? 'فيديو العرض قريباً' : 'Demo video coming soon'}
            </p>
          </div>
        </div>
        <p className="text-center text-muted-foreground">
          {isAr
            ? 'شوف إزاي فورما هتغير رحلتك الرياضية مع تمارين ذكية بالـ AI، تتبع التغذية، وتدريب شخصي.'
            : 'See how Forma can transform your fitness journey with AI-powered workouts, nutrition tracking, and personalized coaching.'}
        </p>
      </div>
    </div>
  );
}
