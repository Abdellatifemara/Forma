'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowLeft,
  Calendar,
  ChevronRight,
  Dumbbell,
  Edit,
  LineChart,
  MessageSquare,
  MoreVertical,
  Target,
  TrendingDown,
  TrendingUp,
  Utensils,
  Weight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

const client = {
  id: '1',
  name: 'Mohamed Ali',
  email: 'mohamed@example.com',
  avatar: null,
  phone: '+20 100 123 4567',
  status: 'active',
  plan: 'Weight Loss Program',
  startDate: 'January 15, 2025',
  nextSession: 'Tomorrow, 10:00 AM',
  goal: 'Lose 10kg in 3 months',
  currentWeight: 85,
  startingWeight: 92,
  targetWeight: 80,
  age: 28,
  height: 178,
  activityLevel: 'Moderate',
  dietaryRestrictions: ['No pork'],
  injuries: 'Minor lower back pain',
  notes: 'Very motivated, prefers morning workouts. Works as a software engineer, mostly sedentary during the day.',
};

const progressData = {
  weightChange: -7,
  workoutsCompleted: 24,
  workoutsScheduled: 28,
  adherence: 86,
  avgCalories: 1850,
  targetCalories: 1800,
};

const recentWorkouts = [
  { date: 'Today', name: 'Upper Body', duration: '52 min', completed: true },
  { date: 'Yesterday', name: 'Cardio HIIT', duration: '30 min', completed: true },
  { date: '2 days ago', name: 'Lower Body', duration: '48 min', completed: true },
  { date: '3 days ago', name: 'Rest Day', duration: '-', completed: true, isRest: true },
  { date: '4 days ago', name: 'Full Body', duration: '55 min', completed: false },
];

const weeklySchedule = [
  { day: 'Mon', workout: 'Upper Body', completed: true },
  { day: 'Tue', workout: 'Cardio', completed: true },
  { day: 'Wed', workout: 'Lower Body', completed: true },
  { day: 'Thu', workout: 'Rest', isRest: true },
  { day: 'Fri', workout: 'Full Body', isToday: true },
  { day: 'Sat', workout: 'Cardio' },
  { day: 'Sun', workout: 'Rest', isRest: true },
];

const messages = [
  {
    from: 'client',
    text: 'Coach, I felt some pain in my lower back during deadlifts today. Should I be worried?',
    time: '2 hours ago',
  },
  {
    from: 'trainer',
    text: 'Thanks for letting me know! Let\'s switch to Romanian deadlifts next session and focus on form. Take it easy for now.',
    time: '1 hour ago',
  },
  {
    from: 'client',
    text: 'Got it, thanks! Also, is it okay if I have a cheat meal this weekend?',
    time: '30 min ago',
  },
];

