'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Users,
  Zap,
  Activity,
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
  const router = useRouter();
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

        // Redirect trainers to trainer dashboard
        const userRole = userResponse.user?.role?.toUpperCase();
        if (userRole === 'TRAINER') {
          router.replace('/trainer/dashboard');
          return;
        }
        if (userRole === 'ADMIN') {
          router.replace('/admin/dashboard');
          return;
        }

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
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border-4 border-primary/20" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6 pb-24', isRTL && 'text-right font-cairo')}>
      {/* Header with Glow Effect */}
      <div className="relative">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <p className="text-muted-foreground text-sm">{greeting}</p>
          <h1 className="text-3xl font-bold mt-1">
            <span className="text-gradient">{user?.name || t.dashboard.welcome}</span>
          </h1>
        </div>
      </div>

      {/* Quick Stats - Glassmorphism Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="stat-card group hover:scale-[1.02] transition-transform">
          <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
            <div className="p-2 rounded-lg bg-orange-500/20 group-hover:shadow-[0_0_20px_hsl(25_100%_55%/0.3)] transition-shadow">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <span className="text-2xl font-bold">{weeklyStats?.streakDays || 0}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{t.dashboard.stats.streak}</p>
        </div>

        <div className="stat-card group hover:scale-[1.02] transition-transform">
          <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
            <div className="p-2 rounded-lg bg-cyan-500/20 group-hover:shadow-[0_0_20px_hsl(180_100%_50%/0.3)] transition-shadow">
              <Dumbbell className="h-5 w-5 text-cyan-500" />
            </div>
            <span className="text-2xl font-bold">{weeklyStats?.workoutsCompleted || 0}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{t.dashboard.stats.workoutsWeek}</p>
        </div>

        <div className="stat-card group hover:scale-[1.02] transition-transform">
          <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
            <div className="p-2 rounded-lg bg-green-500/20 group-hover:shadow-[0_0_20px_hsl(150_100%_50%/0.3)] transition-shadow">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <span className="text-2xl font-bold">{weeklyStats?.totalVolume || 0}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{t.dashboard.stats.lifted}</p>
        </div>

        <div className="stat-card group hover:scale-[1.02] transition-transform">
          <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
            <div className="p-2 rounded-lg bg-purple-500/20 group-hover:shadow-[0_0_20px_hsl(270_95%_65%/0.3)] transition-shadow">
              <Target className="h-5 w-5 text-purple-500" />
            </div>
            <span className="text-2xl font-bold">{Math.round(weeklyStats?.caloriesAvg || 0)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{t.dashboard.stats.avgCalories}</p>
        </div>
      </div>

      {/* Today's Workout - Gradient Card with Glow */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-cyan-500 via-cyan-600 to-purple-600">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl animate-float delay-500" />
          </div>

          <CardContent className="relative p-6 text-white">
            <div className={cn('flex items-center gap-2 mb-2', isRTL && 'flex-row-reverse')}>
              <Activity className="h-4 w-4" />
              <p className="text-sm font-medium opacity-90">{t.dashboard.todayWorkout}</p>
            </div>

            {todayWorkout ? (
              <>
                <h2 className="text-2xl font-bold">{todayWorkout.name}</h2>
                <p className="text-sm opacity-80 mt-1">
                  {todayWorkout.exercises?.length || 0} {t.dashboard.exercises} • {t.dashboard.day} {todayWorkout.day}
                </p>
                <Button
                  size="lg"
                  className={cn(
                    'mt-4 bg-white text-cyan-600 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]',
                    isRTL && 'flex-row-reverse'
                  )}
                  asChild
                >
                  <Link href={`/workouts/${todayWorkout.id}`}>
                    <Play className={cn('h-5 w-5', isRTL ? 'ml-2' : 'mr-2')} fill="currentColor" />
                    {t.dashboard.startWorkout}
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold">{t.dashboard.restDay}</h2>
                <p className="text-sm opacity-80 mt-1">{t.dashboard.noWorkout}</p>
                <Button
                  size="lg"
                  variant="secondary"
                  className="mt-4 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20"
                  asChild
                >
                  <Link href="/workouts">{t.dashboard.browseWorkouts}</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Nutrition & Goals Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Nutrition Card */}
        <Card className="card-glow">
          <CardHeader className={cn(
            'flex flex-row items-center justify-between pb-2',
            isRTL && 'flex-row-reverse'
          )}>
            <CardTitle className={cn('text-base font-semibold flex items-center gap-2', isRTL && 'flex-row-reverse')}>
              <div className="p-1.5 rounded-lg bg-green-500/20">
                <Apple className="h-4 w-4 text-green-500" />
              </div>
              {t.dashboard.nutrition.title}
            </CardTitle>
            <Link href="/nutrition" className="text-sm text-primary hover:text-primary/80 transition-colors">
              {t.dashboard.nutrition.viewAll}
            </Link>
          </CardHeader>
          <CardContent>
            {dailyNutrition ? (
              <div className="space-y-4">
                {/* Calories Progress */}
                <div>
                  <div className={cn('flex justify-between text-sm mb-2', isRTL && 'flex-row-reverse')}>
                    <span className="font-medium">{t.dashboard.nutrition.calories}</span>
                    <span className="text-muted-foreground">
                      {Math.round(dailyNutrition.totals.calories)} / {dailyNutrition.goals.calories}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min(100, (dailyNutrition.totals.calories / dailyNutrition.goals.calories) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <p className="text-lg font-bold text-cyan-500">{Math.round(dailyNutrition.totals.protein)}g</p>
                    <p className="text-xs text-muted-foreground">{t.dashboard.nutrition.protein}</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <p className="text-lg font-bold text-purple-500">{Math.round(dailyNutrition.totals.carbs)}g</p>
                    <p className="text-xs text-muted-foreground">{t.dashboard.nutrition.carbs}</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <p className="text-lg font-bold text-orange-500">{Math.round(dailyNutrition.totals.fat)}g</p>
                    <p className="text-xs text-muted-foreground">{t.dashboard.nutrition.fat}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className={cn('w-full border-primary/30 hover:bg-primary/10 hover:border-primary/50', isRTL && 'flex-row-reverse')}
                  asChild
                >
                  <Link href="/nutrition">
                    <Plus className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                    {t.dashboard.nutrition.logMeal}
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                  <Apple className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm mb-4">{t.dashboard.nutrition.noMeals}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn('border-primary/30 hover:bg-primary/10', isRTL && 'flex-row-reverse')}
                  asChild
                >
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
        <Card className="card-glow">
          <CardHeader className={cn(
            'flex flex-row items-center justify-between pb-2',
            isRTL && 'flex-row-reverse'
          )}>
            <CardTitle className={cn('text-base font-semibold flex items-center gap-2', isRTL && 'flex-row-reverse')}>
              <div className="p-1.5 rounded-lg bg-yellow-500/20">
                <Trophy className="h-4 w-4 text-yellow-500" />
              </div>
              {t.dashboard.weeklyGoals.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Workouts Goal */}
              <div>
                <div className={cn('flex justify-between text-sm mb-2', isRTL && 'flex-row-reverse')}>
                  <span className="font-medium">{t.dashboard.weeklyGoals.workouts}</span>
                  <span className="text-muted-foreground">
                    {weeklyStats?.workoutsCompleted || 0} / {weeklyStats?.workoutsTarget || 4}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="h-full rounded-full transition-all duration-700 bg-cyan-500"
                    style={{ width: `${Math.min(100, ((weeklyStats?.workoutsCompleted || 0) / (weeklyStats?.workoutsTarget || 4)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Calories Goal */}
              <div>
                <div className={cn('flex justify-between text-sm mb-2', isRTL && 'flex-row-reverse')}>
                  <span className="font-medium">{t.dashboard.weeklyGoals.calorieTarget}</span>
                  <span className="text-muted-foreground">
                    {weeklyStats?.daysOnCalorieTarget || 0} / 7
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="h-full rounded-full transition-all duration-700 bg-green-500"
                    style={{ width: `${Math.min(100, ((weeklyStats?.daysOnCalorieTarget || 0) / 7) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Meals Logged */}
              <div>
                <div className={cn('flex justify-between text-sm mb-2', isRTL && 'flex-row-reverse')}>
                  <span className="font-medium">{t.dashboard.weeklyGoals.mealsLogged}</span>
                  <span className="text-muted-foreground">
                    {weeklyStats?.daysWithMeals || 0} / 7
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="h-full rounded-full transition-all duration-700 bg-purple-500"
                    style={{ width: `${Math.min(100, ((weeklyStats?.daysWithMeals || 0) / 7) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Modern Grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { href: '/workouts', icon: Dumbbell, label: t.dashboard.quickActions.workouts, color: 'cyan' },
          { href: '/nutrition', icon: Apple, label: t.dashboard.quickActions.nutrition, color: 'green' },
          { href: '/progress', icon: TrendingUp, label: t.dashboard.quickActions.progress, color: 'purple' },
          { href: '/trainers', icon: Users, label: t.dashboard.quickActions.trainers, color: 'orange' },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              'group relative flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)]',
              isRTL && 'flex-row-reverse'
            )}
          >
            <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300',
                action.color === 'cyan' && 'bg-cyan-500/10 group-hover:bg-cyan-500/20 group-hover:shadow-[0_0_20px_hsl(180_100%_50%/0.2)]',
                action.color === 'green' && 'bg-green-500/10 group-hover:bg-green-500/20 group-hover:shadow-[0_0_20px_hsl(150_100%_50%/0.2)]',
                action.color === 'purple' && 'bg-purple-500/10 group-hover:bg-purple-500/20 group-hover:shadow-[0_0_20px_hsl(270_95%_65%/0.2)]',
                action.color === 'orange' && 'bg-orange-500/10 group-hover:bg-orange-500/20 group-hover:shadow-[0_0_20px_hsl(25_100%_55%/0.2)]',
              )}>
                <action.icon className={cn(
                  'h-5 w-5',
                  action.color === 'cyan' && 'text-cyan-500',
                  action.color === 'green' && 'text-green-500',
                  action.color === 'purple' && 'text-purple-500',
                  action.color === 'orange' && 'text-orange-500',
                )} />
              </div>
              <span className="font-medium">{action.label}</span>
            </div>
            <ChevronRight className={cn(
              'h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1',
              isRTL && 'rotate-180 group-hover:-translate-x-1'
            )} />
          </Link>
        ))}
      </div>
    </div>
  );
}
