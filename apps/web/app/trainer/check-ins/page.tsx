'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Calendar,
  Loader2,
  ChevronRight,
  Dumbbell,
  Utensils,
  Moon,
  Smile,
  Battery,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { checkInsApi, trainersApi, type DailyCheckIn, type TrainerClientResponse } from '@/lib/api';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';

const ratingColors: Record<number, string> = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-green-500',
  5: 'bg-emerald-500',
};

function RatingBadge({
  value,
  label,
  isAr,
}: {
  value: number | null | undefined;
  label: string;
  isAr: boolean;
}) {
  if (value === null || value === undefined) return null;

  const translatedLabel = (() => {
    if (!isAr) return label;
    switch (label) {
      case 'Workout':   return 'تمرين';
      case 'Nutrition': return 'تغذية';
      case 'Sleep':     return 'نوم';
      case 'Energy':    return 'طاقة';
      case 'Stress':    return 'توتر';
      case 'Mood':      return 'مزاج';
      default:          return label;
    }
  })();

  return (
    <div className="flex items-center gap-2">
      <div className={cn('w-2 h-2 rounded-full', ratingColors[value])} />
      <span className="text-sm">{translatedLabel}: {value}/5</span>
    </div>
  );
}

function ClientCheckInCard({
  client,
  onViewDetails,
  isAr,
}: {
  client: TrainerClientResponse;
  onViewDetails: () => void;
  isAr: boolean;
}) {
  const { data: checkIns, isLoading } = useQuery({
    queryKey: ['client-checkins', client.clientId],
    queryFn: () => checkInsApi.getClientCheckIns(client.clientId, 7),
  });

  const todayCheckIn = checkIns?.find(
    (c) => new Date(c.date).toDateString() === new Date().toDateString()
  );

  const weeklyCompliance = checkIns
    ? Math.round((checkIns.filter((c) => c.workoutCompleted).length / 7) * 100)
    : 0;

  return (
    <Card className="glass border-border/50 hover:border-primary/30 transition-all cursor-pointer" onClick={onViewDetails}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-border/50">
              <AvatarImage src={client.client.avatarUrl || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {client.client.firstName?.charAt(0)}
                {client.client.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">
                {client.client.firstName} {client.client.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {client.currentProgram?.name || (isAr ? 'مفيش برنامج' : 'No program')}
              </p>
            </div>
          </div>
          {todayCheckIn ? (
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {isAr ? 'سجّل' : 'Checked In'}
            </Badge>
          ) : (
            <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
              <AlertCircle className="h-3 w-3 mr-1" />
              {isAr ? 'لسه ماسجّلش' : 'No Check-In'}
            </Badge>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {/* Weekly compliance */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">
                {isAr ? 'الالتزام بالتمارين الأسبوعي' : 'Weekly Workout Compliance'}
              </span>
              <span className="font-medium">{weeklyCompliance}%</span>
            </div>
            <Progress value={weeklyCompliance} className="h-2" />
          </div>

          {/* Today's stats */}
          {todayCheckIn && (
            <div className="grid grid-cols-3 gap-2 pt-2">
              {todayCheckIn.workoutCompleted !== undefined && (
                <div className="flex items-center gap-1 text-xs">
                  <Dumbbell className={cn(
                    'h-3 w-3',
                    todayCheckIn.workoutCompleted ? 'text-green-500' : 'text-red-500'
                  )} />
                  <span>
                    {todayCheckIn.workoutCompleted
                      ? (isAr ? 'خلص' : 'Done')
                      : (isAr ? 'اتعداها' : 'Skipped')}
                  </span>
                </div>
              )}
              {todayCheckIn.sleepHours && (
                <div className="flex items-center gap-1 text-xs">
                  <Moon className="h-3 w-3 text-blue-500" />
                  <span>
                    {todayCheckIn.sleepHours}h {isAr ? 'نوم' : 'sleep'}
                  </span>
                </div>
              )}
              {todayCheckIn.mood && (
                <div className="flex items-center gap-1 text-xs">
                  <Smile className="h-3 w-3 text-yellow-500" />
                  <span>{isAr ? 'المزاج:' : 'Mood:'} {todayCheckIn.mood}/5</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

function ClientDetailDialog({
  client,
  open,
  onOpenChange,
  isAr,
}: {
  client: TrainerClientResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAr: boolean;
}) {
  const { data: checkIns, isLoading } = useQuery({
    queryKey: ['client-checkins', client?.clientId],
    queryFn: () => checkInsApi.getClientCheckIns(client!.clientId, 14),
    enabled: !!client,
  });

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={client.client.avatarUrl || undefined} />
              <AvatarFallback>
                {client.client.firstName?.charAt(0)}
                {client.client.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              {client.client.firstName} {client.client.lastName}
              <p className="text-sm font-normal text-muted-foreground">
                {isAr ? 'آخر 14 يوم' : 'Last 14 Days Check-Ins'}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !checkIns || checkIns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {isAr ? 'مفيش تسجيلات لسه' : 'No check-ins recorded yet'}
            </div>
          ) : (
            <div className="space-y-4">
              {checkIns.map((checkIn) => (
                <Card key={checkIn.id} className="border-border/50">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {new Date(checkIn.date).toLocaleDateString(
                            isAr ? 'ar-EG' : 'en-US',
                            {
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric',
                            }
                          )}
                        </span>
                      </div>
                      {checkIn.workoutCompleted ? (
                        <Badge className="bg-green-500/10 text-green-500">
                          {isAr ? 'التمرين خلص' : 'Workout Done'}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          {isAr ? 'يوم راحة' : 'Rest Day'}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {checkIn.workoutRating && (
                        <RatingBadge value={checkIn.workoutRating} label="Workout" isAr={isAr} />
                      )}
                      {checkIn.nutritionRating && (
                        <RatingBadge value={checkIn.nutritionRating} label="Nutrition" isAr={isAr} />
                      )}
                      {checkIn.sleepQuality && (
                        <RatingBadge value={checkIn.sleepQuality} label="Sleep" isAr={isAr} />
                      )}
                      {checkIn.energyLevel && (
                        <RatingBadge value={checkIn.energyLevel} label="Energy" isAr={isAr} />
                      )}
                      {checkIn.stressLevel && (
                        <RatingBadge value={checkIn.stressLevel} label="Stress" isAr={isAr} />
                      )}
                      {checkIn.mood && (
                        <RatingBadge value={checkIn.mood} label="Mood" isAr={isAr} />
                      )}
                    </div>

                    {checkIn.sleepHours && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {isAr ? 'نوم:' : 'Sleep:'} {checkIn.sleepHours} {isAr ? 'ساعات' : 'hours'}
                      </p>
                    )}

                    {(checkIn.workoutNotes || checkIn.nutritionNotes || checkIn.notes) && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        {checkIn.workoutNotes && (
                          <p className="text-sm">
                            <strong>{isAr ? 'تمرين:' : 'Workout:'}</strong> {checkIn.workoutNotes}
                          </p>
                        )}
                        {checkIn.nutritionNotes && (
                          <p className="text-sm">
                            <strong>{isAr ? 'تغذية:' : 'Nutrition:'}</strong> {checkIn.nutritionNotes}
                          </p>
                        )}
                        {checkIn.notes && (
                          <p className="text-sm">
                            <strong>{isAr ? 'ملاحظات:' : 'Notes:'}</strong> {checkIn.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <Link href={`/trainer/messages?client=${client.clientId}`}>
              <Button variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                {isAr ? 'راسل العميل' : 'Message Client'}
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function TrainerCheckInsPage() {
  const [selectedClient, setSelectedClient] = useState<TrainerClientResponse | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['trainer-clients'],
    queryFn: () => trainersApi.getClients(),
  });

  const { data: noCheckInClients, isLoading: noCheckInLoading } = useQuery({
    queryKey: ['clients-no-checkin'],
    queryFn: () => checkInsApi.getClientsWithoutCheckIn(),
  });

  const handleViewDetails = (client: TrainerClientResponse) => {
    setSelectedClient(client);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          {isAr ? 'متابعة العملاء' : 'Client Check-Ins'}
        </h1>
        <p className="text-muted-foreground">
          {isAr ? 'تابع تقدم عملاءك اليومي' : "Monitor your clients' daily progress"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isAr ? 'إجمالي العملاء' : 'Total Clients'}
                </p>
                <p className="text-2xl font-bold">{clients?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isAr ? 'سجلوا النهاردة' : 'Checked In Today'}
                </p>
                <p className="text-2xl font-bold">
                  {(clients?.length || 0) - (noCheckInClients?.length || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-500/10">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isAr ? 'لسه ماسجلوش' : 'Missing Check-In'}
                </p>
                <p className="text-2xl font-bold">{noCheckInClients?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients without check-in alert */}
      {noCheckInClients && noCheckInClients.length > 0 && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              {isAr ? 'عملاء لسه ماسجلوش النهاردة' : "Clients Who Haven't Checked In Today"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {noCheckInClients.map((client) => (
                <Link
                  key={client.id}
                  href={`/trainer/messages?client=${client.id}`}
                >
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 transition-colors"
                  >
                    <Avatar className="h-5 w-5 mr-2">
                      <AvatarImage src={client.avatarUrl || undefined} />
                      <AvatarFallback className="text-[10px]">
                        {client.firstName?.charAt(0)}{client.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {client.firstName} {client.lastName}
                    <MessageSquare className="h-3 w-3 ml-2" />
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clients List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">{isAr ? 'كل العملاء' : 'All Clients'}</TabsTrigger>
          <TabsTrigger value="today">{isAr ? 'سجلوا النهاردة' : 'Checked In Today'}</TabsTrigger>
          <TabsTrigger value="missing">{isAr ? 'لسه ماسجلوش' : 'Missing Check-In'}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {clientsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !clients || clients.length === 0 ? (
            <Card className="glass border-border/50">
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  {isAr ? 'مفيش عملاء لسه' : 'No clients yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clients.map((client) => (
                <ClientCheckInCard
                  key={client.id}
                  client={client}
                  onViewDetails={() => handleViewDetails(client)}
                  isAr={isAr}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="today" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clients
              ?.filter((c) => !noCheckInClients?.some((nc) => nc.id === c.clientId))
              .map((client) => (
                <ClientCheckInCard
                  key={client.id}
                  client={client}
                  onViewDetails={() => handleViewDetails(client)}
                  isAr={isAr}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="missing" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clients
              ?.filter((c) => noCheckInClients?.some((nc) => nc.id === c.clientId))
              .map((client) => (
                <ClientCheckInCard
                  key={client.id}
                  client={client}
                  onViewDetails={() => handleViewDetails(client)}
                  isAr={isAr}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Client Details Dialog */}
      <ClientDetailDialog
        client={selectedClient}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        isAr={isAr}
      />
    </div>
  );
}
