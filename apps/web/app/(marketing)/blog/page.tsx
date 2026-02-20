'use client';

import { FileText } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function BlogPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">
          {isAr ? 'المدونة' : 'Blog'}
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          {isAr
            ? 'قريباً هنشارك معاك نصائح لياقة، أدلة تغذية، وبرامج تمارين.'
            : 'Coming soon. Stay tuned for fitness tips, nutrition guides, and workout routines.'}
        </p>
      </div>
    </div>
  );
}
