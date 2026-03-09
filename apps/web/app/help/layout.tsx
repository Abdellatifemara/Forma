import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Help & FAQ',
  description:
    'Answers to common questions about FormaEG — workouts, nutrition tracking, AI coaching, subscriptions, and more.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I create a workout plan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Go to Workouts → Create Plan, add exercises, set your schedule, and save your custom plan.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I track my nutrition?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Navigate to Nutrition, search for Egyptian and international foods, and log your meals. The app tracks calories, protein, carbs, and fats automatically.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are the subscription tiers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Premium (299 LE/mo) includes AI coaching, personalized recommendations, and full app access. Premium Plus (999 LE/mo) adds personal owner review, white-glove coaching, and health stats.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do Fitness Tests work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Fitness Tests measure your actual capabilities (push-ups, plank hold, pull-ups) so the app can personalize your workouts to your real level.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I connect with a trainer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Visit the Trainers marketplace to browse certified trainers. You can view their specialties, ratings, and book sessions directly.',
      },
    },
  ],
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
