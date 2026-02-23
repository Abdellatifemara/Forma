'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Dumbbell,
  Home,
  Building2,
  Trees,
  Briefcase,
  Loader2,
  Play,
  Sparkles,
  Target,
  Timer,
  Zap,
  Check,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { workoutsApi, type GeneratedProgram } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

// ─── CONFIG ────────────────────────────────────────────────────────────────

const daysOptions = [3, 4, 5, 6];
const durationOptions = [30, 45, 60, 75, 90];

const getLocationOptions = (isAr: boolean) => [
  { id: 'gym', label: isAr ? 'جيم' : 'Gym', icon: Dumbbell, description: isAr ? 'جيم كامل بأجهزة' : 'Full equipment gym' },
  { id: 'home', label: isAr ? 'بيت' : 'Home', icon: Home, description: isAr ? 'أوزان محدودة أو جسم فقط' : 'Limited weights or bodyweight' },
  { id: 'home_gym', label: isAr ? 'جيم بيتي' : 'Home Gym', icon: Building2, description: isAr ? 'جيم مجهز في البيت' : 'Well-equipped home gym' },
  { id: 'outdoor', label: isAr ? 'خارج' : 'Outdoor', icon: Trees, description: isAr ? 'حديقة أو ملعب' : 'Park or outdoor area' },
  { id: 'hotel', label: isAr ? 'فندق' : 'Hotel', icon: Briefcase, description: isAr ? 'جيم فندق صغير' : 'Small hotel gym' },
];

type WizardStep = 'days' | 'duration' | 'location' | 'generating' | 'result';

// ─── WIZARD ────────────────────────────────────────────────────────────────

