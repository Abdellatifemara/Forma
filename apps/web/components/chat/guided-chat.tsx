'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot, ChevronLeft, Home, Sparkles, ArrowRight, AlertTriangle,
  Loader2, CheckCircle2, XCircle, Dumbbell, Apple, Heart,
  TrendingUp, Zap, Pill, RotateCcw, Watch, Settings, BookOpen,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n';
import { getState, INITIAL_STATE } from '@/lib/chat';
import type { ChatState, ChatOption, StateAction, GptEnhancedConfig } from '@/lib/chat/types';
import { matchIntent, getSuggestions, getFollowUpSuggestions, getDidYouMean, getNoMatchHint } from '@/lib/chat/intent-matcher';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import {
  api,
  aiApi,
  exercisesApi,
  nutritionApi,
  workoutsApi,
  progressApi,
  healthMetricsApi,
  programsApi,
  userProfileApi,
  subscriptionsApi,
} from '@/lib/api';

// ─── Domain Config ─────────────────────────────────────────
const DOMAIN_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string; labelAr: string }> = {
  root:        { color: 'text-primary',     bg: 'bg-primary/8',         icon: <Sparkles className="h-4 w-4" />,    label: 'Home',        labelAr: 'الرئيسية' },
  workout:     { color: 'text-red-500',     bg: 'bg-red-500/8',         icon: <Dumbbell className="h-4 w-4" />,    label: 'Workout',     labelAr: 'التمارين' },
  nutrition:   { color: 'text-green-500',   bg: 'bg-green-500/8',       icon: <Apple className="h-4 w-4" />,       label: 'Nutrition',   labelAr: 'التغذية' },
  health:      { color: 'text-pink-500',    bg: 'bg-pink-500/8',        icon: <Heart className="h-4 w-4" />,       label: 'Health',      labelAr: 'الصحة' },
  progress:    { color: 'text-teal-500',    bg: 'bg-teal-500/8',        icon: <TrendingUp className="h-4 w-4" />,  label: 'Progress',    labelAr: 'التقدم' },
  programs:    { color: 'text-indigo-500',  bg: 'bg-indigo-500/8',      icon: <Zap className="h-4 w-4" />,         label: 'Programs',    labelAr: 'البرامج' },
  supplements: { color: 'text-amber-500',   bg: 'bg-amber-500/8',       icon: <Pill className="h-4 w-4" />,        label: 'Supplements', labelAr: 'المكملات' },
  recovery:    { color: 'text-cyan-500',    bg: 'bg-cyan-500/8',        icon: <RotateCcw className="h-4 w-4" />,   label: 'Recovery',    labelAr: 'الاستشفاء' },
  quick:       { color: 'text-orange-500',  bg: 'bg-orange-500/8',      icon: <Zap className="h-4 w-4" />,         label: 'Quick',       labelAr: 'سريع' },
  device:      { color: 'text-purple-500',  bg: 'bg-purple-500/8',      icon: <Watch className="h-4 w-4" />,       label: 'Devices',     labelAr: 'الأجهزة' },
  settings:    { color: 'text-violet-500',  bg: 'bg-violet-500/8',      icon: <Settings className="h-4 w-4" />,    label: 'Settings',    labelAr: 'الإعدادات' },
  onboarding:  { color: 'text-blue-500',    bg: 'bg-blue-500/8',        icon: <BookOpen className="h-4 w-4" />,    label: 'Setup',       labelAr: 'الإعداد' },
};

// ─── Chat History Entry ────────────────────────────────────
interface ChatEntry {
  id: string;
  type: 'bot' | 'user' | 'action' | 'confirm' | 'data';
  text: string;
  stateId?: string;
  optionId?: string;
  icon?: string;
  domain?: string;
  timestamp: number;
  success?: boolean;
}

