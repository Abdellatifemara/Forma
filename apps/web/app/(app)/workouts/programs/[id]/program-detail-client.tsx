'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Dumbbell,
  ChevronDown,
  ChevronUp,
  Flame,
  Target,
  Zap,
  Trophy,
  Play,
  Share2,
  Star,
  Timer,
} from 'lucide-react';
import { programsApi } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ProgramExercise {
  id: string;
  order: number;
  sets: number;
  reps: string | null;
  restSeconds: number;
  customNameEn: string | null;
  customNameAr: string | null;
  notesEn: string | null;
  exercise: {
    id: string;
    nameEn: string;
    nameAr: string | null;
    primaryMuscle: string | null;
  } | null;
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

interface ProgramDetail {
  id: string;
  nameEn: string;
  nameAr: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  durationWeeks: number;
  sourceType: string | null;
  workoutDays?: WorkoutDay[];
}

const MUSCLE_COLORS: Record<string, string> = {
  CHEST: 'bg-red-500/15 text-red-500 border-red-500/20',
  BACK: 'bg-blue-500/15 text-blue-500 border-blue-500/20',
  SHOULDERS: 'bg-orange-500/15 text-orange-500 border-orange-500/20',
  BICEPS: 'bg-purple-500/15 text-purple-500 border-purple-500/20',
  TRICEPS: 'bg-indigo-500/15 text-indigo-500 border-indigo-500/20',
  QUADRICEPS: 'bg-green-500/15 text-green-500 border-green-500/20',
  HAMSTRINGS: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20',
  GLUTES: 'bg-pink-500/15 text-pink-500 border-pink-500/20',
  ABS: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/20',
  CALVES: 'bg-teal-500/15 text-teal-500 border-teal-500/20',
  FOREARMS: 'bg-amber-500/15 text-amber-500 border-amber-500/20',
  TRAPS: 'bg-cyan-500/15 text-cyan-500 border-cyan-500/20',
  LATS: 'bg-sky-500/15 text-sky-500 border-sky-500/20',
};

function getMuscleLabel(muscle: string): string {
  return muscle.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function getCategoryInfo(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('crossfit') || lower.includes('wod') || lower.includes('metcon'))
    return { icon: Trophy, label: 'CrossFit', gradient: 'from-yellow-500 to-amber-600' };
  if (lower.includes('home') || lower.includes('bodyweight') || lower.includes('band') || lower.includes('no equipment'))
    return { icon: Target, label: 'Home', gradient: 'from-green-500 to-emerald-600' };
  if (lower.includes('endurance') || lower.includes('cardio') || lower.includes('hiit') || lower.includes('run'))
    return { icon: Flame, label: 'Endurance', gradient: 'from-blue-500 to-cyan-600' };
  if (lower.includes('hypertrophy') || lower.includes('size') || lower.includes('mass') || lower.includes('bulk'))
    return { icon: Zap, label: 'Hypertrophy', gradient: 'from-red-500 to-rose-600' };
  return { icon: Dumbbell, label: 'Strength', gradient: 'from-primary to-orange-600' };
}

export default function ProgramDetailPage() {
  const { isRTL, language } = useLanguage();
  const isAr = language === 'ar';
  const params = useParams();

  const [programId, setProgramId] = useState<string>('');
  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(0);

  useEffect(() => {
    const segments = window.location.pathname.split('/').filter(Boolean);
    const urlId = segments[segments.length - 1] || '';
    setProgramId(urlId && urlId !== '_placeholder' ? urlId : (params.id as string) || '');
  }, [params.id]);

  useEffect(() => {
    if (!programId || programId === '_placeholder') return;

    // Try browse endpoint first (public), fall back to trainer endpoint
    programsApi.getBrowseById(programId)
      .then(data => setProgram(data as any))
      .catch(() =>
        programsApi.getById(programId)
          .then(data => setProgram(data as any))
          .catch(err => setError(err instanceof Error ? err.message : 'Failed to load'))
      )
      .finally(() => setLoading(false));
  }, [programId]);

  const days = useMemo(() =>
    (program?.workoutDays || []).sort((a, b) => a.dayNumber - b.dayNumber),
    [program]
  );

  const totalExercises = useMemo(() =>
    days.reduce((sum, d) => sum + d.exercises.length, 0),
    [days]
  );

  const uniqueMuscles = useMemo(() => {
    const muscles = new Set<string>();
    days.forEach(d => d.exercises.forEach(ex => {
      if (ex.exercise?.primaryMuscle) muscles.add(ex.exercise.primaryMuscle);
    }));
    return Array.from(muscles);
  }, [days]);

  const categoryInfo = program ? getCategoryInfo(program.nameEn) : null;
  const CategoryIcon = categoryInfo?.icon || Dumbbell;

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {/* Hero skeleton */}
          <div className="h-44 rounded-2xl animate-shimmer" />
          {/* Stats skeleton */}
          <div className="flex gap-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 flex-1 rounded-xl animate-shimmer" />)}
          </div>
          {/* Days skeleton */}
          <div className="space-y-3 mt-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-20 rounded-xl animate-shimmer" />)}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !program) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center px-6">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Dumbbell className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h2 className="text-lg font-semibold mb-1">{isAr ? 'البرنامج مش موجود' : 'Program not found'}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {error || (isAr ? 'ممكن البرنامج اتحذف أو الرابط غلط' : 'The program may have been removed or the link is incorrect')}
          </p>
          <Button variant="outline" asChild>
            <Link href="/workouts/programs">
              <ArrowLeft className={cn('me-2 h-4 w-4', isRTL && 'rotate-180')} />
              {isAr ? 'رجوع للمكتبة' : 'Back to Library'}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const programName = isAr && program.nameAr ? program.nameAr : program.nameEn;
  const programDesc = isAr ? program.descriptionAr || program.descriptionEn : program.descriptionEn;

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/workouts/programs" className="p-2 -ms-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className={cn('h-5 w-5', isRTL && 'rotate-180')} />
          </Link>
          <span className={cn('text-sm font-semibold truncate max-w-[200px]', isAr && 'font-cairo')}>
            {programName}
          </span>
          <button className="p-2 -me-2 rounded-xl hover:bg-muted transition-colors">
            <Share2 className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-28">
        {/* Hero Card */}
        <div className={cn(
          'mt-4 relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br',
          categoryInfo?.gradient || 'from-primary to-orange-600'
        )}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-0 end-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 start-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <CategoryIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1">
                <Star className="h-3.5 w-3.5 text-white fill-white" />
                <span className="text-xs font-medium text-white">{categoryInfo?.label}</span>
              </div>
            </div>

            <h1 className={cn('text-xl font-bold text-white leading-tight mb-2', isAr && 'font-cairo')}>
              {programName}
            </h1>

            {programDesc && (
              <p className="text-sm text-white/80 leading-relaxed line-clamp-3">
                {programDesc}
              </p>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2.5 mt-3">
          <div className="rounded-xl border bg-card p-3 text-center">
            <Calendar className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold">{program.durationWeeks}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
              {isAr ? 'أسبوع' : 'weeks'}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-3 text-center">
            <Clock className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold">{days.length || '—'}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
              {isAr ? 'يوم / أسبوع' : 'days/wk'}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-3 text-center">
            <Dumbbell className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold">{totalExercises || '—'}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
              {isAr ? 'تمرين' : 'exercises'}
            </p>
          </div>
        </div>

        {/* Targeted Muscles */}
        {uniqueMuscles.length > 0 && (
          <div className="mt-4">
            <h2 className={cn('text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2', isAr && 'font-cairo')}>
              {isAr ? 'العضلات المستهدفة' : 'Targeted Muscles'}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {uniqueMuscles.map(muscle => (
                <span
                  key={muscle}
                  className={cn(
                    'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border',
                    MUSCLE_COLORS[muscle] || 'bg-muted text-muted-foreground border-border'
                  )}
                >
                  {getMuscleLabel(muscle)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Workout Days */}
        {days.length > 0 ? (
          <div className="mt-5">
            <h2 className={cn('text-sm font-semibold mb-3 flex items-center gap-2', isAr && 'font-cairo')}>
              <div className="h-1 w-1 rounded-full bg-primary" />
              {isAr ? 'جدول التمارين' : 'Workout Schedule'}
            </h2>

            <div className="space-y-2">
              {days.map((day, dayIdx) => {
                const isExpanded = expandedDay === day.dayNumber;
                const dayMuscles = new Set(
                  day.exercises
                    .map(ex => ex.exercise?.primaryMuscle)
                    .filter(Boolean) as string[]
                );

                return (
                  <div
                    key={day.id}
                    className={cn(
                      'rounded-xl border overflow-hidden transition-all duration-200',
                      isExpanded ? 'bg-card shadow-sm border-primary/20' : 'bg-card hover:bg-muted/30'
                    )}
                    style={{ animationDelay: `${dayIdx * 40}ms` }}
                  >
                    <button
                      onClick={() => setExpandedDay(isExpanded ? null : day.dayNumber)}
                      className="w-full flex items-center gap-3 p-3.5 text-start cursor-pointer"
                    >
                      {/* Day number circle */}
                      <div className={cn(
                        'h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold transition-colors',
                        isExpanded
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}>
                        {day.dayNumber}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className={cn('font-semibold text-sm leading-tight', isAr && 'font-cairo')}>
                          {isAr ? day.nameAr || day.nameEn || `اليوم ${day.dayNumber}` : day.nameEn || `Day ${day.dayNumber}`}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-muted-foreground">
                            {day.exercises.length} {isAr ? 'تمرين' : 'exercises'}
                          </span>
                          {dayMuscles.size > 0 && (
                            <>
                              <span className="text-muted-foreground/30">·</span>
                              <span className="text-[11px] text-muted-foreground truncate">
                                {Array.from(dayMuscles).slice(0, 3).map(m => getMuscleLabel(m)).join(', ')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <ChevronDown className={cn(
                        'h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0',
                        isExpanded && 'rotate-180'
                      )} />
                    </button>

                    {/* Expanded exercises */}
                    {isExpanded && day.exercises.length > 0 && (
                      <div className="border-t bg-muted/20">
                        {day.exercises.sort((a, b) => a.order - b.order).map((ex, i) => {
                          const exName = isAr
                            ? ex.customNameAr || ex.exercise?.nameAr || ex.customNameEn || ex.exercise?.nameEn || ''
                            : ex.customNameEn || ex.exercise?.nameEn || '';
                          const muscle = ex.exercise?.primaryMuscle;

                          return (
                            <div
                              key={ex.id}
                              className={cn(
                                'flex items-center gap-3 px-3.5 py-3',
                                i > 0 && 'border-t border-border/40'
                              )}
                            >
                              {/* Exercise number */}
                              <span className="text-[11px] text-muted-foreground/60 font-medium w-4 text-center flex-shrink-0">
                                {i + 1}
                              </span>

                              <div className="flex-1 min-w-0">
                                <p className={cn('text-sm font-medium leading-tight truncate', isAr && 'font-cairo')}>
                                  {exName}
                                </p>
                                {muscle && (
                                  <span className="text-[10px] text-muted-foreground">
                                    {getMuscleLabel(muscle)}
                                  </span>
                                )}
                              </div>

                              {/* Sets x Reps badge */}
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                                  {ex.sets} × {ex.reps || '?'}
                                </span>
                                {ex.restSeconds > 0 && (
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                    <Timer className="h-2.5 w-2.5" />
                                    {ex.restSeconds}s
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Day notes */}
                        {(isAr ? day.notesAr : day.notesEn) && (
                          <div className="px-3.5 py-2.5 border-t border-border/40 bg-muted/30">
                            <p className={cn('text-xs text-muted-foreground italic', isAr && 'font-cairo')}>
                              {isAr ? day.notesAr : day.notesEn}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* No workout days — show program overview */
          <div className="mt-8 text-center py-8">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Dumbbell className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className={cn('font-semibold mb-1', isAr && 'font-cairo')}>
              {isAr ? 'تفاصيل التمارين' : 'Exercise Details'}
            </h3>
            <p className={cn('text-sm text-muted-foreground max-w-xs mx-auto', isAr && 'font-cairo')}>
              {isAr
                ? 'تفاصيل التمارين هتظهر لما تبدأ البرنامج'
                : 'Exercise breakdown will be available when you start this program'}
            </p>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 inset-x-0 z-20 bg-background/80 backdrop-blur-xl border-t safe-area-bottom">
        <div className="max-w-2xl mx-auto px-4 py-3 flex gap-2">
          <Button
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-orange-600 text-white font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
            onClick={() => {
              // TODO: Start/save program
            }}
          >
            <Play className="me-2 h-4 w-4" />
            {isAr ? 'ابدأ البرنامج' : 'Start Program'}
          </Button>
        </div>
      </div>
    </div>
  );
}
