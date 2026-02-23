'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExerciseSearchDialog } from './ExerciseSearchDialog';
import { workoutsApi, type Exercise } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';

// New types for better structure
interface WorkoutSet {
  id: number;
  reps: string;
  weight: string;
}

interface WorkoutExercise {
  id: number;
  exercise: Exercise;
  sets: WorkoutSet[];
}

interface WorkoutDay {
  id: number;
  name: string;
  exercises: WorkoutExercise[];
}


export default function CreateWorkoutPlanPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [planName, setPlanName] = useState('');
  const [workouts, setWorkouts] = useState<WorkoutDay[]>([{ id: 1, name: isAr ? 'يوم 1' : 'Day 1', exercises: [] }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addWorkoutDay = () => {
    setWorkouts([...workouts, { id: Date.now(), name: `${isAr ? 'يوم' : 'Day'} ${workouts.length + 1}`, exercises: [] }]);
  };

  const removeWorkoutDay = (id: number) => {
    setWorkouts(workouts.filter(w => w.id !== id));
  };

  const updateWorkoutDayName = (id: number, name: string) => {
    setWorkouts(workouts.map(w => w.id === id ? { ...w, name } : w));
  };
  
  const addExerciseToWorkout = (workoutId: number, exercise: Exercise) => {
    const newExercise: WorkoutExercise = {
      id: Date.now(),
      exercise,
      sets: [{ id: Date.now(), reps: '10', weight: '' }],
    };

    setWorkouts(workouts.map(w => 
      w.id === workoutId 
        ? { ...w, exercises: [...w.exercises, newExercise] } 
        : w
    ));
  };

  const removeExerciseFromWorkout = (workoutId: number, exerciseId: number) => {
    setWorkouts(workouts.map(w =>
      w.id === workoutId
        ? { ...w, exercises: w.exercises.filter(ex => ex.id !== exerciseId) }
        : w
    ));
  };

  const addSetToExercise = (workoutId: number, exerciseId: number) => {
    const newSet: WorkoutSet = { id: Date.now(), reps: '10', weight: '' };
    setWorkouts(workouts.map(w =>
      w.id === workoutId
        ? {
            ...w,
            exercises: w.exercises.map(ex =>
              ex.id === exerciseId
                ? { ...ex, sets: [...ex.sets, newSet] }
                : ex
            ),
          }
        : w
    ));
  };

  const updateSetValue = (workoutId: number, exerciseId: number, setId: number, field: 'reps' | 'weight', value: string) => {
     setWorkouts(workouts.map(w =>
      w.id === workoutId
        ? {
            ...w,
            exercises: w.exercises.map(ex =>
              ex.id === exerciseId
                ? {
                    ...ex,
                    sets: ex.sets.map(s =>
                      s.id === setId ? { ...s, [field]: value } : s
                    ),
                  }
                : ex
            ),
          }
        : w
    ));
  };

  const removeSetFromExercise = (workoutId: number, exerciseId: number, setId: number) => {
    setWorkouts(workouts.map(w =>
      w.id === workoutId
        ? {
            ...w,
            exercises: w.exercises.map(ex =>
              ex.id === exerciseId
                ? { ...ex, sets: ex.sets.filter(s => s.id !== setId) }
                : ex
            ),
          }
        : w
    ));
  };

  const handleSavePlan = async () => {
    if (!planName.trim()) {
      setError(isAr ? 'أدخل اسم الخطة' : 'Please enter a plan name');
      return;
    }

    if (workouts.length === 0) {
      setError(isAr ? 'أضف يوم تمرين واحد على الأقل' : 'Please add at least one workout day');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const planData = {
        name: planName,
        workouts: workouts.map(w => ({
          name: w.name,
          exercises: w.exercises.map(ex => ({
            exerciseId: ex.exercise.id,
            sets: ex.sets.map(s => ({ reps: s.reps, weight: s.weight || undefined })),
          })),
        })),
      };

      await workoutsApi.createPlan(planData);
      router.push('/workouts');
    } catch (err) {
      // Error handled
      setError(err instanceof Error ? err.message : (isAr ? 'فشل حفظ الخطة. حاول تاني.' : 'Failed to save plan. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold">{isAr ? 'إنشاء خطة تمرين' : 'Create Workout Plan'}</h1>
        <p className="text-muted-foreground">{isAr ? 'ابني برنامج تدريبك المخصص من الصفر.' : 'Build your own custom training program from scratch.'}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isAr ? 'تفاصيل الخطة' : 'Plan Details'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="planName" className="font-medium">{isAr ? 'اسم الخطة' : 'Plan Name'}</label>
            <Input
              id="planName"
              placeholder={isAr ? 'مثال: خطة القوة الخاصة بي' : 'e.g., My Awesome Strength Plan'}
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
            />
          </div>

          {workouts.map((workout) => (
            <Card key={workout.id} className="bg-muted/50">
              <CardHeader className="flex-row items-center justify-between py-4">
                <Input 
                  value={workout.name} 
                  onChange={(e) => updateWorkoutDayName(workout.id, e.target.value)}
                  className="border-none bg-transparent text-lg font-semibold p-0 focus-visible:ring-0"
                />
                <Button variant="ghost" size="icon" onClick={() => removeWorkoutDay(workout.id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {workout.exercises.map((ex) => (
                  <div key={ex.id} className="space-y-2 rounded-md border bg-background p-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{ex.exercise.name}</h4>
                      <Button variant="ghost" size="icon" onClick={() => removeExerciseFromWorkout(workout.id, ex.id)}>
                        <X className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center text-sm font-medium text-muted-foreground px-2">
                        <span>{isAr ? 'تكرارات' : 'Reps'}</span>
                        <span>{isAr ? 'الوزن (كجم)' : 'Weight (kg)'}</span>
                        <span></span>
                      </div>
                      {ex.sets.map((set, setIndex) => (
                        <div key={set.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                          <Input 
                            type="text" 
                            placeholder="e.g., 8-12" 
                            value={set.reps}
                            onChange={(e) => updateSetValue(workout.id, ex.id, set.id, 'reps', e.target.value)}
                          />
                          <Input 
                            type="number" 
                            placeholder="e.g., 50" 
                             value={set.weight}
                            onChange={(e) => updateSetValue(workout.id, ex.id, set.id, 'weight', e.target.value)}
                          />
                          <Button variant="ghost" size="icon" onClick={() => removeSetFromExercise(workout.id, ex.id, set.id)}>
                             <X className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button variant="outline" size="sm" onClick={() => addSetToExercise(workout.id, ex.id)}>
                      <Plus className="me-2 h-4 w-4" /> {isAr ? 'إضافة مجموعة' : 'Add Set'}
                    </Button>
                  </div>
                ))}
                
                <ExerciseSearchDialog onAddExercise={(exercise) => addExerciseToWorkout(workout.id, exercise)}>
                  <Button variant="outline" className="w-full border-dashed">
                    <Plus className="me-2 h-4 w-4" /> {isAr ? 'إضافة تمرين' : 'Add Exercise'}
                  </Button>
                </ExerciseSearchDialog>
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" onClick={addWorkoutDay}>
            <Plus className="me-2 h-4 w-4" /> {isAr ? 'إضافة يوم / تمرين' : 'Add Day / Workout'}
          </Button>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button
            size="lg"
            className="w-full"
            onClick={handleSavePlan}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                {isAr ? 'جاري الحفظ...' : 'Saving...'}
              </>
            ) : (
              isAr ? 'حفظ الخطة' : 'Save Plan'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
