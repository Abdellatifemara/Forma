'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Dumbbell,
  Play,
  ChevronRight,
  ChevronDown,
  X,
  SlidersHorizontal,
  ImageIcon,
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
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/* ---- Constants ---- */

const muscleGroups = [
  { label: 'All', labelAr: 'الكل', value: 'All' },
  { label: 'Chest', labelAr: 'صدر', value: 'CHEST' },
  { label: 'Back', labelAr: 'ظهر', value: 'BACK' },
  { label: 'Shoulders', labelAr: 'أكتاف', value: 'SHOULDERS' },
  { label: 'Biceps', labelAr: 'باي', value: 'BICEPS' },
  { label: 'Triceps', labelAr: 'تراي', value: 'TRICEPS' },
  { label: 'Forearms', labelAr: 'ساعد', value: 'FOREARMS' },
  { label: 'Abs', labelAr: 'بطن', value: 'ABS' },
  { label: 'Obliques', labelAr: 'جوانب', value: 'OBLIQUES' },
  { label: 'Lower Back', labelAr: 'أسفل الظهر', value: 'LOWER_BACK' },
  { label: 'Glutes', labelAr: 'مؤخرة', value: 'GLUTES' },
  { label: 'Quads', labelAr: 'فخذ أمامي', value: 'QUADRICEPS' },
  { label: 'Hamstrings', labelAr: 'فخذ خلفي', value: 'HAMSTRINGS' },
  { label: 'Calves', labelAr: 'سمانة', value: 'CALVES' },
  { label: 'Full Body', labelAr: 'جسم كامل', value: 'FULL_BODY' },
  { label: 'Cardio', labelAr: 'كارديو', value: 'CARDIO' },
];

const equipmentTypes = [
  { label: 'All', labelAr: 'الكل', value: 'All' },
  { label: 'Barbell', labelAr: 'بار', value: 'BARBELL' },
  { label: 'Dumbbell', labelAr: 'دامبل', value: 'DUMBBELLS' },
  { label: 'Cable', labelAr: 'كيبل', value: 'CABLES' },
  { label: 'Machine', labelAr: 'جهاز', value: 'MACHINES' },
  { label: 'Bodyweight', labelAr: 'وزن الجسم', value: 'BODYWEIGHT' },
  { label: 'Kettlebell', labelAr: 'كيتلبل', value: 'KETTLEBELL' },
  { label: 'Band', labelAr: 'باند', value: 'RESISTANCE_BANDS' },
];

const difficultyLevels = [
  { label: 'All', labelAr: 'الكل', value: 'All' },
  { label: 'Beginner', labelAr: 'مبتدئ', value: 'Beginner' },
  { label: 'Intermediate', labelAr: 'متوسط', value: 'Intermediate' },
  { label: 'Advanced', labelAr: 'متقدم', value: 'Advanced' },
];

/** Strip markdown bold markers */
const stripMarkdown = (text: string): string =>
  text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/__(.*?)__/g, '$1').replace(/\*(.*?)\*/g, '$1');

