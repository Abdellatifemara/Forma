import type { Metadata } from 'next';
import { Cairo, Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import '@/styles/globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://formaeg.com'),
  title: {
    default: 'FormaEG - Shape Your Future',
    template: '%s | FormaEG',
  },
  description:
    'Egypt\'s complete fitness platform. Personalized workouts, nutrition tracking, and expert coaching — built for Egyptians.',
  keywords: [
    'fitness',
    'workout',
    'nutrition',
    'Egypt',
    'gym',
    'personal trainer',
    'fitness app Egypt',
    'Arabic fitness app',
    'FormaEG',
  ],
  authors: [{ name: 'FormaEG' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ar_EG',
    url: 'https://formaeg.com',
    siteName: 'FormaEG',
    title: 'FormaEG - Shape Your Future',
    description:
      'Egypt\'s complete fitness platform. Personalized workouts, nutrition tracking, and expert coaching — built for Egyptians.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FormaEG - Shape Your Future',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FormaEG - Shape Your Future',
    description:
      'Egypt\'s complete fitness platform. Personalized workouts, nutrition tracking, and expert coaching — built for Egyptians.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F97316" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={`${inter.variable} ${cairo.variable} font-sans antialiased`}>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var l = localStorage.getItem('forma-lang');
            if (l === 'ar') {
              document.documentElement.lang = 'ar';
              document.body.style.fontFamily = 'Cairo, sans-serif';
            }
          } catch(e) {}
        `}} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
