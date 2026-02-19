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
  Camera,
  Mic,
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

const FormChecker = dynamic(
  () => import('@/components/workouts/form-checker').then(mod => ({ default: mod.FormChecker })),
  { ssr: false, loading: () => <div className="fixed inset-0 bg-black z-50 flex items-center justify-center"><div className="text-white">Loading form checker...</div></div> }
);
import { WorkoutWithVoiceCoach, VoiceCoachToggle, useVoiceCoach } from '@/components/workouts/voice-coach';

const quickActions = [
  {
    icon: Sparkles,
    title: 'What Now?',
    description: 'Get your perfect workout',
    href: '?whatnow=true',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: Camera,
    title: 'Form Check',
    description: 'Real-time form analysis',
    href: '?formcheck=true',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Mic,
    title: 'Voice Coach',
    description: 'Hands-free guidance',
    href: '?voicecoach=true',
    gradient: 'from-orange-500 to-red-500',
  },
];

const muscleGroups = [
  { name: 'Chest', value: 'CHEST', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { name: 'Back', value: 'BACK', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { name: 'Shoulders', value: 'SHOULDERS', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { name: 'Biceps', value: 'BICEPS', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { name: 'Quads', value: 'QUADRICEPS', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { name: 'Abs', value: 'ABS', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { name: 'Cardio', value: 'CARDIO', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  { name: 'Full Body', value: 'FULL_BODY', color: 'bg-forma-teal/20 text-forma-teal border-forma-teal/30' },
];

function WorkoutsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [history, setHistory] = useState<WorkoutLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  // Quick Action states from URL params
  const showWhatNow = searchParams.get('whatnow') === 'true';
  const showFormCheck = searchParams.get('formcheck') === 'true';
  const showVoiceCoach = searchParams.get('voicecoach') === 'true';
  const [formCheckExercise, setFormCheckExercise] = useState('squat');

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
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-forma-teal animate-spin" />
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
            <Dumbbell className="h-6 w-6 text-forma-teal" />
            {t.workouts.title}
          </h1>
          <p className="text-muted-foreground">Track and plan your training</p>
        </div>
        <Button className="btn-premium" asChild>
          <Link href="/workouts/log">
            <Plus className="mr-2 h-4 w-4" />
            Log Workout
          </Link>
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        {quickActions.map((action) => (
          <Link
            key={action.title}
            href={`/workouts${action.href}`}
            className="group relative overflow-hidden rounded-2xl border bg-card p-4 transition-all duration-300 hover:border-forma-teal/50 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${action.gradient} shadow-lg`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold group-hover:text-forma-teal transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-forma-teal group-hover:translate-x-1 transition-all" />
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
            <div className="empty-state py-12">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Dumbbell className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t.workouts.noActivePlan}</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Create your first plan or get a personalized recommendation
              </p>
              <div className="flex gap-3">
                <Button variant="outline" asChild>
                  <Link href="/workouts/create">Create Plan</Link>
                </Button>
                <Button className="btn-premium" asChild>
                  <Link href="/workouts?whatnow=true">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate for Me
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            plans.map((plan, index) => (
              <Card
                key={plan.id}
                className={`glass-card overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  activePlanId === plan.id ? 'border-forma-teal ring-1 ring-forma-teal/20' : ''
                } animate-fade-up`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                        {activePlanId === plan.id && (
                          <Badge className="bg-forma-teal/20 text-forma-teal border-forma-teal/30">
                            <Zap className="h-3 w-3 mr-1" />
                            {t.workouts.activePlan}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {plan.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-forma-teal" />
                          {plan.frequency} days/week
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer className="h-4 w-4 text-forma-teal" />
                          {plan.duration} weeks
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4 text-forma-teal" />
                          {plan.goal || 'General Fitness'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {activePlanId === plan.id ? (
                        <Button variant="outline" className="flex-1 sm:flex-none" asChild>
                          <Link href={`/workouts/${plan.id}`}>
                            {t.workouts.browsePlans}
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          className="btn-premium flex-1 sm:flex-none"
                          onClick={() => handleStartPlan(plan.id)}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          {t.workouts.startPlan}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {/* Create Custom Plan Card */}
          <Card className="border-dashed border-2 bg-transparent hover:border-forma-teal/50 hover:bg-forma-teal/5 transition-all duration-300">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Plus className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Create Custom Plan</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Build your own workout program from scratch
              </p>
              <Button variant="outline" className="rounded-xl" asChild>
                <Link href="/workouts/create">Create Plan</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4 mt-6">
          {history.length === 0 ? (
            <div className="empty-state py-12">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t.progress.noData}</h3>
              <p className="text-muted-foreground text-sm">
                Complete your first workout to see it here
              </p>
            </div>
          ) : (
            history.map((workout, index) => (
              <Card
                key={workout.id}
                className="glass-card hover:shadow-lg transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-forma-teal to-forma-teal-light flex items-center justify-center">
                        <Dumbbell className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(workout.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <h3 className="font-semibold">{workout.name || 'Workout'}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Timer className="h-3.5 w-3.5" />
                            {Math.round((workout.duration || 0) / 60)} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame className="h-3.5 w-3.5 text-orange-500" />
                            {workout.calories || 0} kcal
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5 text-forma-teal" />
                            {workout.totalVolume || 0} kg
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-xl">
                      View
                      <ChevronRight className="ml-1 h-4 w-4" />
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
            {muscleGroups.map((muscle, index) => (
              <Link
                key={muscle.name}
                href={`/exercises?muscle=${muscle.value}`}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Card className="glass-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${muscle.color}`}>
                      <Dumbbell className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{muscle.name}</h3>
                      <p className="text-xs text-muted-foreground">View exercises</p>
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

      {/* Quick Action: Form Check */}
      {showFormCheck && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera className="w-6 h-6 text-forma-teal" />
              <h2 className="text-white text-lg font-semibold">Form Check</h2>
            </div>
            <button
              onClick={closeQuickAction}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="px-4 pb-4">
            <p className="text-white/70 mb-4">Select an exercise to check your form:</p>
            <div className="flex flex-wrap gap-2">
              {['squat', 'pushup', 'deadlift', 'plank'].map((exercise) => (
                <button
                  key={exercise}
                  onClick={() => setFormCheckExercise(exercise)}
                  className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                    formCheckExercise === exercise
                      ? 'bg-forma-teal text-white'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {exercise}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <FormChecker exercise={formCheckExercise} onClose={closeQuickAction} />
          </div>
        </div>
      )}

      {/* Quick Action: Voice Coach */}
      {showVoiceCoach && (
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Voice Coach</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Hands-free workout guidance</p>
                </div>
              </div>
              <WorkoutWithVoiceCoach
                exercises={[
                  { name: 'Squats', sets: 3, reps: 12 },
                  { name: 'Push-ups', sets: 3, reps: 10 },
                  { name: 'Lunges', sets: 3, reps: 10 },
                  { name: 'Plank', sets: 3, reps: 30 },
                ]}
                language="en"
              />
            </div>
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
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-forma-teal animate-spin" />
          </div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <WorkoutsContent />
    </Suspense>
  );
}
