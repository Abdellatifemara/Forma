'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRight,
  Clock,
  Flame,
  Heart,
  Activity,
  Sparkles,
  ArrowRight,
  Dumbbell,
} from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
    ? (isRTL ? 'صباح الخير' : "Let's Get Back")
    : hour < 18
      ? (isRTL ? 'يلا نكمل' : "Let's Get Back")
      : (isRTL ? 'يلا نتمرن' : "Let's Get Back");

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const userName = user?.name || user?.firstName || (isRTL ? 'بطل' : 'Champ');

  return (
    <div className={cn('space-y-6', isRTL && 'font-cairo')}>
      {/* Header — Greeting + Avatar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            {greeting} <span>{'\uD83D\uDCAA'}</span>
          </p>
          <h1 className="text-2xl font-bold">{userName}</h1>
        </div>
        <Link href="/profile">
          <Avatar className="h-11 w-11 border-2 border-border">
            <AvatarImage src={user?.avatarUrl || user?.avatar || undefined} />
            <AvatarFallback className="bg-muted text-foreground font-semibold">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>

      {/* Upgrade Banner — for free/trial users */}
      {(!user?.subscription || (typeof user.subscription === 'object' && (!user.subscription.tier || user.subscription.tier === 'FREE'))) && (
        <Link
          href="/profile/subscription"
          className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-forma-orange/10 to-amber-500/10 border border-forma-orange/20 p-4 transition-colors hover:bg-forma-orange/15"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forma-orange/20">
            <Sparkles className="h-5 w-5 text-forma-orange" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">
              {isRTL ? 'رقّي لبريميوم' : 'Upgrade to Premium'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'كوتش ذكي، برامج تمارين، وأكتر!' : 'AI coach, workout programs, and more!'}
            </p>
          </div>
          <ArrowRight className={cn('h-4 w-4 text-forma-orange shrink-0', false)} />
        </Link>
      )}

      {/* Hero Banner — Gym photo with overlay */}
      <div className="relative overflow-hidden rounded-3xl bg-secondary h-48">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent dark:from-black/90 dark:via-black/60" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-forma-orange/20" />
        <div className="relative h-full flex flex-col justify-end p-5">
          <h2 className="text-xl font-bold text-white leading-tight">
            {isRTL ? 'أقوى مع كل تمرين،' : 'Stronger every rep,'}
            <br />
            {isRTL ? 'كل خطوة.' : 'every step.'}
          </h2>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex gap-1.5">
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] text-white/80">#FitLife</span>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] text-white/80">#FormaEG</span>
            </div>
            <Link
              href={todayWorkout ? `/workouts/${todayWorkout.id}` : '/workouts'}
              className={cn(
                'rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white',
                isRTL ? 'me-auto' : 'ms-auto'
              )}
            >
              {isRTL ? 'يلا نبدأ 🔥' : 'Start Workout 🔥'}
            </Link>
          </div>
        </div>
      </div>

      {/* Daily Program Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold">{isRTL ? 'البرنامج اليومي' : 'Daily Program'}</h3>
          <Link href="/workouts" className="text-xs text-muted-foreground hover:text-primary">
            {isRTL ? 'شوف الكل' : 'See All'}
          </Link>
        </div>

        {/* Workout Cards — Horizontal Scroll */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {todayWorkout && !('isRestDay' in todayWorkout) ? (
            <WorkoutCard
              name={todayWorkout.name || (isRTL ? 'تمرين اليوم' : "Today's Workout")}
              duration={Math.round((todayWorkout.exercises?.length || 4) * 8)}
              sets={todayWorkout.exercises?.reduce((sum: number, ex: any) => sum + (ex.sets || 3), 0) || 12}
              reps={todayWorkout.exercises?.length || 4}
              href={`/workouts/${todayWorkout.id}`}
              isRTL={isRTL}
            />
          ) : null}

          {/* What Now — always show as option */}
          <Link
            href="/workouts?whatnow=true"
            className="shrink-0 w-40 rounded-2xl border border-primary/30 bg-primary/5 overflow-hidden hover:bg-primary/10 transition-colors"
          >
            <div className="h-24 bg-gradient-to-br from-primary/20 to-forma-orange/20 relative flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-primary/60" />
            </div>
            <div className="p-3">
              <p className="text-xs font-semibold">{isRTL ? 'إيه دلوقتي؟' : 'What Now?'}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{isRTL ? 'تمرين مخصصلك' : 'AI picks for you'}</p>
            </div>
          </Link>

          {/* Browse Workouts */}
          <Link
            href="/workouts"
            className="shrink-0 w-40 rounded-2xl border border-border/50 bg-muted/30 overflow-hidden hover:bg-muted/50 transition-colors"
          >
            <div className="h-24 bg-gradient-to-br from-secondary to-secondary/80 relative flex items-center justify-center">
              <Dumbbell className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <div className="p-3">
              <p className="text-xs font-semibold">{isRTL ? 'تصفح التمارين' : 'Browse All'}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{isRTL ? 'اختر برنامجك' : 'Plans & exercises'}</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-muted/50 border border-border/50 p-4 text-center">
          <Flame className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold">{weeklyStats?.streakDays || 0}</p>
          <p className="text-[10px] text-muted-foreground">{isRTL ? 'يوم متواصل' : 'Day Streak'}</p>
        </div>
        <div className="rounded-2xl bg-muted/50 border border-border/50 p-4 text-center">
          <Activity className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold">{weeklyStats?.workoutsCompleted || 0}</p>
          <p className="text-[10px] text-muted-foreground">{isRTL ? 'هذا الأسبوع' : 'This Week'}</p>
        </div>
        <div className="rounded-2xl bg-muted/50 border border-border/50 p-4 text-center">
          <Heart className="h-5 w-5 text-red-500 mx-auto mb-1" />
          <p className="text-lg font-bold">{Math.round(weeklyStats?.caloriesAvg || 0)}</p>
          <p className="text-[10px] text-muted-foreground">{isRTL ? 'سعرات' : 'Avg Cal'}</p>
        </div>
      </div>

      {/* Nutrition Quick View */}
      {dailyNutrition && (
        <div className="rounded-2xl border border-border/50 bg-muted/30 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">{isRTL ? 'أكل النهارده' : "Today's Nutrition"}</h3>
            <Link href="/nutrition" className="text-xs text-primary">
              {isRTL ? 'التفاصيل' : 'Details'}
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <NutrientPill label={isRTL ? 'سعرات' : 'Cal'} value={Math.round(dailyNutrition.totals.calories)} color="text-primary" />
            <NutrientPill label={isRTL ? 'بروتين' : 'Protein'} value={`${Math.round(dailyNutrition.totals.protein)}g`} color="text-blue-500" />
            <NutrientPill label={isRTL ? 'كاربز' : 'Carbs'} value={`${Math.round(dailyNutrition.totals.carbs)}g`} color="text-amber-500" />
            <NutrientPill label={isRTL ? 'دهون' : 'Fat'} value={`${Math.round(dailyNutrition.totals.fat)}g`} color="text-red-400" />
          </div>
        </div>
      )}

      {/* Personal Trainer Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold">{isRTL ? 'المدرب الشخصي' : 'Personal Trainer'}</h3>
          <Link href="/trainers" className="text-xs text-muted-foreground hover:text-primary">
            {isRTL ? 'شوف الكل' : 'See All'}
          </Link>
        </div>
        <Link href="/trainers" className="flex items-center gap-3 rounded-2xl border border-border/50 bg-muted/30 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <span className="text-lg">{'\uD83C\uDFCB\uFE0F'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{isRTL ? 'ابحث عن مدربك' : 'Find Your Trainer'}</p>
            <p className="text-xs text-muted-foreground truncate">
              {isRTL ? 'مدربين معتمدين جاهزين يساعدوك' : 'Certified trainers ready to help'}
            </p>
          </div>
          <ChevronRight className={cn('h-5 w-5 text-muted-foreground shrink-0', false)} />
        </Link>
      </div>
    </div>
  );
}

/* ---- Workout Card Component ---- */
function WorkoutCard({ name, duration, sets, reps, href, isRTL }: {
  name: string;
  duration: number;
  sets: number;
  reps: number;
  href: string;
  isRTL: boolean;
}) {
  return (
    <Link href={href} className="shrink-0 w-40 rounded-2xl border border-border/50 bg-muted/30 overflow-hidden">
      {/* Photo placeholder — dark gradient */}
      <div className="h-24 bg-gradient-to-br from-secondary to-secondary/80 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-forma-orange/10" />
      </div>
      <div className="p-3">
        <p className="text-xs font-semibold truncate">{name}</p>
        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <Clock className="h-3 w-3" /> ~{duration} {isRTL ? 'د' : 'min'}
          </span>
          <span>{sets} {isRTL ? 'مجموعة' : 'sets'} · {reps} {isRTL ? 'تمرين' : 'ex'}</span>
        </div>
      </div>
    </Link>
  );
}

/* ---- Nutrient Pill ---- */
function NutrientPill({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="text-center">
      <p className={cn('text-sm font-bold', color)}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

/* ---- Skeleton Loading ---- */
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-7 w-36 rounded bg-muted mt-2" />
        </div>
        <div className="h-11 w-11 rounded-full bg-muted" />
      </div>
      <div className="h-12 rounded-2xl bg-muted" />
      <div className="h-48 rounded-3xl bg-muted" />
      <div className="h-6 w-32 rounded bg-muted" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-8 w-16 rounded-full bg-muted" />)}
      </div>
      <div className="flex gap-3">
        {[1, 2].map(i => <div key={i} className="h-40 w-40 rounded-2xl bg-muted" />)}
      </div>
    </div>
  );
}
