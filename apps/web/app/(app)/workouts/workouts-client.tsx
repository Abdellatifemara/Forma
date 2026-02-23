'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Calendar,
  Dumbbell,
  Plus,
  Timer,
  TrendingUp,
  Sparkles,
  Play,
  ChevronRight,
  Zap,
  Target,
  Flame,
  Filter,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { workoutsApi, type WorkoutPlan, type WorkoutLog } from '@/lib/api';
import { WhatNowButton } from '@/components/workouts/what-now';
import { useLanguage } from '@/lib/i18n';
import dynamic from 'next/dynamic';

const FitnessTests = dynamic(
  () => import('@/components/workouts/fitness-tests').then(mod => ({ default: mod.FitnessTests })),
  { ssr: false }
);
const getQuickActions = (isAr: boolean) => [
  {
    icon: Sparkles,
    title: isAr ? 'إيه دلوقتي؟' : 'What Now?',
    description: isAr ? 'هنختارلك التمرين المثالي' : 'Get your perfect workout',
    href: '?whatnow=true',
    gradient: 'from-primary to-orange-600',
  },
  {
    icon: Calendar,
    title: isAr ? 'جهّزلي برنامج' : 'Generate Program',
    description: isAr ? 'برنامج ٤ أسابيع مخصص' : 'Personalized 4-week plan',
    href: '/workouts/generate',
    gradient: 'from-emerald-500 to-emerald-600',
    absolute: true,
  },
  {
    icon: Dumbbell,
    title: isAr ? 'مكتبة البرامج' : 'Program Library',
    description: isAr ? 'تصفح ٥٠+ برنامج جاهز' : 'Browse 50+ preset programs',
    href: '/workouts/programs',
    gradient: 'from-purple-500 to-purple-600',
    absolute: true,
  },
  {
    icon: Target,
    title: isAr ? 'اختبارات اللياقة' : 'Fitness Tests',
    description: isAr ? 'اعرف مستواك' : 'Know your fitness level',
    href: '?formcheck=true',
    gradient: 'from-blue-500 to-blue-500',
  },
];

