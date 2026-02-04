'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Play,
  Dumbbell,
  Flame,
  TrendingUp,
  Plus,
  ChevronRight,
  Apple,
  Trophy,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  authApi,
  workoutsApi,
  nutritionApi,
  statsApi,
  type User,
  type Workout,
  type DailyNutritionLog,
  type WeeklySummary,
} from '@/lib/api';

export default function DashboardPage() {
  const { t, isRTL } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [todayWorkout, setTodayWorkout] = useState<Workout | null>(null);
  const [dailyNutrition, setDailyNutrition] = useState<DailyNutritionLog | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [userResponse, workoutResponse, nutritionResponse, statsResponse] = await Promise.all([
          authApi.getMe(),
          workoutsApi.getTodayWorkout(),
          nutritionApi.getDailyLog(),
          statsApi.getWeeklySummary(),
        ]);

        setUser(userResponse.user);
        setTodayWorkout(workoutResponse);
        setDailyNutrition(nutritionResponse);
        setWeeklyStats(statsResponse);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12
    ? t.dashboard.greetings.morning
    : hour < 18
      ? t.dashboard.greetings.afternoon
      : t.dashboard.greetings.evening;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-coral-500" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6 pb-20', isRTL && 'text-right font-cairo')}>
      {/* Header */}
      <div>
        <p className="text-muted-foreground">{greeting}</p>
        <h1 className="text-2xl font-bold">{user?.name || 'there'}</h1>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-muted/50 p-4">
          <div className={cn('flex items-center gap-2 text-coral-500', isRTL && 'flex-row-reverse')}>
            <Flame className="h-5 w-5" />
            <span className="text-2xl font-bold">{weeklyStats?.streakDays || 0}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{t.dashboard.stats.streak}</p>
        </div>

        <div className="rounded-xl bg-muted/50 p-4">
          <div className={cn('flex items-center gap-2 text-blue-500', isRTL && 'flex-row-reverse')}>
            <Dumbbell className="h-5 w-5" />
            <span className="text-2xl font-bold">{weeklyStats?.workoutsCompleted || 0}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{t.dashboard.stats.workoutsWeek}</p>
        </div>

        <div className="rounded-xl bg-muted/50 p-4">
          <div className={cn('flex items-center gap-2 text-green-500', isRTL && 'flex-row-reverse')}>
            <TrendingUp className="h-5 w-5" />
            <span className="text-2xl font-bold">{weeklyStats?.totalVolume || 0}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{t.dashboard.stats.lifted}</p>
        </div>

        <div className="rounded-xl bg-muted/50 p-4">
          <div className={cn('flex items-center gap-2 text-orange-500', isRTL && 'flex-row-reverse')}>
            <Target className="h-5 w-5" />
            <span className="text-2xl font-bold">{Math.round(weeklyStats?.caloriesAvg || 0)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{t.dashboard.stats.avgCalories}</p>
        </div>
      </div>

      {/* Today's Workout */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-coral-500 to-coral-600 text-white">
        <CardContent className="p-6">
          <p className="text-sm opacity-80">{t.dashboard.todayWorkout}</p>
          {todayWorkout ? (
            <>
              <h2 className="text-xl font-bold mt-1">{todayWorkout.name}</h2>
              <p className="text-sm opacity-80 mt-1">
                {todayWorkout.exercises?.length || 0} {t.dashboard.exercises} • {t.dashboard.day} {todayWorkout.day}
              </p>
              <Button
                size="lg"
                className={cn('mt-4 bg-white text-coral-600 hover:bg-white/90', isRTL && 'flex-row-reverse')}
                asChild
              >
                <Link href={`/workouts/${todayWorkout.id}`}>
                  <Play className={cn('h-5 w-5', isRTL ? 'ml-2' : 'mr-2')} />
                  {t.dashboard.startWorkout}
                </Link>
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mt-1">{t.dashboard.restDay}</h2>
              <p className="text-sm opacity-80 mt-1">{t.dashboard.noWorkout}</p>
              <Button
                size="lg"
                variant="secondary"
                className="mt-4 bg-white/20 text-white hover:bg-white/30"
                asChild
              >
                <Link href="/workouts">{t.dashboard.browseWorkouts}</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Nutrition & Progress Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Nutrition Card */}
        <Card>
          <CardHeader className={cn(
            'flex flex-row items-center justify-between pb-2',
            isRTL && 'flex-row-reverse'
          )}>
            <CardTitle className={cn('text-base font-semibold flex items-center gap-2', isRTL && 'flex-row-reverse')}>
              <Apple className="h-5 w-5 text-green-500" />
              {t.dashboard.nutrition.title}
            </CardTitle>
            <Link href="/nutrition" className="text-sm text-coral-500 hover:underline">
              {t.dashboard.nutrition.viewAll}
            </Link>
          </CardHeader>
          <CardContent>
            {dailyNutrition ? (
              <div className="space-y-4">
                {/* Calories */}
                <div>
                  <div className={cn('flex justify-between text-sm mb-1', isRTL && 'flex-row-reverse')}>
                    <span>{t.dashboard.nutrition.calories}</span>
                    <span className="text-muted-foreground">
                      {Math.round(dailyNutrition.totals.calories)} / {dailyNutrition.goals.calories}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-coral-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (dailyNutrition.totals.calories / dailyNutrition.goals.calories) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold">{Math.round(dailyNutrition.totals.protein)}g</p>
                    <p className="text-xs text-muted-foreground">{t.dashboard.nutrition.protein}</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{Math.round(dailyNutrition.totals.carbs)}g</p>
                    <p className="text-xs text-muted-foreground">{t.dashboard.nutrition.carbs}</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{Math.round(dailyNutrition.totals.fat)}g</p>
                    <p className="text-xs text-muted-foreground">{t.dashboard.nutrition.fat}</p>
                  </div>
                </div>

                <Button variant="outline" size="sm" className={cn('w-full', isRTL && 'flex-row-reverse')} asChild>
                  <Link href="/nutrition">
                    <Plus className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                    {t.dashboard.nutrition.logMeal}
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground text-sm mb-3">{t.dashboard.nutrition.noMeals}</p>
                <Button variant="outline" size="sm" className={cn(isRTL && 'flex-row-reverse')} asChild>
                  <Link href="/nutrition">
                    <Plus className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                    {t.dashboard.nutrition.logFirst}
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Goals Card */}
        <Card>
          <CardHeader className={cn(
            'flex flex-row items-center justify-between pb-2',
            isRTL && 'flex-row-reverse'
          )}>
            <CardTitle className={cn('text-base font-semibold flex items-center gap-2', isRTL && 'flex-row-reverse')}>
              <Trophy className="h-5 w-5 text-yellow-500" />
              {t.dashboard.weeklyGoals.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Workouts Goal */}
              <div>
                <div className={cn('flex justify-between text-sm mb-1', isRTL && 'flex-row-reverse')}>
                  <span>{t.dashboard.weeklyGoals.workouts}</span>
                  <span className="text-muted-foreground">
                    {weeklyStats?.workoutsCompleted || 0} / {weeklyStats?.workoutsTarget || 4}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((weeklyStats?.workoutsCompleted || 0) / (weeklyStats?.workoutsTarget || 4)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Calories Goal */}
              <div>
                <div className={cn('flex justify-between text-sm mb-1', isRTL && 'flex-row-reverse')}>
                  <span>{t.dashboard.weeklyGoals.calorieTarget}</span>
                  <span className="text-muted-foreground">
                    {weeklyStats?.daysOnCalorieTarget || 0} / 7
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((weeklyStats?.daysOnCalorieTarget || 0) / 7) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Meals Logged */}
              <div>
                <div className={cn('flex justify-between text-sm mb-1', isRTL && 'flex-row-reverse')}>
                  <span>{t.dashboard.weeklyGoals.mealsLogged}</span>
                  <span className="text-muted-foreground">
                    {weeklyStats?.daysWithMeals || 0} / 7
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((weeklyStats?.daysWithMeals || 0) / 7) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/workouts"
          className={cn(
            'flex items-center justify-between rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50',
            isRTL && 'flex-row-reverse'
          )}
        >
          <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Dumbbell className="h-5 w-5 text-blue-500" />
            </div>
            <span className="font-medium">{t.dashboard.quickActions.workouts}</span>
          </div>
          <ChevronRight className={cn('h-5 w-5 text-muted-foreground', isRTL && 'rotate-180')} />
        </Link>

        <Link
          href="/nutrition"
          className={cn(
            'flex items-center justify-between rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50',
            isRTL && 'flex-row-reverse'
          )}
        >
          <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <Apple className="h-5 w-5 text-green-500" />
            </div>
            <span className="font-medium">{t.dashboard.quickActions.nutrition}</span>
          </div>
          <ChevronRight className={cn('h-5 w-5 text-muted-foreground', isRTL && 'rotate-180')} />
        </Link>

        <Link
          href="/progress"
          className={cn(
            'flex items-center justify-between rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50',
            isRTL && 'flex-row-reverse'
          )}
        >
          <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
            <span className="font-medium">{t.dashboard.quickActions.progress}</span>
          </div>
          <ChevronRight className={cn('h-5 w-5 text-muted-foreground', isRTL && 'rotate-180')} />
        </Link>

        <Link
          href="/squads"
          className={cn(
            'flex items-center justify-between rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50',
            isRTL && 'flex-row-reverse'
          )}
        >
          <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
              <Trophy className="h-5 w-5 text-orange-500" />
            </div>
            <span className="font-medium">{t.dashboard.quickActions.squads}</span>
          </div>
          <ChevronRight className={cn('h-5 w-5 text-muted-foreground', isRTL && 'rotate-180')} />
        </Link>
      </div>
    </div>
  );
}
