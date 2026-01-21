'use client';

import Link from 'next/link';
import { CheckCircle, Clock, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TrainerApplicationSuccessPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center pb-20 lg:ml-64 lg:pb-6">
      <Card className="max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-forma-teal/10">
            <CheckCircle className="h-8 w-8 text-forma-teal" />
          </div>

          <h1 className="text-2xl font-bold">Application Submitted!</h1>
          <p className="mt-3 text-muted-foreground">
            Thank you for applying to become a Forma trainer. We've received your
            application and will review it shortly.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-4 text-left">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Review Time</p>
                <p className="text-sm text-muted-foreground">
                  Applications are typically reviewed within 2-3 business days
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-4 text-left">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Check Your Email</p>
                <p className="text-sm text-muted-foreground">
                  We'll send you an email with the next steps once your
                  application is reviewed
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Button variant="forma" className="w-full" asChild>
              <Link href="/app/dashboard">Return to Dashboard</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/app/profile">View Your Profile</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
