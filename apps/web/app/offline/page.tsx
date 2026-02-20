'use client';

import { WifiOff, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function OfflinePage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-12 h-12 text-gray-500 dark:text-gray-400" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {isAr ? 'أنت مش متصل بالإنترنت' : "You're Offline"}
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {isAr
            ? 'مفيش اتصال بالإنترنت. متقلقش - تقدر تسجل تمارينك وهتتزامن لما ترجع أونلاين.'
            : "No internet connection. Don't worry - you can still log your workouts and they'll sync when you're back online."}
        </p>

        <div className="space-y-4">
          <button
            onClick={handleRetry}
            className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            {isAr ? 'حاول تاني' : 'Try Again'}
          </button>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {isAr ? 'متاح بدون إنترنت:' : 'Available Offline:'}
            </h2>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {isAr ? 'تسجيل التمارين (هتتزامن بعدين)' : 'Log workouts (syncs later)'}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {isAr ? 'عرض خطط التمارين المحفوظة' : 'View cached workout plans'}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {isAr ? 'تصفح مكتبة التمارين' : 'Browse exercise library'}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
