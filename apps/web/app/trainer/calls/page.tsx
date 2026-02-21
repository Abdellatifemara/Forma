'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Video,
  Phone,
  Calendar,
  Clock,
  Plus,
  Loader2,
  Play,
  X,
  Check,
  Users,
  MessageSquare,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  scheduledCallsApi,
  trainersApi,
  type ScheduledCall,
  type ScheduledCallType,
  type CreateScheduledCallData,
  type TrainerClientResponse,
} from '@/lib/api';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';

function getCallTypeLabels(isAr: boolean): Record<ScheduledCallType, { label: string; color: string }> {
  return {
    ONBOARDING: { label: isAr ? 'تعارف' : 'Onboarding', color: 'bg-blue-500' },
    WEEKLY_CHECKIN: { label: isAr ? 'متابعة أسبوعية' : 'Weekly Check-in', color: 'bg-green-500' },
    PROGRESS_REVIEW: { label: isAr ? 'مراجعة تقدم' : 'Progress Review', color: 'bg-purple-500' },
    PROGRAM_UPDATE: { label: isAr ? 'تحديث برنامج' : 'Program Update', color: 'bg-orange-500' },
    EMERGENCY: { label: isAr ? 'طوارئ' : 'Emergency', color: 'bg-red-500' },
    CUSTOM: { label: isAr ? 'مخصص' : 'Custom', color: 'bg-gray-500' },
  };
}

function getStatusLabels(isAr: boolean): Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> {
  return {
    SCHEDULED: { label: isAr ? 'مجدول' : 'Scheduled', variant: 'secondary' },
    CONFIRMED: { label: isAr ? 'مؤكد' : 'Confirmed', variant: 'default' },
    IN_PROGRESS: { label: isAr ? 'جاري' : 'In Progress', variant: 'default' },
    COMPLETED: { label: isAr ? 'مكتمل' : 'Completed', variant: 'outline' },
    CANCELLED: { label: isAr ? 'ملغي' : 'Cancelled', variant: 'destructive' },
    NO_SHOW: { label: isAr ? 'لم يحضر' : 'No Show', variant: 'destructive' },
  };
}

