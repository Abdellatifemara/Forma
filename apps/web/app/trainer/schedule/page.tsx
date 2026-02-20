'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Video,
  MessageSquare,
  FileText,
  Save,
  Loader2,
  Trash2,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getAuthCookie } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';

const DAYS_EN = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

const DAYS_AR = [
  { value: 0, label: 'الأحد', short: 'أحد' },
  { value: 1, label: 'الاثنين', short: 'اثنين' },
  { value: 2, label: 'الثلاثاء', short: 'ثلاثاء' },
  { value: 3, label: 'الأربعاء', short: 'أربعاء' },
  { value: 4, label: 'الخميس', short: 'خميس' },
  { value: 5, label: 'الجمعة', short: 'جمعة' },
  { value: 6, label: 'السبت', short: 'سبت' },
];

const TIMES = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = (i % 2) * 30;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

interface AvailabilitySlot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotMinutes: number;
}

interface ScheduledCall {
  id: string;
  scheduledAt: string;
  duration: number;
  type: string;
  status: string;
  client: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  trainer: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export default function SchedulePage() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [currentWeek, setCurrentWeek] = useState(0);
  const [view, setView] = useState<'week' | 'day'>('week');
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [calls, setCalls] = useState<ScheduledCall[]>([]);
  const [todaysCalls, setTodaysCalls] = useState<ScheduledCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const DAYS = isAr ? DAYS_AR : DAYS_EN;
  const locale = isAr ? 'ar-EG' : 'en-US';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getAuthCookie();
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch availability
      const availRes = await fetch(`${API_URL}/scheduled-calls/availability/me`, { headers });
      if (availRes.ok) {
        const data = await availRes.json();
        setSlots(data);
      }

      // Fetch calls
      const callsRes = await fetch(`${API_URL}/scheduled-calls/trainer/all?upcoming=true`, { headers });
      if (callsRes.ok) {
        const data = await callsRes.json();
        setCalls(data);
      }

