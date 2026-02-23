'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Dumbbell, ChevronDown, ChevronUp } from 'lucide-react';
import { programsApi } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface ProgramDetail {
  id: string;
  nameEn: string;
  nameAr: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  durationWeeks: number;
  sourceType: string | null;
  workoutDays?: Array<{
    id: string;
    dayNumber: number;
    nameEn: string | null;
    nameAr: string | null;
    notesEn: string | null;
    notesAr: string | null;
    exercises: Array<{
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
    }>;
  }>;
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

  // Read actual ID from URL (Cloudflare static export fix)
  useEffect(() => {
    const segments = window.location.pathname.split('/').filter(Boolean);
    const urlId = segments[segments.length - 1] || '';
    setProgramId(urlId && urlId !== '_placeholder' ? urlId : (params.id as string) || '');
  }, [params.id]);

  useEffect(() => {
    if (!programId || programId === '_placeholder') return;

    programsApi.getById(programId)
      .then(data => setProgram(data as any))
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [programId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <div className="h-8 w-48 rounded-lg animate-shimmer" />
          <div className="h-4 w-full rounded animate-shimmer" />
          <div className="h-4 w-3/4 rounded animate-shimmer" />
          <div className="mt-6 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl animate-shimmer" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">{error || (isAr ? 'البرنامج مش موجود' : 'Program not found')}</p>
          <Link href="/workouts/programs" className="text-primary text-sm mt-2 inline-block">
            {isAr ? '← رجوع للمكتبة' : '← Back to library'}
          </Link>
        </div>
      </div>
    );
  }

  const days = program.workoutDays || [];

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/workouts/programs" className="p-2 -ms-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className={cn('h-5 w-5', isRTL && 'rotate-180')} />
          </Link>
          <div className="min-w-0">
            <h1 className={cn('text-lg font-bold truncate', isAr && 'font-cairo')}>
              {isAr && program.nameAr ? program.nameAr : program.nameEn}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-24">
        {/* Program Info */}
        <div className="mt-4 p-4 rounded-2xl border bg-card">
          <div className="flex items-center gap-4 mb-3">
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {program.durationWeeks} {isAr ? 'أسبوع' : 'weeks'}
            </span>
            {days.length > 0 && (
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {days.length} {isAr ? 'يوم/أسبوع' : 'days/week'}
              </span>
            )}
          </div>
          <p className={cn('text-sm text-muted-foreground', isAr && 'font-cairo')}>
            {isAr ? program.descriptionAr || program.descriptionEn : program.descriptionEn || ''}
          </p>
        </div>

        {/* Workout Days */}
        {days.length > 0 ? (
          <div className="mt-4 space-y-2">
            <h2 className={cn('text-base font-semibold mb-3', isAr && 'font-cairo')}>
              {isAr ? 'أيام التمرين' : 'Workout Days'}
            </h2>
            {days.sort((a, b) => a.dayNumber - b.dayNumber).map((day) => {
              const isExpanded = expandedDay === day.dayNumber;
              return (
                <div key={day.id} className="rounded-xl border bg-card overflow-hidden">
                  <button
                    onClick={() => setExpandedDay(isExpanded ? null : day.dayNumber)}
                    className="w-full flex items-center justify-between p-4 text-start hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <span className="text-xs font-medium text-primary">
                        {isAr ? `اليوم ${day.dayNumber}` : `Day ${day.dayNumber}`}
                      </span>
                      <h3 className={cn('font-semibold text-sm', isAr && 'font-cairo')}>
                        {isAr ? day.nameAr || day.nameEn || '' : day.nameEn || ''}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {day.exercises.length} {isAr ? 'تمرين' : 'exercises'}
                      </span>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </button>
                  {isExpanded && day.exercises.length > 0 && (
                    <div className="border-t px-4 pb-3">
                      {day.exercises.sort((a, b) => a.order - b.order).map((ex, i) => (
                        <div key={ex.id} className={cn('py-2.5', i > 0 && 'border-t border-border/50')}>
                          <div className="flex items-center justify-between">
                            <span className={cn('text-sm font-medium', isAr && 'font-cairo')}>
                              {isAr
                                ? ex.customNameAr || ex.exercise?.nameAr || ex.customNameEn || ex.exercise?.nameEn || ''
                                : ex.customNameEn || ex.exercise?.nameEn || ''}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {ex.sets}×{ex.reps || '?'}
                            </span>
                          </div>
                          {ex.exercise?.primaryMuscle && (
                            <span className="text-xs text-muted-foreground">
                              {ex.exercise.primaryMuscle.replace(/_/g, ' ').toLowerCase()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 text-center">
            <Dumbbell className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className={cn('text-sm text-muted-foreground', isAr && 'font-cairo')}>
              {isAr ? 'تفاصيل التمارين مش متاحة لهذا البرنامج' : 'Exercise details not available for this program'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
