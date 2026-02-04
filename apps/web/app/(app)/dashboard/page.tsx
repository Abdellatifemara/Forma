'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Timer,
  TrendingUp,
  ChevronRight,
  Play,
  Dumbbell,
  Target,
  Loader2,
  Plus,
  Sparkles,
  Zap,
  Moon,
  Trophy,
  Users,
  Heart,
  Camera,
  Mic,
  Activity,
  Calendar,
  ArrowRight,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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

// Feature cards for discovery
const featureCards = [
  {
    icon: Sparkles,
    title: 'What Now?',
    titleAr: 'ماذا الآن؟',
    description: 'Get personalized workout suggestions',
    href: '/workouts?whatnow=true',
    gradient: 'from-violet-500 to-purple-600',
    badge: 'AI',
  },
  {
    icon: Camera,
    title: 'Form Check',
    titleAr: 'تصحيح الحركة',
    description: 'AI analyzes your exercise form',
    href: '/workouts?formcheck=true',
    gradient: 'from-blue-500 to-cyan-500',
    badge: 'FREE',
  },
  {
    icon: Mic,
    title: 'Voice Coach',
    titleAr: 'المدرب الصوتي',
    description: 'Hands-free workout guidance',
    href: '/workouts?voicecoach=true',
    gradient: 'from-orange-500 to-red-500',
    badge: 'FREE',
  },
  {
    icon: Users,
    title: 'Squads',
    titleAr: 'الفرق',
    description: 'Train with friends & compete',
    href: '/squads',
    gradient: 'from-green-500 to-emerald-500',
    badge: 'NEW',
  },
];

