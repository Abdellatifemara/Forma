'use client';

import { Video, Calendar, Clock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n';
import { useSubscription } from '@/hooks/use-subscription';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function VideoConsultationsPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { tier } = useSubscription();
  const isPremiumPlus = tier === 'PREMIUM_PLUS';

  return (
    <div className={cn('space-y-6 pb-20', isAr && 'font-cairo')}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Video className="h-6 w-6 text-primary" />
          {isAr ? 'استشارات فيديو' : 'Video Consultations'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isAr ? 'مكالمات فيديو شهرية مع مدربك الشخصي' : 'Monthly video calls with your personal trainer'}
        </p>
      </div>

      {isPremiumPlus ? (
        <div className="space-y-4">
          <Card className="rounded-2xl border-primary/20 bg-primary/5">
            <CardContent className="p-6 text-center">
              <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                <Video className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold mb-2">
                {isAr ? 'جلسات الفيديو قريباً' : 'Video Sessions Coming Soon'}
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                {isAr
                  ? 'بنجهز نظام حجز الجلسات. لحد ما يجهز، تقدر تتواصل مع مدربك من الشات مباشرة.'
                  : "We're setting up the booking system. In the meantime, you can reach your trainer directly through chat."}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{isAr ? '2 جلسة/شهر' : '2 sessions/month'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{isAr ? '30 دقيقة لكل جلسة' : '30 min per session'}</span>
                </div>
              </div>
              <Button className="mt-6" asChild>
                <Link href="/chat">
                  {isAr ? 'تواصل مع مدربك' : 'Chat with your Trainer'}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="rounded-2xl">
          <CardContent className="p-6 text-center">
            <div className="p-4 rounded-full bg-purple-500/10 w-fit mx-auto mb-4">
              <Crown className="h-8 w-8 text-purple-500" />
            </div>
            <h2 className="text-lg font-semibold mb-2">
              {isAr ? 'ميزة Premium+' : 'Premium+ Feature'}
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
              {isAr
                ? 'استشارات الفيديو متاحة فقط لمشتركي Premium+. ارتقِ الآن للحصول على جلسات فيديو شهرية مع مدربك.'
                : 'Video consultations are available for Premium+ subscribers. Upgrade to get monthly video sessions with your trainer.'}
            </p>
            <Badge className="mb-4 bg-purple-500/10 text-purple-500 border-purple-500/30">
              {isAr ? 'ابتداءً من 999 جنيه/شهر' : 'Starting at 999 EGP/month'}
            </Badge>
            <br />
            <Button className="mt-4 bg-purple-500 hover:bg-purple-600 text-white" asChild>
              <Link href="/profile/subscription">
                <Crown className="h-4 w-4 me-2" />
                {isAr ? 'ارتقِ إلى Premium+' : 'Upgrade to Premium+'}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
