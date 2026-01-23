'use client';

import { useState, useEffect } from 'react';
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
import { workoutsApi, type WorkoutPlan, type WorkoutLog } from '@/lib/api';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];


export default function WorkoutsPage() {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [history, setHistory] = useState<WorkoutLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [plansResponse, historyResponse] = await Promise.all([
          workoutsApi.getPlans(),
          workoutsApi.getHistory(),
        ]);
        setPlans(plansResponse);
        setHistory(historyResponse.data); // history is paginated
      } catch (error) {
        console.error("Error fetching workouts data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

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

      <Tabs defaultValue="plans">
        <TabsList>
          <TabsTrigger value="plans">My Plans</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{plan.name}</h3>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {plan.frequency} days/week
                      </span>
                      <span className="flex items-center gap-1">
                        <Timer className="h-4 w-4" />
                        {plan.duration} weeks
                      </span>
                    </div>
                  </div>
                  <Button variant={'default'}>
                    Start Plan
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
          {history.map((workout) => (
            <Card key={workout.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{new Date(workout.date).toLocaleDateString()}</p>
                    <h3 className="font-semibold">Workout</h3> {/* No name available */}
                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Timer className="h-4 w-4" />
                        {Math.round(workout.duration / 60)} min
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {workout.totalVolume} kg
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
                <Link key={category} href={`/exercises?muscle=${category.toLowerCase()}`}>
                  <Card className="cursor-pointer hover:border-forma-teal/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-forma-teal/10 p-2">
                          <Dumbbell className="h-5 w-5 text-forma-teal" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{category}</h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
