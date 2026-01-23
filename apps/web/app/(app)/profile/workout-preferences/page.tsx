'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function WorkoutPreferencesPage() {
  return (
    <div className="space-y-6 pb-20 lg:ml-64 lg:pb-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/profile">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Workout Preferences</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Workout preferences coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
