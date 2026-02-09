'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Mail,
  MessageCircle,
  HelpCircle,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

const faqs = [
  {
    question: 'How do I create a workout plan?',
    answer: 'Go to Workouts → Create Plan, add exercises, set your schedule, and save your custom plan. You can also use "What Now?" to get a personalized recommendation.',
  },
  {
    question: 'How do I track my nutrition?',
    answer: 'Navigate to Nutrition, search for Egyptian and international foods, and log your meals. The app tracks calories, protein, carbs, and fats automatically.',
  },
  {
    question: 'How do I log my weight and progress?',
    answer: 'Go to Progress → Log Weight to record your current weight. You can also take progress photos and view your trends over time.',
  },
  {
    question: 'How do I find exercises for a specific muscle?',
    answer: 'Go to Exercises and use the filters to select your target muscle group, equipment, and difficulty level.',
  },
  {
    question: 'How does the "What Now?" feature work?',
    answer: 'Tell it your available time, energy level, and location (gym/home/outdoor), and it will suggest the perfect workout for your situation.',
  },
  {
    question: 'How do I check my exercise form?',
    answer: 'Use the Form Check feature in Workouts. It uses your camera to analyze your form and provide real-time feedback on exercises like squats and push-ups.',
  },
  {
    question: 'What is Voice Coach?',
    answer: 'Voice Coach provides hands-free workout guidance. It announces exercises, counts reps, manages rest times, and gives form reminders - all through voice.',
  },
  {
    question: 'How do I connect with a trainer?',
    answer: 'Visit the Trainers marketplace to browse certified trainers. You can view their specialties, ratings, and book sessions directly.',
  },
  {
    question: 'How do I become a trainer on Forma?',
    answer: 'Go to Settings → Become a Trainer, fill out your qualifications, upload certifications, and submit your application for review.',
  },
  {
    question: 'What are the subscription tiers?',
    answer: 'Free tier includes basic tracking. Premium adds unlimited personalized recommendations, advanced analytics, and trainer messaging. Premium Plus includes personal coaching.',
  },
  {
    question: 'How do I change my language?',
    answer: 'Go to Settings and select your preferred language. Forma supports both English and Arabic.',
  },
  {
    question: 'Is my chat private?',
    answer: 'Yes, all messages are end-to-end encrypted. Only you and your conversation partner can read them.',
  },
];

export default function HelpPage() {
  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground mt-2">
          Find answers to common questions or get in touch with our team
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardContent className="pt-6 text-center">
            <MessageCircle className="h-10 w-10 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold">Live Chat</h3>
            <p className="text-sm text-muted-foreground mt-1">Chat with support</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardContent className="pt-6 text-center">
            <Mail className="h-10 w-10 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold">Email Us</h3>
            <p className="text-sm text-muted-foreground mt-1">support@forma.fitness</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-10 w-10 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold">Guides</h3>
            <p className="text-sm text-muted-foreground mt-1">Learn how to use Forma</p>
          </CardContent>
        </Card>
      </div>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
              <h4 className="font-medium flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" />
                {faq.question}
              </h4>
              <p className="text-sm text-muted-foreground mt-1 ml-6">
                {faq.answer}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-muted-foreground mb-4">
          Can&apos;t find what you&apos;re looking for?
        </p>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