export default function AppDashboardPage() {
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

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';
  const greetingAr =
    currentHour < 12 ? 'صباح الخير' : currentHour < 18 ? 'مساء الخير' : 'مساء الخير';

  const userName = user?.name || user?.firstName || 'there';

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-muted animate-pulse" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-forma-teal animate-spin" />
          </div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Greeting */}
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold">
          {greeting}, <span className="text-gradient">{userName}</span>! 👋
        </h1>
        <p className="text-muted-foreground mt-1">Let&apos;s crush your goals today.</p>
      </div>

      {/* Quick Stats Bento Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="stat-card-premium">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <span className="text-xs text-muted-foreground">kcal</span>
          </div>
          <p className="text-2xl font-bold">{weeklyStats ? Math.round(weeklyStats.caloriesAvg) : '--'}</p>
          <p className="text-xs text-muted-foreground">Avg Calories</p>
        </div>

        <div className="stat-card-premium">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20">
              <Activity className="h-5 w-5 text-green-500" />
            </div>
            <span className="text-xs text-muted-foreground">min</span>
          </div>
          <p className="text-2xl font-bold">{weeklyStats?.activeMinutes || '--'}</p>
          <p className="text-xs text-muted-foreground">Active Time</p>
        </div>

        <div className="stat-card-premium">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
              <Dumbbell className="h-5 w-5 text-blue-500" />
            </div>
            <span className="text-xs text-muted-foreground">this week</span>
          </div>
          <p className="text-2xl font-bold">{weeklyStats?.workoutsCompleted || 0}</p>
          <p className="text-xs text-muted-foreground">Workouts</p>
        </div>

        <div className="stat-card-premium">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20">
              <span className="text-lg fire-animation">🔥</span>
            </div>
            <span className="text-xs text-muted-foreground">days</span>
          </div>
          <p className="text-2xl font-bold">{weeklyStats?.streakDays || 0}</p>
          <p className="text-xs text-muted-foreground">Streak</p>
        </div>
      </div>

      {/* Today's Workout - Hero Card */}
      <div className="hero-workout-card animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <div className="relative z-10">
          <Badge className="mb-3 bg-white/20 text-white border-0">
            <Calendar className="h-3 w-3 mr-1" />
            Today&apos;s Workout
          </Badge>

          {todayWorkout ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{todayWorkout.name}</h2>
                <p className="text-muted-foreground mt-1">
                  {todayWorkout.exercises?.length || 0} exercises • ~{todayWorkout.duration || 45} min
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {todayWorkout.targetMuscles?.slice(0, 3).map((muscle: string) => (
                    <span key={muscle} className={`muscle-tag ${muscle.toLowerCase()}`}>
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>
              <Button size="lg" className="btn-premium w-full sm:w-auto" asChild>
                <Link href={`/workouts/${todayWorkout.id}`}>
                  <Play className="mr-2 h-5 w-5" />
                  Start Workout
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">No workout scheduled</h2>
                <p className="text-muted-foreground mt-1">
                  Tap &quot;What Now?&quot; for AI suggestions or browse workouts
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 sm:flex-none" asChild>
                  <Link href="/workouts">
                    Browse Plans
                  </Link>
                </Button>
                <Button className="btn-premium flex-1 sm:flex-none" asChild>
                  <Link href="/workouts?whatnow=true">
                    <Sparkles className="mr-2 h-4 w-4" />
                    What Now?
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feature Discovery Cards */}
      <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Powerful Features</h2>
          <Link href="/settings" className="text-sm text-forma-teal hover:underline flex items-center gap-1">
            All Features <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {featureCards.map((feature, index) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="feature-card group"
              style={{ animationDelay: `${0.3 + index * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`feature-card-icon bg-gradient-to-r ${feature.gradient}`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <Badge variant="secondary" className="text-[10px]">{feature.badge}</Badge>
              </div>
              <h3 className="font-semibold text-sm group-hover:text-forma-teal transition-colors">
                {feature.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Nutrition Summary */}
        <Card className="glass-card overflow-hidden animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Utensils className="h-4 w-4 text-green-500" />
              </div>
              Today&apos;s Nutrition
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/nutrition" className="text-forma-teal">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {dailyNutrition ? (
              <>
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium">Calories</span>
                    <span className="text-muted-foreground">
                      {Math.round(dailyNutrition.totals.calories)} / {dailyNutrition.goals.calories}
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-primary transition-all duration-500"
                      style={{ width: `${Math.min(100, (dailyNutrition.totals.calories / dailyNutrition.goals.calories) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Protein', value: dailyNutrition.totals.protein, goal: dailyNutrition.goals.protein, color: 'bg-blue-500' },
                    { label: 'Carbs', value: dailyNutrition.totals.carbs, goal: dailyNutrition.goals.carbs, color: 'bg-orange-500' },
                    { label: 'Fat', value: dailyNutrition.totals.fat, goal: dailyNutrition.goals.fat, color: 'bg-yellow-500' },
                  ].map((macro) => (
                    <div key={macro.label} className="text-center">
                      <div className="text-sm text-muted-foreground">{macro.label}</div>
                      <div className="font-bold text-lg">{Math.round(macro.value)}g</div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted mt-1">
                        <div
                          className={`h-full rounded-full ${macro.color} transition-all duration-500`}
                          style={{ width: `${Math.min(100, (macro.value / macro.goal) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                  <Link href="/nutrition">
                    <Plus className="mr-2 h-4 w-4" />
                    Log a meal
                  </Link>
                </Button>
              </>
            ) : (
              <div className="empty-state py-6">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Utensils className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No meals logged today</p>
                <p className="text-xs text-muted-foreground mt-1">Start tracking your nutrition</p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link href="/nutrition">
                    <Plus className="mr-2 h-4 w-4" />
                    Log a meal
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Progress */}
        <Card className="glass-card overflow-hidden animate-fade-up" style={{ animationDelay: '0.5s' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-forma-teal/20 flex items-center justify-center">
                <Target className="h-4 w-4 text-forma-teal" />
              </div>
              Weekly Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  label: 'Workouts',
                  icon: Dumbbell,
                  value: weeklyStats?.workoutsCompleted || 0,
                  target: weeklyStats?.workoutsTarget || 4,
                  color: 'text-forma-teal',
                  bgColor: 'bg-forma-teal',
                },
                {
                  label: 'Calorie Goal',
                  icon: Flame,
                  value: weeklyStats?.daysOnCalorieTarget || 0,
                  target: 7,
                  color: 'text-orange-500',
                  bgColor: 'bg-orange-500',
                },
                {
                  label: 'Nutrition Logged',
                  icon: Utensils,
                  value: weeklyStats?.daysWithMeals || 0,
                  target: 7,
                  color: 'text-green-500',
                  bgColor: 'bg-green-500',
                },
              ].map((goal) => (
                <div key={goal.label}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="flex items-center gap-2">
                      <goal.icon className={`h-4 w-4 ${goal.color}`} />
                      <span className="font-medium">{goal.label}</span>
                    </span>
                    <span className="text-muted-foreground">
                      {goal.value} / {goal.target}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${goal.bgColor} transition-all duration-500`}
                      style={{ width: `${Math.min(100, (goal.value / goal.target) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      <Card className="glass-card animate-fade-up" style={{ animationDelay: '0.6s' }}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Trophy className="h-4 w-4 text-yellow-500" />
            </div>
            Achievements
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/achievements" className="text-forma-teal">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {[
              { emoji: '🏆', name: 'First Workout', unlocked: true },
              { emoji: '🔥', name: '7-Day Streak', unlocked: true },
              { emoji: '💪', name: '10 Workouts', unlocked: false },
              { emoji: '🎯', name: 'Goal Crusher', unlocked: false },
              { emoji: '⚡', name: 'Speed Demon', unlocked: false },
            ].map((achievement) => (
              <div
                key={achievement.name}
                className={`flex flex-col items-center gap-2 min-w-[80px] ${!achievement.unlocked && 'opacity-40'}`}
              >
                <div className={`achievement-badge ${achievement.unlocked && 'unlocked'}`}>
                  {achievement.emoji}
                </div>
                <span className="text-xs text-center font-medium">{achievement.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Padding for Mobile Nav */}
      <div className="h-4 lg:hidden" />
    </div>
  );
}