export default function GenerateProgramPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [step, setStep] = useState<WizardStep>('days');
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [minutesPerSession, setMinutesPerSession] = useState(45);
  const [location, setLocation] = useState<string>('gym');
  const [program, setProgram] = useState<GeneratedProgram | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState<number>(1);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const locationOptions = getLocationOptions(isAr);

  const stepNumber = step === 'days' ? 1 : step === 'duration' ? 2 : step === 'location' ? 3 : 0;
  const totalSteps = 3;

  const handleGenerate = async () => {
    setStep('generating');
    setError(null);
    try {
      const result = await workoutsApi.generateProgram({
        daysPerWeek,
        minutesPerSession,
        location: location as any,
      });
      setProgram(result);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : (isAr ? 'فشل إنشاء البرنامج' : 'Failed to generate program'));
      setStep('location');
    }
  };

  const handleActivate = async () => {
    if (!program) return;
    setIsActivating(true);
    try {
      // Create a plan from the generated program, then activate it
      const plan = await workoutsApi.createPlan({
        name: program.name,
        description: program.description,
        difficulty: 'INTERMEDIATE',
        goal: 'BUILD_MUSCLE',
        workouts: program.weeks.flatMap((week) =>
          week.sessions.map((session) => ({
            name: session.title || `Week ${week.weekNumber} Session`,
            exercises: (session.workingSets || session.exercises || []).map((ex: any) => ({
              exerciseId: ex.exerciseId || ex.id || 'unknown',
              sets: Array.from({ length: ex.sets || 3 }, () => ({
                reps: String(typeof ex.reps === 'string' ? ex.reps : ex.reps || '10'),
                weight: '',
              })),
            })),
          }))
        ),
      });
      await workoutsApi.activatePlan(plan.id);
      router.push('/workouts');
    } catch (err) {
      setError(err instanceof Error ? err.message : (isAr ? 'فشل تفعيل البرنامج' : 'Failed to activate program'));
    } finally {
      setIsActivating(false);
    }
  };

  // ─── GENERATING STATE ──────────────────────────────────────────────────
  if (step === 'generating') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="relative mb-6">
          <div className="h-20 w-20 rounded-full border-4 border-muted animate-pulse" />
          <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-transparent border-t-forma-orange animate-spin" />
          <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-forma-orange" />
        </div>
        <h2 className="text-xl font-bold mb-2">{isAr ? 'بنجهزلك البرنامج...' : 'Building Your Program...'}</h2>
        <p className="text-muted-foreground text-sm text-center max-w-xs">
          {isAr
            ? 'بنحلل بروفايلك وتاريخ تمارينك عشان نعملك برنامج مخصص'
            : 'Analyzing your profile and workout history to create a personalized plan'}
        </p>
        <div className="mt-6 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-forma-orange animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ─── RESULT STATE ────────────────────────────────────────────────────
  if (step === 'result' && program) {
    return (
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setStep('location'); setProgram(null); }}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{isAr ? program.nameAr || program.name : program.name}</h1>
            <p className="text-sm text-muted-foreground">
              {isAr ? program.descriptionAr || program.description : program.description}
            </p>
          </div>
        </div>

        {/* Program Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-forma-orange/10 border border-forma-orange/20 p-3 text-center">
            <Calendar className="h-5 w-5 text-forma-orange mx-auto mb-1" />
            <p className="text-lg font-bold">{program.durationWeeks}</p>
            <p className="text-[11px] text-muted-foreground">{isAr ? 'أسابيع' : 'weeks'}</p>
          </div>
          <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 text-center">
            <Target className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-lg font-bold">{program.daysPerWeek}</p>
            <p className="text-[11px] text-muted-foreground">{isAr ? 'يوم/أسبوع' : 'days/week'}</p>
          </div>
          <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-3 text-center">
            <Dumbbell className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-lg font-bold">{program.weeks.reduce((s, w) => s + w.sessions.length, 0)}</p>
            <p className="text-[11px] text-muted-foreground">{isAr ? 'جلسة' : 'sessions'}</p>
          </div>
        </div>

        {/* Weeks */}
        <div className="space-y-3">
          {program.weeks.map((week) => (
            <div key={week.weekNumber} className="rounded-xl border border-border/60 overflow-hidden">
              {/* Week Header */}
              <button
                onClick={() => setExpandedWeek(expandedWeek === week.weekNumber ? 0 : week.weekNumber)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-forma-orange/10 flex items-center justify-center font-bold text-forma-orange">
                    W{week.weekNumber}
                  </div>
                  <div className="text-start">
                    <p className="font-semibold">
                      {isAr ? `الأسبوع ${week.weekNumber}` : `Week ${week.weekNumber}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{week.phase}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {week.sessions.length} {isAr ? 'جلسة' : 'sessions'}
                  </Badge>
                  {expandedWeek === week.weekNumber ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Sessions */}
              {expandedWeek === week.weekNumber && (
                <div className="border-t border-border/40 divide-y divide-border/30">
                  {week.sessions.map((session, sessionIdx) => {
                    const dayKey = week.weekNumber * 100 + sessionIdx;
                    const isExpanded = expandedDay === dayKey;
                    const exercises = session.workingSets || session.exercises || [];

                    return (
                      <div key={sessionIdx}>
                        <button
                          onClick={() => setExpandedDay(isExpanded ? null : dayKey)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-sm font-medium">
                              D{sessionIdx + 1}
                            </div>
                            <div className="text-start">
                              <p className="text-sm font-medium">
                                {isAr ? (session.titleAr || session.title) : session.title}
                              </p>
                              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Timer className="h-3 w-3" />
                                  {session.durationMinutes || minutesPerSession} {isAr ? 'د' : 'min'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Dumbbell className="h-3 w-3" />
                                  {exercises.length} {isAr ? 'تمرين' : 'exercises'}
                                </span>
                                {session.estimatedCalories > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Flame className="h-3 w-3" />
                                    ~{session.estimatedCalories} kcal
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>

                        {/* Exercise list */}
                        {isExpanded && exercises.length > 0 && (
                          <div className="px-4 pb-3 space-y-2">
                            {/* Target muscles */}
                            {session.targetMuscles && session.targetMuscles.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {session.targetMuscles.map((muscle: string) => (
                                  <span
                                    key={muscle}
                                    className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                                  >
                                    {muscle.charAt(0) + muscle.slice(1).toLowerCase().replace('_', ' ')}
                                  </span>
                                ))}
                              </div>
                            )}
                            {exercises.map((ex: any, exIdx: number) => (
                              <div
                                key={exIdx}
                                className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="w-6 h-6 shrink-0 rounded bg-forma-orange/20 text-forma-orange flex items-center justify-center text-[10px] font-bold">
                                    {exIdx + 1}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {isAr ? (ex.nameAr || ex.name) : ex.name}
                                    </p>
                                    {ex.muscleGroup && (
                                      <p className="text-[10px] text-muted-foreground">
                                        {ex.muscleGroup.toLowerCase().replace('_', ' ')}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-end shrink-0 ms-2">
                                  <p className="text-sm font-bold">{ex.sets} x {ex.reps}</p>
                                  {ex.restSeconds && (
                                    <p className="text-[10px] text-muted-foreground">
                                      {isAr ? 'راحة' : 'rest'} {ex.restSeconds}s
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Activate Button */}
        <div className="sticky bottom-20 lg:bottom-4 z-10">
          <Button
            onClick={handleActivate}
            disabled={isActivating}
            className="w-full py-6 bg-gradient-to-r from-forma-orange to-orange-600 hover:from-forma-orange/90 hover:to-orange-700 text-white rounded-xl font-semibold text-base shadow-lg"
          >
            {isActivating ? (
              <>
                <Loader2 className="me-2 h-5 w-5 animate-spin" />
                {isAr ? 'بنفعّل...' : 'Activating...'}
              </>
            ) : (
              <>
                <Zap className="me-2 h-5 w-5" />
                {isAr ? 'فعّل البرنامج' : 'Activate Program'}
              </>
            )}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}
      </div>
    );
  }

  // ─── WIZARD STEPS ────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-20">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/workouts">
            <ArrowLeft className="me-2 h-4 w-4" />
            {isAr ? 'رجوع' : 'Back'}
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-r from-forma-orange to-orange-600 flex items-center justify-center shadow-lg">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold">{isAr ? 'جهّزلي برنامج' : 'Generate My Program'}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isAr ? 'برنامج ٤ أسابيع مخصص ليك' : 'A personalized 4-week program just for you'}
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                s < stepNumber
                  ? 'bg-forma-orange text-white'
                  : s === stepNumber
                    ? 'bg-forma-orange/20 text-forma-orange border-2 border-forma-orange'
                    : 'bg-muted text-muted-foreground'
              )}
            >
              {s < stepNumber ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < 3 && (
              <div className={cn('h-0.5 w-8 rounded-full', s < stepNumber ? 'bg-forma-orange' : 'bg-muted')} />
            )}
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        {isAr ? `الخطوة ${stepNumber} من ${totalSteps}` : `Step ${stepNumber} of ${totalSteps}`}
      </p>

      {/* Step 1: Days per week */}
      {step === 'days' && (
        <div className="space-y-4 animate-fade-up">
          <div className="text-center">
            <h2 className="text-lg font-semibold">{isAr ? 'كام يوم في الأسبوع؟' : 'How many days per week?'}</h2>
            <p className="text-sm text-muted-foreground">{isAr ? 'اختار عدد أيام التمرين' : 'Choose your training frequency'}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {daysOptions.map((d) => (
              <button
                key={d}
                onClick={() => setDaysPerWeek(d)}
                className={cn(
                  'p-5 rounded-xl border-2 transition-all text-center',
                  daysPerWeek === d
                    ? 'border-forma-orange bg-forma-orange/10 shadow-md'
                    : 'border-border hover:border-forma-orange/50'
                )}
              >
                <p className="text-3xl font-bold mb-1">{d}</p>
                <p className="text-xs text-muted-foreground">
                  {isAr ? `${d} أيام/أسبوع` : `${d} days/week`}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {d === 3
                    ? (isAr ? 'مثالي للمبتدئين' : 'Great for beginners')
                    : d === 4
                      ? (isAr ? 'الأكتر شيوعاً' : 'Most popular')
                      : d === 5
                        ? (isAr ? 'متقدم' : 'Advanced')
                        : (isAr ? 'للمحترفين' : 'For pros')}
                </p>
              </button>
            ))}
          </div>
          <Button
            onClick={() => setStep('duration')}
            className="w-full py-5 bg-forma-orange hover:bg-forma-orange/90 text-white rounded-xl font-medium"
          >
            {isAr ? 'التالي' : 'Next'}
            <ChevronRight className="ms-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Step 2: Duration */}
      {step === 'duration' && (
        <div className="space-y-4 animate-fade-up">
          <div className="text-center">
            <h2 className="text-lg font-semibold">{isAr ? 'كام دقيقة كل جلسة؟' : 'How long per session?'}</h2>
            <p className="text-sm text-muted-foreground">{isAr ? 'الوقت المتاح لكل تمرين' : 'Available time per workout'}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {durationOptions.map((m) => (
              <button
                key={m}
                onClick={() => setMinutesPerSession(m)}
                className={cn(
                  'px-5 py-3.5 rounded-xl border-2 transition-all',
                  minutesPerSession === m
                    ? 'border-forma-orange bg-forma-orange/10 shadow-md'
                    : 'border-border hover:border-forma-orange/50'
                )}
              >
                <div className="flex items-center gap-2">
                  <Clock className={cn('h-4 w-4', minutesPerSession === m ? 'text-forma-orange' : 'text-muted-foreground')} />
                  <span className="font-semibold">{m}</span>
                  <span className="text-sm text-muted-foreground">{isAr ? 'دقيقة' : 'min'}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep('days')}
              className="flex-1 py-5 rounded-xl"
            >
              <ArrowLeft className="me-2 h-4 w-4" />
              {isAr ? 'رجوع' : 'Back'}
            </Button>
            <Button
              onClick={() => setStep('location')}
              className="flex-1 py-5 bg-forma-orange hover:bg-forma-orange/90 text-white rounded-xl font-medium"
            >
              {isAr ? 'التالي' : 'Next'}
              <ChevronRight className="ms-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Location */}
      {step === 'location' && (
        <div className="space-y-4 animate-fade-up">
          <div className="text-center">
            <h2 className="text-lg font-semibold">{isAr ? 'بتتمرن فين؟' : 'Where do you train?'}</h2>
            <p className="text-sm text-muted-foreground">{isAr ? 'عشان نختار التمارين المناسبة' : 'So we pick the right exercises'}</p>
          </div>
          <div className="space-y-2">
            {locationOptions.map((loc) => {
              const Icon = loc.icon;
              const isSelected = location === loc.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => setLocation(loc.id)}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-start',
                    isSelected
                      ? 'border-forma-orange bg-forma-orange/10'
                      : 'border-border hover:border-forma-orange/50'
                  )}
                >
                  <div className={cn(
                    'h-12 w-12 rounded-xl flex items-center justify-center shrink-0',
                    isSelected ? 'bg-forma-orange/20' : 'bg-muted'
                  )}>
                    <Icon className={cn('h-6 w-6', isSelected ? 'text-forma-orange' : 'text-muted-foreground')} />
                  </div>
                  <div className="flex-1">
                    <p className={cn('font-medium', isSelected && 'text-forma-orange')}>{loc.label}</p>
                    <p className="text-xs text-muted-foreground">{loc.description}</p>
                  </div>
                  {isSelected && (
                    <div className="h-6 w-6 rounded-full bg-forma-orange flex items-center justify-center shrink-0">
                      <Check className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          {/* Summary */}
          <div className="rounded-xl bg-muted/50 p-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {isAr ? 'ملخص' : 'Summary'}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-forma-orange" />
                {daysPerWeek} {isAr ? 'أيام/أسبوع' : 'days/week'}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-forma-orange" />
                {minutesPerSession} {isAr ? 'دقيقة' : 'min'}
              </span>
              <span className="flex items-center gap-1.5">
                <Dumbbell className="h-4 w-4 text-forma-orange" />
                {locationOptions.find((l) => l.id === location)?.label}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep('duration')}
              className="flex-1 py-5 rounded-xl"
            >
              <ArrowLeft className="me-2 h-4 w-4" />
              {isAr ? 'رجوع' : 'Back'}
            </Button>
            <Button
              onClick={handleGenerate}
              className="flex-1 py-5 bg-gradient-to-r from-forma-orange to-orange-600 hover:from-forma-orange/90 hover:to-orange-700 text-white rounded-xl font-medium shadow-lg"
            >
              <Sparkles className="me-2 h-5 w-5" />
              {isAr ? 'جهّزلي البرنامج' : 'Generate Program'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
