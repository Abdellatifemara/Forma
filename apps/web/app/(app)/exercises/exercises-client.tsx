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
  Lock,
  Crown,
  Timer,
  Zap,
  Swords,
  Flame,
  Shield,
  Users,
  Target,
  Leaf,
  Waves,
  Trophy,
  Heart,
  Medal,
  Sparkles,
  ArrowLeft,
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
import { useLanguage } from '@/lib/i18n';
import { useSubscription } from '@/hooks/use-subscription';
import { EXERCISE_CATEGORIES, isCategoryAccessible, type ExerciseCategory } from '@/lib/subscription-features';
import { cn } from '@/lib/utils';

/* ---- Icon map ---- */
const ICON_MAP: Record<string, React.ElementType> = {
  Dumbbell, Timer, Zap, Swords, Flame, Shield, Users, Target,
  Leaf, Waves, Trophy, Heart, Medal, PersonStanding: Dumbbell, // fallback
};

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
  'All', 'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Kettlebell', 'Resistance Band',
];

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

// Map frontend category IDs → backend ExerciseCategory enum
const categoryToEnum: Record<string, string> = {
  gym: 'STRENGTH',
  crossfit: 'CROSSFIT',
  boxing: 'MARTIAL_ARTS',
  kickboxing: 'MARTIAL_ARTS',
  bjj: 'MARTIAL_ARTS',
  wrestling: 'MARTIAL_ARTS',
  mma: 'MARTIAL_ARTS',
  yoga: 'YOGA',
  swimming: 'CARDIO',
  olympic: 'OLYMPIC',
  calisthenics: 'CALISTHENICS',
  mobility: 'MOBILITY',
  sport: 'PLYOMETRIC',
  preworkout: 'CARDIO',
  postworkout: 'CARDIO',
};

/** Strip markdown bold markers and clean up text for display */
const stripMarkdown = (text: string): string =>
  text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/__(.*?)__/g, '$1').replace(/\*(.*?)\*/g, '$1');

const getMuscleLabel = (value: string) => {
  const muscle = muscleGroups.find(m => m.value === value);
  return muscle?.label || value;
};

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

/* ============================================
   UPGRADE MODAL
   ============================================ */