// ─── API Result Formatter ──────────────────────────────────
function formatApiResult(endpoint: string, params: Record<string, string> | undefined, data: any, isAr: boolean): string {
  if (!data) return isAr ? 'لا توجد بيانات' : 'No data found';

  if (endpoint === '/exercises' || endpoint.startsWith('/exercises/muscle/')) {
    const items = Array.isArray(data) ? data : data?.data || data?.items || [];
    if (items.length === 0) return isAr ? 'مفيش تمارين اتلاقت' : 'No exercises found';
    const list = items.slice(0, 8).map((ex: any) =>
      `  ${isAr ? (ex.nameAr || ex.name) : ex.name}${ex.primaryMuscle ? ` (${ex.primaryMuscle})` : ''}`
    ).join('\n');
    const total = data?.total || items.length;
    return `${isAr ? `اتلاقى ${total} تمرين:` : `Found ${total} exercises:`}\n${list}${total > 8 ? `\n${isAr ? `... و ${total - 8} كمان` : `... and ${total - 8} more`}` : ''}`;
  }

  if (endpoint === '/foods' || endpoint === '/nutrition/foods') {
    const items = Array.isArray(data) ? data : data?.data || data?.items || [];
    if (items.length === 0) return isAr ? 'مفيش أكل اتلاقى' : 'No food found';
    const list = items.slice(0, 8).map((f: any) =>
      `  ${isAr ? (f.nameAr || f.name) : f.name} — ${f.caloriesPer100g || f.calories || '?'} cal`
    ).join('\n');
    const total = data?.total || items.length;
    return `${isAr ? `اتلاقى ${total} أكلة:` : `Found ${total} foods:`}\n${list}${total > 8 ? `\n${isAr ? `... و ${total - 8} كمان` : `... and ${total - 8} more`}` : ''}`;
  }

  if (endpoint === '/workouts/today') {
    if (!data || (!data.name && !data.exercises)) return isAr ? 'مفيش تمرين النهارده لسه' : 'No workout scheduled for today';
    const name = isAr ? (data.nameAr || data.name) : data.name;
    const exCount = data.exercises?.length || 0;
    return `${isAr ? 'تمرين النهارده:' : "Today's workout:"} ${name || ''}\n${isAr ? `${exCount} تمارين` : `${exCount} exercises`}`;
  }

  if (endpoint === '/workouts/history') {
    const items = Array.isArray(data) ? data : data?.data || data?.items || [];
    if (items.length === 0) return isAr ? 'مفيش تاريخ تمارين' : 'No workout history';
    return `${isAr ? `${items.length} تمرين مسجل` : `${items.length} workouts logged`}`;
  }

  if (endpoint === '/nutrition/today' || endpoint === '/nutrition/daily') {
    if (!data || !data.totalCalories) return isAr ? 'مسجلتش أي وجبات النهارده' : 'No meals logged today';
    return `${isAr ? 'النهارده:' : 'Today:'} ${data.totalCalories || 0} cal | P: ${data.totalProtein || 0}g | C: ${data.totalCarbs || 0}g | F: ${data.totalFat || 0}g`;
  }

  if (endpoint === '/health-metrics/dashboard') {
    if (!data || Object.keys(data).length === 0) return isAr ? 'مفيش بيانات صحية لسه' : 'No health data yet';
    const lines: string[] = [];
    if (data.weight) lines.push(`${isAr ? 'الوزن' : 'Weight'}: ${data.weight} kg`);
    if (data.bodyFat) lines.push(`${isAr ? 'نسبة الدهون' : 'Body Fat'}: ${data.bodyFat}%`);
    if (data.restingHR) lines.push(`${isAr ? 'نبض الراحة' : 'Resting HR'}: ${data.restingHR} bpm`);
    if (data.steps) lines.push(`${isAr ? 'الخطوات' : 'Steps'}: ${data.steps}`);
    if (data.sleepHours) lines.push(`${isAr ? 'النوم' : 'Sleep'}: ${data.sleepHours}h`);
    return lines.length > 0 ? lines.join('\n') : (isAr ? 'مفيش بيانات صحية لسه' : 'No health data yet');
  }

  if (endpoint.startsWith('/health-metrics/type/')) {
    const items = Array.isArray(data) ? data : [];
    if (items.length === 0) return isAr ? 'مفيش بيانات لسه' : 'No data recorded yet';
    const latest = items[0];
    return `${isAr ? 'آخر قراءة:' : 'Latest:'} ${latest.value} ${latest.unit || ''} (${new Date(latest.recordedAt || latest.createdAt).toLocaleDateString()})`;
  }

  if (endpoint === '/programs') {
    const items = Array.isArray(data) ? data : data?.data || data?.items || [];
    if (items.length === 0) return isAr ? 'مفيش برامج متاحة' : 'No programs available';
    const list = items.slice(0, 6).map((p: any) =>
      `  ${isAr ? (p.nameAr || p.name) : p.name}${p.level ? ` (${p.level})` : ''}`
    ).join('\n');
    return `${isAr ? `${items.length} برنامج:` : `${items.length} programs:`}\n${list}`;
  }

  if (endpoint === '/progress/weight') {
    const items = Array.isArray(data) ? data : [];
    if (items.length === 0) return isAr ? 'مفيش سجل وزن' : 'No weight history';
    const latest = items[0];
    return `${isAr ? 'آخر وزن:' : 'Latest weight:'} ${latest.weight || latest.value} kg`;
  }

  if (endpoint === '/programs/active' || endpoint === '/workouts/plans/active') {
    if (!data) return isAr ? 'مفيش برنامج نشط حالياً' : 'No active program';
    return `${isAr ? 'البرنامج النشط:' : 'Active program:'} ${isAr ? (data.nameAr || data.name) : data.name}`;
  }

  if (typeof data === 'string') return data;
  if (data.message) return data.message;
  return isAr ? 'تم' : 'Done';
}

// ─── Execute API call ──────────────────────────────────────
async function callApi(
  actionType: string,
  endpoint: string,
  params?: Record<string, string>
): Promise<any> {
  if (endpoint === '/exercises') {
    const searchParams: Record<string, string> = {};
    if (params?.muscle) searchParams.primaryMuscle = params.muscle;
    if (params?.equipment) searchParams.equipment = params.equipment;
    if (params?.difficulty) searchParams.difficulty = params.difficulty;
    if (params?.category) searchParams.category = params.category;
    searchParams.pageSize = '10';
    return exercisesApi.search(searchParams as any);
  }
  if (endpoint.startsWith('/exercises/muscle/')) {
    return exercisesApi.getByMuscle(endpoint.split('/').pop()!);
  }
  if (endpoint === '/foods') {
    const searchParams: Record<string, string> = { pageSize: '10' };
    if (params?.category) searchParams.category = params.category;
    if (params?.isEgyptian) searchParams.isEgyptian = params.isEgyptian;
    if (params?.highProtein) searchParams.highProtein = params.highProtein;
    if (params?.lowCal) searchParams.lowCal = params.lowCal;
    if (params?.brand) searchParams.brand = params.brand;
    if (params?.tags) searchParams.tags = params.tags;
    return api.get('/foods', searchParams);
  }
  if (endpoint === '/nutrition/foods') return nutritionApi.searchFoods(params?.query || '');
  if (endpoint === '/nutrition/today' || endpoint === '/nutrition/daily') return nutritionApi.getDailyLog();
  if (endpoint === '/nutrition/log') return nutritionApi.logMeal(params as any);
  if (endpoint === '/nutrition/log-water') return api.post('/nutrition/water', { ml: Number(params?.ml || 250) });
  if (endpoint === '/nutrition/water-today') return api.get('/nutrition/water/today');
  if (endpoint === '/nutrition/suggest') return api.get('/nutrition/suggestions');
  if (endpoint === '/nutrition/calculate') return api.get('/nutrition/calculate', params);
  if (endpoint === '/nutrition/set-targets') return api.post('/nutrition/targets', params);
  if (endpoint === '/nutrition/set-plan') return api.post('/nutrition/plan', params);
  if (endpoint === '/workouts/today') return workoutsApi.getTodayWorkout();
  if (endpoint === '/workouts/history') {
    const days = params?.days === 'all' ? undefined : { limit: Number(params?.days || 7) };
    return workoutsApi.getHistory(days as any);
  }
  if (endpoint === '/workouts/log') return workoutsApi.logWorkout(params as any);
  if (endpoint === '/workouts/log-rest') return api.post('/workouts/log', { type: 'rest', reason: params?.reason });
  if (endpoint === '/workouts/log-activity') return api.post('/workouts/log', { type: params?.type, duration: Number(params?.duration) });
  if (endpoint === '/workouts/create-quick') return api.post('/workouts/quick', { type: params?.type });
  if (endpoint === '/workouts/generate') return api.post('/workouts/generate', { split: params?.split, exerciseCount: Number(params?.count) });
  if (endpoint === '/workouts/current-exercises') return workoutsApi.getTodayWorkout();
  if (endpoint === '/workouts/swap-exercise') return api.post('/workouts/swap', params);
  if (endpoint === '/workouts/add-exercise') return api.post('/workouts/exercises', params);
  if (endpoint === '/workouts/rate') return api.post('/workouts/rate', { rating: Number(params?.rating) });
  if (endpoint === '/health/log' || endpoint === '/health-metrics') {
    const type = params?.type;
    const value = params?.value;
    if (!type || !value) return null;
    return healthMetricsApi.create({ type: type as any, value: Number(value), recordedAt: new Date().toISOString() } as any);
  }
  if (endpoint === '/health/recovery-score') return healthMetricsApi.getDashboard();
  if (endpoint === '/health/recovery-detail' || endpoint === '/health/recovery-history') return healthMetricsApi.getDashboard();
  if (endpoint === '/health/sleep' || endpoint === '/health/sleep/last-night') return healthMetricsApi.getByType('SLEEP_HOURS' as any, 7);
  if (endpoint === '/health/sleep/trend') return healthMetricsApi.getByType('SLEEP_HOURS' as any, 30);
  if (endpoint === '/health/heart') return healthMetricsApi.getByType('HEART_RATE_RESTING' as any, 30);
  if (endpoint === '/health/strain' || endpoint === '/health/activity/today') return healthMetricsApi.getDashboard();
  if (endpoint === '/health/calories-burned') return healthMetricsApi.getByType('CALORIES_BURNED' as any, 7);
  if (endpoint === '/health/log-injury') return userProfileApi.addInjury({ bodyPart: params?.bodyPart as any, status: 'active' } as any);
  if (endpoint === '/health/set-reminder') return api.post('/notifications/reminder', params);
  if (endpoint === '/progress/weight' || endpoint === '/health/log' && params?.type === 'WEIGHT') {
    if (actionType === 'write') return progressApi.logWeight({ weight: Number(params?.value || params?.weight) });
    return progressApi.getWeightHistory();
  }
  if (endpoint === '/profile/set-goal') return api.patch('/users/me', { fitnessGoal: params?.goal });
  if (endpoint === '/programs') return programsApi.getAll();
  if (endpoint === '/programs/active') return workoutsApi.getActivePlan();
  if (endpoint === '/programs/start') return api.post('/workouts/plans/activate', params);
  if (endpoint === '/devices/connect') return api.post('/devices/connect', params);
  if (endpoint === '/devices/my') return api.get('/devices');
  if (endpoint === '/devices/disconnect') return api.post('/devices/disconnect', params);
  if (endpoint === '/devices/sync-frequency') return api.patch('/devices/sync', params);
  if (endpoint === '/devices/set-permissions') return api.patch('/devices/permissions', params);
  if (endpoint === '/devices/delete-all-data') return api.delete('/devices/data');
  if (actionType === 'write') return api.post(endpoint, params);
  return api.get(endpoint, params);
}

