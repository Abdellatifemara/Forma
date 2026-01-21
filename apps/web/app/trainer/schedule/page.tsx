'use client';

import { useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Video,
  MessageSquare,
  FileText,
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

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

const sessions = [
  {
    id: '1',
    client: 'Mohamed Ali',
    type: 'video',
    time: '10:00 AM',
    duration: '45 min',
    day: 1, // Monday
    hour: 10,
    status: 'confirmed',
  },
  {
    id: '2',
    client: 'Sara Ahmed',
    type: 'check-in',
    time: '2:00 PM',
    duration: '30 min',
    day: 1, // Monday
    hour: 14,
    status: 'confirmed',
  },
  {
    id: '3',
    client: 'Youssef Hassan',
    type: 'form-review',
    time: '4:30 PM',
    duration: '15 min',
    day: 2, // Tuesday
    hour: 16,
    status: 'pending',
  },
  {
    id: '4',
    client: 'Nour Ibrahim',
    type: 'video',
    time: '11:00 AM',
    duration: '60 min',
    day: 3, // Wednesday
    hour: 11,
    status: 'confirmed',
  },
];

const upcomingToday = [
  {
    client: 'Mohamed Ali',
    time: '10:00 AM',
    type: 'Video Call',
    avatar: 'MA',
  },
  {
    client: 'Sara Ahmed',
    time: '2:00 PM',
    type: 'Weekly Check-in',
    avatar: 'SA',
  },
  {
    client: 'Ahmed Hassan',
    time: '4:30 PM',
    type: 'Form Review',
    avatar: 'AH',
  },
];

export default function SchedulePage() {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [view, setView] = useState<'week' | 'day'>('week');

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-3 w-3" />;
      case 'check-in':
        return <MessageSquare className="h-3 w-3" />;
      case 'form-review':
        return <FileText className="h-3 w-3" />;
      default:
        return <Calendar className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Schedule</h1>
          <p className="text-muted-foreground">Manage your client sessions</p>
        </div>
        <Button variant="forma">
          <Plus className="mr-2 h-4 w-4" />
          New Session
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Calendar */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentWeek(currentWeek - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle>March 18 - 24, 2024</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentWeek(currentWeek + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={view === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('week')}
              >
                Week
              </Button>
              <Button
                variant={view === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('day')}
              >
                Day
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Week View */}
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header */}
                <div className="grid grid-cols-8 border-b">
                  <div className="p-2 text-sm font-medium text-muted-foreground" />
                  {weekDays.map((day, index) => (
                    <div
                      key={day}
                      className={`p-2 text-center ${
                        index === 1 ? 'bg-forma-teal/5' : ''
                      }`}
                    >
                      <p className="text-sm font-medium">{day}</p>
                      <p className="text-lg font-bold">{18 + index}</p>
                    </div>
                  ))}
                </div>

                {/* Time slots */}
                <div className="relative">
                  {hours.map((hour) => (
                    <div key={hour} className="grid grid-cols-8 border-b">
                      <div className="p-2 text-right text-sm text-muted-foreground">
                        {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                      </div>
                      {weekDays.map((_, dayIndex) => (
                        <div
                          key={dayIndex}
                          className={`relative h-16 border-l ${
                            dayIndex === 1 ? 'bg-forma-teal/5' : ''
                          }`}
                        >
                          {sessions
                            .filter((s) => s.day === dayIndex && s.hour === hour)
                            .map((session) => (
                              <div
                                key={session.id}
                                className={`absolute inset-x-1 top-1 rounded-md p-1 text-xs ${
                                  session.status === 'confirmed'
                                    ? 'bg-forma-teal/20 text-forma-teal'
                                    : 'bg-yellow-500/20 text-yellow-500'
                                }`}
                              >
                                <div className="flex items-center gap-1">
                                  {getSessionIcon(session.type)}
                                  <span className="truncate font-medium">
                                    {session.client}
                                  </span>
                                </div>
                                <span>{session.time}</span>
                              </div>
                            ))}
                        </div>
                      ))}
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
              <CardTitle className="text-base font-semibold">Today</CardTitle>
              <CardDescription>Monday, March 18</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingToday.map((session, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{session.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{session.client}</p>
                      <p className="text-xs text-muted-foreground">{session.type}</p>
                    </div>
                    <Badge variant="outline">{session.time}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Mon - Fri</span>
                  <span className="text-muted-foreground">9 AM - 6 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Saturday</span>
                  <span className="text-muted-foreground">10 AM - 2 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sunday</span>
                  <span className="text-muted-foreground">Closed</span>
                </div>
              </div>
              <Button variant="outline" className="mt-4 w-full" size="sm">
                Edit Availability
              </Button>
            </CardContent>
          </Card>

          {/* Session Types */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Session Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-forma-teal" />
                  <span className="text-sm">Video Call</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm">Check-in</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-orange-500" />
                  <span className="text-sm">Form Review</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
