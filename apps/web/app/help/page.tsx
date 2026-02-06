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
    answer: 'Go to Workouts → Create Plan, add exercises, and save your custom plan.',
  },
  {
    question: 'How do I track my nutrition?',
    answer: 'Navigate to Nutrition, search for foods, and log your meals for each day.',
  },
  {
    question: 'How do I connect with a trainer?',
    answer: 'Visit the Trainers marketplace to browse and connect with certified trainers.',
  },
  {
    question: 'How do I upgrade my subscription?',
    answer: 'Go to Settings → Subscription to view plans and upgrade.',
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
