'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
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

interface SetData {
  id: string;
  reps: number | string;
  weight: number | string;
  completed: boolean;
  isWarmup?: boolean;
}

interface ExerciseData {
  id: string;
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

const workout = {
  id: '1',
  name: 'Push Day - Chest & Triceps',
  description: 'Focus on chest and triceps with compound and isolation movements',
  exercises: [
    {
      id: '1',
      name: 'Bench Press',
      nameAr: 'تمرين الصدر',
      muscleGroup: 'Chest',
      targetSets: 4,
      targetReps: '8-10',
      restSeconds: 90,
      sets: [
        { id: '1-1', reps: '', weight: '', completed: false, isWarmup: true },
        { id: '1-2', reps: '', weight: '', completed: false },
        { id: '1-3', reps: '', weight: '', completed: false },
        { id: '1-4', reps: '', weight: '', completed: false },
        { id: '1-5', reps: '', weight: '', completed: false },
      ],
      notes: 'Last time: 80kg x 8',
      completed: false,
    },
    {
      id: '2',
      name: 'Incline Dumbbell Press',
      nameAr: 'ضغط الدمبل المائل',
      muscleGroup: 'Chest',
      targetSets: 3,
      targetReps: '10-12',
      restSeconds: 75,
      sets: [
        { id: '2-1', reps: '', weight: '', completed: false },
        { id: '2-2', reps: '', weight: '', completed: false },
        { id: '2-3', reps: '', weight: '', completed: false },
      ],
      completed: false,
    },
    {
      id: '3',
      name: 'Cable Flyes',
      nameAr: 'تمرين الكابل للصدر',
      muscleGroup: 'Chest',
      targetSets: 3,
      targetReps: '12-15',
      restSeconds: 60,
      sets: [
        { id: '3-1', reps: '', weight: '', completed: false },
        { id: '3-2', reps: '', weight: '', completed: false },
        { id: '3-3', reps: '', weight: '', completed: false },
      ],
      completed: false,
    },
    {
      id: '4',
      name: 'Tricep Pushdown',
      nameAr: 'دفع التراي',
      muscleGroup: 'Triceps',
      targetSets: 3,
      targetReps: '12-15',
      restSeconds: 60,
      sets: [
        { id: '4-1', reps: '', weight: '', completed: false },
        { id: '4-2', reps: '', weight: '', completed: false },
        { id: '4-3', reps: '', weight: '', completed: false },
      ],
      completed: false,
    },
    {
      id: '5',
      name: 'Overhead Tricep Extension',
      nameAr: 'تمديد التراي فوق الرأس',
      muscleGroup: 'Triceps',
      targetSets: 3,
      targetReps: '10-12',
      restSeconds: 60,
      sets: [
        { id: '5-1', reps: '', weight: '', completed: false },
        { id: '5-2', reps: '', weight: '', completed: false },
        { id: '5-3', reps: '', weight: '', completed: false },
      ],
      completed: false,
    },
  ],
};

export default function ActiveWorkoutPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<ExerciseData[]>(workout.exercises);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [currentRestDuration, setCurrentRestDuration] = useState(0);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(
    workout.exercises[0]?.id
  );
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Main workout timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Rest timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (restTimer !== null && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (restTimer === 0) {
      // Play notification sound
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

  const handleSetComplete = (exerciseId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;

        const updatedSets = exercise.sets.map((set) =>
          set.id === setId ? { ...set, completed: !set.completed } : set
        );

        const allSetsCompleted = updatedSets
          .filter((s) => !s.isWarmup)
          .every((s) => s.completed);

        // Start rest timer if set was completed
        const set = exercise.sets.find((s) => s.id === setId);
        if (set && !set.completed) {
          setRestTimer(exercise.restSeconds);
          setCurrentRestDuration(exercise.restSeconds);
        }

        return {
          ...exercise,
          sets: updatedSets,
          completed: allSetsCompleted,
        };
      })
    );
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
        const newSetId = `${exerciseId}-${exercise.sets.length + 1}`;
        return {
          ...exercise,
          sets: [
            ...exercise.sets,
            { id: newSetId, reps: '', weight: '', completed: false },
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
  const progress = (completedExercises / totalExercises) * 100;

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

  const confirmFinish = () => {
    console.log('Saving workout:', {
      exercises,
      duration: elapsedTime,
      totalVolume,
    });
    router.push('/workouts');
  };

  const restProgress = restTimer !== null && currentRestDuration > 0
    ? (restTimer / currentRestDuration) * 100
    : 0;

  const getMuscleGroupColor = (muscle: string) => {
    const colors: Record<string, string> = {
      'Chest': 'from-red-500 to-orange-500',
      'Triceps': 'from-purple-500 to-pink-500',
      'Shoulders': 'from-blue-500 to-cyan-500',
      'Back': 'from-green-500 to-emerald-500',
      'Biceps': 'from-yellow-500 to-orange-500',
      'Legs': 'from-cyan-500 to-blue-500',
    };
    return colors[muscle] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="min-h-screen bg-background pb-32 lg:ml-64 lg:pb-6">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none lg:left-64">
        <div className="absolute top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-40 -left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Sticky Header */}
      <div className="sticky top-0 z-20 glass border-b border-border/50">
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

          <Button className="btn-primary" size="sm" onClick={handleFinishWorkout}>
            <Save className="mr-2 h-4 w-4" />
            Finish
          </Button>
        </div>

        {/* Progress Stats */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div className="text-center">
              <p className="text-lg font-bold text-cyan-400">{completedSets}/{totalSets}</p>
              <p className="text-xs text-muted-foreground">Sets</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-purple-400">{completedExercises}/{totalExercises}</p>
              <p className="text-xs text-muted-foreground">Exercises</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-400">{(totalVolume / 1000).toFixed(1)}k</p>
              <p className="text-xs text-muted-foreground">Volume (kg)</p>
            </div>
          </div>
          <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
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
            <Card className="glass border-primary/50 overflow-hidden">
              <div
                className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20"
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
                    <p className="font-semibold">Rest Time</p>
                    <p className="text-sm text-muted-foreground">
                      Take a breather
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
        {exercises.map((exercise, exerciseIndex) => (
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
                "glass border-border/50 transition-all overflow-hidden",
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
                        <div className="col-span-2">SET</div>
                        <div className="col-span-4 text-center">KG</div>
                        <div className="col-span-4 text-center">REPS</div>
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
                        Add Set
                      </Button>
                    </div>

                    {/* Rest Timer Button */}
                    <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Timer className="h-4 w-4" />
                        <span>Rest: {exercise.restSeconds}s</span>
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
                        Start Rest
                      </Button>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </motion.div>
          </Collapsible>
        ))}
      </div>

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="glass border-border/50">
          <DialogHeader>
            <DialogTitle>Exit Workout?</DialogTitle>
            <DialogDescription>
              Your workout progress will be lost if you exit without saving.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowExitDialog(false)}>
              Continue Workout
            </Button>
            <Button
              variant="destructive"
              onClick={() => router.push('/workouts')}
            >
              Exit Without Saving
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finish Confirmation Dialog */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent className="glass border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Workout Complete!
            </DialogTitle>
            <DialogDescription>
              Great job pushing through! Here's your summary:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-cyan-400" />
                </div>
                <p className="text-2xl font-bold">{formatTime(elapsedTime)}</p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-5 w-5 text-purple-400" />
                </div>
                <p className="text-2xl font-bold">{completedExercises}</p>
                <p className="text-xs text-muted-foreground">Exercises</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center justify-center mb-2">
                  <Flame className="h-5 w-5 text-orange-400" />
                </div>
                <p className="text-2xl font-bold">{totalVolume.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Volume (kg)</p>
              </div>
            </div>

            {/* Achievement teaser */}
            {totalVolume > 5000 && (
              <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Zap className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="font-medium text-yellow-400">New Record!</p>
                  <p className="text-xs text-muted-foreground">You crushed {(totalVolume / 1000).toFixed(1)}k volume today!</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinishDialog(false)}>
              Keep Going
            </Button>
            <Button className="btn-primary" onClick={confirmFinish}>
              <Save className="mr-2 h-4 w-4" />
              Save Workout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
