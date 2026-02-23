'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { workoutsApi, WhatNowInput, WhatNowRecommendation, ExerciseBlock, WarmupExercise } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import {
  Zap,
  Clock,
  MapPin,
  Battery,
  BatteryLow,
  BatteryFull,
  Dumbbell,
  Home,
  Trees,
  Building2,
  Bed,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  Flame,
  Timer,
  Target,
  TrendingUp,
  Play,
  Heart,
  Activity,
} from 'lucide-react';

const energyLevels = [
  { id: 'low', label: 'Low', labelAr: 'منخفض', icon: BatteryLow, color: 'text-orange-500' },
  { id: 'medium', label: 'Medium', labelAr: 'متوسط', icon: Battery, color: 'text-yellow-500' },
  { id: 'high', label: 'High', labelAr: 'مرتفع', icon: BatteryFull, color: 'text-green-500' },
];

const locations = [
  { id: 'gym', label: 'Gym', labelAr: 'جيم', icon: Dumbbell },
  { id: 'home', label: 'Home', labelAr: 'بيت', icon: Home },
  { id: 'home_gym', label: 'Home Gym', labelAr: 'جيم بيتي', icon: Building2 },
  { id: 'outdoor', label: 'Outdoor', labelAr: 'خارج', icon: Trees },
];

const timeOptions = [10, 15, 20, 30, 45, 60, 75, 90];

const FORMAT_LABELS: Record<string, { en: string; ar: string }> = {
  EMOM: { en: 'EMOM', ar: 'EMOM' },
  TABATA: { en: 'Tabata', ar: 'تاباتا' },
  CIRCUIT: { en: 'Circuit', ar: 'دائري' },
  SUPERSET: { en: 'Superset', ar: 'سوبرسيت' },
  STRAIGHT_SETS: { en: 'Straight Sets', ar: 'مجموعات' },
  CLUSTER: { en: 'Cluster Sets', ar: 'كلستر' },
  REST_PAUSE: { en: 'Rest-Pause', ar: 'راحة-استمرار' },
  TRADITIONAL: { en: 'Traditional', ar: 'تقليدي' },
};

const CATEGORY_COLORS: Record<string, string> = {
  compound: 'bg-forma-orange/20 text-forma-orange border-forma-orange/30',
  isolation: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  accessory: 'bg-green-500/20 text-green-400 border-green-500/30',
  finisher: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function CollapsibleSection({
  title,
  titleAr,
  icon: Icon,
  children,
  defaultOpen = false,
  isAr,
  badge,
}: {
  title: string;
  titleAr: string;
  icon: any;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isAr: boolean;
  badge?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-forma-orange" />
          <span className="font-medium text-sm">{isAr ? titleAr : title}</span>
          {badge && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{badge}</span>
          )}
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {isOpen && <div className="px-3 pb-3 space-y-2">{children}</div>}
    </div>
  );
}

function WarmupCooldownItem({ exercise, isAr }: { exercise: WarmupExercise; isAr: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-foreground">{isAr ? exercise.nameAr : exercise.name}</span>
      <span className="text-muted-foreground text-xs">{exercise.duration}</span>
    </div>
  );
}

