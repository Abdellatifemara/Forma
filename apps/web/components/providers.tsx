'use client';

import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from '@/lib/i18n';
import { SurveyProvider } from '@/components/research/survey-provider';
import { setupGlobalErrorHandlers } from '@/lib/error-reporter';
import { ErrorBoundary } from '@/components/error-boundary';

function SurveyWrapper({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  return (
    <SurveyProvider language={language}>
      {children}
    </SurveyProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    setupGlobalErrorHandlers();
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 min - data stays fresh longer
            gcTime: 10 * 60 * 1000,   // 10 min - keep in cache longer
            refetchOnWindowFocus: false,
            refetchOnReconnect: 'always',
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
          },
        },
      })
  );

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <SurveyWrapper>
              {children}
            </SurveyWrapper>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
