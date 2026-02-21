'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Dumbbell,
  Info,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  X,
  Flame,
  Target,
  Zap,
  Timer,
  Volume2,
  VolumeX,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { api, workoutsApi } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';

interface SetData {
  id: string;
  setNumber: number;
  reps: number | string;
  weight: number | string;
  completed: boolean;
  isWarmup?: boolean;
}

interface ExerciseData {
  id: string;
  exerciseId: string;
  name: string;
  nameAr?: string;
  muscleGroup: string;
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  sets: SetData[];
  notes?: string;
  completed: boolean;
}

interface WorkoutData {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  exercises: ExerciseData[];
}

interface WorkoutSession {
  logId: string;
  startedAt: string;
}

export default function ActiveWorkoutPage() {
  const params = useParams();
  const workoutId = params.id as string;
  const router = useRouter();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  // Data states
  const [workout, setWorkout] = useState<WorkoutData | null>(null);
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Timer states
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [currentRestDuration, setCurrentRestDuration] = useState(0);

  // UI states
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const isPlaceholder = workoutId === '_placeholder' || workoutId === '_placeholder_';

  // Redirect placeholder routes (static export artifact)
  useEffect(() => {
    if (isPlaceholder) {
      window.location.href = '/workouts';
    }
  }, [isPlaceholder]);

  // Fetch workout data and start session
  useEffect(() => {
    if (isPlaceholder) return;

    async function initializeWorkout() {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch workout plan details
        const planData = await workoutsApi.getPlan(workoutId);

        if (!planData || !planData.workouts || planData.workouts.length === 0) {
          setError('Workout not found');
          return;
        }

        // Get the first workout day (or find by ID if it's a specific workout)
        const workoutDay = planData.workouts.find((w: { id: string }) => w.id === workoutId) || planData.workouts[0];

        // Transform to our exercise format
        const transformedExercises: ExerciseData[] = (workoutDay.exercises || []).map((ex: {
          exerciseId: string;
          exercise?: { id: string; nameEn?: string; nameAr?: string; primaryMuscle?: string };
          sets?: number;
          reps?: string;
          restSeconds?: number;
        }, index: number) => ({
          id: `ex-${index}`,
          exerciseId: ex.exerciseId,
          name: ex.exercise?.nameEn || 'Unknown Exercise',
          nameAr: ex.exercise?.nameAr,
          muscleGroup: ex.exercise?.primaryMuscle || 'Other',
          targetSets: ex.sets || 3,
          targetReps: ex.reps || '8-12',
          restSeconds: ex.restSeconds || 90,
          sets: Array.from({ length: ex.sets || 3 }, (_, i) => ({
            id: `set-${index}-${i}`,
            setNumber: i + 1,
            reps: '',
            weight: '',
            completed: false,
          })),
          notes: undefined,
          completed: false,
        }));

        setWorkout({
          id: workoutDay.id,
          name: workoutDay.name || planData.name || 'Workout',
          nameAr: (workoutDay as { nameAr?: string }).nameAr,
          description: planData.description,
          exercises: transformedExercises,
        });

        setExercises(transformedExercises);
        if (transformedExercises.length > 0) {
          setExpandedExercise(transformedExercises[0].id);
        }

        // Start workout session
        try {
          const sessionResponse = await api.post<{ id: string; startedAt: string }>(`/workouts/start/${workoutDay.id}`);
          setSession({
            logId: sessionResponse.id,
            startedAt: sessionResponse.startedAt,
          });
        } catch (startError) {
          console.warn('Could not start workout session:', startError);
          // Session tracking unavailable - sets won't be saved to server but user can still use the workout locally
        }

      } catch (err) {
        // Error handled
        setError(err instanceof Error ? err.message : 'Failed to load workout');
      } finally {
        setIsLoading(false);
      }
    }

    initializeWorkout();
  }, [workoutId]);

  // Main workout timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && !isLoading) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isLoading]);

  // Rest timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (restTimer !== null && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (restTimer === 0) {
      if (soundEnabled && typeof window !== 'undefined') {
        try {
          const audio = new Audio('/sounds/timer-end.mp3');
          audio.play().catch(() => {});
        } catch {}
      }
      setRestTimer(null);
    }
    return () => clearInterval(interval);
  }, [restTimer, soundEnabled]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSetComplete = async (exerciseId: string, setId: string) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    const set = exercise?.sets.find(s => s.id === setId);

    if (!exercise || !set) return;

    // Toggle completion
    const newCompleted = !set.completed;

    // Update local state
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;

        const updatedSets = ex.sets.map((s) =>
          s.id === setId ? { ...s, completed: newCompleted } : s
        );

        const allSetsCompleted = updatedSets
          .filter((s) => !s.isWarmup)
          .every((s) => s.completed);

        // Start rest timer if set was completed
        if (newCompleted) {
          setRestTimer(ex.restSeconds);
          setCurrentRestDuration(ex.restSeconds);
        }

        return {
          ...ex,
          sets: updatedSets,
          completed: allSetsCompleted,
        };
      })
    );

    // Log set to API if we have a session
    if (session && newCompleted && set.reps && set.weight) {
      try {
        await api.post(`/workouts/logs/${session.logId}/sets`, {
          exerciseId: exercise.exerciseId,
          setNumber: set.setNumber,
          reps: parseInt(String(set.reps)) || 0,
          weightKg: parseFloat(String(set.weight)) || 0,
        });
      } catch (err) {
        // Error handled - don't block UI, set is still marked as complete locally
      }
    }
  };

  const handleSetValueChange = (
    exerciseId: string,
    setId: string,
    field: 'reps' | 'weight',
    value: string
  ) => {
    setExercises((prev) =>
      prev.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;
        return {
          ...exercise,
          sets: exercise.sets.map((set) =>
            set.id === setId ? { ...set, [field]: value } : set
          ),
        };
      })
    );
  };

  const addSet = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;
        const newSetNumber = exercise.sets.length + 1;
        return {
          ...exercise,
          sets: [
            ...exercise.sets,
            {
              id: `${exerciseId}-${newSetNumber}`,
              setNumber: newSetNumber,
              reps: '',
              weight: '',
              completed: false
            },
          ],
        };
      })
    );
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;
        return {
          ...exercise,
          sets: exercise.sets.filter((set) => set.id !== setId),
        };
      })
    );
  };

  const completedExercises = exercises.filter((e) => e.completed).length;
  const totalExercises = exercises.length;
  const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  const totalSets = exercises.reduce((sum, e) => sum + e.sets.filter(s => !s.isWarmup).length, 0);
  const completedSets = exercises.reduce(
    (sum, e) => sum + e.sets.filter(s => s.completed && !s.isWarmup).length,
    0
  );

  const totalVolume = exercises.reduce((total, exercise) => {
    return (
      total +
      exercise.sets
        .filter((set) => set.completed && !set.isWarmup)
        .reduce((setTotal, set) => {
          const weight = parseFloat(String(set.weight)) || 0;
          const reps = parseInt(String(set.reps)) || 0;
          return setTotal + weight * reps;
        }, 0)
    );
  }, 0);

  const handleFinishWorkout = () => {
    setShowFinishDialog(true);
  };

  const confirmFinish = async () => {
    if (!session) {
      router.push('/workouts');
      return;
    }

    setIsSaving(true);

    try {
      await api.put(`/workouts/logs/${session.logId}/complete`, {
        rating: 4,
        notes: `Completed ${completedExercises} exercises, ${totalVolume}kg total volume`,
      });

      router.push('/workouts');
    } catch (err) {
      // Error handled - still navigate, data was logged per-set
      router.push('/workouts');
    }
  };

  const restProgress = restTimer !== null && currentRestDuration > 0
    ? (restTimer / currentRestDuration) * 100
    : 0;

  const getMuscleGroupColor = (muscle: string) => {
    const normalizedMuscle = muscle?.toUpperCase() || '';
    const colors: Record<string, string> = {
      'CHEST': 'from-red-500 to-orange-500',
      'TRICEPS': 'from-purple-500 to-pink-500',
      'SHOULDERS': 'from-blue-500 to-blue-500',
      'BACK': 'from-green-500 to-emerald-500',
      'BICEPS': 'from-yellow-500 to-orange-500',
      'QUADRICEPS': 'from-blue-500 to-blue-600',
      'HAMSTRINGS': 'from-teal-500 to-green-500',
      'GLUTES': 'from-pink-500 to-rose-500',
      'ABS': 'from-amber-500 to-yellow-500',
      'OBLIQUES': 'from-amber-500 to-orange-500',
      'LOWER_BACK': 'from-green-500 to-teal-500',
      'FOREARMS': 'from-orange-500 to-red-500',
      'CALVES': 'from-indigo-500 to-purple-500',
      'FULL_BODY': 'from-forma-orange to-emerald-500',
      'CARDIO': 'from-pink-500 to-red-500',
    };
    return colors[normalizedMuscle] || 'from-gray-500 to-gray-600';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{isAr ? 'جاري تحميل التمرين...' : 'Loading workout...'}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !workout) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center max-w-sm mx-auto">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Dumbbell className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">{isAr ? 'التمرين غير متاح' : 'Workout Unavailable'}</h2>
          <p className="text-muted-foreground mb-6">{isAr ? 'التمرين ده مش موجود أو اتحذف. اختار تمرين من صفحة التمارين.' : 'This workout doesn\'t exist or has been removed. Choose a workout from the workouts page.'}</p>
          <Button className="btn-primary" onClick={() => router.push('/workouts')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {isAr ? 'اختار تمرين' : 'Browse Workouts'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none lg:left-64">
        <div className="absolute top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-40 -left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Sticky Header */}
      <div className="sticky top-0 z-20 rounded-2xl border-b border-border/50 bg-card">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => setShowExitDialog(true)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Workout Timer */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  isTimerRunning ? "bg-green-500" : "bg-yellow-500"
                )} />
                <span className="text-2xl font-bold font-mono tracking-wider">
                  {formatTime(elapsedTime)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
              >
                {isTimerRunning ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{workout.name}</p>
          </div>

          <Button className="btn-primary" size="sm" onClick={handleFinishWorkout} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isAr ? 'خلص' : 'Finish'}
          </Button>
        </div>

        {/* Progress Stats */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div className="text-center">
              <p className="text-lg font-bold text-blue-400">{completedSets}/{totalSets}</p>
              <p className="text-xs text-muted-foreground">{isAr ? 'مجموعات' : 'Sets'}</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-purple-400">{completedExercises}/{totalExercises}</p>
              <p className="text-xs text-muted-foreground">{isAr ? 'تمارين' : 'Exercises'}</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-400">{(totalVolume / 1000).toFixed(1)}k</p>
              <p className="text-xs text-muted-foreground">{isAr ? 'الحجم (كجم)' : 'Volume (kg)'}</p>
            </div>
          </div>
          <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Rest Timer Overlay */}
      <AnimatePresence>
        {restTimer !== null && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-x-0 bottom-20 z-30 px-4 lg:left-64 lg:bottom-4"
          >
            <Card className="rounded-2xl border border-primary/50 bg-card overflow-hidden">
              <div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                style={{ width: `${restProgress}%` }}
              />
              <CardContent className="relative flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  {/* Circular Timer */}
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-muted/30"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray={`${restProgress * 1.76} 176`}
                        className="text-primary transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold font-mono">{restTimer}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">{isAr ? 'وقت الراحة' : 'Rest Time'}</p>
                    <p className="text-sm text-muted-foreground">
                      {isAr ? 'خد نفسك' : 'Take a breather'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRestTimer((prev) => (prev !== null ? prev + 30 : 30))}
                    className="border-primary/50"
                  >
                    +30s
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                  >
                    {soundEnabled ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setRestTimer(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercises */}
      <div className="relative z-10 space-y-4 p-4">
        {exercises.length === 0 ? (
          <div className="text-center py-12">
            <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">{isAr ? 'مفيش تمارين في التمرين ده' : 'No exercises in this workout'}</p>
            <p className="text-muted-foreground">{isAr ? 'خطة التمرين دي مفيهاش تمارين.' : 'This workout plan has no exercises configured.'}</p>
          </div>
        ) : (
          exercises.map((exercise, exerciseIndex) => (
            <Collapsible
              key={exercise.id}
              open={expandedExercise === exercise.id}
              onOpenChange={() =>
                setExpandedExercise(
                  expandedExercise === exercise.id ? null : exercise.id
                )
              }
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: exerciseIndex * 0.05 }}
              >
                <Card className={cn(
                  "rounded-2xl border border-border/50 bg-card transition-all overflow-hidden",
                  exercise.completed && "border-green-500/50 bg-green-500/5"
                )}>
                  {/* Gradient accent bar */}
                  <div className={cn(
                    "h-1 bg-gradient-to-r",
                    getMuscleGroupColor(exercise.muscleGroup)
                  )} />

                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-xl transition-all",
                            exercise.completed
                              ? "bg-green-500 text-white"
                              : "bg-muted/50 text-muted-foreground"
                          )}>
                            {exercise.completed ? (
                              <Check className="h-5 w-5" />
                            ) : (
                              <span className="font-bold">{exerciseIndex + 1}</span>
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-base">{exercise.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={cn(
                                "text-xs bg-gradient-to-r bg-clip-text text-transparent",
                                getMuscleGroupColor(exercise.muscleGroup)
                              )}>
                                {exercise.muscleGroup}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {exercise.targetSets} sets × {exercise.targetReps}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Set Progress */}
                          <div className="flex gap-1">
                            {exercise.sets.filter(s => !s.isWarmup).map((set, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "w-2 h-2 rounded-full transition-all",
                                  set.completed ? "bg-green-500" : "bg-muted/50"
                                )}
                              />
                            ))}
                          </div>
                          {expandedExercise === exercise.id ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      {/* Notes */}
                      {exercise.notes && (
                        <div className="mb-4 flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/20 p-3 text-sm">
                          <Info className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground">{exercise.notes}</span>
                        </div>
                      )}

                      {/* Sets Table */}
                      <div className="space-y-2">
                        {/* Header */}
                        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
                          <div className="col-span-2">{isAr ? 'مجموعة' : 'SET'}</div>
                          <div className="col-span-4 text-center">{isAr ? 'كجم' : 'KG'}</div>
                          <div className="col-span-4 text-center">{isAr ? 'تكرار' : 'REPS'}</div>
                          <div className="col-span-2"></div>
                        </div>

                        {/* Sets */}
                        {exercise.sets.map((set, setIndex) => (
                          <motion.div
                            key={set.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: setIndex * 0.03 }}
                            className={cn(
                              "grid grid-cols-12 items-center gap-2 p-2 rounded-xl transition-all",
                              set.completed
                                ? "bg-green-500/10 border border-green-500/30"
                                : "bg-muted/20"
                            )}
                          >
                            <div className="col-span-2">
                              {set.isWarmup ? (
                                <Badge variant="secondary" className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">
                                  W
                                </Badge>
                              ) : (
                                <span className={cn(
                                  "font-bold text-sm",
                                  set.completed ? "text-green-400" : "text-foreground"
                                )}>
                                  {exercise.sets.filter((s, i) => !s.isWarmup && i <= setIndex).length}
                                </span>
                              )}
                            </div>
                            <div className="col-span-4">
                              <Input
                                type="number"
                                placeholder="-"
                                value={set.weight}
                                onChange={(e) =>
                                  handleSetValueChange(
                                    exercise.id,
                                    set.id,
                                    'weight',
                                    e.target.value
                                  )
                                }
                                className="h-10 text-center bg-muted/30 border-border/50 font-medium"
                                disabled={set.completed}
                              />
                            </div>
                            <div className="col-span-4">
                              <Input
                                type="number"
                                placeholder="-"
                                value={set.reps}
                                onChange={(e) =>
                                  handleSetValueChange(
                                    exercise.id,
                                    set.id,
                                    'reps',
                                    e.target.value
                                  )
                                }
                                className="h-10 text-center bg-muted/30 border-border/50 font-medium"
                                disabled={set.completed}
                              />
                            </div>
                            <div className="col-span-2 flex justify-end gap-1">
                              <Button
                                variant={set.completed ? 'default' : 'outline'}
                                size="icon"
                                className={cn(
                                  "h-10 w-10 transition-all",
                                  set.completed
                                    ? "bg-green-500 hover:bg-green-600 text-white"
                                    : "border-border/50 hover:border-primary hover:bg-primary/10"
                                )}
                                onClick={() => handleSetComplete(exercise.id, set.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              {!set.completed && exercise.sets.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => removeSet(exercise.id, set.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        ))}

                        {/* Add Set Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full border border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5"
                          onClick={() => addSet(exercise.id)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          {isAr ? 'أضف مجموعة' : 'Add Set'}
                        </Button>
                      </div>

                      {/* Rest Timer Button */}
                      <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Timer className="h-4 w-4" />
                          <span>{isAr ? 'راحة:' : 'Rest:'} {exercise.restSeconds}s</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-primary/50 hover:bg-primary/10"
                          onClick={() => {
                            setRestTimer(exercise.restSeconds);
                            setCurrentRestDuration(exercise.restSeconds);
                          }}
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          {isAr ? 'ابدأ راحة' : 'Start Rest'}
                        </Button>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </motion.div>
            </Collapsible>
          ))
        )}
      </div>

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="rounded-2xl border border-border/50 bg-card">
          <DialogHeader>
            <DialogTitle>{isAr ? 'خروج من التمرين?' : 'Exit Workout?'}</DialogTitle>
            <DialogDescription>
              {isAr ? 'تقدمك في التمرين هيتحذف لو خرجت من غير حفظ.' : 'Your workout progress will be lost if you exit without saving.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowExitDialog(false)}>
              {isAr ? 'كمل التمرين' : 'Continue Workout'}
            </Button>
            <Button
              variant="destructive"
              onClick={() => router.push('/workouts')}
            >
              {isAr ? 'اخرج من غير حفظ' : 'Exit Without Saving'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finish Confirmation Dialog */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent className="rounded-2xl border border-border/50 bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              {isAr ? 'التمرين خلص!' : 'Workout Complete!'}
            </DialogTitle>
            <DialogDescription>
              {isAr ? 'شغل عظيم! هنا ملخصك:' : "Great job pushing through! Here's your summary:"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
                <p className="text-2xl font-bold">{formatTime(elapsedTime)}</p>
                <p className="text-xs text-muted-foreground">{isAr ? 'المدة' : 'Duration'}</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-5 w-5 text-purple-400" />
                </div>
                <p className="text-2xl font-bold">{completedExercises}</p>
                <p className="text-xs text-muted-foreground">{isAr ? 'تمارين' : 'Exercises'}</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center justify-center mb-2">
                  <Flame className="h-5 w-5 text-orange-400" />
                </div>
                <p className="text-2xl font-bold">{totalVolume.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{isAr ? 'الحجم (كجم)' : 'Volume (kg)'}</p>
              </div>
            </div>

            {/* Achievement teaser */}
            {totalVolume > 5000 && (
              <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Zap className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="font-medium text-yellow-400">{isAr ? 'جلسة رائعة!' : 'Great Session!'}</p>
                  <p className="text-xs text-muted-foreground">You crushed {(totalVolume / 1000).toFixed(1)}k volume today!</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinishDialog(false)}>
              {isAr ? 'كمل' : 'Keep Going'}
            </Button>
            <Button className="btn-primary" onClick={confirmFinish} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isAr ? 'احفظ التمرين' : 'Save Workout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
