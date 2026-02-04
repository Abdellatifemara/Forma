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
    default: 'Forma - Shape Your Future',
    template: '%s | Forma',
  },
  description:
    'Egypt\'s premier AI-powered fitness platform. Personalized workouts, nutrition tracking, and expert coaching.',
  keywords: [
    'fitness',
    'workout',
    'nutrition',
    'Egypt',
    'gym',
    'personal trainer',
    'AI fitness',
    'Arabic fitness app',
  ],
  authors: [{ name: 'Forma' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ar_EG',
    url: 'https://formaeg.com',
    siteName: 'Forma',
    title: 'Forma - Shape Your Future',
    description:
      'Egypt\'s premier AI-powered fitness platform. Personalized workouts, nutrition tracking, and expert coaching.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Forma - Shape Your Future',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forma - Shape Your Future',
    description:
      'Egypt\'s premier AI-powered fitness platform. Personalized workouts, nutrition tracking, and expert coaching.',
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
      <body className={`${inter.variable} ${cairo.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