      // Fetch today's calls
      const todayRes = await fetch(`${API_URL}/scheduled-calls/trainer/today`, { headers });
      if (todayRes.ok) {
        const data = await todayRes.json();
        setTodaysCalls(data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSlot = () => {
    setSlots([
      ...slots,
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', slotMinutes: 30 },
    ]);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: keyof AvailabilitySlot, value: string | number) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlots(newSlots);
  };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      const token = getAuthCookie();
      const res = await fetch(`${API_URL}/scheduled-calls/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slots }),
      });

      if (res.ok) {
        toast({
          title: isAr ? 'محفوظ' : 'Saved',
          description: isAr ? 'تم تحديث مواعيدك' : 'Your availability has been updated.',
        });
        setAvailabilityOpen(false);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'فشل حفظ المواعيد' : 'Failed to save availability.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmCall = async (callId: string) => {
    try {
      const token = getAuthCookie();
      const res = await fetch(`${API_URL}/scheduled-calls/${callId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        toast({
          title: isAr ? 'مؤكد' : 'Confirmed',
          description: isAr ? 'تم تأكيد المكالمة' : 'Call has been confirmed.',
        });
        fetchData();
      }
    } catch (error) {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'فشل تأكيد المكالمة' : 'Failed to confirm call.',
        variant: 'destructive',
      });
    }
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'ONBOARDING':
      case 'video':
        return <Video className="h-3 w-3" />;
      case 'WEEKLY_CHECKIN':
      case 'check-in':
        return <MessageSquare className="h-3 w-3" />;
      case 'PROGRESS_REVIEW':
      case 'form-review':
        return <FileText className="h-3 w-3" />;
      default:
        return <Calendar className="h-3 w-3" />;
    }
  };

  const getWeekDates = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (currentWeek * 7));

    return DAYS_EN.map((_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  };

  const formatHour = (hour: number): string => {
    if (isAr) {
      const date = new Date();
      date.setHours(hour, 0, 0, 0);
      return date.toLocaleTimeString('ar-EG', { hour: 'numeric', hour12: true });
    }
    if (hour > 12) return `${hour - 12} PM`;
    if (hour === 12) return '12 PM';
    return `${hour} AM`;
  };

  const weekDates = getWeekDates();
  const hours = Array.from({ length: 12 }, (_, i) => i + 8);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{isAr ? 'الجدول' : 'Schedule'}</h1>
          <p className="text-muted-foreground">
            {isAr ? 'إدارة جلسات عملاءك' : 'Manage your client sessions'}
          </p>
        </div>
        <Dialog open={availabilityOpen} onOpenChange={setAvailabilityOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              {isAr ? 'تحديد المواعيد' : 'Set Availability'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isAr ? 'حدد مواعيدك المتاحة' : 'Set Your Availability'}</DialogTitle>
              <DialogDescription>
                {isAr
                  ? 'حدد الأوقات اللي العملاء يقدروا يحجزوا فيها مكالمات'
                  : 'Define when clients can book video calls with you.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {slots.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{isAr ? 'مفيش مواعيد محددة' : 'No availability set'}</p>
                  <p className="text-sm">
                    {isAr ? 'أضف أوقات عشان العملاء يقدروا يحجزوا' : 'Add time slots to let clients book calls'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {slots.map((slot, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30">
                      <Select
                        value={slot.dayOfWeek.toString()}
                        onValueChange={(v) => updateSlot(index, 'dayOfWeek', parseInt(v))}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS.map((day) => (
                            <SelectItem key={day.value} value={day.value.toString()}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={slot.startTime}
                        onValueChange={(v) => updateSlot(index, 'startTime', v)}
                      >
                        <SelectTrigger className="w-[90px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIMES.map((time) => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <span className="text-muted-foreground text-sm">
                        {isAr ? 'إلى' : 'to'}
                      </span>

                      <Select
                        value={slot.endTime}
                        onValueChange={(v) => updateSlot(index, 'endTime', v)}
                      >
                        <SelectTrigger className="w-[90px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIMES.map((time) => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={slot.slotMinutes.toString()}
                        onValueChange={(v) => updateSlot(index, 'slotMinutes', parseInt(v))}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">{isAr ? '15 دقيقة' : '15 min'}</SelectItem>
                          <SelectItem value="30">{isAr ? '30 دقيقة' : '30 min'}</SelectItem>
                          <SelectItem value="45">{isAr ? '45 دقيقة' : '45 min'}</SelectItem>
                          <SelectItem value="60">{isAr ? '60 دقيقة' : '60 min'}</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSlot(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button variant="outline" onClick={addSlot} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {isAr ? 'أضف وقت' : 'Add Time Slot'}
              </Button>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setAvailabilityOpen(false)}>
                  {isAr ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button onClick={saveAvailability} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  {isAr ? 'حفظ التغييرات' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Calendar */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setCurrentWeek(currentWeek - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle>
                {weekDates[0].toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
                {' - '}
                {weekDates[6].toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setCurrentWeek(currentWeek + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setCurrentWeek(0)}>
              {isAr ? 'النهاردة' : 'Today'}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header */}
                <div className="grid grid-cols-8 border-b">
                  <div className="p-2 text-sm font-medium text-muted-foreground" />
                  {DAYS.map((day, index) => {
                    const date = weekDates[index];
                    const isToday = date.toDateString() === new Date().toDateString();
                    return (
                      <div key={day.value} className={`p-2 text-center ${isToday ? 'bg-forma-teal/10' : ''}`}>
                        <p className="text-sm font-medium">{day.short}</p>
                        <p className={`text-lg font-bold ${isToday ? 'text-forma-teal' : ''}`}>
                          {date.getDate()}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Time slots */}
                <div className="relative">
                  {hours.map((hour) => (
                    <div key={hour} className="grid grid-cols-8 border-b">
                      <div className="p-2 text-right text-sm text-muted-foreground">
                        {formatHour(hour)}
                      </div>
                      {DAYS.map((_, dayIndex) => {
                        const date = weekDates[dayIndex];
                        const isToday = date.toDateString() === new Date().toDateString();

                        // Find calls for this day and hour
                        const dayCalls = calls.filter((call) => {
                          const callDate = new Date(call.scheduledAt);
                          return (
                            callDate.toDateString() === date.toDateString() &&
                            callDate.getHours() === hour
                          );
                        });

                        return (
                          <div
                            key={dayIndex}
                            className={`relative h-16 border-l ${isToday ? 'bg-forma-teal/5' : ''}`}
                          >
                            {dayCalls.map((call) => (
                              <div
                                key={call.id}
                                className={`absolute inset-x-1 top-1 rounded-md p-1 text-xs cursor-pointer ${
                                  call.status === 'CONFIRMED'
                                    ? 'bg-forma-teal/20 text-forma-teal'
                                    : call.status === 'SCHEDULED'
                                    ? 'bg-yellow-500/20 text-yellow-600'
                                    : 'bg-muted'
                                }`}
                                onClick={() => call.status === 'SCHEDULED' && confirmCall(call.id)}
                              >
                                <div className="flex items-center gap-1">
                                  {getSessionIcon(call.type)}
                                  <span className="truncate font-medium">{call.client.name}</span>
                                </div>
                                <span>
                                  {new Date(call.scheduledAt).toLocaleTimeString(locale, {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Sessions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                {isAr ? 'النهاردة' : 'Today'}
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todaysCalls.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {isAr ? 'مفيش مكالمات النهاردة' : 'No calls scheduled today'}
                </p>
              ) : (
                <div className="space-y-3">
                  {todaysCalls.map((call) => (
                    <div key={call.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={call.client.avatarUrl} />
                        <AvatarFallback>{call.client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{call.client.name}</p>
                        <p className="text-xs text-muted-foreground">{call.type.replace('_', ' ')}</p>
                      </div>
                      <Badge variant={call.status === 'CONFIRMED' ? 'default' : 'outline'}>
                        {new Date(call.scheduledAt).toLocaleTimeString(locale, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Availability Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                {isAr ? 'مواعيدك المتاحة' : 'Your Availability'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {isAr ? 'مفيش مواعيد محددة' : 'No availability set'}
                </p>
              ) : (
                <div className="space-y-1 text-sm">
                  {DAYS.map((day) => {
                    const daySlots = slots.filter((s) => s.dayOfWeek === day.value);
                    return (
                      <div key={day.value} className="flex items-center justify-between">
                        <span>{day.short}</span>
                        <span className="text-muted-foreground">
                          {daySlots.length > 0
                            ? daySlots.map((s) => `${s.startTime}-${s.endTime}`).join(', ')
                            : isAr ? 'إجازة' : 'Off'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              <Button
                variant="outline"
                className="mt-4 w-full"
                size="sm"
                onClick={() => setAvailabilityOpen(true)}
              >
                {isAr ? 'تعديل المواعيد' : 'Edit Availability'}
              </Button>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                {isAr ? 'الحالة' : 'Status'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-forma-teal" />
                  <span className="text-sm">{isAr ? 'مؤكد' : 'Confirmed'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">
                    {isAr ? 'معلق (اضغط للتأكيد)' : 'Pending (click to confirm)'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
