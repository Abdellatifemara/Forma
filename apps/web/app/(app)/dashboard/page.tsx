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
import { SkeletonDashboard } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

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
    return <SkeletonDashboard />;
  }

  return (
    <div className={cn('space-y-6 pb-24', isRTL && 'text-right font-cairo')}>
      {/* Header — Clean, no glow blob */}
      <div>
        <p className="text-muted-foreground text-sm">{greeting}</p>
        <h1 className="text-3xl font-bold mt-1 text-foreground">
          {user?.name || user?.firstName || t.dashboard.welcome}
        </h1>
      </div>

      {/* Quick Stats — White cards with colored left accent */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card-accent-left border-s-orange-500">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <span className="text-2xl font-bold">{weeklyStats?.streakDays || 0}</span>
              <p className="text-xs text-muted-foreground">{t.dashboard.stats.streak}</p>
            </div>
          </div>
        </div>

        <div className="card-accent-left border-s-primary">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="text-2xl font-bold">{weeklyStats?.workoutsCompleted || 0}</span>
              <p className="text-xs text-muted-foreground">{t.dashboard.stats.workoutsWeek}</p>
            </div>
          </div>
        </div>

        <div className="card-accent-left border-s-green-500">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-500/10">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <span className="text-2xl font-bold">{weeklyStats?.totalVolume || 0}</span>
              <p className="text-xs text-muted-foreground">{t.dashboard.stats.lifted}</p>
            </div>
          </div>
        </div>

        <div className="card-accent-left border-s-purple-500">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-500/10">
              <Target className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <span className="text-2xl font-bold">{Math.round(weeklyStats?.caloriesAvg || 0)}</span>
              <p className="text-xs text-muted-foreground">{t.dashboard.stats.avgCalories}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Activity Chart — Flexcore-style */}
      <Card className="card-premium overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-500/10">
              <Activity className="h-4 w-4 text-orange-500" />
            </div>
            {isRTL ? 'النشاط الأسبوعي' : 'Weekly Activity'}
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {isRTL ? 'هذا الأسبوع' : 'This Week'}
          </span>
        </CardHeader>
        <CardContent>
          <WeeklyChart weeklyStats={weeklyStats} isRTL={isRTL} />
        </CardContent>
      </Card>

      {/* Today's Workout — White card with teal accent */}
      <Card className="card-premium overflow-hidden border-s-[3px] border-s-primary">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{t.dashboard.todayWorkout}</p>
          </div>

          {todayWorkout ? (
            <>
              <h2 className="text-2xl font-bold text-foreground">{todayWorkout.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {todayWorkout.exercises?.length || 0} {t.dashboard.exercises} {'\u2022'} {t.dashboard.day} {todayWorkout.day}
              </p>
              <Button
                size="lg"
                className="mt-4 btn-primary"
                asChild
              >
                <Link href={`/workouts/${todayWorkout.id}`}>
                  <Play className={cn('h-5 w-5', isRTL ? 'ms-2' : 'me-2')} fill="currentColor" />
                  {t.dashboard.startWorkout}
                </Link>
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-foreground">{t.dashboard.restDay}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t.dashboard.noWorkout}</p>
              <Button
                size="lg"
                variant="outline"
                className="mt-4 border-primary/30 hover:bg-primary/5"
                asChild
              >
                <Link href="/workouts">{t.dashboard.browseWorkouts}</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Nutrition & Goals Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Nutrition Card */}
        <Card className="card-premium">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-green-50 dark:bg-green-500/10">
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
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">{t.dashboard.nutrition.calories}</span>
                    <span className="text-muted-foreground">
                      {Math.round(dailyNutrition.totals.calories)} / {dailyNutrition.goals.calories}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min(100, dailyNutrition.goals.calories > 0 ? (dailyNutrition.totals.calories / dailyNutrition.goals.calories) * 100 : 0)}%` }}
                    />
                  </div>
                </div>

                {/* Macros — Clean white cards with colored text */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-xl border border-border/60 bg-white dark:bg-card">
                    <p className="text-lg font-bold text-primary">{Math.round(dailyNutrition.totals.protein)}g</p>
                    <p className="text-xs text-muted-foreground">{t.dashboard.nutrition.protein}</p>
                  </div>
                  <div className="text-center p-3 rounded-xl border border-border/60 bg-white dark:bg-card">
                    <p className="text-lg font-bold text-purple-500">{Math.round(dailyNutrition.totals.carbs)}g</p>
                    <p className="text-xs text-muted-foreground">{t.dashboard.nutrition.carbs}</p>
                  </div>
                  <div className="text-center p-3 rounded-xl border border-border/60 bg-white dark:bg-card">
                    <p className="text-lg font-bold text-orange-500">{Math.round(dailyNutrition.totals.fat)}g</p>
                    <p className="text-xs text-muted-foreground">{t.dashboard.nutrition.fat}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-primary/30 hover:bg-primary/5 hover:border-primary/50"
                  asChild
                >
                  <Link href="/nutrition">
                    <Plus className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />
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
                  className="border-primary/30 hover:bg-primary/5"
                  asChild
                >
                  <Link href="/nutrition">
                    <Plus className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />
                    {t.dashboard.nutrition.logFirst}
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Goals Card */}
        <Card className="card-premium">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-yellow-500/10">
                <Trophy className="h-4 w-4 text-amber-500" />
              </div>
              {t.dashboard.weeklyGoals.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">{t.dashboard.weeklyGoals.workouts}</span>
                  <span className="text-muted-foreground">
                    {weeklyStats?.workoutsCompleted || 0} / {weeklyStats?.workoutsTarget || 4}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="h-full rounded-full transition-all duration-700 bg-primary"
                    style={{ width: `${Math.min(100, ((weeklyStats?.workoutsCompleted || 0) / (weeklyStats?.workoutsTarget || 4)) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
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

              <div>
                <div className="flex justify-between text-sm mb-2">
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

      {/* Quick Actions — Clean white cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { href: '/workouts', icon: Dumbbell, label: t.dashboard.quickActions.workouts, color: 'bg-primary/10', iconColor: 'text-primary' },
          { href: '/nutrition', icon: Apple, label: t.dashboard.quickActions.nutrition, color: 'bg-green-50 dark:bg-green-500/10', iconColor: 'text-green-500' },
          { href: '/progress', icon: TrendingUp, label: t.dashboard.quickActions.progress, color: 'bg-purple-50 dark:bg-purple-500/10', iconColor: 'text-purple-500' },
          { href: '/trainers', icon: Users, label: t.dashboard.quickActions.trainers, color: 'bg-orange-50 dark:bg-orange-500/10', iconColor: 'text-orange-500' },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex items-center justify-between rounded-xl border border-border/60 bg-white dark:bg-card p-4 transition-all duration-200 hover:shadow-card-hover"
          >
            <div className="flex items-center gap-3">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', action.color)}>
                <action.icon className={cn('h-5 w-5', action.iconColor)} />
              </div>
              <span className="font-medium">{action.label}</span>
            </div>
            <ChevronRight className={cn(
              'h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5',
              isRTL && 'rotate-180 group-hover:-translate-x-0.5'
            )} />
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ---- Weekly Activity Bar Chart ---- */
const DAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_AR = ['اث', 'ثل', 'أر', 'خم', 'جم', 'سب', 'أح'];

function WeeklyChart({ weeklyStats, isRTL }: { weeklyStats: WeeklySummary | null; isRTL: boolean }) {
  const today = new Date().getDay(); // 0=Sun
  const todayIdx = today === 0 ? 6 : today - 1; // convert to Mon=0
  const labels = isRTL ? DAYS_AR : DAYS_EN;

  // Placeholder until API returns daily breakdown
  const completed = weeklyStats?.workoutsCompleted ?? 0;
  const data = labels.map((day, i) => ({
    day,
    minutes: i < completed ? 30 + (i * 12 % 45) : (i <= todayIdx ? 10 : 0),
    isToday: i === todayIdx,
  }));

  return (
    <div className="h-[180px] w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="25%">
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis hide />
          <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
            {data.map((entry, idx) => (
              <Cell
                key={idx}
                fill={entry.isToday ? '#f97316' : 'hsl(var(--muted-foreground) / 0.2)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
