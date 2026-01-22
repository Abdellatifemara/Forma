'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Footprints,
  Timer,
  TrendingUp,
  ChevronRight,
  Play,
  Dumbbell,
  Target,
  Loader2,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { authApi, type User } from '@/lib/api';

export default function AppDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await authApi.getMe();
        setUser(response.user);
      } catch {
        // User not authenticated or error - show welcome state
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, []);

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  const userName = user?.name || 'there';

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center lg:ml-64">
        <Loader2 className="h-8 w-8 animate-spin text-forma-teal" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:ml-64 lg:pb-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">{greeting}, {userName}!</h1>
        <p className="text-muted-foreground">Let us crush your goals today.</p>
      </div>

      {/* Quick Stats - Empty State */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-xs text-muted-foreground">Goal: 2,200</span>
            </div>
            <p className="mt-2 text-2xl font-bold">--</p>
            <p className="text-sm text-muted-foreground">Calories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Footprints className="h-5 w-5 text-blue-500" />
              <span className="text-xs text-muted-foreground">Goal: 10,000</span>
            </div>
            <p className="mt-2 text-2xl font-bold">--</p>
            <p className="text-sm text-muted-foreground">Steps</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Timer className="h-5 w-5 text-green-500" />
              <span className="text-xs text-muted-foreground">Goal: 60 min</span>
            </div>
            <p className="mt-2 text-2xl font-bold">--</p>
            <p className="text-sm text-muted-foreground">Active Min</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-5 w-5 text-forma-teal" />
              <span className="text-xs text-muted-foreground">days</span>
            </div>
            <p className="mt-2 text-2xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Workout - Empty State */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-forma-teal/20 to-forma-teal/5 p-6">
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="forma" className="mb-2">
                Today&apos;s Workout
              </Badge>
              <h2 className="text-xl font-bold">No workout scheduled</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Start your fitness journey by selecting a workout plan or creating your own.
              </p>
            </div>
            <Button variant="forma" size="lg" asChild>
              <Link href="/app/workouts">
                <Plus className="mr-2 h-4 w-4" />
                Browse Workouts
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Nutrition Summary - Empty State */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Today&apos;s Nutrition</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/nutrition">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm">
                <span>Calories</span>
                <span className="text-muted-foreground">-- / 2,200</span>
              </div>
              <Progress value={0} className="mt-2" />
            </div>

            <div className="mb-4 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Protein</div>
                <div className="font-bold text-chart-protein">--g</div>
                <Progress value={0} className="mt-1 h-1" />
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Carbs</div>
                <div className="font-bold text-chart-carbs">--g</div>
                <Progress value={0} className="mt-1 h-1" />
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Fat</div>
                <div className="font-bold text-chart-fat">--g</div>
                <Progress value={0} className="mt-1 h-1" />
              </div>
            </div>

            <div className="rounded-lg border border-dashed p-4 text-center">
              <p className="text-sm text-muted-foreground">No meals logged today</p>
              <Button variant="outline" size="sm" className="mt-2" asChild>
                <Link href="/app/nutrition">
                  <Plus className="mr-2 h-4 w-4" />
                  Log a meal
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress & Achievements - Empty State */}
        <div className="space-y-6">
          {/* Weekly Goal Progress */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Weekly Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-forma-teal" />
                      Workouts
                    </span>
                    <span className="text-muted-foreground">0 / 5</span>
                  </div>
                  <Progress value={0} className="mt-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-500" />
                      Calorie Goal
                    </span>
                    <span className="text-muted-foreground">0 / 7 days</span>
                  </div>
                  <Progress value={0} className="mt-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Footprints className="h-4 w-4 text-blue-500" />
                      Step Goal
                    </span>
                    <span className="text-muted-foreground">0 / 7 days</span>
                  </div>
                  <Progress value={0} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements - Empty State */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Recent Achievements</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/app/achievements">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed p-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <TrendingUp className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No achievements yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Complete workouts and hit your goals to unlock achievements
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