export default function ClientDetailPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const weightProgress =
    ((client.startingWeight - client.currentWeight) /
      (client.startingWeight - client.targetWeight)) *
    100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/trainer/clients">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={client.avatar || undefined} />
              <AvatarFallback className="text-xl">
                {client.name.split(' ').map((n) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{client.name}</h1>
                <Badge variant={client.status === 'active' ? 'forma' : 'secondary'}>
                  {client.status}
                </Badge>
              </div>
              <p className="text-muted-foreground">{client.plan}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline">
            <MessageSquare className="mr-2 h-4 w-4" />
            Message
          </Button>
          <Button variant="forma">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Session
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit Client Info
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Dumbbell className="mr-2 h-4 w-4" />
                Assign New Program
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Utensils className="mr-2 h-4 w-4" />
                Update Meal Plan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                End Coaching
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weight Progress</p>
                <p className="text-2xl font-bold">
                  {progressData.weightChange > 0 ? '+' : ''}
                  {progressData.weightChange} kg
                </p>
              </div>
              <div
                className={`rounded-full p-2 ${
                  progressData.weightChange < 0
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-red-500/10 text-red-500'
                }`}
              >
                {progressData.weightChange < 0 ? (
                  <TrendingDown className="h-5 w-5" />
                ) : (
                  <TrendingUp className="h-5 w-5" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Workouts</p>
                <p className="text-2xl font-bold">
                  {progressData.workoutsCompleted}/{progressData.workoutsScheduled}
                </p>
              </div>
              <div className="rounded-full bg-forma-teal/10 p-2 text-forma-teal">
                <Dumbbell className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Adherence</p>
                <p className="text-2xl font-bold">{progressData.adherence}%</p>
              </div>
              <div className="rounded-full bg-forma-teal/10 p-2 text-forma-teal">
                <Target className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Calories</p>
                <p className="text-2xl font-bold">{progressData.avgCalories}</p>
              </div>
              <div className="rounded-full bg-forma-teal/10 p-2 text-forma-teal">
                <Utensils className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Client Info */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{client.email}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{client.phone}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Age</span>
                  <span className="font-medium">{client.age} years</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Height</span>
                  <span className="font-medium">{client.height} cm</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Activity Level</span>
                  <span className="font-medium">{client.activityLevel}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Date</span>
                  <span className="font-medium">{client.startDate}</span>
                </div>
              </CardContent>
            </Card>

            {/* Goal Progress */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Goal Progress</CardTitle>
                <CardDescription>{client.goal}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Starting</p>
                    <p className="text-2xl font-bold">{client.startingWeight} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current</p>
                    <p className="text-2xl font-bold text-forma-teal">
                      {client.currentWeight} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target</p>
                    <p className="text-2xl font-bold">{client.targetWeight} kg</p>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{Math.round(weightProgress)}%</span>
                  </div>
                  <Progress value={weightProgress} className="h-3" />
                </div>

                {/* Week Schedule */}
                <div>
                  <h4 className="mb-3 font-semibold">This Week</h4>
                  <div className="grid grid-cols-7 gap-2">
                    {weeklySchedule.map((day) => (
                      <div
                        key={day.day}
                        className={`rounded-lg border p-2 text-center text-sm ${
                          day.isToday
                            ? 'border-forma-teal bg-forma-teal/10'
                            : day.completed
                            ? 'bg-muted/50'
                            : ''
                        }`}
                      >
                        <p className="font-medium">{day.day}</p>
                        <p
                          className={`text-xs ${
                            day.isRest ? 'text-muted-foreground' : ''
                          }`}
                        >
                          {day.workout}
                        </p>
                        {day.completed && !day.isRest && (
                          <Badge variant="forma" className="mt-1 text-xs">
                            Done
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes & Restrictions */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{client.notes}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Health Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Dietary Restrictions</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {client.dietaryRestrictions.map((restriction) => (
                      <Badge key={restriction} variant="secondary">
                        {restriction}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Injuries/Conditions</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {client.injuries || 'None reported'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Workouts Tab */}
        <TabsContent value="workouts" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Workouts</h3>
            <Button variant="forma">
              <Dumbbell className="mr-2 h-4 w-4" />
              Assign Workout
            </Button>
          </div>

          <div className="space-y-3">
            {recentWorkouts.map((workout, index) => (
              <Card key={index}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        workout.completed
                          ? 'bg-forma-teal/10 text-forma-teal'
                          : 'bg-red-500/10 text-red-500'
                      }`}
                    >
                      {workout.isRest ? (
                        <Activity className="h-5 w-5" />
                      ) : (
                        <Dumbbell className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{workout.name}</p>
                      <p className="text-sm text-muted-foreground">{workout.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {!workout.isRest && (
                      <span className="text-sm text-muted-foreground">
                        {workout.duration}
                      </span>
                    )}
                    <Badge
                      variant={
                        workout.completed
                          ? workout.isRest
                            ? 'secondary'
                            : 'forma'
                          : 'destructive'
                      }
                    >
                      {workout.completed
                        ? workout.isRest
                          ? 'Rest'
                          : 'Completed'
                        : 'Missed'}
                    </Badge>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Nutrition Tab */}
        <TabsContent value="nutrition" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Nutrition Overview</h3>
            <Button variant="forma">
              <Utensils className="mr-2 h-4 w-4" />
              Update Meal Plan
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Daily Calories</p>
                <p className="text-2xl font-bold">{progressData.targetCalories}</p>
                <p className="text-xs text-muted-foreground">Target</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Protein</p>
                <p className="text-2xl font-bold">150g</p>
                <p className="text-xs text-muted-foreground">Target</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Carbs</p>
                <p className="text-2xl font-bold">180g</p>
                <p className="text-xs text-muted-foreground">Target</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Fat</p>
                <p className="text-2xl font-bold">60g</p>
                <p className="text-xs text-muted-foreground">Target</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Current Meal Plan</CardTitle>
              <CardDescription>Weight Loss - 1800 cal deficit plan</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Client is following a moderate carb, high protein meal plan optimized
                for fat loss while preserving muscle mass.
              </p>
              <Button variant="outline" className="mt-4">
                View Full Meal Plan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Progress Tracking</h3>
            <Button variant="outline">
              <LineChart className="mr-2 h-4 w-4" />
              View Full Report
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Weight className="h-5 w-5" />
                  Weight History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 rounded-lg bg-muted/50 flex items-center justify-center">
                  <p className="text-muted-foreground">Weight chart placeholder</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Workout Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 rounded-lg bg-muted/50 flex items-center justify-center">
                  <p className="text-muted-foreground">Volume chart placeholder</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.from === 'trainer' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      message.from === 'trainer'
                        ? 'bg-forma-teal text-white'
                        : 'bg-muted'
                    }`}
                  >
                    <p>{message.text}</p>
                    <p
                      className={`mt-2 text-xs ${
                        message.from === 'trainer'
                          ? 'text-white/70'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex gap-2 pt-4">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border bg-background px-4 py-2"
                />
                <Button variant="forma">Send</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
