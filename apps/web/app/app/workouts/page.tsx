'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Plus,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const weekSchedule = [
  { day: 'Mon', workout: 'Push Day', completed: true },
  { day: 'Tue', workout: 'Pull Day', completed: true },
  { day: 'Wed', workout: 'Rest', completed: true, isRest: true },
  { day: 'Thu', workout: 'Legs', completed: true },
  { day: 'Fri', workout: 'Push Day', completed: false, isToday: true },
  { day: 'Sat', workout: 'Pull Day', completed: false },
  { day: 'Sun', workout: 'Rest', completed: false, isRest: true },
];

const workoutPlans = [
  {
    id: '1',
    name: 'Push Pull Legs',
    description: 'Classic 6-day split for muscle building',
    frequency: '6 days/week',
    duration: '12 weeks',
    active: true,
  },
  {
    id: '2',
    name: 'Full Body Strength',
    description: 'Compound-focused strength program',
    frequency: '3 days/week',
    duration: '8 weeks',
    active: false,
  },
  {
    id: '3',
    name: 'HIIT Fat Burn',
    description: 'High intensity cardio and conditioning',
    frequency: '4 days/week',
    duration: '6 weeks',
    active: false,
  },
];

const recentWorkouts = [
  {
    date: 'Today',
    name: 'Push Day - Chest & Triceps',
    duration: '52 min',
    volume: '12,450 kg',
    exercises: 6,
  },
  {
    date: 'Yesterday',
    name: 'Pull Day - Back & Biceps',
    duration: '48 min',
    volume: '10,200 kg',
    exercises: 6,
  },
  {
    date: '2 days ago',
    name: 'Legs - Quads & Hamstrings',
    duration: '55 min',
    volume: '15,800 kg',
    exercises: 7,
  },
];

export default function WorkoutsPage() {
  const [currentWeek, setCurrentWeek] = useState(0);

  return (
    <div className="space-y-6 pb-20 lg:ml-64 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workouts</h1>
          <p className="text-muted-foreground">Track and plan your training</p>
        </div>
        <Button variant="forma">
          <Plus className="mr-2 h-4 w-4" />
          Log Workout
        </Button>
      </div>

      {/* Week Schedule */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">This Week</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentWeek(currentWeek - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">Week of Mar 18</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentWeek(currentWeek + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekSchedule.map((day) => (
              <div
                key={day.day}
                className={`rounded-lg border p-3 text-center transition-colors ${
                  day.isToday
                    ? 'border-forma-teal bg-forma-teal/10'
                    : day.completed
                    ? 'bg-muted/50'
                    : ''
                }`}
              >
                <p className="text-xs font-medium text-muted-foreground">{day.day}</p>
                <p
                  className={`mt-1 text-sm font-medium ${
                    day.isRest ? 'text-muted-foreground' : ''
                  }`}
                >
                  {day.workout}
                </p>
                {day.completed && !day.isRest && (
                  <Badge variant="forma" className="mt-2 text-xs">
                    Done
                  </Badge>
                )}
                {day.isToday && !day.completed && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    Today
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="plans">
        <TabsList>
          <TabsTrigger value="plans">My Plans</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          {workoutPlans.map((plan) => (
            <Card key={plan.id} className={plan.active ? 'border-forma-teal' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{plan.name}</h3>
                      {plan.active && <Badge variant="forma">Active</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {plan.frequency}
                      </span>
                      <span className="flex items-center gap-1">
                        <Timer className="h-4 w-4" />
                        {plan.duration}
                      </span>
                    </div>
                  </div>
                  <Button variant={plan.active ? 'outline' : 'default'}>
                    {plan.active ? 'View Plan' : 'Start Plan'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <div className="rounded-full bg-muted p-3">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-semibold">Create Custom Plan</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Build your own workout program from scratch
              </p>
              <Button className="mt-4" variant="outline">
                Create Plan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {recentWorkouts.map((workout, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{workout.date}</p>
                    <h3 className="font-semibold">{workout.name}</h3>
                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Timer className="h-4 w-4" />
                        {workout.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Dumbbell className="h-4 w-4" />
                        {workout.exercises} exercises
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {workout.volume}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="exercises" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Cardio'].map(
              (category) => (
                <Card key={category} className="cursor-pointer hover:border-forma-teal/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-forma-teal/10 p-2">
                        <Dumbbell className="h-5 w-5 text-forma-teal" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{category}</h3>
                        <p className="text-sm text-muted-foreground">
                          {Math.floor(Math.random() * 50) + 20} exercises
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
