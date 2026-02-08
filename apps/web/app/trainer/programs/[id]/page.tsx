'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  Copy,
  Dumbbell,
  GripVertical,
  MoreVertical,
  Play,
  Plus,
  Save,
  Search,
  Settings,
  Trash2,
  X,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Exercise {
  id: string;
  name: string;
  nameAr?: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
}

interface WorkoutDay {
  id: string;
  name: string;
  dayNumber: number;
  exercises: Exercise[];
  isRestDay: boolean;
}

const exerciseLibrary = [
  { id: '1', name: 'Bench Press', nameAr: 'تمرين الصدر', muscleGroup: 'Chest' },
  { id: '2', name: 'Incline Dumbbell Press', nameAr: 'ضغط الدمبل المائل', muscleGroup: 'Chest' },
  { id: '3', name: 'Cable Flyes', nameAr: 'تمرين الكابل للصدر', muscleGroup: 'Chest' },
  { id: '4', name: 'Deadlift', nameAr: 'الرفعة الميتة', muscleGroup: 'Back' },
  { id: '5', name: 'Pull-ups', nameAr: 'السحب للأعلى', muscleGroup: 'Back' },
  { id: '6', name: 'Barbell Row', nameAr: 'تجديف البار', muscleGroup: 'Back' },
  { id: '7', name: 'Squat', nameAr: 'القرفصاء', muscleGroup: 'Legs' },
  { id: '8', name: 'Leg Press', nameAr: 'ضغط الأرجل', muscleGroup: 'Legs' },
  { id: '9', name: 'Romanian Deadlift', nameAr: 'الرفعة الرومانية', muscleGroup: 'Legs' },
  { id: '10', name: 'Shoulder Press', nameAr: 'ضغط الكتف', muscleGroup: 'Shoulders' },
  { id: '11', name: 'Lateral Raises', nameAr: 'رفع جانبي', muscleGroup: 'Shoulders' },
  { id: '12', name: 'Bicep Curl', nameAr: 'تمرين الباي', muscleGroup: 'Biceps' },
  { id: '13', name: 'Tricep Pushdown', nameAr: 'دفع التراي', muscleGroup: 'Triceps' },
  { id: '14', name: 'Plank', nameAr: 'البلانك', muscleGroup: 'Core' },
];