function UpgradeModal({ open, onClose, language }: { open: boolean; onClose: () => void; language: string }) {
  const isAr = language === 'ar';
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-purple-500/10">
              <Crown className="h-6 w-6 text-purple-500" />
            </div>
            {isAr ? 'محتوى Premium+' : 'Premium+ Content'}
          </DialogTitle>
          <DialogDescription>
            {isAr
              ? 'هذه الفئة متاحة فقط لمشتركي Premium+. ارتقِ الآن للوصول لكل التمارين.'
              : 'This category is only available for Premium+ subscribers. Upgrade to unlock all exercises.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {[
            isAr ? 'ملاكمة، كيك بوكسينج، مواي تاي، جوجيتسو' : 'Boxing, Kickboxing, Muay Thai, BJJ',
            isAr ? 'يوجا، سباحة، رفع أثقال أولمبي' : 'Yoga, Swimming, Olympic Lifting',
            isAr ? 'تمارين رياضية وتأهيل حركي' : 'Sport-specific drills & mobility rehab',
            isAr ? 'كاليسثنكس وتمارين متقدمة' : 'Calisthenics & advanced exercises',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-purple-400 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <Button
            className="w-full bg-primary text-white hover:bg-primary/90"
            asChild
          >
            <Link href="/signup?plan=premium_plus">
              <Crown className="h-4 w-4 mr-2" />
              {isAr ? 'ارتقِ إلى Premium+' : 'Upgrade to Premium+'}
            </Link>
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            {isAr ? 'ابتداءً من 999 جنيه/شهر' : 'Starting at 999 EGP/month'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================
   CATEGORY GRID
   ============================================ */
function CategoryGrid({
  onSelect,
  selectedCategory,
  userTier,
  language,
  onLockedTap,
}: {
  onSelect: (cat: ExerciseCategory | null) => void;
  selectedCategory: ExerciseCategory | null;
  userTier: string;
  language: string;
  onLockedTap: () => void;
}) {
  const isAr = language === 'ar';

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
      {EXERCISE_CATEGORIES.map((cat) => {
        const Icon = ICON_MAP[cat.icon] || Dumbbell;
        const accessible = isCategoryAccessible(cat.id, userTier as any);
        const isSelected = selectedCategory?.id === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => {
              if (!accessible) {
                onLockedTap();
                return;
              }
              onSelect(isSelected ? null : cat);
            }}
            className={cn(
              'relative flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all duration-200',
              accessible && !isSelected && 'bg-card hover:border-primary/50 hover:shadow-md',
              accessible && isSelected && 'bg-primary/10 border-primary shadow-md',
              !accessible && 'bg-muted/30 border-border/40 opacity-70 cursor-not-allowed',
            )}
          >
            {/* Lock badge */}
            {!accessible && (
              <div className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-purple-500 shadow-sm">
                <Lock className="h-2.5 w-2.5 text-white" />
              </div>
            )}

            <div className={cn(
              'p-2.5 rounded-xl transition-colors',
              accessible && !isSelected && 'bg-primary/10',
              accessible && isSelected && 'bg-primary/20',
              !accessible && 'bg-muted',
            )}>
              <Icon className={cn(
                'h-5 w-5',
                accessible ? 'text-primary' : 'text-muted-foreground',
              )} />
            </div>

            <span className={cn(
              'text-xs font-medium text-center leading-tight',
              !accessible && 'text-muted-foreground',
            )}>
              {isAr ? cat.nameAr : cat.name}
            </span>

            {!accessible && (
              <span className="text-[10px] font-semibold text-purple-500">Premium+</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================
   MAIN PAGE
   ============================================ */
function ExercisesPageContent() {
  const searchParams = useSearchParams();
  const initialMuscle = searchParams.get('muscle');
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const { tier } = useSubscription();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState(normalizeMuscleParam(initialMuscle));
  const [equipmentFilter, setEquipmentFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    // Don't fetch unless user has selected a category, typed a search, or applied a filter
    const hasActiveSearch = selectedCategory || searchQuery || muscleFilter !== 'All' || equipmentFilter !== 'All' || difficultyFilter !== 'All';
    if (!hasActiveSearch) {
      setExercises([]);
      setIsLoading(false);
      return;
    }

    async function searchExercises() {
      setIsLoading(true);
      try {
        const params: Record<string, any> = {
          query: selectedCategory ? undefined : searchQuery || undefined,
          category: selectedCategory ? categoryToEnum[selectedCategory.id] : undefined,
          primaryMuscle: muscleFilter !== 'All' ? muscleFilter : undefined,
          equipment: equipmentFilter !== 'All' ? [equipmentToEnum[equipmentFilter]] : undefined,
          difficulty: difficultyFilter !== 'All' ? difficultyFilter.toUpperCase() : undefined,
          pageSize: '20',
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
    const timer = setTimeout(() => {
      searchExercises();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, muscleFilter, equipmentFilter, difficultyFilter, selectedCategory]);

  const activeFilters = [muscleFilter, equipmentFilter, difficultyFilter].filter(
    (f) => f !== 'All'
  );

  const clearFilters = () => {
    setMuscleFilter('All');
    setEquipmentFilter('All');
    setDifficultyFilter('All');
    setSelectedCategory(null);
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
    <div className={cn('space-y-6 pb-20', isAr && 'text-right font-cairo')}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{isAr ? 'مكتبة التمارين' : 'Exercise Library'}</h1>
        <p className="text-muted-foreground">
          {isAr ? 'اختر فئة أو ابحث عن تمرين' : 'Choose a category or search for exercises'}
        </p>
      </div>

      {/* Category Grid */}
      {!selectedCategory && (
        <CategoryGrid
          onSelect={setSelectedCategory}
          selectedCategory={selectedCategory}
          userTier={tier}
          language={language}
          onLockedTap={() => setShowUpgradeModal(true)}
        />
      )}

      {/* Selected Category Header */}
      {selectedCategory && (
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="rounded-full"
          >
            <ArrowLeft className={cn('h-4 w-4', isAr && 'rotate-180')} />
          </Button>
          <div className="flex items-center gap-2">
            {(() => {
              const Icon = ICON_MAP[selectedCategory.icon] || Dumbbell;
              return <Icon className="h-5 w-5 text-primary" />;
            })()}
            <h2 className="text-lg font-bold">
              {isAr ? selectedCategory.nameAr : selectedCategory.name}
            </h2>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={isAr ? 'ابحث عن تمرين...' : 'Search exercises...'}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={activeFilters.length > 0 ? 'border-primary' : ''}
          >
            <Filter className="mr-2 h-4 w-4" />
            {t.common.filter}
            {activeFilters.length > 0 && (
              <Badge variant="secondary" className="ml-2">
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
                    {t.exercises.muscleGroup}
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
                    {t.exercises.equipment}
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
                    {t.exercises.difficulty}
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
                  {isAr ? 'مسح الفلاتر' : 'Clear Filters'}
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
                <X className="h-3 w-3 cursor-pointer" onClick={() => setMuscleFilter('All')} />
              </Badge>
            )}
            {equipmentFilter !== 'All' && (
              <Badge variant="secondary" className="gap-1">
                {equipmentFilter}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setEquipmentFilter('All')} />
              </Badge>
            )}
            {difficultyFilter !== 'All' && (
              <Badge variant="secondary" className="gap-1">
                {difficultyFilter}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setDifficultyFilter('All')} />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      {(selectedCategory || searchQuery || muscleFilter !== 'All' || equipmentFilter !== 'All' || difficultyFilter !== 'All') && (
        <p className="text-sm text-muted-foreground">
          {isAr ? `عرض ${exercises.length} تمرين` : `Showing ${exercises.length} exercises`}
        </p>
      )}

      {/* Loading */}
      {isLoading && (selectedCategory || searchQuery || muscleFilter !== 'All') && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Exercise Grid */}
      {!isLoading && (selectedCategory || searchQuery || muscleFilter !== 'All' || equipmentFilter !== 'All' || difficultyFilter !== 'All') && exercises.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exercises.map((exercise) => (
            <Card
              key={exercise.id}
              className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
              onClick={() => setSelectedExercise(exercise)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Dumbbell className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{exercise.nameEn || (exercise as any).name}</h3>
                    {exercise.nameAr && (
                      <p className="text-sm text-muted-foreground">{exercise.nameAr}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        {exercise.primaryMuscle || (exercise as any).muscleGroup}
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
      )}

      {!isLoading && (selectedCategory || searchQuery || muscleFilter !== 'All' || equipmentFilter !== 'All' || difficultyFilter !== 'All') && exercises.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Dumbbell className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">{t.exercises.noExercises}</h3>
          <p className="mt-2 text-muted-foreground">{t.exercises.tryDifferent}</p>
          <Button variant="outline" onClick={clearFilters} className="mt-4">
            {isAr ? 'مسح الفلاتر' : 'Clear Filters'}
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
                  {selectedExercise.nameEn || (selectedExercise as any).name}
                  {selectedExercise.nameAr && (
                    <span className="ml-2 text-base font-normal text-muted-foreground">
                      {selectedExercise.nameAr}
                    </span>
                  )}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Exercise details for {selectedExercise.nameEn || (selectedExercise as any).name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Video section — will show exercise demo videos when available */}
                <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                  <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                    <Play className="h-10 w-10 mb-2 opacity-40" />
                    <p className="text-sm">{isAr ? 'فيديو العرض' : 'Demo Video'}</p>
                  </div>
                </div>

                {/* Info Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{selectedExercise.primaryMuscle || (selectedExercise as any).muscleGroup}</Badge>
                  <Badge variant="outline">{Array.isArray(selectedExercise.equipment) ? selectedExercise.equipment[0] : selectedExercise.equipment}</Badge>
                  <Badge className={getDifficultyColor(selectedExercise.difficulty)}>
                    {selectedExercise.difficulty}
                  </Badge>
                </div>

                {/* Secondary Muscles */}
                {selectedExercise.secondaryMuscles && selectedExercise.secondaryMuscles.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-semibold">{t.exercises.secondaryMuscles}</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedExercise.secondaryMuscles.map((muscle) => (
                        <Badge key={muscle} variant="secondary">{muscle}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {(selectedExercise.descriptionEn || (selectedExercise as any).description) && (
                  <div>
                    <h4 className="mb-2 font-semibold">{t.exercises.details}</h4>
                    <p className="text-muted-foreground">
                      {stripMarkdown(selectedExercise.descriptionEn || (selectedExercise as any).description || '')}
                    </p>
                  </div>
                )}

                {/* Instructions */}
                {(selectedExercise.instructionsEn || (selectedExercise as any).instructions || []).length > 0 && (
                  <div>
                    <h4 className="mb-2 font-semibold">{t.exercises.instructions}</h4>
                    <ol className="space-y-2">
                      {(selectedExercise.instructionsEn || (selectedExercise as any).instructions || []).map((instruction: string, index: number) => (
                        <li key={index} className="flex gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                            {index + 1}
                          </span>
                          <span className="text-muted-foreground">{stripMarkdown(instruction)}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Tips */}
                {(selectedExercise.tipsEn || (selectedExercise as any).tips || []).length > 0 && (
                  <div>
                    <h4 className="mb-2 font-semibold">{t.exercises.tips}</h4>
                    <ul className="space-y-2">
                      {(selectedExercise.tipsEn || (selectedExercise as any).tips || []).map((tip: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-muted-foreground">
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
                    <h4 className="mb-3 font-semibold">{isAr ? 'أسئلة شائعة' : 'Frequently Asked Questions'}</h4>
                    <div className="space-y-3">
                      {selectedExercise.faqsEn.map((faq: { question: string; answer: string }, index: number) => (
                        <details key={index} className="group rounded-lg border bg-muted/30 p-3">
                          <summary className="cursor-pointer font-medium text-sm flex items-center justify-between">
                            {faq.question}
                            <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                          </summary>
                          <p className="mt-2 text-sm text-muted-foreground pl-0">{faq.answer}</p>
                        </details>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button — links to workout creation */}
                <Button
                  className="w-full btn-primary"
                  onClick={() => {
                    setSelectedExercise(null);
                    window.location.href = '/workouts/create';
                  }}
                >
                  {isAr ? 'إنشاء تمرين' : 'Create Workout'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        language={language}
      />
    </div>
  );
}

function ExercisesPageFallback() {
  return (
    <div className="flex h-[50vh] items-center justify-center pb-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
