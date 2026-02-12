'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Filter,
  Dumbbell,
  Play,
  ChevronRight,
  X,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { exercisesApi, type Exercise } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const muscleGroups = [
  { label: 'All', value: 'All' },
  { label: 'Chest', value: 'CHEST' },
  { label: 'Back', value: 'BACK' },
  { label: 'Shoulders', value: 'SHOULDERS' },
  { label: 'Biceps', value: 'BICEPS' },
  { label: 'Triceps', value: 'TRICEPS' },
  { label: 'Forearms', value: 'FOREARMS' },
  { label: 'Abs', value: 'ABS' },
  { label: 'Obliques', value: 'OBLIQUES' },
  { label: 'Lower Back', value: 'LOWER_BACK' },
  { label: 'Glutes', value: 'GLUTES' },
  { label: 'Quads', value: 'QUADRICEPS' },
  { label: 'Hamstrings', value: 'HAMSTRINGS' },
  { label: 'Calves', value: 'CALVES' },
  { label: 'Full Body', value: 'FULL_BODY' },
  { label: 'Cardio', value: 'CARDIO' },
];

const equipmentTypes = [
  'All',
  'Barbell',
  'Dumbbell',
  'Cable',
  'Machine',
  'Bodyweight',
  'Kettlebell',
  'Resistance Band',
];

// Map frontend equipment names to backend enum values
const equipmentToEnum: Record<string, string> = {
  'Barbell': 'BARBELL',
  'Dumbbell': 'DUMBBELLS',
  'Cable': 'CABLES',
  'Machine': 'MACHINES',
  'Bodyweight': 'BODYWEIGHT',
  'Kettlebell': 'KETTLEBELL',
  'Resistance Band': 'RESISTANCE_BANDS',
};

const difficultyLevels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

// Helper to get muscle group label from value
const getMuscleLabel = (value: string) => {
  const muscle = muscleGroups.find(m => m.value === value);
  return muscle?.label || value;
};

// Helper to validate/normalize muscle group from URL param
const normalizeMuscleParam = (param: string | null): string => {
  if (!param) return 'All';
  // Check if it's already a valid enum value
  const exactMatch = muscleGroups.find(m => m.value === param);
  if (exactMatch) return exactMatch.value;
  // Check if it matches a label (case-insensitive)
  const labelMatch = muscleGroups.find(m => m.label.toLowerCase() === param.toLowerCase());
  if (labelMatch) return labelMatch.value;
  // Check uppercase version
  const upperMatch = muscleGroups.find(m => m.value === param.toUpperCase());
  if (upperMatch) return upperMatch.value;
  return 'All';
};