const initialProgram = {
  id: '1',
  name: 'Push Pull Legs Program',
  description: 'A classic 6-day training split for intermediate to advanced lifters',
  duration: 12,
  frequency: 6,
  level: 'intermediate',
  goal: 'muscle_building',
  days: [
    {
      id: '1',
      name: 'Push Day A',
      dayNumber: 1,
      isRestDay: false,
      exercises: [
        { id: '1', name: 'Bench Press', muscleGroup: 'Chest', sets: 4, reps: '6-8', restSeconds: 120, notes: 'Focus on chest contraction' },
        { id: '2', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', sets: 3, reps: '8-10', restSeconds: 90 },
        { id: '10', name: 'Shoulder Press', muscleGroup: 'Shoulders', sets: 3, reps: '8-10', restSeconds: 90 },
        { id: '11', name: 'Lateral Raises', muscleGroup: 'Shoulders', sets: 3, reps: '12-15', restSeconds: 60 },
        { id: '13', name: 'Tricep Pushdown', muscleGroup: 'Triceps', sets: 3, reps: '10-12', restSeconds: 60 },
      ],
    },
    {
      id: '2',
      name: 'Pull Day A',
      dayNumber: 2,
      isRestDay: false,
      exercises: [
        { id: '4', name: 'Deadlift', muscleGroup: 'Back', sets: 4, reps: '5-6', restSeconds: 180, notes: 'Keep core tight' },
        { id: '5', name: 'Pull-ups', muscleGroup: 'Back', sets: 4, reps: '6-10', restSeconds: 90 },
        { id: '6', name: 'Barbell Row', muscleGroup: 'Back', sets: 3, reps: '8-10', restSeconds: 90 },
        { id: '12', name: 'Bicep Curl', muscleGroup: 'Biceps', sets: 3, reps: '10-12', restSeconds: 60 },
      ],
    },
    {
      id: '3',
      name: 'Legs Day A',
      dayNumber: 3,
      isRestDay: false,
      exercises: [
        { id: '7', name: 'Squat', muscleGroup: 'Legs', sets: 4, reps: '6-8', restSeconds: 180 },
        { id: '8', name: 'Leg Press', muscleGroup: 'Legs', sets: 3, reps: '10-12', restSeconds: 90 },
        { id: '9', name: 'Romanian Deadlift', muscleGroup: 'Legs', sets: 3, reps: '8-10', restSeconds: 90 },
      ],
    },
    {
      id: '4',
      name: 'Rest Day',
      dayNumber: 4,
      isRestDay: true,
      exercises: [],
    },
  ] as WorkoutDay[],
};

export default function ProgramBuilderPage() {
  const [program, setProgram] = useState(initialProgram);
  const [selectedDay, setSelectedDay] = useState<string>(program.days[0]?.id || '');
  const [showExerciseDialog, setShowExerciseDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const currentDay = program.days.find((d) => d.id === selectedDay);

  const filteredExercises = exerciseLibrary.filter(
    (e) =>
      e.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      e.muscleGroup.toLowerCase().includes(exerciseSearch.toLowerCase())
  );

  const addExercise = (exercise: typeof exerciseLibrary[0]) => {
    if (!currentDay) return;

    const newExercise: Exercise = {
      ...exercise,
      sets: 3,
      reps: '8-10',
      restSeconds: 90,
    };

    setProgram((prev) => ({
      ...prev,
      days: prev.days.map((day) =>
        day.id === selectedDay
          ? { ...day, exercises: [...day.exercises, newExercise] }
          : day
      ),
    }));
    setHasChanges(true);
    setShowExerciseDialog(false);
  };

  const removeExercise = (exerciseId: string) => {
    setProgram((prev) => ({
      ...prev,
      days: prev.days.map((day) =>
        day.id === selectedDay
          ? { ...day, exercises: day.exercises.filter((e) => e.id !== exerciseId) }
          : day
      ),
    }));
    setHasChanges(true);
  };

  const updateExercise = (exerciseId: string, field: keyof Exercise, value: any) => {
    setProgram((prev) => ({
      ...prev,
      days: prev.days.map((day) =>
        day.id === selectedDay
          ? {
              ...day,
              exercises: day.exercises.map((e) =>
                e.id === exerciseId ? { ...e, [field]: value } : e
              ),
            }
          : day
      ),
    }));
    setHasChanges(true);
  };

  const addDay = (isRestDay: boolean = false) => {
    const newDay: WorkoutDay = {
      id: `day-${Date.now()}`,
      name: isRestDay ? 'Rest Day' : `Day ${program.days.length + 1}`,
      dayNumber: program.days.length + 1,
      isRestDay,
      exercises: [],
    };

    setProgram((prev) => ({
      ...prev,
      days: [...prev.days, newDay],
    }));
    setSelectedDay(newDay.id);
    setHasChanges(true);
  };

  const removeDay = (dayId: string) => {
    setProgram((prev) => ({
      ...prev,
      days: prev.days.filter((d) => d.id !== dayId),
    }));
    if (selectedDay === dayId) {
      setSelectedDay(program.days[0]?.id || '');
    }
    setHasChanges(true);
  };

  const duplicateDay = (dayId: string) => {
    const dayToDuplicate = program.days.find((d) => d.id === dayId);
    if (!dayToDuplicate) return;

    const newDay: WorkoutDay = {
      ...dayToDuplicate,
      id: `day-${Date.now()}`,
      name: `${dayToDuplicate.name} (Copy)`,
      dayNumber: program.days.length + 1,
    };

    setProgram((prev) => ({
      ...prev,
      days: [...prev.days, newDay],
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // TODO: Save to API
    setHasChanges(false);
  };

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
            <h1 className="text-2xl font-bold">{program.name}</h1>
            <p className="text-muted-foreground">{program.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowSettingsDialog(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button variant="forma" onClick={handleSave} disabled={!hasChanges}>
            <Save className="mr-2 h-4 w-4" />
            {hasChanges ? 'Save Changes' : 'Saved'}
          </Button>
        </div>
      </div>

      {/* Program Info Bar */}
      <div className="flex flex-wrap gap-4">
        <Badge variant="outline" className="py-1.5">
          <Calendar className="mr-1 h-3 w-3" />
          {program.duration} weeks
        </Badge>
        <Badge variant="outline" className="py-1.5">
          <Dumbbell className="mr-1 h-3 w-3" />
          {program.frequency} days/week
        </Badge>
        <Badge variant="outline" className="py-1.5 capitalize">
          {program.level}
        </Badge>
        <Badge variant="forma" className="py-1.5 capitalize">
          {program.goal.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Day Selector */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Workout Days</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => addDay(false)}>
                    <Dumbbell className="mr-2 h-4 w-4" />
                    Add Workout Day
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addDay(true)}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Add Rest Day
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {program.days.map((day) => (
              <div
                key={day.id}
                className={`group flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                  selectedDay === day.id
                    ? 'border-forma-teal bg-forma-teal/5'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedDay(day.id)}
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{day.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {day.isRestDay
                        ? 'Rest & Recovery'
                        : `${day.exercises.length} exercises`}
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
                    <DropdownMenuItem onClick={() => duplicateDay(day.id)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => removeDay(day.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
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
                <CardTitle>{currentDay?.name || 'Select a day'}</CardTitle>
                <CardDescription>
                  {currentDay?.isRestDay
                    ? 'Rest and recovery day'
                    : 'Drag exercises to reorder'}
                </CardDescription>
              </div>
              {currentDay && !currentDay.isRestDay && (
                <Button variant="forma" onClick={() => setShowExerciseDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Exercise
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {currentDay?.isRestDay ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 font-semibold">Rest Day</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Recovery is essential for muscle growth and preventing injury
                </p>
              </div>
            ) : currentDay?.exercises.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4">
                  <Dumbbell className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 font-semibold">No exercises yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Start building this workout by adding exercises
                </p>
                <Button
                  variant="forma"
                  className="mt-4"
                  onClick={() => setShowExerciseDialog(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Exercise
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {currentDay?.exercises.map((exercise, index) => (
                  <div
                    key={`${exercise.id}-${index}`}
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
                          <h4 className="font-medium">{exercise.name}</h4>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {exercise.muscleGroup}
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
                          <Label className="text-xs">Sets</Label>
                          <Input
                            type="number"
                            value={exercise.sets}
                            onChange={(e) =>
                              updateExercise(exercise.id, 'sets', parseInt(e.target.value))
                            }
                            className="mt-1 h-9"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Reps</Label>
                          <Input
                            value={exercise.reps}
                            onChange={(e) =>
                              updateExercise(exercise.id, 'reps', e.target.value)
                            }
                            className="mt-1 h-9"
                            placeholder="8-10"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Rest (sec)</Label>
                          <Input
                            type="number"
                            value={exercise.restSeconds}
                            onChange={(e) =>
                              updateExercise(
                                exercise.id,
                                'restSeconds',
                                parseInt(e.target.value)
                              )
                            }
                            className="mt-1 h-9"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs">Notes (optional)</Label>
                        <Input
                          value={exercise.notes || ''}
                          onChange={(e) =>
                            updateExercise(exercise.id, 'notes', e.target.value)
                          }
                          className="mt-1 h-9"
                          placeholder="Form tips, tempo, etc."
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

      {/* Add Exercise Dialog */}
      <Dialog open={showExerciseDialog} onOpenChange={setShowExerciseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Exercise</DialogTitle>
            <DialogDescription>
              Search and select exercises to add to this workout
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              value={exerciseSearch}
              onChange={(e) => setExerciseSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-[400px] space-y-2 overflow-y-auto">
            {filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                onClick={() => addExercise(exercise)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-forma-teal/10">
                    <Dumbbell className="h-5 w-5 text-forma-teal" />
                  </div>
                  <div>
                    <p className="font-medium">{exercise.name}</p>
                    <p className="text-sm text-muted-foreground">{exercise.nameAr}</p>
                  </div>
                </div>
                <Badge variant="outline">{exercise.muscleGroup}</Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Program Settings</DialogTitle>
            <DialogDescription>Configure your program details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Program Name</Label>
              <Input
                value={program.name}
                onChange={(e) => {
                  setProgram({ ...program, name: e.target.value });
                  setHasChanges(true);
                }}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={program.description}
                onChange={(e) => {
                  setProgram({ ...program, description: e.target.value });
                  setHasChanges(true);
                }}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duration (weeks)</Label>
                <Input
                  type="number"
                  value={program.duration}
                  onChange={(e) => {
                    setProgram({ ...program, duration: parseInt(e.target.value) });
                    setHasChanges(true);
                  }}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Frequency (days/week)</Label>
                <Input
                  type="number"
                  value={program.frequency}
                  onChange={(e) => {
                    setProgram({ ...program, frequency: parseInt(e.target.value) });
                    setHasChanges(true);
                  }}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label>Difficulty Level</Label>
              <Select
                value={program.level}
                onValueChange={(value) => {
                  setProgram({ ...program, level: value });
                  setHasChanges(true);
                }}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Goal</Label>
              <Select
                value={program.goal}
                onValueChange={(value) => {
                  setProgram({ ...program, goal: value });
                  setHasChanges(true);
                }}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="muscle_building">Muscle Building</SelectItem>
                  <SelectItem value="weight_loss">Weight Loss</SelectItem>
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="endurance">Endurance</SelectItem>
                  <SelectItem value="general_fitness">General Fitness</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button variant="forma" onClick={() => setShowSettingsDialog(false)}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