function ExerciseItem({ exercise, index, isAr }: { exercise: ExerciseBlock; index: number; isAr: boolean }) {
  const categoryColor = CATEGORY_COLORS[exercise.category] || CATEGORY_COLORS.compound;
  return (
    <div className="p-3 bg-muted/30 rounded-xl space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="w-7 h-7 shrink-0 bg-forma-orange/20 text-forma-orange rounded-lg flex items-center justify-center text-xs font-bold">
            {index + 1}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-tight">{isAr ? (exercise.nameAr || exercise.name) : exercise.name}</p>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${categoryColor}`}>
                {exercise.category}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {exercise.muscleGroup?.toLowerCase().replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
        <div className="text-end shrink-0">
          <p className="font-bold text-sm">{exercise.sets} x {exercise.reps}</p>
          <p className="text-[10px] text-muted-foreground">
            {isAr ? 'راحة' : 'rest'} {exercise.restSeconds}s
          </p>
        </div>
      </div>
      {/* Details row */}
      <div className="flex flex-wrap gap-2 text-[10px]">
        {exercise.tempo && (
          <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
            {isAr ? 'إيقاع' : 'Tempo'}: {exercise.tempo}
          </span>
        )}
        {exercise.rpeTarget && (
          <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
            RPE {exercise.rpeTarget}
          </span>
        )}
        {exercise.supersetWith && (
          <span className="px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            {isAr ? 'سوبرسيت مع' : 'SS with'} {exercise.supersetWith}
          </span>
        )}
      </div>
      {exercise.notes && (
        <p className="text-[11px] text-muted-foreground italic">
          {isAr ? (exercise.notesAr || exercise.notes) : exercise.notes}
        </p>
      )}
    </div>
  );
}

export function WhatNowButton() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const [isOpen, setIsOpen] = useState(true); // Auto-open since it's in a modal
  const [recommendation, setRecommendation] = useState<WhatNowRecommendation | null>(null);
  const [input, setInput] = useState<WhatNowInput>({
    availableMinutes: 30,
    energyLevel: 'medium',
    location: 'gym',
  });

  const mutation = useMutation({
    mutationFn: (data: WhatNowInput) => workoutsApi.getWhatNow(data),
    onSuccess: (data) => {
      setRecommendation(data);
    },
  });

  const handleGetRecommendation = () => {
    mutation.mutate(input);
  };

  // Check if this is the new format (has workingSets) or legacy (has exercises)
  const isNewFormat = recommendation?.workingSets && recommendation.workingSets.length > 0;
  const isRest = recommendation?.type === 'rest' || recommendation?.type === 'active_recovery';

  return (
    <div className="bg-background rounded-2xl shadow-2xl overflow-hidden border border-border max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-forma-orange to-orange-600 p-5 text-white sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{isAr ? 'إيه دلوقتي؟' : 'What Now?'}</h2>
              <p className="text-xs text-white/70">{isAr ? 'التمرين المثالي ليك' : 'Your perfect workout'}</p>
            </div>
          </div>
        </div>
      </div>

      {!recommendation ? (
        // Input Form
        <div className="p-5 space-y-5">
          {/* Available Time */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2.5">
              <Clock className="w-4 h-4" />
              {isAr ? 'عندك كام دقيقة؟' : 'Available Time'}
            </label>
            <div className="flex flex-wrap gap-2">
              {timeOptions.map((mins) => (
                <button
                  key={mins}
                  onClick={() => setInput({ ...input, availableMinutes: mins })}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    input.availableMinutes === mins
                      ? 'bg-forma-orange text-white shadow-md'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {mins} {isAr ? 'د' : 'min'}
                </button>
              ))}
            </div>
          </div>

          {/* Energy Level */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2.5">
              <Battery className="w-4 h-4" />
              {isAr ? 'مستوى طاقتك' : 'Energy Level'}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {energyLevels.map((level) => {
                const Icon = level.icon;
                const isSelected = input.energyLevel === level.id;
                return (
                  <button
                    key={level.id}
                    onClick={() => setInput({ ...input, energyLevel: level.id as 'low' | 'medium' | 'high' })}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-forma-orange bg-forma-orange/10'
                        : 'border-border hover:border-forma-orange/50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-1.5 ${level.color}`} />
                    <span className={`text-xs font-medium ${isSelected ? 'text-forma-orange' : 'text-muted-foreground'}`}>
                      {isAr ? level.labelAr : level.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2.5">
              <MapPin className="w-4 h-4" />
              {isAr ? 'إنت فين؟' : 'Where are you?'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {locations.map((loc) => {
                const Icon = loc.icon;
                const isSelected = input.location === loc.id;
                return (
                  <button
                    key={loc.id}
                    onClick={() => setInput({ ...input, location: loc.id as any })}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-forma-orange bg-forma-orange/10'
                        : 'border-border hover:border-forma-orange/50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-1.5 ${isSelected ? 'text-forma-orange' : 'text-muted-foreground'}`} />
                    <span className={`text-xs font-medium ${isSelected ? 'text-forma-orange' : 'text-muted-foreground'}`}>
                      {isAr ? loc.labelAr : loc.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleGetRecommendation}
            disabled={mutation.isPending}
            className="w-full py-3.5 bg-gradient-to-r from-forma-orange to-orange-600 hover:from-forma-orange/90 hover:to-orange-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg transition-all"
          >
            {mutation.isPending ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                {isAr ? 'بحسبلك...' : 'Analyzing...'}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {isAr ? 'جيبلي التمرين' : 'Get My Workout'}
              </>
            )}
          </button>
        </div>
      ) : (
        // Recommendation Display
        <div className="p-5 space-y-4">
          {/* Top badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              recommendation.type === 'rest'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : recommendation.type === 'active_recovery'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : recommendation.type === 'quick_workout'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'bg-forma-orange/20 text-forma-orange border border-forma-orange/30'
            }`}>
              {recommendation.type === 'rest' && <Bed className="w-3 h-3 inline me-1" />}
              {recommendation.type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </span>
            {recommendation.format && !isRest && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                {isAr ? FORMAT_LABELS[recommendation.format]?.ar : FORMAT_LABELS[recommendation.format]?.en || recommendation.format}
              </span>
            )}
            {recommendation.periodizationPhase && !isRest && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                {recommendation.periodizationPhase}
              </span>
            )}
          </div>

          {/* Title & Description */}
          <div>
            <h3 className="text-lg font-bold mb-1">
              {isAr ? recommendation.titleAr : recommendation.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isAr ? recommendation.descriptionAr : recommendation.description}
            </p>
          </div>

          {/* Stats row */}
          {!isRest && (
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Timer className="w-4 h-4 text-forma-orange" />
                {recommendation.durationMinutes} {isAr ? 'د' : 'min'}
              </span>
              {recommendation.estimatedCalories > 0 && (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Flame className="w-4 h-4 text-orange-500" />
                  ~{recommendation.estimatedCalories} kcal
                </span>
              )}
              {recommendation.workingSets && (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Dumbbell className="w-4 h-4 text-forma-orange" />
                  {recommendation.workingSets.length} {isAr ? 'تمرين' : 'exercises'}
                </span>
              )}
            </div>
          )}

          {/* Reason */}
          <div className="bg-forma-orange/10 border border-forma-orange/20 rounded-xl p-3">
            <p className="text-xs text-forma-orange">
              <Sparkles className="w-3.5 h-3.5 inline me-1.5" />
              {isAr ? recommendation.reasonAr : recommendation.reason}
            </p>
          </div>

          {/* Target Muscles */}
          {recommendation.targetMuscles?.length > 0 && !isRest && (
            <div className="flex flex-wrap gap-1.5">
              {recommendation.targetMuscles.map((muscle) => (
                <span
                  key={muscle}
                  className="px-2.5 py-1 bg-muted text-muted-foreground rounded-full text-xs"
                >
                  {muscle.charAt(0) + muscle.slice(1).toLowerCase().replace('_', ' ')}
                </span>
              ))}
            </div>
          )}

          {/* Warmup (new format) */}
          {isNewFormat && recommendation.warmup?.exercises?.length > 0 && (
            <CollapsibleSection
              title="Warmup"
              titleAr="إحماء"
              icon={Heart}
              isAr={isAr}
              badge={`${recommendation.warmup.durationMinutes} ${isAr ? 'د' : 'min'}`}
            >
              {recommendation.warmup.exercises.map((ex, i) => (
                <WarmupCooldownItem key={i} exercise={ex} isAr={isAr} />
              ))}
            </CollapsibleSection>
          )}

          {/* Working Sets (new format) */}
          {isNewFormat && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-forma-orange" />
                <h4 className="font-medium text-sm">{isAr ? 'التمارين' : 'Exercises'}</h4>
              </div>
              {recommendation.workingSets.map((exercise, index) => (
                <ExerciseItem key={index} exercise={exercise} index={index} isAr={isAr} />
              ))}
            </div>
          )}

          {/* Legacy exercises display (fallback) */}
          {!isNewFormat && recommendation.exercises && recommendation.exercises.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-forma-orange" />
                {isAr ? 'التمارين' : 'Exercises'}
              </h4>
              {recommendation.exercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-forma-orange/20 text-forma-orange rounded-lg flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{isAr ? (exercise.nameAr || exercise.name) : exercise.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {typeof exercise.equipment === 'string'
                          ? exercise.equipment.toLowerCase().replace('_', ' ')
                          : 'Bodyweight'}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-sm">{exercise.sets} x {exercise.reps}</p>
                </div>
              ))}
            </div>
          )}

          {/* Cooldown (new format) */}
          {isNewFormat && recommendation.cooldown?.exercises?.length > 0 && (
            <CollapsibleSection
              title="Cooldown"
              titleAr="تهدئة"
              icon={Activity}
              isAr={isAr}
              badge={`${recommendation.cooldown.durationMinutes} ${isAr ? 'د' : 'min'}`}
            >
              {recommendation.cooldown.exercises.map((ex, i) => (
                <WarmupCooldownItem key={i} exercise={ex} isAr={isAr} />
              ))}
            </CollapsibleSection>
          )}

          {/* Progression Notes (new format) */}
          {isNewFormat && recommendation.progressionNotes && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs font-medium text-green-400">
                  {isAr ? 'ملاحظات التقدم' : 'Progression'}
                </span>
              </div>
              <p className="text-xs text-green-300/80">
                {isAr ? recommendation.progressionNotesAr : recommendation.progressionNotes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setRecommendation(null)}
              className="flex-1 py-3 border border-border text-muted-foreground rounded-xl font-medium hover:bg-muted transition-colors text-sm"
            >
              {isAr ? 'جرّب تاني' : 'Try Again'}
            </button>
            {!isRest && (
              <button
                onClick={() => {
                  // TODO: Wire to workoutsApi.startWorkout
                  alert(isAr ? 'قريبًا!' : 'Coming soon!');
                }}
                className="flex-1 py-3 bg-gradient-to-r from-forma-orange to-orange-600 text-white rounded-xl font-medium hover:from-forma-orange/90 hover:to-orange-700 transition-all flex items-center justify-center gap-2 text-sm shadow-lg"
              >
                <Play className="w-4 h-4" />
                {isAr ? 'ابدأ التمرين' : 'Start Workout'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