function CallCard({
  call,
  clients,
  onStart,
  onEnd,
  onCancel,
}: {
  call: ScheduledCall;
  clients: TrainerClientResponse[];
  onStart: (id: string) => void;
  onEnd: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const callTypeLabels = getCallTypeLabels(isAr);
  const statusLabels = getStatusLabels(isAr);
  const locale = isAr ? 'ar-EG' : 'en-US';

  const client = clients.find((c) => c.clientId === call.clientId);
  const typeInfo = callTypeLabels[call.type];
  const statusInfo = statusLabels[call.status];
  const scheduledDate = new Date(call.scheduledAt);
  const isToday = scheduledDate.toDateString() === new Date().toDateString();
  const isPast = scheduledDate < new Date() && call.status === 'SCHEDULED';
  const isActive = call.status === 'IN_PROGRESS';

  return (
    <Card className={cn(
      'glass border-border/50 transition-all',
      isActive && 'border-green-500/50 ring-2 ring-green-500/20',
      isPast && call.status === 'SCHEDULED' && 'border-red-500/30'
    )}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-border/50">
              <AvatarImage src={client?.client.avatarUrl || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {client?.client.firstName?.charAt(0)}
                {client?.client.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">
                {client?.client.firstName} {client?.client.lastName}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className={cn('w-2 h-2 rounded-full', typeInfo.color)} />
                <span className="text-sm text-muted-foreground">{typeInfo.label}</span>
              </div>
            </div>
          </div>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {isToday
                ? (isAr ? 'النهاردة' : 'Today')
                : scheduledDate.toLocaleDateString(locale, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {scheduledDate.toLocaleTimeString(locale, {
                hour: '2-digit',
                minute: '2-digit',
              })} ({call.duration} {isAr ? 'دقيقة' : 'min'})
            </span>
          </div>
          {call.agenda && (
            <div className="flex items-start gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="text-muted-foreground">{call.agenda}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          {call.status === 'SCHEDULED' && (
            <>
              <Button
                size="sm"
                className="flex-1 btn-primary"
                onClick={() => onStart(call.id)}
              >
                <Play className="h-4 w-4 me-2" />
                {isAr ? 'ابدأ المكالمة' : 'Start Call'}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onCancel(call.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
          {call.status === 'IN_PROGRESS' && (
            <>
              {call.meetingUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(call.meetingUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 me-2" />
                  {isAr ? 'افتح الاجتماع' : 'Open Meeting'}
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => onEnd(call.id)}
              >
                <Check className="h-4 w-4 me-2" />
                {isAr ? 'إنهاء المكالمة' : 'End Call'}
              </Button>
            </>
          )}
          {call.status === 'COMPLETED' && call.trainerNotes && (
            <div className="w-full p-2 bg-muted/50 rounded text-sm">
              <strong>{isAr ? 'ملاحظات:' : 'Notes:'}</strong> {call.trainerNotes}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ScheduleCallDialog({
  open,
  onOpenChange,
  clients,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: TrainerClientResponse[];
}) {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const callTypeLabels = getCallTypeLabels(isAr);

  const queryClient = useQueryClient();
  const [clientId, setClientId] = useState('');
  const [type, setType] = useState<ScheduledCallType>('WEEKLY_CHECKIN');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('30');
  const [agenda, setAgenda] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: CreateScheduledCallData) => scheduledCallsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-calls'] });
      queryClient.invalidateQueries({ queryKey: ['today-calls'] });
      onOpenChange(false);
      // Reset form
      setClientId('');
      setDate('');
      setTime('');
      setAgenda('');
    },
  });

  const handleSubmit = () => {
    if (!clientId || !date || !time) return;
    createMutation.mutate({
      clientId,
      type,
      scheduledAt: `${date}T${time}:00`,
      duration: parseInt(duration),
      agenda: agenda || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isAr ? 'جدول مكالمة' : 'Schedule a Call'}</DialogTitle>
          <DialogDescription>
            {isAr ? 'حجز مكالمة فيديو مع عميلك' : 'Book a video call with your client'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>{isAr ? 'العميل' : 'Client'}</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder={isAr ? 'اختر العميل' : 'Select client'} />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.clientId} value={client.clientId}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={client.client.avatarUrl || undefined} />
                        <AvatarFallback className="text-xs">
                          {client.client.firstName?.charAt(0)}
                          {client.client.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {client.client.firstName} {client.client.lastName}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{isAr ? 'نوع المكالمة' : 'Call Type'}</Label>
            <Select value={type} onValueChange={(v) => setType(v as ScheduledCallType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(callTypeLabels).map(([key, { label, color }]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', color)} />
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isAr ? 'التاريخ' : 'Date'}</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? 'الوقت' : 'Time'}</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{isAr ? 'المدة' : 'Duration'}</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">{isAr ? '15 دقيقة' : '15 minutes'}</SelectItem>
                <SelectItem value="30">{isAr ? '30 دقيقة' : '30 minutes'}</SelectItem>
                <SelectItem value="45">{isAr ? '45 دقيقة' : '45 minutes'}</SelectItem>
                <SelectItem value="60">{isAr ? 'ساعة' : '1 hour'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{isAr ? 'الأجندة (اختياري)' : 'Agenda (optional)'}</Label>
            <Textarea
              placeholder={isAr ? 'هتتكلموا عن إيه؟' : 'What will you discuss?'}
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
            />
          </div>

          <Button
            className="w-full btn-primary"
            onClick={handleSubmit}
            disabled={!clientId || !date || !time || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin me-2" />
            ) : (
              <Calendar className="h-4 w-4 me-2" />
            )}
            {isAr ? 'جدول مكالمة' : 'Schedule Call'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function TrainerCallsPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const statusLabels = getStatusLabels(isAr);
  const locale = isAr ? 'ar-EG' : 'en-US';

  const queryClient = useQueryClient();
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['trainer-clients'],
    queryFn: () => trainersApi.getClients(),
  });

  const { data: allCalls, isLoading: callsLoading } = useQuery({
    queryKey: ['trainer-calls'],
    queryFn: () => scheduledCallsApi.getTrainerCalls({ upcoming: false }),
  });

  const { data: todayCalls } = useQuery({
    queryKey: ['today-calls'],
    queryFn: () => scheduledCallsApi.getTodaysCalls(),
  });

  const startCallMutation = useMutation({
    mutationFn: (id: string) => scheduledCallsApi.start(id),
    onSuccess: (call) => {
      queryClient.invalidateQueries({ queryKey: ['trainer-calls'] });
      queryClient.invalidateQueries({ queryKey: ['today-calls'] });
      if (call.meetingUrl) {
        window.open(call.meetingUrl, '_blank');
      }
    },
  });

  const endCallMutation = useMutation({
    mutationFn: (id: string) => scheduledCallsApi.end(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-calls'] });
      queryClient.invalidateQueries({ queryKey: ['today-calls'] });
    },
  });

  const cancelCallMutation = useMutation({
    mutationFn: (id: string) => scheduledCallsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-calls'] });
      queryClient.invalidateQueries({ queryKey: ['today-calls'] });
    },
  });

  const upcomingCalls = allCalls?.filter(
    (c) => c.status === 'SCHEDULED' && new Date(c.scheduledAt) >= new Date()
  );
  const activeCalls = allCalls?.filter((c) => c.status === 'IN_PROGRESS');
  const pastCalls = allCalls?.filter(
    (c) => c.status === 'COMPLETED' || c.status === 'CANCELLED' || c.status === 'NO_SHOW'
  );

  const isLoading = clientsLoading || callsLoading;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isAr ? 'المكالمات المجدولة' : 'Scheduled Calls'}
          </h1>
          <p className="text-muted-foreground">
            {isAr ? 'إدارة مكالمات الفيديو مع عملاءك' : 'Manage video calls with your clients'}
          </p>
        </div>
        <Button className="btn-primary" onClick={() => setScheduleOpen(true)}>
          <Plus className="me-2 h-4 w-4" />
          {isAr ? 'جدول مكالمة' : 'Schedule Call'}
        </Button>
      </div>

      {/* Today's Calls Alert */}
      {todayCalls && todayCalls.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              {isAr ? `مكالمات النهاردة (${todayCalls.length})` : `Today's Calls (${todayCalls.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayCalls.map((call) => {
                const client = clients?.find((c) => c.clientId === call.clientId);
                return (
                  <div key={call.id} className="flex items-center justify-between p-2 rounded bg-background/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={client?.client.avatarUrl || undefined} />
                        <AvatarFallback className="text-xs">
                          {client?.client.firstName?.charAt(0)}
                          {client?.client.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {client?.client.firstName} {client?.client.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(call.scheduledAt).toLocaleTimeString(locale, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge variant={statusLabels[call.status].variant}>
                      {statusLabels[call.status].label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isAr ? 'النهاردة' : 'Today'}
                </p>
                <p className="text-2xl font-bold">{todayCalls?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Play className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isAr ? 'نشط' : 'Active'}
                </p>
                <p className="text-2xl font-bold">{activeCalls?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isAr ? 'قادمة' : 'Upcoming'}
                </p>
                <p className="text-2xl font-bold">{upcomingCalls?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Check className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isAr ? 'مكتملة' : 'Completed'}
                </p>
                <p className="text-2xl font-bold">
                  {pastCalls?.filter((c) => c.status === 'COMPLETED').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calls Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">
            {isAr ? `قادمة (${upcomingCalls?.length || 0})` : `Upcoming (${upcomingCalls?.length || 0})`}
          </TabsTrigger>
          <TabsTrigger value="active">
            {isAr ? `نشط (${activeCalls?.length || 0})` : `Active (${activeCalls?.length || 0})`}
          </TabsTrigger>
          <TabsTrigger value="past">
            {isAr ? `سابقة (${pastCalls?.length || 0})` : `Past (${pastCalls?.length || 0})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !upcomingCalls || upcomingCalls.length === 0 ? (
            <Card className="glass border-border/50">
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  {isAr ? 'مفيش مكالمات قادمة' : 'No upcoming calls'}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setScheduleOpen(true)}
                >
                  <Plus className="h-4 w-4 me-2" />
                  {isAr ? 'جدول مكالمة' : 'Schedule a Call'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingCalls.map((call) => (
                <CallCard
                  key={call.id}
                  call={call}
                  clients={clients || []}
                  onStart={(id) => startCallMutation.mutate(id)}
                  onEnd={(id) => endCallMutation.mutate(id)}
                  onCancel={(id) => cancelCallMutation.mutate(id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-4">
          {!activeCalls || activeCalls.length === 0 ? (
            <Card className="glass border-border/50">
              <CardContent className="py-12 text-center">
                <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  {isAr ? 'مفيش مكالمات نشطة' : 'No active calls'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeCalls.map((call) => (
                <CallCard
                  key={call.id}
                  call={call}
                  clients={clients || []}
                  onStart={(id) => startCallMutation.mutate(id)}
                  onEnd={(id) => endCallMutation.mutate(id)}
                  onCancel={(id) => cancelCallMutation.mutate(id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          {!pastCalls || pastCalls.length === 0 ? (
            <Card className="glass border-border/50">
              <CardContent className="py-12 text-center">
                <Check className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  {isAr ? 'مفيش مكالمات سابقة' : 'No past calls'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastCalls.slice(0, 12).map((call) => (
                <CallCard
                  key={call.id}
                  call={call}
                  clients={clients || []}
                  onStart={(id) => startCallMutation.mutate(id)}
                  onEnd={(id) => endCallMutation.mutate(id)}
                  onCancel={(id) => cancelCallMutation.mutate(id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Schedule Dialog */}
      <ScheduleCallDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        clients={clients || []}
      />
    </div>
  );
}
