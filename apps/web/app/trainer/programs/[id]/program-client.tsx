'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  Copy,
  Dumbbell,
  GripVertical,
  Loader2,
  MoreVertical,
  Play,
  Plus,
  Save,
  Search,
  Settings,
  Trash2,
  X,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { programsApi, exercisesApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n';

interface ExerciseResult {
  id: string;
  nameEn: string;
  nameAr?: string;
  primaryMuscle?: string;
  category?: string;
}

interface ProgramExercise {
  id: string;
  exerciseId: string | null;
  customNameEn: string | null;
  customNameAr: string | null;
  order: number;
  sets: number;
  reps: string | null;
  restSeconds: number;
  notesEn: string | null;
  notesAr: string | null;
  exercise?: { nameEn: string; nameAr?: string; primaryMuscle?: string };
}

interface WorkoutDay {
  id: string;
  dayNumber: number;
  nameEn: string | null;
  nameAr: string | null;
  notesEn: string | null;
  notesAr: string | null;
  exercises: ProgramExercise[];
}

interface Program {
  id: string;
  nameEn: string;
  nameAr: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  durationWeeks: number;
  priceEGP: number | null;
  status: string;
  sourceType: string | null;
  workoutDays: WorkoutDay[];
  _count: { clients: number };
}

export default function ProgramBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const programId = params.id as string;

  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string>('');
  const [showExerciseDialog, setShowExerciseDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [exerciseResults, setExerciseResults] = useState<ExerciseResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    nameEn: '',
    descriptionEn: '',
    durationWeeks: 12,
    priceEGP: 0,
  });

  // Load program
  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await programsApi.getById(programId);
        setProgram(data);
        if (data.workoutDays.length > 0) {
          setSelectedDayId(data.workoutDays[0].id);
        }
        setSettingsForm({
          nameEn: data.nameEn,
          descriptionEn: data.descriptionEn || '',
          durationWeeks: data.durationWeeks,
          priceEGP: data.priceEGP || 0,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : (isAr ? 'فشل تحميل البرنامج' : 'Failed to load program'));
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [programId]);

  // Search exercises from real DB
  useEffect(() => {
    if (!exerciseSearch.trim()) {
      setExerciseResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await exercisesApi.search({ query: exerciseSearch, pageSize: 20 });
        const items = (response as any).data || (response as any).items || [];
        setExerciseResults(items.map((e: any) => ({
          id: e.id,
          nameEn: e.nameEn || e.name_en || e.name || '',
          nameAr: e.nameAr || e.name_ar || '',
          primaryMuscle: e.primaryMuscle || e.primary_muscle || '',
          category: e.category || '',
        })));
      } catch {
        setExerciseResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [exerciseSearch]);

  const currentDay = program?.workoutDays.find((d) => d.id === selectedDayId);
  const isRestDay = currentDay ? currentDay.exercises.length === 0 && currentDay.nameEn?.toLowerCase().includes('rest') : false;

  const addExerciseToDay = async (exercise: ExerciseResult) => {
    if (!currentDay || !program) return;

    try {
      const newExercise = await programsApi.addExercise(program.id, currentDay.id, {
        exerciseId: exercise.id,
        customNameEn: exercise.nameEn,
        sets: 3,
        reps: '8-10',
        restSeconds: 90,
      });

      setProgram((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          workoutDays: prev.workoutDays.map((day) =>
            day.id === selectedDayId
              ? { ...day, exercises: [...day.exercises, { ...newExercise, exercise: { nameEn: exercise.nameEn, nameAr: exercise.nameAr, primaryMuscle: exercise.primaryMuscle } }] }
              : day
          ),
        };
      });

      setShowExerciseDialog(false);
      setExerciseSearch('');
      toast({ title: isAr ? 'تم إضافة التمرين' : 'Exercise added' });
    } catch (err) {
      toast({ title: isAr ? 'فشل إضافة التمرين' : 'Failed to add exercise', variant: 'destructive' });
    }
  };

  const removeExercise = async (exerciseId: string) => {
    if (!program) return;

    try {
      await programsApi.deleteExercise(program.id, exerciseId);

      setProgram((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          workoutDays: prev.workoutDays.map((day) =>
            day.id === selectedDayId
              ? { ...day, exercises: day.exercises.filter((e) => e.id !== exerciseId) }
              : day
          ),
        };
      });
      toast({ title: isAr ? 'تم حذف التمرين' : 'Exercise removed' });
    } catch {
      toast({ title: isAr ? 'فشل حذف التمرين' : 'Failed to remove exercise', variant: 'destructive' });
    }
  };

  const updateExercise = async (exerciseId: string, field: string, value: any) => {
    if (!program) return;

    // Optimistic update
    setProgram((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        workoutDays: prev.workoutDays.map((day) =>
          day.id === selectedDayId
            ? {
                ...day,
                exercises: day.exercises.map((e) =>
                  e.id === exerciseId ? { ...e, [field]: value } : e
                ),
              }
            : day
        ),
      };
    });
    setHasChanges(true);
  };

  const saveExerciseChanges = async () => {
    if (!program) return;
    setIsSaving(true);

    try {
      // Save each exercise's current state
      for (const day of program.workoutDays) {
        for (const ex of day.exercises) {
          await programsApi.updateExercise(program.id, ex.id, {
            sets: ex.sets,
            reps: ex.reps || undefined,
            restSeconds: ex.restSeconds,
            notesEn: ex.notesEn || undefined,
          });
        }
      }

      // Save program settings if changed
      await programsApi.update(program.id, {
        nameEn: settingsForm.nameEn,
        descriptionEn: settingsForm.descriptionEn || undefined,
        durationWeeks: settingsForm.durationWeeks,
        priceEGP: settingsForm.priceEGP || undefined,
      });

      setHasChanges(false);
      toast({ title: isAr ? 'تم حفظ البرنامج' : 'Program saved' });
    } catch {
      toast({ title: isAr ? 'فشل الحفظ' : 'Failed to save', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const addDay = async (isRest: boolean = false) => {
    if (!program) return;

    try {
      const newDay = await programsApi.addWorkoutDay(program.id, {
        nameEn: isRest ? 'Rest Day' : `Day ${program.workoutDays.length + 1}`,
      });

      setProgram((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          workoutDays: [...prev.workoutDays, { ...newDay, exercises: newDay.exercises || [] }],
        };
      });
      setSelectedDayId(newDay.id);
      toast({ title: isRest ? (isAr ? 'تم إضافة يوم راحة' : 'Rest day added') : (isAr ? 'تم إضافة يوم تمرين' : 'Workout day added') });
    } catch {
      toast({ title: isAr ? 'فشل إضافة اليوم' : 'Failed to add day', variant: 'destructive' });
    }
  };

  const removeDay = async (dayId: string) => {
    if (!program) return;

    try {
      await programsApi.deleteWorkoutDay(program.id, dayId);

      setProgram((prev) => {
        if (!prev) return prev;
        const newDays = prev.workoutDays.filter((d) => d.id !== dayId);
        return { ...prev, workoutDays: newDays };
      });

      if (selectedDayId === dayId) {
        setSelectedDayId(program.workoutDays[0]?.id || '');
      }
      toast({ title: isAr ? 'تم حذف اليوم' : 'Day removed' });
    } catch {
      toast({ title: isAr ? 'فشل حذف اليوم' : 'Failed to remove day', variant: 'destructive' });
    }
  };

  const saveSettings = async () => {
    if (!program) return;

    try {
      await programsApi.update(program.id, {
        nameEn: settingsForm.nameEn,
        descriptionEn: settingsForm.descriptionEn || undefined,
        durationWeeks: settingsForm.durationWeeks,
        priceEGP: settingsForm.priceEGP || undefined,
      });

      setProgram((prev) => prev ? {
        ...prev,
        nameEn: settingsForm.nameEn,
        descriptionEn: settingsForm.descriptionEn,
        durationWeeks: settingsForm.durationWeeks,
        priceEGP: settingsForm.priceEGP,
      } : prev);

      setShowSettingsDialog(false);
      toast({ title: isAr ? 'تم حفظ الإعدادات' : 'Settings saved' });
    } catch {
      toast({ title: isAr ? 'فشل حفظ الإعدادات' : 'Failed to save settings', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">{isAr ? 'فشل تحميل البرنامج' : 'Failed to load program'}</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" asChild>
          <Link href="/trainer/programs">{isAr ? 'رجوع للبرامج' : 'Back to Programs'}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/trainer/programs">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{program.nameEn}</h1>
            <p className="text-muted-foreground">{program.descriptionEn || (isAr ? 'بدون وصف' : 'No description')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowSettingsDialog(true)}>
            <Settings className={isAr ? 'ml-2 h-4 w-4' : 'mr-2 h-4 w-4'} />
            {isAr ? 'الإعدادات' : 'Settings'}
          </Button>
          <Button variant="forma" onClick={saveExerciseChanges} disabled={!hasChanges || isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {hasChanges ? (isAr ? 'حفظ التغييرات' : 'Save Changes') : (isAr ? 'تم الحفظ' : 'Saved')}
          </Button>
        </div>
      </div>

      {/* Program Info Bar */}
      <div className="flex flex-wrap gap-4">
        <Badge variant="outline" className="py-1.5">
          <Calendar className="mr-1 h-3 w-3" />
          {program.durationWeeks} {isAr ? 'أسابيع' : 'weeks'}
        </Badge>
        <Badge variant="outline" className="py-1.5">
          <Dumbbell className="mr-1 h-3 w-3" />
          {program.workoutDays.length} {isAr ? 'أيام' : 'days'}
        </Badge>
        <Badge variant="outline" className="py-1.5 capitalize">
          {program.status.toLowerCase()}
        </Badge>
        {program.priceEGP && (
          <Badge variant="forma" className="py-1.5">
            {program.priceEGP} {isAr ? 'ج.م' : 'EGP'}
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Day Selector */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{isAr ? 'أيام التمرين' : 'Workout Days'}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => addDay(false)}>
                    <Dumbbell className="mr-2 h-4 w-4" />
                    {isAr ? 'إضافة يوم تمرين' : 'Add Workout Day'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addDay(true)}>
                    <Calendar className="mr-2 h-4 w-4" />
                    {isAr ? 'إضافة يوم راحة' : 'Add Rest Day'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {program.workoutDays.map((day) => (
              <div
                key={day.id}
                className={`group flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                  selectedDayId === day.id
                    ? 'border-forma-teal bg-forma-teal/5'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedDayId(day.id)}
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{day.nameEn || `Day ${day.dayNumber}`}</p>
                    <p className="text-xs text-muted-foreground">
                      {day.exercises.length === 0 && day.nameEn?.toLowerCase().includes('rest')
                        ? (isAr ? 'راحة واستشفاء' : 'Rest & Recovery')
                        : `${day.exercises.length} ${isAr ? 'تمارين' : 'exercises'}`}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => removeDay(day.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isAr ? 'حذف' : 'Delete'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Workout Builder */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{currentDay?.nameEn || (isAr ? 'اختار يوم' : 'Select a day')}</CardTitle>
                <CardDescription>
                  {isRestDay
                    ? (isAr ? 'يوم راحة واستشفاء' : 'Rest and recovery day')
                    : (isAr ? 'أضف واظبط التمارين' : 'Add and configure exercises')}
                </CardDescription>
              </div>
              {currentDay && !isRestDay && (
                <Button variant="forma" onClick={() => setShowExerciseDialog(true)}>
                  <Plus className={isAr ? 'ml-2 h-4 w-4' : 'mr-2 h-4 w-4'} />
                  {isAr ? 'إضافة تمرين' : 'Add Exercise'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isRestDay ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 font-semibold">{isAr ? 'يوم راحة' : 'Rest Day'}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isAr ? 'الراحة مهمة لنمو العضلات ومنع الإصابات' : 'Recovery is essential for muscle growth and preventing injury'}
                </p>
              </div>
            ) : currentDay?.exercises.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4">
                  <Dumbbell className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 font-semibold">{isAr ? 'مفيش تمارين لسه' : 'No exercises yet'}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isAr ? 'ابدأ ببناء التمرين بإضافة تمارين' : 'Start building this workout by adding exercises'}
                </p>
                <Button
                  variant="forma"
                  className="mt-4"
                  onClick={() => setShowExerciseDialog(true)}
                >
                  <Plus className={isAr ? 'ml-2 h-4 w-4' : 'mr-2 h-4 w-4'} />
                  {isAr ? 'أضف أول تمرين' : 'Add First Exercise'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {currentDay?.exercises.map((exercise, index) => (
                  <div
                    key={exercise.id}
                    className="group flex items-start gap-4 rounded-lg border p-4"
                  >
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <GripVertical className="h-5 w-5 cursor-grab text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        {index + 1}
                      </span>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">
                            {exercise.exercise?.nameEn || exercise.customNameEn || 'Exercise'}
                          </h4>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {exercise.exercise?.primaryMuscle || (isAr ? 'عام' : 'General')}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100"
                          onClick={() => removeExercise(exercise.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs">{isAr ? 'مجموعات' : 'Sets'}</Label>
                          <Input
                            type="number"
                            value={exercise.sets}
                            onChange={(e) =>
                              updateExercise(exercise.id, 'sets', parseInt(e.target.value) || 0)
                            }
                            className="mt-1 h-9"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">{isAr ? 'تكرارات' : 'Reps'}</Label>
                          <Input
                            value={exercise.reps || ''}
                            onChange={(e) =>
                              updateExercise(exercise.id, 'reps', e.target.value)
                            }
                            className="mt-1 h-9"
                            placeholder="8-10"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">{isAr ? 'راحة (ثانية)' : 'Rest (sec)'}</Label>
                          <Input
                            type="number"
                            value={exercise.restSeconds}
                            onChange={(e) =>
                              updateExercise(exercise.id, 'restSeconds', parseInt(e.target.value) || 0)
                            }
                            className="mt-1 h-9"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs">{isAr ? 'ملاحظات (اختياري)' : 'Notes (optional)'}</Label>
                        <Input
                          value={exercise.notesEn || ''}
                          onChange={(e) =>
                            updateExercise(exercise.id, 'notesEn', e.target.value)
                          }
                          className="mt-1 h-9"
                          placeholder={isAr ? 'نصائح الأداء، السرعة، إلخ' : 'Form tips, tempo, etc.'}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Exercise Dialog - searches real DB */}
      <Dialog open={showExerciseDialog} onOpenChange={setShowExerciseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isAr ? 'إضافة تمرين' : 'Add Exercise'}</DialogTitle>
            <DialogDescription>
              {isAr ? 'ابحث من قاعدة بيانات التمارين' : 'Search from our exercise database'}
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={isAr ? 'ابحث عن تمارين...' : 'Search exercises (e.g. bench press, squat, deadlift)...'}
              value={exerciseSearch}
              onChange={(e) => setExerciseSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-[400px] space-y-2 overflow-y-auto">
            {searchLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {!searchLoading && exerciseSearch && exerciseResults.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {isAr ? `مفيش تمارين لـ "${exerciseSearch}"` : <>No exercises found for &quot;{exerciseSearch}&quot;</>}
              </div>
            )}

            {!searchLoading && !exerciseSearch && (
              <div className="text-center py-8 text-muted-foreground">
                {isAr ? 'اكتب عشان تبحث عن تمارين...' : 'Type to search exercises...'}
              </div>
            )}

            {exerciseResults.map((exercise) => (
              <div
                key={exercise.id}
                className="flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                onClick={() => addExerciseToDay(exercise)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-forma-teal/10">
                    <Dumbbell className="h-5 w-5 text-forma-teal" />
                  </div>
                  <div>
                    <p className="font-medium">{exercise.nameEn}</p>
                    {exercise.nameAr && (
                      <p className="text-sm text-muted-foreground">{exercise.nameAr}</p>
                    )}
                  </div>
                </div>
                <Badge variant="outline">{exercise.primaryMuscle || exercise.category}</Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? 'إعدادات البرنامج' : 'Program Settings'}</DialogTitle>
            <DialogDescription>{isAr ? 'اظبط تفاصيل برنامجك' : 'Configure your program details'}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>{isAr ? 'اسم البرنامج' : 'Program Name'}</Label>
              <Input
                value={settingsForm.nameEn}
                onChange={(e) => setSettingsForm({ ...settingsForm, nameEn: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>{isAr ? 'الوصف' : 'Description'}</Label>
              <Textarea
                value={settingsForm.descriptionEn}
                onChange={(e) => setSettingsForm({ ...settingsForm, descriptionEn: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{isAr ? 'المدة (أسابيع)' : 'Duration (weeks)'}</Label>
                <Input
                  type="number"
                  value={settingsForm.durationWeeks}
                  onChange={(e) => setSettingsForm({ ...settingsForm, durationWeeks: parseInt(e.target.value) || 1 })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>{isAr ? 'السعر (ج.م)' : 'Price (EGP)'}</Label>
                <Input
                  type="number"
                  value={settingsForm.priceEGP}
                  onChange={(e) => setSettingsForm({ ...settingsForm, priceEGP: parseInt(e.target.value) || 0 })}
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="forma" onClick={saveSettings}>
              {isAr ? 'حفظ الإعدادات' : 'Save Settings'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