const getMuscleGroups = (isAr: boolean) => [
  { name: isAr ? 'صدر' : 'Chest', value: 'CHEST', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { name: isAr ? 'ظهر' : 'Back', value: 'BACK', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { name: isAr ? 'كتف' : 'Shoulders', value: 'SHOULDERS', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { name: isAr ? 'باي' : 'Biceps', value: 'BICEPS', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { name: isAr ? 'رجل' : 'Quads', value: 'QUADRICEPS', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { name: isAr ? 'بطن' : 'Abs', value: 'ABS', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { name: isAr ? 'كارديو' : 'Cardio', value: 'CARDIO', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  { name: isAr ? 'جسم كامل' : 'Full Body', value: 'FULL_BODY', color: 'bg-forma-orange/20 text-forma-orange border-forma-orange/30' },
];

function WorkoutsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [history, setHistory] = useState<WorkoutLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  // Quick Action states from URL params
  const showWhatNow = searchParams.get('whatnow') === 'true';
  const showFormCheck = searchParams.get('formcheck') === 'true';
  const closeQuickAction = () => {
    router.push('/workouts');
  };

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [plansResponse, historyResponse, activePlanResponse] = await Promise.all([
          workoutsApi.getPlans(),
          workoutsApi.getHistory(),
          workoutsApi.getActivePlan(),
        ]);
        setPlans(plansResponse);
        setHistory(historyResponse.data);
        if (activePlanResponse?.id) {
          setActivePlanId(activePlanResponse.id);
        }
      } catch (error) {
        // Error handled
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleStartPlan = async (planId: string) => {
    try {
      await workoutsApi.activatePlan(planId);
      setActivePlanId(planId);
    } catch (error) {
      // Error handled
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto h-16 w-16">
            <div className="h-16 w-16 rounded-full border-4 border-muted animate-pulse" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-forma-orange animate-spin" />
          </div>
          <p className="mt-4 text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-forma-orange" />
            {t.workouts.title}
          </h1>
          <p className="text-muted-foreground">{isAr ? 'تابع و خطط تمارينك' : 'Track and plan your training'}</p>
        </div>
        <Button className="bg-primary text-white hover:bg-primary/90" asChild>
          <Link href="/workouts/log">
            <Plus className="me-2 h-4 w-4" />
            {isAr ? 'سجّل تمرين' : 'Log Workout'}
          </Link>
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        {getQuickActions(isAr).map((action) => (
          <Link
            key={action.title}
            href={(action as any).absolute ? action.href : `/workouts${action.href}`}
            className="group relative overflow-hidden rounded-2xl border bg-card p-4 transition-all duration-300 hover:border-forma-orange/50 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${action.gradient} shadow-lg`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold group-hover:text-forma-orange transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-forma-orange group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="plans" className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <TabsList className="w-full justify-start bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="plans" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            {t.workouts.myPlans}
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            {t.workouts.history}
          </TabsTrigger>
          <TabsTrigger value="exercises" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            {t.workouts.exercises}
          </TabsTrigger>
        </TabsList>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-4 mt-6">
          {plans.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Dumbbell className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t.workouts.noActivePlan}</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {isAr ? 'اعمل أول خطة تمرين أو خلي الذكاء الاصطناعي يختارلك' : 'Create your first plan or get a personalized recommendation'}
              </p>
              <div className="flex gap-3">
                <Button variant="outline" asChild>
                  <Link href="/workouts/create">{isAr ? 'اعمل خطة' : 'Create Plan'}</Link>
                </Button>
                <Button className="bg-primary text-white hover:bg-primary/90" asChild>
                  <Link href="/workouts?whatnow=true">
                    <Sparkles className="me-2 h-4 w-4" />
                    {isAr ? 'اختارلي' : 'Generate for Me'}
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            plans.map((plan, index) => (
              <Card
                key={plan.id}
                className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  activePlanId === plan.id ? 'border-forma-orange ring-1 ring-forma-orange/20' : ''
                } animate-fade-up`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                        {activePlanId === plan.id && (
                          <Badge className="bg-forma-orange/20 text-forma-orange border-forma-orange/30">
                            <Zap className="h-3 w-3 me-1" />
                            {t.workouts.activePlan}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {plan.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-forma-orange" />
                          {plan.frequency} {isAr ? 'يوم/أسبوع' : 'days/week'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer className="h-4 w-4 text-forma-orange" />
                          {plan.duration} {isAr ? 'أسبوع' : 'weeks'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4 text-forma-orange" />
                          {plan.goal || (isAr ? 'لياقة عامة' : 'General Fitness')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {activePlanId === plan.id ? (
                        <Button variant="outline" className="flex-1 sm:flex-none" asChild>
                          <Link href={`/workouts/${plan.id}`}>
                            {t.workouts.browsePlans}
                            <ChevronRight className="ms-1 h-4 w-4" />
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          className="bg-primary text-white hover:bg-primary/90 flex-1 sm:flex-none"
                          onClick={() => handleStartPlan(plan.id)}
                        >
                          <Play className="me-2 h-4 w-4" />
                          {t.workouts.startPlan}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {/* Create Specific Plan */}
          <Card className="border-dashed border-2 bg-transparent hover:border-primary/50 hover:bg-primary/5 transition-all duration-300">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">{isAr ? 'خطة مستهدفة' : 'Specific Plan'}</h3>
              <p className="text-xs text-muted-foreground mb-3">
                {isAr ? 'اختار هدفك وعضلاتك والخطة جاهزة' : 'Pick your goal & muscles — plan ready'}
              </p>
              <Button variant="outline" size="sm" className="rounded-xl" asChild>
                <Link href="/workouts?whatnow=true">{isAr ? 'ابدأ' : 'Start'}</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Custom Plan */}
          <Card className="border-dashed border-2 bg-transparent hover:border-forma-orange/50 hover:bg-forma-orange/5 transition-all duration-300">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="h-12 w-12 rounded-2xl bg-forma-orange/10 flex items-center justify-center mb-3">
                <Plus className="h-6 w-6 text-forma-orange" />
              </div>
              <h3 className="font-semibold mb-1">{isAr ? 'خطة مخصصة' : 'Custom Plan'}</h3>
              <p className="text-xs text-muted-foreground mb-3">
                {isAr ? 'ابني كل تفصيلة بنفسك من الصفر' : 'Build every detail yourself from scratch'}
              </p>
              <Button variant="outline" size="sm" className="rounded-xl" asChild>
                <Link href="/workouts/create">{isAr ? 'اعمل خطة' : 'Create'}</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Hardcore Mode */}
          <Card className="border-dashed border-2 bg-transparent hover:border-red-500/50 hover:bg-red-500/5 transition-all duration-300">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-3">
                <Flame className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="font-semibold mb-1">{isAr ? 'وضع الهاردكور' : 'Hardcore Mode'}</h3>
              <p className="text-xs text-muted-foreground mb-3">
                {isAr ? 'أقصى شدة. مش لأصحاب القلوب الضعيفة' : 'Max intensity. Not for the faint-hearted'}
              </p>
              <Button variant="outline" size="sm" className="rounded-xl border-red-500/30 text-red-500 hover:bg-red-500/10" asChild>
                <Link href="/workouts?whatnow=true">{isAr ? 'يلا' : 'Let\'s Go'}</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Trainer CTA */}
          <Link
            href="/trainers"
            className="block rounded-2xl border border-forma-orange/30 bg-gradient-to-r from-forma-orange/5 to-orange-500/5 p-4 transition-all hover:border-forma-orange/50 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-forma-orange/10 flex items-center justify-center shrink-0">
                <span className="text-2xl">🏋️</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">{isAr ? 'مدرب شخصي؟' : 'Need a Personal Trainer?'}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isAr ? 'مدربين محترفين يعملولك برنامج مخصص' : 'Pro trainers build you a custom program'}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-forma-orange shrink-0" />
            </div>
          </Link>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4 mt-6">
          {history.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t.progress.noData}</h3>
              <p className="text-muted-foreground text-sm">
                {isAr ? 'كمّل أول تمرين عشان يظهر هنا' : 'Complete your first workout to see it here'}
              </p>
            </div>
          ) : (
            history.map((workout, index) => (
              <Card
                key={workout.id}
                className="hover:shadow-lg transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-forma-orange to-forma-orange-light flex items-center justify-center">
                        <Dumbbell className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(workout.date).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <h3 className="font-semibold">{workout.name || (isAr ? 'تمرين' : 'Workout')}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Timer className="h-3.5 w-3.5" />
                            {Math.round((workout.duration || 0) / 60)} {isAr ? 'د' : 'min'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame className="h-3.5 w-3.5 text-orange-500" />
                            {workout.calories || 0} kcal
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5 text-forma-orange" />
                            {workout.totalVolume || 0} kg
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-xl" asChild>
                      <Link href={`/workouts/${workout.id}`}>
                        {isAr ? 'عرض' : 'View'}
                        <ChevronRight className="ms-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Exercises Tab */}
        <TabsContent value="exercises" className="mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {getMuscleGroups(isAr).map((muscle, index) => (
              <Link
                key={muscle.name}
                href={`/exercises?muscle=${muscle.value}`}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${muscle.color}`}>
                      <Dumbbell className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{muscle.name}</h3>
                      <p className="text-xs text-muted-foreground">{isAr ? 'عرض التمارين' : 'View exercises'}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Action: What Now? */}
      {showWhatNow && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg animate-scale-in">
            <div className="flex justify-end mb-2">
              <button
                onClick={closeQuickAction}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <WhatNowButton />
          </div>
        </div>
      )}

      {/* Quick Action: Fitness Tests */}
      {showFormCheck && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-lg mx-auto p-4 py-6">
            <FitnessTests onClose={closeQuickAction} />
          </div>
        </div>
      )}

    </div>
  );
}

export default function WorkoutsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto h-16 w-16">
            <div className="h-16 w-16 rounded-full border-4 border-muted animate-pulse" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-forma-orange animate-spin" />
          </div>
          <p className="mt-4 text-muted-foreground">...</p>
        </div>
      </div>
    }>
      <WorkoutsContent />
    </Suspense>
  );
}