function ExercisesPageContent() {
  const searchParams = useSearchParams();
  const initialMuscle = searchParams.get('muscle');
  const { toast } = useToast();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState(normalizeMuscleParam(initialMuscle));
  const [equipmentFilter, setEquipmentFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function searchExercises() {
      setIsLoading(true);
      try {
        const params = {
          query: searchQuery || undefined,
          primaryMuscle: muscleFilter !== 'All' ? muscleFilter : undefined,
          equipment: equipmentFilter !== 'All' ? [equipmentToEnum[equipmentFilter]] : undefined,
          difficulty: difficultyFilter !== 'All' ? difficultyFilter.toUpperCase() : undefined,
        };
        const response = await exercisesApi.search(params);
        // Handle both old format (exercises) and new format (data)
        const exerciseData = response.data || (response as any).exercises || [];
        setExercises(exerciseData);
      } catch (error) {
        // Error handled
        setExercises([]);
      } finally {
        setIsLoading(false);
      }
    }
    // A small debounce to avoid firing requests on every keystroke
    const timer = setTimeout(() => {
      searchExercises();
    }, 300); 

    return () => clearTimeout(timer);
  }, [searchQuery, muscleFilter, equipmentFilter, difficultyFilter]);

  const activeFilters = [muscleFilter, equipmentFilter, difficultyFilter].filter(
    (f) => f !== 'All'
  );

  const clearFilters = () => {
    setMuscleFilter('All');
    setEquipmentFilter('All');
    setDifficultyFilter('All');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-500/10 text-green-500';
      case 'Intermediate':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'Advanced':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:ml-64 lg:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Exercise Library</h1>
        <p className="text-muted-foreground">
          Browse our collection of exercises with detailed instructions
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={activeFilters.length > 0 ? 'border-forma-teal' : ''}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFilters.length > 0 && (
              <Badge variant="forma" className="ml-2">
                {activeFilters.length}
              </Badge>
            )}
          </Button>
        </div>

        {showFilters && (
          <Card>
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Muscle Group
                  </label>
                  <Select value={muscleFilter} onValueChange={setMuscleFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {muscleGroups.map((muscle) => (
                        <SelectItem key={muscle.value} value={muscle.value}>
                          {muscle.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Equipment
                  </label>
                  <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {equipmentTypes.map((equipment) => (
                        <SelectItem key={equipment} value={equipment}>
                          {equipment}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Difficulty
                  </label>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {activeFilters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear all filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Active Filter Tags */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {muscleFilter !== 'All' && (
              <Badge variant="secondary" className="gap-1">
                {getMuscleLabel(muscleFilter)}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setMuscleFilter('All')}
                />
              </Badge>
            )}
            {equipmentFilter !== 'All' && (
              <Badge variant="secondary" className="gap-1">
                {equipmentFilter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setEquipmentFilter('All')}
                />
              </Badge>
            )}
            {difficultyFilter !== 'All' && (
              <Badge variant="secondary" className="gap-1">
                {difficultyFilter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setDifficultyFilter('All')}
                />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing {exercises.length} exercises
      </p>

      {/* Exercise Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {exercises.map((exercise) => (
          <Card
            key={exercise.id}
            className="cursor-pointer transition-colors hover:border-forma-teal/50"
            onClick={() => setSelectedExercise(exercise)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-forma-teal/10">
                  <Dumbbell className="h-6 w-6 text-forma-teal" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{exercise.nameEn || exercise.name}</h3>
                  <p className="text-sm text-muted-foreground">{exercise.nameAr}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {exercise.primaryMuscle || exercise.muscleGroup}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getDifficultyColor(exercise.difficulty)}`}
                    >
                      {exercise.difficulty}
                    </Badge>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {exercises.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Dumbbell className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No exercises found</h3>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search or filters
          </p>
          <Button variant="outline" onClick={clearFilters} className="mt-4">
            Clear all filters
          </Button>
        </div>
      )}

      {/* Exercise Detail Dialog */}
      <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {selectedExercise && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {selectedExercise.nameEn || selectedExercise.name}
                  <span className="ml-2 text-base font-normal text-muted-foreground">
                    {selectedExercise.nameAr}
                  </span>
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Exercise details for {selectedExercise.nameEn || selectedExercise.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Video Placeholder */}
                <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                  <div className="flex h-full items-center justify-center">
                    <Button
                      variant="forma"
                      size="lg"
                      onClick={() => toast({ title: 'Coming Soon', description: 'Exercise videos will be available soon' })}
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Watch Demo
                    </Button>
                  </div>
                </div>

                {/* Info Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{selectedExercise.primaryMuscle || selectedExercise.muscleGroup}</Badge>
                  <Badge variant="outline">{Array.isArray(selectedExercise.equipment) ? selectedExercise.equipment[0] : selectedExercise.equipment}</Badge>
                  <Badge
                    className={getDifficultyColor(selectedExercise.difficulty)}
                  >
                    {selectedExercise.difficulty}
                  </Badge>
                </div>

                {/* Secondary Muscles */}
                {selectedExercise.secondaryMuscles && selectedExercise.secondaryMuscles.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-semibold">Secondary Muscles</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedExercise.secondaryMuscles.map((muscle) => (
                        <Badge key={muscle} variant="secondary">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h4 className="mb-2 font-semibold">Description</h4>
                  <p className="text-muted-foreground">
                    {selectedExercise.descriptionEn || selectedExercise.description}
                  </p>
                </div>

                {/* Instructions */}
                <div>
                  <h4 className="mb-2 font-semibold">Instructions</h4>
                  <ol className="space-y-2">
                    {(selectedExercise.instructionsEn || selectedExercise.instructions || []).map((instruction, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forma-teal/10 text-sm font-medium text-forma-teal">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Tips */}
                {(selectedExercise.tipsEn || selectedExercise.tips) && (selectedExercise.tipsEn || selectedExercise.tips || []).length > 0 && (
                  <div>
                    <h4 className="mb-2 font-semibold">Tips</h4>
                    <ul className="space-y-2">
                      {(selectedExercise.tipsEn || selectedExercise.tips || []).map((tip, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-muted-foreground"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-forma-teal" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* FAQs */}
                {selectedExercise.faqsEn && Array.isArray(selectedExercise.faqsEn) && selectedExercise.faqsEn.length > 0 && (
                  <div>
                    <h4 className="mb-3 font-semibold">Frequently Asked Questions</h4>
                    <div className="space-y-3">
                      {selectedExercise.faqsEn.map((faq: { question: string; answer: string }, index: number) => (
                        <details key={index} className="group rounded-lg border bg-muted/30 p-3">
                          <summary className="cursor-pointer font-medium text-sm flex items-center justify-between">
                            {faq.question}
                            <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                          </summary>
                          <p className="mt-2 text-sm text-muted-foreground pl-0">
                            {faq.answer}
                          </p>
                        </details>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  variant="forma"
                  className="w-full"
                  onClick={() => toast({ title: 'Coming Soon', description: 'Quick add to workout will be available soon' })}
                >
                  Add to Workout
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ExercisesPageFallback() {
  return (
    <div className="flex h-[50vh] items-center justify-center pb-20 lg:ml-64 lg:pb-6">
      <Loader2 className="h-8 w-8 animate-spin text-forma-teal" />
    </div>
  );
}

export default function ExercisesPage() {
  return (
    <Suspense fallback={<ExercisesPageFallback />}>
      <ExercisesPageContent />
    </Suspense>
  );
}