const normalizeMuscleParam = (param: string | null): string => {
  if (!param) return 'All';
  const exactMatch = muscleGroups.find(m => m.value === param);
  if (exactMatch) return exactMatch.value;
  const labelMatch = muscleGroups.find(m => m.label.toLowerCase() === param.toLowerCase());
  if (labelMatch) return labelMatch.value;
  const upperMatch = muscleGroups.find(m => m.value === param.toUpperCase());
  if (upperMatch) return upperMatch.value;
  return 'All';
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case 'beginner':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'intermediate':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'advanced':
      return 'bg-red-500/10 text-red-600 border-red-500/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

/* ============================================
   EXERCISE CARD
   ============================================ */
function ExerciseCard({ exercise, onClick, isAr }: { exercise: Exercise; onClick: () => void; isAr: boolean }) {
  const name = stripMarkdown(exercise.nameEn || (exercise as any).name || '');
  const nameAr = exercise.nameAr ? stripMarkdown(exercise.nameAr) : null;
  const muscle = exercise.primaryMuscle || (exercise as any).muscleGroup || '';
  const equipment = Array.isArray(exercise.equipment) ? exercise.equipment[0] : exercise.equipment;

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all hover:border-primary/40 hover:shadow-lg"
      onClick={onClick}
    >
      {/* Image placeholder */}
      <div className="relative aspect-[16/10] bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/40">
          <ImageIcon className="h-8 w-8 mb-1" />
        </div>
        {/* Difficulty badge overlay */}
        {exercise.difficulty && (
          <div className="absolute top-2.5 end-2.5">
            <Badge variant="outline" className={cn('text-[10px] font-semibold border backdrop-blur-sm', getDifficultyColor(exercise.difficulty))}>
              {exercise.difficulty}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-3.5">
        <h3 className="font-semibold text-sm leading-tight line-clamp-1">{isAr && nameAr ? nameAr : name}</h3>
        {isAr && nameAr && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{name}</p>
        )}
        {!isAr && nameAr && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 font-cairo">{nameAr}</p>
        )}

        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          {muscle && (
            <Badge variant="secondary" className="text-[10px] px-2 py-0">
              {muscle.replace(/_/g, ' ')}
            </Badge>
          )}
          {equipment && equipment !== 'NONE' && (
            <Badge variant="outline" className="text-[10px] px-2 py-0">
              {String(equipment).replace(/_/g, ' ')}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================
   MAIN PAGE
   ============================================ */
function ExercisesPageContent() {
  const searchParams = useSearchParams();
  const initialMuscle = searchParams.get('muscle');
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState(normalizeMuscleParam(initialMuscle));
  const [equipmentFilter, setEquipmentFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const pillsRef = useRef<HTMLDivElement>(null);

  // Auto-search when any filter changes
  useEffect(() => {
    const hasActiveFilter = searchQuery || muscleFilter !== 'All' || equipmentFilter !== 'All' || difficultyFilter !== 'All';

    if (!hasActiveFilter) {
      setExercises([]);
      setHasSearched(false);
      return;
    }

    async function searchExercises() {
      setIsLoading(true);
      setHasSearched(true);
      try {
        const params: Record<string, any> = {
          query: searchQuery || undefined,
          primaryMuscle: muscleFilter !== 'All' ? muscleFilter : undefined,
          equipment: equipmentFilter !== 'All' ? [equipmentFilter] : undefined,
          difficulty: difficultyFilter !== 'All' ? difficultyFilter.toUpperCase() : undefined,
          pageSize: '30',
        };
        const response = await exercisesApi.search(params);
        const exerciseData = response.data || (response as any).exercises || [];
        setExercises(exerciseData);
      } catch {
        setExercises([]);
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(searchExercises, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, muscleFilter, equipmentFilter, difficultyFilter]);

  const activeFilterCount = [equipmentFilter, difficultyFilter].filter(f => f !== 'All').length;

  const clearAllFilters = () => {
    setMuscleFilter('All');
    setEquipmentFilter('All');
    setDifficultyFilter('All');
    setSearchQuery('');
  };

  return (
    <div className={cn('space-y-5 pb-20', isAr && 'text-right font-cairo')}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{isAr ? 'مكتبة التمارين' : 'Exercise Library'}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isAr ? 'ابحث عن تمارين حسب العضلة أو المعدات' : 'Find exercises by muscle, equipment, or name'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className={cn('absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground', isAr ? 'right-3' : 'left-3')} />
          <Input
            placeholder={isAr ? 'ابحث عن تمرين...' : 'Search exercises...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(isAr ? 'pr-9' : 'pl-9')}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={cn('absolute top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted', isAr ? 'left-2' : 'right-2')}
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={cn('shrink-0', activeFilterCount > 0 && 'border-primary text-primary')}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -end-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Muscle Group Pills — horizontal scroll */}
      <div className="relative -mx-4 px-4">
        <div
          ref={pillsRef}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {muscleGroups.map((muscle) => {
            const isActive = muscleFilter === muscle.value;
            return (
              <button
                key={muscle.value}
                onClick={() => setMuscleFilter(isActive ? 'All' : muscle.value)}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {isAr ? muscle.labelAr : muscle.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Equipment + Difficulty filters (collapsible) */}
      {showFilters && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              {isAr ? 'المعدات' : 'Equipment'}
            </label>
            <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {equipmentTypes.map((eq) => (
                  <SelectItem key={eq.value} value={eq.value}>
                    {isAr ? eq.labelAr : eq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              {isAr ? 'المستوى' : 'Difficulty'}
            </label>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {difficultyLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {isAr ? level.labelAr : level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Active filter tags */}
      {(muscleFilter !== 'All' || equipmentFilter !== 'All' || difficultyFilter !== 'All') && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">{isAr ? 'الفلاتر:' : 'Filters:'}</span>
          {muscleFilter !== 'All' && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {isAr ? muscleGroups.find(m => m.value === muscleFilter)?.labelAr : muscleGroups.find(m => m.value === muscleFilter)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setMuscleFilter('All')} />
            </Badge>
          )}
          {equipmentFilter !== 'All' && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {isAr ? equipmentTypes.find(e => e.value === equipmentFilter)?.labelAr : equipmentTypes.find(e => e.value === equipmentFilter)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setEquipmentFilter('All')} />
            </Badge>
          )}
          {difficultyFilter !== 'All' && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {isAr ? difficultyLevels.find(d => d.value === difficultyFilter)?.labelAr : difficultyLevels.find(d => d.value === difficultyFilter)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setDifficultyFilter('All')} />
            </Badge>
          )}
          <button onClick={clearAllFilters} className="text-xs text-primary hover:underline">
            {isAr ? 'مسح الكل' : 'Clear all'}
          </button>
        </div>
      )}

      {/* Results count */}
      {hasSearched && !isLoading && (
        <p className="text-xs text-muted-foreground">
          {isAr ? `${exercises.length} تمرين` : `${exercises.length} exercises found`}
        </p>
      )}

      {/* Loading shimmer */}
      {isLoading && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border overflow-hidden">
              <div className="aspect-[16/10] bg-muted animate-shimmer" />
              <div className="p-3.5 space-y-2">
                <div className="h-4 w-3/4 rounded bg-muted animate-shimmer" />
                <div className="h-3 w-1/2 rounded bg-muted animate-shimmer" />
                <div className="flex gap-1.5">
                  <div className="h-4 w-14 rounded-full bg-muted animate-shimmer" />
                  <div className="h-4 w-12 rounded-full bg-muted animate-shimmer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exercise Grid */}
      {!isLoading && hasSearched && exercises.length > 0 && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onClick={() => setSelectedExercise(exercise)}
              isAr={isAr}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && hasSearched && exercises.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 rounded-full bg-muted/50 mb-4">
            <Dumbbell className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold">{t.exercises.noExercises}</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-xs">{t.exercises.tryDifferent}</p>
          <Button variant="outline" size="sm" onClick={clearAllFilters} className="mt-4">
            {isAr ? 'مسح الفلاتر' : 'Clear Filters'}
          </Button>
        </div>
      )}

      {/* Initial state — no filters active */}
      {!hasSearched && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 rounded-full bg-primary/5 mb-4">
            <Search className="h-8 w-8 text-primary/40" />
          </div>
          <h3 className="font-semibold text-muted-foreground">
            {isAr ? 'اختر عضلة أو ابحث' : 'Select a muscle or search'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-xs">
            {isAr ? 'اختر مجموعة عضلية من الأعلى أو اكتب اسم التمرين' : 'Pick a muscle group above or type an exercise name'}
          </p>
        </div>
      )}

      {/* Exercise Detail Dialog */}
      <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {selectedExercise && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {stripMarkdown(selectedExercise.nameEn || (selectedExercise as any).name || '')}
                  {selectedExercise.nameAr && (
                    <span className="ms-2 text-base font-normal text-muted-foreground font-cairo">
                      {stripMarkdown(selectedExercise.nameAr)}
                    </span>
                  )}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Exercise details for {selectedExercise.nameEn || (selectedExercise as any).name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Video placeholder */}
                <div className="relative aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-muted to-muted/50">
                  <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                    <Play className="h-10 w-10 mb-2 opacity-40" />
                    <p className="text-sm">{isAr ? 'فيديو العرض' : 'Demo Video'}</p>
                  </div>
                </div>

                {/* Info Badges */}
                <div className="flex flex-wrap gap-2">
                  {(selectedExercise.primaryMuscle || (selectedExercise as any).muscleGroup) && (
                    <Badge variant="outline">
                      {(selectedExercise.primaryMuscle || (selectedExercise as any).muscleGroup).replace(/_/g, ' ')}
                    </Badge>
                  )}
                  {selectedExercise.equipment && (
                    <Badge variant="outline">
                      {String(Array.isArray(selectedExercise.equipment) ? selectedExercise.equipment[0] : selectedExercise.equipment).replace(/_/g, ' ')}
                    </Badge>
                  )}
                  {selectedExercise.difficulty && (
                    <Badge className={getDifficultyColor(selectedExercise.difficulty)}>
                      {selectedExercise.difficulty}
                    </Badge>
                  )}
                </div>

                {/* Secondary Muscles */}
                {selectedExercise.secondaryMuscles && selectedExercise.secondaryMuscles.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-semibold text-sm">{t.exercises.secondaryMuscles}</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedExercise.secondaryMuscles.map((muscle) => (
                        <Badge key={muscle} variant="secondary" className="text-xs">{muscle.replace(/_/g, ' ')}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {(selectedExercise.descriptionEn || (selectedExercise as any).description) && (
                  <div>
                    <h4 className="mb-2 font-semibold text-sm">{t.exercises.details}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {stripMarkdown(selectedExercise.descriptionEn || (selectedExercise as any).description || '')}
                    </p>
                  </div>
                )}

                {/* Instructions */}
                {(selectedExercise.instructionsEn || (selectedExercise as any).instructions || []).length > 0 && (
                  <div>
                    <h4 className="mb-2 font-semibold text-sm">{t.exercises.instructions}</h4>
                    <ol className="space-y-2">
                      {(selectedExercise.instructionsEn || (selectedExercise as any).instructions || []).map((instruction: string, index: number) => (
                        <li key={index} className="flex gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {index + 1}
                          </span>
                          <span className="text-sm text-muted-foreground leading-relaxed">{stripMarkdown(instruction)}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Tips */}
                {(selectedExercise.tipsEn || (selectedExercise as any).tips || []).length > 0 && (
                  <div>
                    <h4 className="mb-2 font-semibold text-sm">{t.exercises.tips}</h4>
                    <ul className="space-y-2">
                      {(selectedExercise.tipsEn || (selectedExercise as any).tips || []).map((tip: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          {stripMarkdown(tip)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* FAQs */}
                {selectedExercise.faqsEn && Array.isArray(selectedExercise.faqsEn) && selectedExercise.faqsEn.length > 0 && (
                  <div>
                    <h4 className="mb-3 font-semibold text-sm">{isAr ? 'أسئلة شائعة' : 'FAQ'}</h4>
                    <div className="space-y-2">
                      {selectedExercise.faqsEn.map((faq: { question: string; answer: string }, index: number) => (
                        <details key={index} className="group rounded-lg border bg-muted/30 p-3">
                          <summary className="cursor-pointer font-medium text-sm flex items-center justify-between">
                            {faq.question}
                            <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90 shrink-0 ms-2" />
                          </summary>
                          <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
                        </details>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action */}
                <Button
                  className="w-full btn-primary"
                  onClick={() => {
                    setSelectedExercise(null);
                    window.location.href = '/workouts/create';
                  }}
                >
                  {isAr ? 'إضافة لتمرين' : 'Add to Workout'}
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
    <div className="flex h-[50vh] items-center justify-center pb-20">
      <div className="p-4 rounded-full bg-primary/5">
        <Dumbbell className="h-8 w-8 text-primary/40 animate-pulse" />
      </div>
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
