'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
      // Play notification sound or vibrate
      setRestTimer(null);
    }
    return () => clearInterval(interval);
  }, [restTimer]);

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
    // Save workout data
    console.log('Saving workout:', {
      exercises,
      duration: elapsedTime,
      totalVolume,
    });
    router.push('/app/workouts');
  };

  return (
    <div className="min-h-screen bg-background pb-32 lg:ml-64 lg:pb-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => setShowExitDialog(true)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h1 className="font-semibold">{workout.name}</h1>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatTime(elapsedTime)}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
              >
                {isTimerRunning ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
          <Button variant="forma" size="sm" onClick={handleFinishWorkout}>
            <Save className="mr-2 h-4 w-4" />
            Finish
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completedExercises}/{totalExercises} exercises
            </span>
            <span className="font-medium text-forma-teal">
              {totalVolume.toLocaleString()} kg
            </span>
          </div>
          <Progress value={progress} className="mt-2 h-2" />
        </div>
      </div>

      {/* Rest Timer Overlay */}
      {restTimer !== null && (
        <div className="fixed inset-x-0 bottom-20 z-20 px-4 lg:left-64 lg:bottom-4">
          <Card className="border-forma-teal bg-forma-teal/10">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">Rest Timer</p>
                <p className="text-2xl font-bold text-forma-teal">
                  {formatTime(restTimer)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Progress
                  value={(restTimer / currentRestDuration) * 100}
                  className="h-2 w-24"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRestTimer((prev) => (prev !== null ? prev + 30 : 30))}
                >
                  +30s
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setRestTimer(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Exercises */}
      <div className="space-y-4 p-4">
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
            <Card
              className={exercise.completed ? 'border-forma-teal bg-forma-teal/5' : ''}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          exercise.completed
                            ? 'bg-forma-teal text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {exercise.completed ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          exerciseIndex + 1
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-base">{exercise.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {exercise.targetSets} sets × {exercise.targetReps} reps
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{exercise.muscleGroup}</Badge>
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
                    <div className="mb-4 flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{exercise.notes}</span>
                    </div>
                  )}

                  {/* Sets Table */}
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                      <div className="col-span-2">Set</div>
                      <div className="col-span-4">Weight (kg)</div>
                      <div className="col-span-4">Reps</div>
                      <div className="col-span-2"></div>
                    </div>

                    {/* Sets */}
                    {exercise.sets.map((set, setIndex) => (
                      <div
                        key={set.id}
                        className={`grid grid-cols-12 items-center gap-2 ${
                          set.completed ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="col-span-2 text-sm">
                          {set.isWarmup ? (
                            <Badge variant="secondary" className="text-xs">
                              W
                            </Badge>
                          ) : (
                            <span className="font-medium">
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
                            className="h-9 text-center"
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
                            className="h-9 text-center"
                            disabled={set.completed}
                          />
                        </div>
                        <div className="col-span-2 flex justify-end gap-1">
                          <Button
                            variant={set.completed ? 'forma' : 'outline'}
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => handleSetComplete(exercise.id, set.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          {!set.completed && exercise.sets.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-destructive"
                              onClick={() => removeSet(exercise.id, set.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Add Set Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => addSet(exercise.id)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Set
                    </Button>
                  </div>

                  {/* Rest Timer Button */}
                  <div className="mt-4 flex items-center justify-between border-t pt-4">
                    <span className="text-sm text-muted-foreground">
                      Rest: {exercise.restSeconds}s
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRestTimer(exercise.restSeconds);
                        setCurrentRestDuration(exercise.restSeconds);
                      }}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Start Rest Timer
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
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
              onClick={() => router.push('/app/workouts')}
            >
              Exit Without Saving
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finish Confirmation Dialog */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finish Workout?</DialogTitle>
            <DialogDescription>
              Great job! Here's your workout summary:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{formatTime(elapsedTime)}</p>
                <p className="text-sm text-muted-foreground">Duration</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{completedExercises}</p>
                <p className="text-sm text-muted-foreground">Exercises</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{totalVolume.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total kg</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinishDialog(false)}>
              Keep Going
            </Button>
            <Button variant="forma" onClick={confirmFinish}>
              <Save className="mr-2 h-4 w-4" />
              Save Workout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