// ─── GPT-Enhanced Node Execution (Premium+ only) ──────────
// Gathers context from APIs, fills prompt template, calls GPT
async function executeGptEnhanced(config: GptEnhancedConfig, isAr: boolean): Promise<string> {
  // 1. Gather context from all sources
  const context: Record<string, string> = {};

  for (const source of config.contextSources) {
    try {
      let data: any;
      switch (source.type) {
        case 'profile':
          data = await api.get('/users/me');
          break;
        case 'todayWorkout':
          data = await workoutsApi.getTodayWorkout();
          break;
        case 'workoutHistory':
          data = await workoutsApi.getHistory({ limit: 7 } as any);
          break;
        case 'nutritionToday':
          data = await nutritionApi.getDailyLog();
          break;
        case 'weightHistory':
          data = await progressApi.getWeightHistory();
          break;
        case 'healthMetrics':
          data = await healthMetricsApi.getDashboard();
          break;
        case 'activePlan':
          data = await workoutsApi.getActivePlan();
          break;
        case 'preferences':
          data = await api.get('/users/me/preferences');
          break;
        case 'injuries':
          data = await api.get('/users/me/injuries');
          break;
        case 'subscription':
          data = await subscriptionsApi.getMySubscription();
          break;
        default:
          data = null;
      }
      context[source.key] = data ? JSON.stringify(data).slice(0, 2000) : 'No data available';
    } catch {
      context[source.key] = 'No data available';
    }
  }

  // 2. Fill prompt template
  let prompt = config.promptTemplate;
  for (const [key, value] of Object.entries(context)) {
    prompt = prompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }

  // 3. Build system context with model hints for the backend pipeline
  const systemContext = [
    config.systemPrompt || (isAr
      ? 'أنت مدرب لياقة مصري محترف. أجب بالعامية المصرية. كن مختصراً وعملياً.'
      : 'You are a professional Egyptian fitness coach. Be concise and practical.'),
    `Output format: ${config.outputFormat}`,
    config.model ? `Preferred model: ${config.model}` : '',
  ].filter(Boolean).join('\n');

  // 4. Call GPT via our API
  const result = await aiApi.chat(prompt, {
    language: isAr ? 'ar' : 'en',
    context: systemContext,
    conversationHistory: [],
  });

  return result.response || (isAr ? 'معلش حصل مشكلة' : 'Something went wrong');
}

