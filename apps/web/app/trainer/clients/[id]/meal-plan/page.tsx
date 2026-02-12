'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Utensils,
  Apple,
  Pill,
  Calendar,
  Clock,
  Construction,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ClientMealPlanPage() {
  const params = useParams();
  const clientId = params.id as string;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/trainer/clients/${clientId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Meal Plan Management</h1>
          <p className="text-muted-foreground">Create and manage nutrition plans</p>
        </div>
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 ml-auto">
          Coming Soon
        </Badge>
      </div>

      {/* Coming Soon Card */}
      <Card className="glass border-amber-500/30 bg-amber-500/5">
        <CardContent className="py-12">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-6">
              <Construction className="h-8 w-8 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Meal Plan Builder Coming Soon</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Create personalized meal plans for your clients with our Egyptian food database,
              supplement recommendations, and macro tracking.
            </p>

            {/* Preview of features */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-3xl mx-auto">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <Utensils className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
                <p className="font-medium text-sm">Custom Meals</p>
                <p className="text-xs text-muted-foreground">Egyptian food database</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <Pill className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                <p className="font-medium text-sm">Supplements</p>
                <p className="text-xs text-muted-foreground">Local market options</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <Calendar className="h-6 w-6 text-green-400 mx-auto mb-2" />
                <p className="font-medium text-sm">Weekly Plans</p>
                <p className="text-xs text-muted-foreground">7-day meal scheduling</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <Apple className="h-6 w-6 text-red-400 mx-auto mb-2" />
                <p className="font-medium text-sm">Macro Tracking</p>
                <p className="text-xs text-muted-foreground">Protein, carbs, fats</p>
              </div>
            </div>

            <div className="mt-8">
              <Button variant="outline" asChild>
                <Link href={`/trainer/clients/${clientId}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Client
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What's Available Now */}
      <Card className="glass border-border/50">
        <CardContent className="py-6">
          <h3 className="font-semibold mb-4">What you can do now:</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              View client&apos;s logged meals in their nutrition tab
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Send nutrition advice via messages
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Track client&apos;s weight progress in their overview
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
