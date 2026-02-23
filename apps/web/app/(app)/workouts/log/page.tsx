'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { workoutsApi } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';

interface ExerciseSet {
  id: number;
  reps: string;
  weight: string;
}

interface ExerciseEntry {
  id: number;
  name: string;
  sets: ExerciseSet[];
}

export default function LogWorkoutPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [workoutName, setWorkoutName] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<ExerciseEntry[]>([
    { id: 1, name: '', sets: [{ id: 1, reps: '', weight: '' }] },
  ]);
  // Load prefilled workout from What Now if available
  useEffect(() => {
    const saved = sessionStorage.getItem('forma_prefill_workout');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.name) setWorkoutName(data.name);
        if (data.duration) setDuration(data.duration);
        if (data.exercises?.length > 0) {
          setExercises(data.exercises.map((ex: any, i: number) => ({
            id: Date.now() + i,
            name: ex.name || '',
            sets: (ex.sets || []).map((s: any, j: number) => ({
              id: Date.now() + i * 100 + j,
              reps: s.reps || '',
              weight: s.weight || '',
            })),
          })));
        }
        sessionStorage.removeItem('forma_prefill_workout');
      } catch {}
    }
  }, []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addExercise = () => {
    setExercises([
      ...exercises,
      { id: Date.now(), name: '', sets: [{ id: Date.now(), reps: '', weight: '' }] },
    ]);
  };

  const removeExercise = (id: number) => {
    setExercises(exercises.filter((ex) => ex.id !== id));
  };

  const updateExerciseName = (id: number, name: string) => {
    setExercises(exercises.map((ex) => (ex.id === id ? { ...ex, name } : ex)));
  };

  const addSet = (exerciseId: number) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: [...ex.sets, { id: Date.now(), reps: '', weight: '' }] }
          : ex
      )
    );
  };

  const updateSet = (
    exerciseId: number,
    setId: number,
    field: 'reps' | 'weight',
    value: string
  ) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s) =>
                s.id === setId ? { ...s, [field]: value } : s
              ),
            }
          : ex
      )
    );
  };

  const removeSet = (exerciseId: number, setId: number) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.filter((s) => s.id !== setId) }
          : ex
      )
    );
  };

  const handleSubmit = async () => {
    // Validation
    if (!workoutName.trim()) {
      setError(isAr ? 'أدخل اسم التمرين' : 'Please enter a workout name');
      return;
    }

    const durationNum = parseInt(duration);
    if (!duration || isNaN(durationNum) || durationNum <= 0 || durationNum > 720) {
      setError(isAr ? 'المدة لازم تكون بين 1 و 720 دقيقة' : 'Duration must be between 1 and 720 minutes');
      return;
    }

    const validExercises = exercises.filter((ex) => ex.name.trim());
    if (validExercises.length === 0) {
      setError(isAr ? 'أضف تمرين واحد على الأقل' : 'Please add at least one exercise');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await workoutsApi.logWorkout({
        name: workoutName.trim().slice(0, 200),
        durationMinutes: durationNum,
        exercises: validExercises.map((ex) => ({
          name: ex.name.trim().slice(0, 200),
          sets: ex.sets
            .filter((s) => s.reps)
            .map((s) => {
              const reps = Math.min(Math.max(parseInt(s.reps) || 0, 0), 1000);
              const weight = s.weight ? parseFloat(s.weight) : undefined;
              return {
                reps,
                weightKg: weight && !isNaN(weight) && weight > 0 && weight <= 500 ? weight : undefined,
              };
            }),
        })),
        notes: notes ? notes.trim().slice(0, 2000) : undefined,
      });

      router.push('/workouts');
    } catch (err) {
      // Error handled
      setError(
        err instanceof Error
          ? err.message
          : isAr
            ? 'فشل تسجيل التمرين. حاول تاني.'
            : 'Failed to log workout. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold">
          {isAr ? 'تسجيل تمرين' : 'Log a Workout'}
        </h1>
        <p className="text-muted-foreground">
          {isAr
            ? 'أدخل تفاصيل جلسة التدريب يدوياً.'
            : 'Manually enter the details of your training session.'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isAr ? 'تفاصيل التمرين' : 'Workout Details'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="font-medium">
              {isAr ? 'اسم التمرين' : 'Workout Name'}
            </label>
            <Input
              placeholder={isAr ? 'مثال: جري الصبح، يوم صدر' : 'e.g., Morning Run, Chest Day'}
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="font-medium">
              {isAr ? 'المدة (دقائق)' : 'Duration (minutes)'}
            </label>
            <Input
              type="number"
              placeholder="e.g., 60"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          {exercises.map((exercise, exIndex) => (
            <div key={exercise.id} className="space-y-4 rounded-md border p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {isAr ? `تمرين #${exIndex + 1}` : `Exercise #${exIndex + 1}`}
                </h3>
                {exercises.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeExercise(exercise.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Input
                placeholder={isAr ? 'اسم التمرين، مثال: بنش بريس' : 'Exercise Name, e.g., Bench Press'}
                value={exercise.name}
                onChange={(e) => updateExerciseName(exercise.id, e.target.value)}
              />
              {exercise.sets.map((set, setIndex) => (
                <div key={set.id} className="flex items-center gap-2">
                  <span className="w-14 text-sm text-muted-foreground">
                    {isAr ? `مجموعة ${setIndex + 1}` : `Set ${setIndex + 1}`}
                  </span>
                  <Input
                    type="number"
                    placeholder={isAr ? 'تكرارات' : 'Reps'}
                    value={set.reps}
                    onChange={(e) =>
                      updateSet(exercise.id, set.id, 'reps', e.target.value)
                    }
                  />
                  <Input
                    type="number"
                    placeholder={isAr ? 'الوزن (كجم)' : 'Weight (kg)'}
                    value={set.weight}
                    onChange={(e) =>
                      updateSet(exercise.id, set.id, 'weight', e.target.value)
                    }
                  />
                  {exercise.sets.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSet(exercise.id, set.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => addSet(exercise.id)}>
                <Plus className="mr-2 h-4 w-4" />
                {isAr ? 'إضافة مجموعة' : 'Add Set'}
              </Button>
            </div>
          ))}

          <Button variant="outline" onClick={addExercise}>
            <Plus className="mr-2 h-4 w-4" />
            {isAr ? 'إضافة تمرين' : 'Add Exercise'}
          </Button>

          <div className="space-y-2">
            <label className="font-medium">
              {isAr ? 'ملاحظات' : 'Notes'}
            </label>
            <textarea
              className="w-full rounded-md border p-2"
              placeholder={isAr ? 'أي أفكار عن تمرينك؟' : 'Any thoughts on your workout?'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isAr ? 'جاري الحفظ...' : 'Saving...'}
              </>
            ) : (
              isAr ? 'حفظ التمرين' : 'Save Workout'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