// ─── Confirmation Dialog ───────────────────────────────────
function ConfirmDialog({
  action,
  isAr,
  onConfirm,
  onCancel,
}: {
  action: StateAction;
  isAr: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const text = action.confirmText
    ? (isAr ? action.confirmText.ar : action.confirmText.en)
    : (isAr ? 'هل أنت متأكد؟' : 'Are you sure?');

  return (
    <div className="mx-4 mb-3 p-4 rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800/40 animate-scale-in">
      <div className="flex items-start gap-3 mb-4">
        <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <p className="text-sm leading-relaxed pt-1" dir={isAr ? 'rtl' : 'ltr'}>{text}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
        >
          {isAr ? 'لأ' : 'Cancel'}
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 h-10 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
        >
          {isAr ? 'أيوه، أكيد' : 'Yes, confirm'}
        </button>
      </div>
    </div>
  );
}

// ─── Typing Dots ──────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

// ─── Time-Aware Greeting ────────────────────────────────────
function getTimeGreeting(isAr: boolean): string {
  const hour = new Date().getHours();
  if (hour < 6) return isAr ? 'سهرانين يا بطل؟ ايه اللي جابك الوقت ده؟' : "Burning the midnight oil? What brings you here?";
  if (hour < 12) return isAr ? 'صباح الخير يا بطل! جاهز للتمرين النهارده؟' : "Good morning champ! Ready to train today?";
  if (hour < 17) return isAr ? 'أهلاً! ايه الخطة النهارده؟' : "Hey! What's the plan today?";
  if (hour < 21) return isAr ? 'مساء الخير! وقت التمرين ولا أكل ولا ايه؟' : "Good evening! Workout time, meal time, or something else?";
  return isAr ? 'أهلاً! قبل ما تنام خلينا نشوف تقدمك' : "Hey! Before bed, let's check your progress";
}

function getContextualChips(isAr: boolean): Array<{ label: string; stateId: string; route?: string }> {
  const hour = new Date().getHours();
  const chips: Array<{ label: string; stateId: string; route?: string }> = [];

  if (hour >= 5 && hour < 11) {
    chips.push({ label: isAr ? 'ابدأ تمرين' : 'Start workout', stateId: 'WK_TODAY', route: '/workouts' });
    chips.push({ label: isAr ? 'سجل فطار' : 'Log breakfast', stateId: 'NT_LOG_MEAL', route: '/nutrition' });
    chips.push({ label: isAr ? 'استرتش الصبح' : 'Morning stretch', stateId: 'RC_STRETCH_MORNING' });
  } else if (hour >= 11 && hour < 15) {
    chips.push({ label: isAr ? 'سجل غدا' : 'Log lunch', stateId: 'NT_LOG_MEAL', route: '/nutrition' });
    chips.push({ label: isAr ? 'ابدأ تمرين' : 'Start workout', stateId: 'WK_TODAY', route: '/workouts' });
    chips.push({ label: isAr ? 'آكل ايه؟' : 'What to eat?', stateId: 'NT_SUGGEST' });
  } else if (hour >= 15 && hour < 20) {
    chips.push({ label: isAr ? 'ابدأ تمرين' : 'Start workout', stateId: 'WK_TODAY', route: '/workouts' });
    chips.push({ label: isAr ? 'أكل قبل التمرين' : 'Pre-workout meal', stateId: 'NT_PRE_WORKOUT' });
    chips.push({ label: isAr ? 'سجل وجبة' : 'Log meal', stateId: 'NT_LOG_MEAL', route: '/nutrition' });
  } else {
    chips.push({ label: isAr ? 'سجل عشا' : 'Log dinner', stateId: 'NT_LOG_MEAL', route: '/nutrition' });
    chips.push({ label: isAr ? 'شوف تقدمي' : 'My progress', stateId: 'PR_MENU', route: '/progress' });
    chips.push({ label: isAr ? 'استرتش قبل النوم' : 'Bedtime stretch', stateId: 'RC_STRETCH_NIGHT' });
  }

  return chips;
}

// ─── Contextual Placeholder ─────────────────────────────────
function getContextualPlaceholder(domain: string, isAr: boolean): string {
  const hints: Record<string, { en: string; ar: string }> = {
    root:        { en: 'Try "start workout" or "log meal" or "change my name"', ar: 'جرب "ابدأ تمرين" أو "سجل وجبة" أو "غير اسمي"' },
    workout:     { en: 'Try "chest exercises" or "skip today" or "form check"', ar: 'جرب "تمارين صدر" أو "اسكب النهارده" أو "الفورم"' },
    nutrition:   { en: 'Try "log breakfast" or "high protein" or "pre workout meal"', ar: 'جرب "سجل فطار" أو "بروتين عالي" أو "أكل قبل التمرين"' },
    health:      { en: 'Try "sleep data" or "heart rate" or "log weight"', ar: 'جرب "بيانات النوم" أو "نبض القلب" أو "سجل الوزن"' },
    progress:    { en: 'Try "my progress" or "log weight" or "weekly check"', ar: 'جرب "تقدمي" أو "سجل الوزن" أو "تشيك أسبوعي"' },
    programs:    { en: 'Try "beginner program" or "my program" or "browse"', ar: 'جرب "برنامج مبتدئين" أو "برنامجي" أو "تصفح"' },
    supplements: { en: 'Try "creatine" or "protein powder" or "where to buy"', ar: 'جرب "كرياتين" أو "بروتين" أو "فين اشتري"' },
    recovery:    { en: 'Try "foam rolling" or "morning stretch" or "ice bath"', ar: 'جرب "فوم رولر" أو "استرتش الصبح" أو "حمام تلج"' },
    device:      { en: 'Try "apple watch" or "garmin" or "my devices"', ar: 'جرب "أبل واتش" أو "جارمين" أو "أجهزتي"' },
    settings:    { en: 'Try "change password" or "edit profile" or "subscription"', ar: 'جرب "غير الباسورد" أو "عدل البروفايل" أو "الاشتراك"' },
  };
  return (hints[domain] || hints.root)[isAr ? 'ar' : 'en'];
}

// ─── Relative Time ──────────────────────────────────────────
function timeAgo(timestamp: number): string {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return '';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return '';
}

// ─── Main Guided Chat Component ────────────────────────────
export default function GuidedChat() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const router = useRouter();

  // Restore session from sessionStorage (persists across in-app navigation)
  const restored = useRef(false);
  const [currentStateId, setCurrentStateId] = useState(() => {
    if (typeof window === 'undefined') return INITIAL_STATE;
    try { return sessionStorage.getItem('forma-chat-state') || INITIAL_STATE; } catch { return INITIAL_STATE; }
  });
  const [history, setHistory] = useState<ChatEntry[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = sessionStorage.getItem('forma-chat-history');
      if (saved) { restored.current = true; return JSON.parse(saved); }
    } catch {}
    return [];
  });
  const [stateStack, setStateStack] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = sessionStorage.getItem('forma-chat-stack');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [pendingAction, setPendingAction] = useState<{ action: StateAction; nextState: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userTier, setUserTier] = useState<'TRIAL' | 'PREMIUM' | 'PREMIUM_PLUS'>('PREMIUM');

  const [textInput, setTextInput] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ label: string; labelAr: string; stateId: string }>>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Time-aware welcome message on first load (only if no restored session)
  const [welcomed, setWelcomed] = useState(() => restored.current);

  // Persist chat state to sessionStorage on every change
  useEffect(() => {
    try {
      sessionStorage.setItem('forma-chat-state', currentStateId);
      sessionStorage.setItem('forma-chat-history', JSON.stringify(history.slice(-50))); // keep last 50 messages
      sessionStorage.setItem('forma-chat-stack', JSON.stringify(stateStack.slice(-20)));
    } catch {}
  }, [currentStateId, history, stateStack]);

  // Fetch user subscription tier
  useEffect(() => {
    subscriptionsApi.getMySubscription().then((sub: any) => {
      if (sub?.tier) setUserTier(sub.tier);
      else if (sub?.plan) setUserTier(sub.plan.toUpperCase().replace('+', '_PLUS'));
    }).catch(() => {}); // Default to PREMIUM on error
  }, []);

  // Show time-aware welcome on mount (only for new sessions)
  useEffect(() => {
    if (welcomed) return;
    setWelcomed(true);
    const greeting = getTimeGreeting(isAr);
    setHistory([{
      id: 'welcome', type: 'bot', text: greeting,
      stateId: 'ROOT', domain: 'root', timestamp: Date.now(),
    }]);
  }, [isAr, welcomed]);

  const currentState: ChatState | null = (() => {
    try { return getState(currentStateId); } catch { return getState(INITIAL_STATE); }
  })();

  useEffect(() => {
    try { getState(currentStateId); } catch { setCurrentStateId(INITIAL_STATE); }
  }, [currentStateId]);

  // Smart auto-scroll: only scroll if user is near the bottom (not reading old messages)
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); return; }
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, pendingAction, isLoading]);

  // ─── Actions ──────────────────────────────────────────
  const handleFetchAction = useCallback(async (action: StateAction) => {
    if (!action.endpoint) return;
    setIsLoading(true);
    try {
      const data = await callApi(action.type, action.endpoint, action.params);
      const text = formatApiResult(action.endpoint, action.params, data, isAr);
      setHistory(prev => [...prev, { id: `data-${Date.now()}`, type: 'data', text, timestamp: Date.now(), success: true }]);
    } catch (err: any) {
      const errorMsg = err?.message?.includes('401') || err?.message?.includes('403')
        ? (isAr ? 'سجّل دخول الأول' : 'Please log in first')
        : (isAr ? 'فشل تحميل البيانات' : 'Failed to load data');
      setHistory(prev => [...prev, { id: `data-${Date.now()}`, type: 'data', text: errorMsg, timestamp: Date.now(), success: false }]);
    } finally { setIsLoading(false); }
  }, [isAr]);

  const handleWriteAction = useCallback(async (action: StateAction) => {
    if (!action.endpoint) return;
    setIsLoading(true);
    try {
      await callApi('write', action.endpoint, action.params);
      setHistory(prev => [...prev, { id: `data-${Date.now()}`, type: 'data', text: isAr ? 'تم بنجاح' : 'Done successfully', timestamp: Date.now(), success: true }]);
    } catch (err: any) {
      const errorMsg = err?.message?.includes('401') || err?.message?.includes('403')
        ? (isAr ? 'سجّل دخول الأول' : 'Please log in first')
        : (isAr ? 'حصل خطأ' : 'Something went wrong');
      setHistory(prev => [...prev, { id: `data-${Date.now()}`, type: 'data', text: errorMsg, timestamp: Date.now(), success: false }]);
    } finally { setIsLoading(false); }
  }, [isAr]);

  const executeAction = useCallback(async (action: StateAction) => {
    if (action.type === 'navigate' && action.route) { router.push(action.route); return; }
    if ((action.type === 'fetch' || action.type === 'read') && action.endpoint) { await handleFetchAction(action); return; }
    if (action.type === 'write' && action.endpoint) { await handleWriteAction(action); return; }
  }, [router, handleFetchAction, handleWriteAction]);

  // Bot message on state change + GPT-enhanced nodes
  useEffect(() => {
    if (!currentState?.botMessage) return;
    const msg = isAr ? currentState.botMessage.ar : currentState.botMessage.en;
    const lastBot = history.filter(h => h.type === 'bot').pop();
    if (lastBot?.stateId === currentState.id) return;
    setHistory(prev => [...prev, {
      id: `bot-${Date.now()}`, type: 'bot', text: msg, stateId: currentState!.id,
      domain: currentState!.domain, timestamp: Date.now(),
    }]);

    // Regular fetch/read actions
    if (currentState.onEnter && (currentState.onEnter.type === 'fetch' || currentState.onEnter.type === 'read') && currentState.onEnter.endpoint) {
      handleFetchAction(currentState.onEnter);
    }

    // GPT-enhanced nodes (Premium+ only) — targeted AI call at leaf states
    if (currentState.gptEnhanced && userTier !== 'PREMIUM_PLUS') {
      setHistory(prev => [...prev, {
        id: `lock-${Date.now()}`, type: 'data' as const,
        text: isAr ? '🔒 الميزة دي متاحة لمشتركين Premium+ بس. رقّي اشتراكك عشان تستخدم الذكاء الاصطناعي.' : '🔒 This feature is available for Premium+ subscribers only. Upgrade to unlock AI-powered insights.',
        timestamp: Date.now(), success: false,
      }]);
    }
    if (currentState.gptEnhanced && userTier === 'PREMIUM_PLUS') {
      setIsLoading(true);
      executeGptEnhanced(currentState.gptEnhanced, isAr)
        .then(response => {
          setHistory(prev => [...prev, {
            id: `ai-${Date.now()}`, type: 'data', text: response,
            timestamp: Date.now(), success: true,
          }]);
        })
        .catch(() => {
          setHistory(prev => [...prev, {
            id: `ai-${Date.now()}`, type: 'data',
            text: isAr ? 'حصلت مشكلة في الذكاء الاصطناعي' : 'AI analysis failed — try again',
            timestamp: Date.now(), success: false,
          }]);
        })
        .finally(() => setIsLoading(false));
    }
  }, [currentStateId, isAr, handleFetchAction]);

  // ─── Navigation ──────────────────────────────────────
  const transitionTo = useCallback((nextStateId: string) => {
    setStateStack(prev => [...prev, currentStateId]);
    setCurrentStateId(nextStateId);
    setPendingAction(null);
  }, [currentStateId]);

  const handleSelect = useCallback((option: ChatOption) => {
    const label = isAr ? option.label.ar : option.label.en;
    setHistory(prev => [...prev, {
      id: `user-${Date.now()}`, type: 'user', text: label,
      optionId: option.id, icon: option.icon, timestamp: Date.now(),
    }]);
    if (option.action?.requiresConfirmation) {
      setPendingAction({ action: option.action, nextState: option.nextState });
      return;
    }
    if (option.action) executeAction(option.action);
    transitionTo(option.nextState);
  }, [isAr, executeAction, transitionTo]);

  const handleConfirm = useCallback(() => {
    if (!pendingAction) return;
    setHistory(prev => [...prev, { id: `confirm-${Date.now()}`, type: 'confirm', text: isAr ? 'تم التأكيد' : 'Confirmed', timestamp: Date.now() }]);
    executeAction(pendingAction.action);
    transitionTo(pendingAction.nextState);
  }, [pendingAction, isAr, executeAction, transitionTo]);

  const handleCancel = useCallback(() => {
    setHistory(prev => [...prev, { id: `cancel-${Date.now()}`, type: 'confirm', text: isAr ? 'تم الإلغاء' : 'Cancelled', timestamp: Date.now() }]);
    setPendingAction(null);
  }, [isAr]);

  const handleBack = useCallback(() => {
    if (currentState?.back) { setStateStack(prev => [...prev, currentStateId]); setCurrentStateId(currentState.back!); }
    else if (stateStack.length > 0) { const prev = stateStack[stateStack.length - 1]; setStateStack(s => s.slice(0, -1)); setCurrentStateId(prev); }
    setPendingAction(null);
  }, [currentState, currentStateId, stateStack]);

  const handleReset = useCallback(() => {
    setCurrentStateId(INITIAL_STATE);
    setStateStack([]);
    setPendingAction(null);
    setHistory([]);
    try {
      sessionStorage.removeItem('forma-chat-state');
      sessionStorage.removeItem('forma-chat-history');
      sessionStorage.removeItem('forma-chat-stack');
    } catch {}
  }, []);

  // Smart text input — match natural language to states
  const handleTextSubmit = useCallback(() => {
    const text = textInput.trim();
    if (!text) return;

    // Add user message to chat
    setHistory(prev => [...prev, {
      id: `user-${Date.now()}`, type: 'user', text,
      timestamp: Date.now(),
    }]);
    setTextInput('');
    setSuggestions([]);

    // Match intent
    const match = matchIntent(text, currentStateId);

    if (match) {
      // Handle special __BACK__ state
      if (match.stateId === '__BACK__') {
        handleBack();
        return;
      }

      // Show bot response + optional tip
      if (match.response) {
        const msg = isAr ? match.response.ar : match.response.en;
        setTimeout(() => {
          setHistory(prev => [...prev, {
            id: `bot-${Date.now()}`, type: 'bot', text: msg,
            stateId: match.stateId, domain: 'root', timestamp: Date.now(),
          }]);
          // Show contextual tip (if any) with a slight delay
          if (match.tip) {
            const tipMsg = isAr ? match.tip.ar : match.tip.en;
            setTimeout(() => {
              setHistory(prev => [...prev, {
                id: `tip-${Date.now()}`, type: 'bot',
                text: `💡 ${tipMsg}`,
                stateId: match.stateId, domain: 'root', timestamp: Date.now(),
              }]);
            }, 800);
          }
        }, 300);
      }

      // Auto-execute API actions when extracted params are available
      if (match.extractedParams) {
        const p = match.extractedParams;
        // Auto-log weight if value extracted
        if (p.weight && match.stateId === 'PR_LOG_WEIGHT') {
          setIsLoading(true);
          callApi('write', '/progress/weight', { value: p.weight, weight: p.weight })
            .then(() => {
              setHistory(prev => [...prev, {
                id: `data-${Date.now()}`, type: 'data',
                text: isAr ? `تم تسجيل وزنك: ${p.weight} كيلو` : `Weight logged: ${p.weight} kg`,
                timestamp: Date.now(), success: true,
              }]);
            })
            .catch(() => {
              setHistory(prev => [...prev, {
                id: `data-${Date.now()}`, type: 'data',
                text: isAr ? 'حصل خطأ في تسجيل الوزن' : 'Failed to log weight',
                timestamp: Date.now(), success: false,
              }]);
            })
            .finally(() => setIsLoading(false));
        }
        // Auto-log water if value extracted
        if (p.water_ml && match.stateId === 'NT_LOG_WATER') {
          setIsLoading(true);
          callApi('write', '/nutrition/log-water', { ml: p.water_ml })
            .then(() => {
              setHistory(prev => [...prev, {
                id: `data-${Date.now()}`, type: 'data',
                text: isAr ? `تم تسجيل ${p.water_ml} مل مية` : `Logged ${p.water_ml} ml water`,
                timestamp: Date.now(), success: true,
              }]);
            })
            .catch(() => {
              setHistory(prev => [...prev, {
                id: `data-${Date.now()}`, type: 'data',
                text: isAr ? 'حصل خطأ في تسجيل المية' : 'Failed to log water',
                timestamp: Date.now(), success: false,
              }]);
            })
            .finally(() => setIsLoading(false));
        }
      }

      // Navigate if there's a route
      if (match.action?.route) {
        setTimeout(() => router.push(match.action!.route), 600);
      }

      // Transition to matched state (with safety check)
      try {
        getState(match.stateId); // verify it exists
        setTimeout(() => transitionTo(match.stateId), 400);
      } catch {
        // State doesn't exist, just show the response
      }
    } else {
      // No match — try "did you mean?" then domain-aware fallback
      const didYouMean = getDidYouMean(text, 2);
      const currentDomain = currentState?.domain || 'root';

      if (didYouMean.length > 0) {
        // Show "did you mean?" with clickable suggestions
        const dymLabels = didYouMean.map(d => `"${isAr ? d.labelAr : d.label}"`).join(isAr ? ' أو ' : ' or ');
        const fallbackMsg = isAr
          ? `مش فاهم تمام. قصدك ${dymLabels}؟`
          : `I didn't quite get that. Did you mean ${dymLabels}?`;

        setTimeout(() => {
          setHistory(prev => [...prev, {
            id: `bot-${Date.now()}`, type: 'bot',
            text: fallbackMsg,
            stateId: currentStateId, domain: currentDomain, timestamp: Date.now(),
          }]);
        }, 300);
      } else {
        const smartHint = getNoMatchHint(currentStateId, isAr);
        const fallbackText = isAr
          ? `مش فاهم تمام. ${smartHint}`
          : `I didn't quite get that. ${smartHint}`;

        setTimeout(() => {
          setHistory(prev => [...prev, {
            id: `bot-${Date.now()}`, type: 'bot',
            text: fallbackText,
            stateId: currentStateId, domain: currentDomain, timestamp: Date.now(),
          }]);
        }, 300);
      }
    }
  }, [textInput, currentStateId, isAr, router, transitionTo, handleBack]);

  // Update suggestions as user types
  useEffect(() => {
    if (textInput.trim().length >= 2) {
      setSuggestions(getSuggestions(textInput, 3));
    } else {
      setSuggestions([]);
    }
  }, [textInput]);

  if (!currentState) return null;

  const domain = DOMAIN_CONFIG[currentState.domain] || DOMAIN_CONFIG.root;
  const isRoot = currentStateId === INITIAL_STATE;
  const depth = stateStack.length;

  // Filter options based on user tier and conditions
  const filteredOptions = currentState.options.filter((opt) => {
    if (!opt.condition) return true;
    if (opt.condition.type === 'tier') {
      if (opt.condition.tier === 'PREMIUM_PLUS' && userTier !== 'PREMIUM_PLUS') return false;
      if (opt.condition.tier === 'PREMIUM' && userTier === 'TRIAL') return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-[calc(100dvh-180px)] min-h-[400px] max-h-[700px] rounded-2xl border border-border/60 bg-white dark:bg-card overflow-hidden shadow-card" dir={isAr ? 'rtl' : 'ltr'}>

      {/* ─── Header ─── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 bg-white dark:bg-card">
        <div className={`h-10 w-10 rounded-2xl ${domain.bg} flex items-center justify-center ${domain.color}`}>
          {domain.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-sm">{t.chat?.title || 'AI Coach'}</h1>
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
          </div>
          {!isRoot && (
            <div className="flex items-center gap-1 mt-0.5">
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-[18px] border-0 ${domain.bg} ${domain.color} font-medium`}>
                {isAr ? domain.labelAr : domain.label}
              </Badge>
            </div>
          )}
          {isRoot && (
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isAr ? 'اختار إيه تحب تعمل' : 'What would you like to do?'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!isRoot && (
            <button
              onClick={handleBack}
              className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ChevronLeft className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          )}
          {depth > 1 && (
            <button
              onClick={handleReset}
              className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
            >
              <Home className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ─── Breadcrumb (only when deep) ─── */}
      {depth > 1 && (
        <div className="px-4 py-1.5 border-b border-border/40 bg-muted/30">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground overflow-x-auto no-scrollbar">
            <button onClick={handleReset} className="hover:text-foreground transition-colors flex-shrink-0">
              {isAr ? 'الرئيسية' : 'Home'}
            </button>
            {stateStack.slice(-2).map((sid, i) => {
              try {
                const s = getState(sid);
                const label = isAr ? s.text.ar : s.text.en;
                return (
                  <span key={`${sid}-${i}`} className="flex items-center gap-1.5 flex-shrink-0">
                    <ChevronRight className={`h-2.5 w-2.5 ${isAr ? 'rotate-180' : ''}`} />
                    <span className="truncate max-w-[80px]">{label}</span>
                  </span>
                );
              } catch { return null; }
            })}
            <span className="flex items-center gap-1.5 flex-shrink-0">
              <ChevronRight className={`h-2.5 w-2.5 ${isAr ? 'rotate-180' : ''}`} />
              <span className="text-foreground font-medium truncate max-w-[100px]">
                {isAr ? currentState.text.ar : currentState.text.en}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* ─── Chat Messages ─── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {history.map((entry, idx) => {
            if (entry.type === 'bot') {
              return (
                <div key={entry.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(idx * 30, 150)}ms` }}>
                  <div className="flex items-start gap-2.5">
                    <div className={`h-7 w-7 rounded-xl ${DOMAIN_CONFIG[entry.domain || 'root']?.bg || 'bg-primary/8'} flex items-center justify-center flex-shrink-0 mt-0.5 ${DOMAIN_CONFIG[entry.domain || 'root']?.color || 'text-primary'}`}>
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className="bg-muted/60 rounded-2xl rounded-tl-md px-3.5 py-2.5 max-w-[85%]">
                      <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{entry.text}</p>
                      {timeAgo(entry.timestamp) && (
                        <p className="text-[10px] text-muted-foreground/50 mt-1">{timeAgo(entry.timestamp)}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            if (entry.type === 'user') {
              return (
                <div key={entry.id} className="flex justify-end animate-fade-up">
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-md px-3.5 py-2.5 max-w-[80%]">
                    <p className="text-[13px] leading-relaxed">
                      {entry.icon && <span className="me-1">{entry.icon}</span>}
                      {entry.text}
                    </p>
                  </div>
                </div>
              );
            }

            if (entry.type === 'data') {
              return (
                <div key={entry.id} className="animate-fade-up">
                  <div className="flex items-start gap-2.5">
                    <div className={`h-7 w-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      entry.success ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}>
                      {entry.success ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    </div>
                    <div className={`rounded-2xl rounded-tl-md px-3.5 py-2.5 max-w-[85%] ${
                      entry.success
                        ? 'bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/40'
                        : 'bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40'
                    }`}>
                      <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{entry.text}</p>
                    </div>
                  </div>
                </div>
              );
            }

            if (entry.type === 'confirm') {
              return (
                <div key={entry.id} className="flex justify-center py-1">
                  <span className="text-[11px] text-muted-foreground bg-muted/60 px-3 py-1 rounded-full">
                    {entry.text}
                  </span>
                </div>
              );
            }

            return null;
          })}

          {isLoading && (
            <div className="flex items-start gap-2.5 animate-fade-up">
              <div className={`h-7 w-7 rounded-xl ${domain.bg} flex items-center justify-center flex-shrink-0 ${domain.color}`}>
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="bg-muted/60 rounded-2xl rounded-tl-md">
                <TypingDots />
              </div>
            </div>
          )}

          {/* Follow-up suggestions after successful actions */}
          {!isLoading && !pendingAction && history.length > 2 && (() => {
            const lastEntry = history[history.length - 1];
            if (lastEntry?.type === 'data' && lastEntry.success) {
              const followUps = getFollowUpSuggestions(currentStateId, isAr);
              if (followUps.length === 0) return null;
              return (
                <div className="flex flex-wrap gap-1.5 mt-1 animate-fade-up">
                  {followUps.map((fu, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setHistory(prev => [...prev, {
                          id: `user-${Date.now()}`, type: 'user', text: fu.label, timestamp: Date.now(),
                        }]);
                        try {
                          getState(fu.stateId);
                          transitionTo(fu.stateId);
                        } catch {}
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-full border border-primary/20 text-primary hover:bg-primary/8 transition-colors"
                    >
                      {fu.label}
                    </button>
                  ))}
                </div>
              );
            }
            return null;
          })()}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ─── Confirmation Dialog ─── */}
      {pendingAction && (
        <ConfirmDialog action={pendingAction.action} isAr={isAr} onConfirm={handleConfirm} onCancel={handleCancel} />
      )}

      {/* ─── Contextual Quick Actions (Root only) ─── */}
      {isRoot && !pendingAction && history.length <= 2 && (
        <div className="border-t border-border/60 bg-gradient-to-b from-primary/5 to-transparent px-3 py-2">
          <p className="text-[11px] text-muted-foreground mb-1.5">{isAr ? 'إجراءات سريعة' : 'Quick actions'}</p>
          <div className="flex flex-wrap gap-1.5">
            {getContextualChips(isAr).map((chip, i) => (
              <button
                key={i}
                onClick={() => {
                  setHistory(prev => [...prev, {
                    id: `user-${Date.now()}`, type: 'user', text: chip.label, timestamp: Date.now(),
                  }]);
                  try {
                    getState(chip.stateId);
                    transitionTo(chip.stateId);
                  } catch {}
                  if (chip.route) setTimeout(() => router.push(chip.route!), 300);
                }}
                className="text-[12px] px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 active:scale-95 transition-all"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Options Panel ─── */}
      {!pendingAction && filteredOptions.length > 0 && (
        <div className="border-t border-border/60 bg-muted/20 dark:bg-card">
          <div className="p-3">
            {/* Root level: 2-column grid of cards */}
            {isRoot ? (
              <div className="grid grid-cols-2 gap-2">
                {filteredOptions.map((option) => {
                  const label = isAr ? option.label.ar : option.label.en;
                  const optDomain = DOMAIN_CONFIG[option.nextState?.split('_')[0]?.toLowerCase()] || DOMAIN_CONFIG.root;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelect(option)}
                      disabled={isLoading}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-card border border-border/60 hover:border-primary/30 hover:shadow-sm active:scale-[0.98] transition-all duration-150 disabled:opacity-50 text-start"
                    >
                      <div className={`h-9 w-9 rounded-xl ${optDomain.bg} flex items-center justify-center flex-shrink-0 ${optDomain.color}`}>
                        {option.icon ? <span className="text-base">{option.icon}</span> : optDomain.icon}
                      </div>
                      <span className="text-[13px] font-medium leading-tight line-clamp-2">{label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Deeper levels: clean list */
              <div className="space-y-1 max-h-[220px] overflow-y-auto no-scrollbar">
                {filteredOptions.map((option) => {
                  const label = isAr ? option.label.ar : option.label.en;
                  const isBack = option.nextState === 'ROOT' || label.includes('Back') || label.includes('رجوع');

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelect(option)}
                      disabled={isLoading}
                      className={`
                        w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-150
                        disabled:opacity-50 disabled:cursor-not-allowed text-start
                        ${isBack
                          ? 'text-muted-foreground hover:bg-muted/50'
                          : 'hover:bg-white dark:hover:bg-muted/50 hover:shadow-sm active:scale-[0.98]'
                        }
                      `}
                    >
                      {option.icon && <span className="text-base flex-shrink-0">{option.icon}</span>}
                      <span className={`text-[13px] flex-1 ${isBack ? '' : 'font-medium'}`}>{label}</span>
                      {option.condition?.type === 'tier' && option.condition.tier === 'PREMIUM_PLUS' && (
                        <Sparkles className="h-3 w-3 text-amber-500 flex-shrink-0" />
                      )}
                      {!isBack && (
                        <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0 ${isAr ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Smart Text Input ─── */}
      <div className="border-t border-border/60 bg-white dark:bg-card">
        {/* Autocomplete suggestions */}
        {suggestions.length > 0 && (
          <div className="px-3 pt-2 flex flex-wrap gap-1.5">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setTextInput('');
                  setSuggestions([]);
                  // Simulate typing and submitting
                  setHistory(prev => [...prev, {
                    id: `user-${Date.now()}`, type: 'user',
                    text: isAr ? s.labelAr : s.label,
                    timestamp: Date.now(),
                  }]);
                  try {
                    getState(s.stateId);
                    const match = matchIntent(isAr ? s.labelAr : s.label, currentStateId);
                    if (match?.response) {
                      setTimeout(() => {
                        setHistory(prev => [...prev, {
                          id: `bot-${Date.now()}`, type: 'bot',
                          text: isAr ? match.response!.ar : match.response!.en,
                          stateId: s.stateId, domain: 'root', timestamp: Date.now(),
                        }]);
                      }, 200);
                    }
                    if (match?.action?.route) {
                      setTimeout(() => router.push(match.action!.route), 500);
                    }
                    setTimeout(() => transitionTo(s.stateId), 300);
                  } catch {}
                }}
                className="text-[11px] px-2.5 py-1 rounded-full bg-primary/8 text-primary hover:bg-primary/15 transition-colors"
              >
                {isAr ? s.labelAr : s.label}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 p-3">
          <input
            ref={inputRef}
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleTextSubmit(); }}
            placeholder={getContextualPlaceholder(currentState?.domain || 'root', isAr)}
            className="flex-1 bg-muted/50 border border-border/50 rounded-xl px-3.5 py-2.5 text-[13px] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
            dir={isAr ? 'rtl' : 'ltr'}
          />
          <button
            onClick={handleTextSubmit}
            disabled={!textInput.trim() || isLoading}
            className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <Send className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
