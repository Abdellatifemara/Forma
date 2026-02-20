'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, ChevronLeft, Home, Sparkles, ArrowRight, AlertTriangle, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import { getState, INITIAL_STATE } from '@/lib/chat';
import type { ChatState, ChatOption, StateAction } from '@/lib/chat/types';
import { useRouter } from 'next/navigation';
import {
  api,
  exercisesApi,
  nutritionApi,
  workoutsApi,
  progressApi,
  healthMetricsApi,
  programsApi,
  userProfileApi,
} from '@/lib/api';

// ─── Domain Colors ─────────────────────────────────────────
const DOMAIN_COLORS: Record<string, string> = {
  root: 'from-blue-500 to-blue-600',
  workout: 'from-red-500 to-orange-500',
  nutrition: 'from-green-500 to-emerald-500',
  health: 'from-pink-500 to-rose-500',
  progress: 'from-teal-500 to-cyan-500',
  programs: 'from-indigo-500 to-violet-500',
  supplements: 'from-amber-500 to-yellow-500',
  recovery: 'from-cyan-500 to-sky-500',
  quick: 'from-orange-500 to-amber-500',
  device: 'from-purple-500 to-fuchsia-500',
  settings: 'from-violet-500 to-purple-500',
  onboarding: 'from-blue-500 to-indigo-500',
};

const DOMAIN_BG: Record<string, string> = {
  root: 'bg-blue-500/10 border-blue-500/20',
  workout: 'bg-red-500/10 border-red-500/20',
  nutrition: 'bg-green-500/10 border-green-500/20',
  health: 'bg-pink-500/10 border-pink-500/20',
  progress: 'bg-teal-500/10 border-teal-500/20',
  programs: 'bg-indigo-500/10 border-indigo-500/20',
  supplements: 'bg-amber-500/10 border-amber-500/20',
  recovery: 'bg-cyan-500/10 border-cyan-500/20',
  quick: 'bg-orange-500/10 border-orange-500/20',
  device: 'bg-purple-500/10 border-purple-500/20',
  settings: 'bg-violet-500/10 border-violet-500/20',
  onboarding: 'bg-blue-500/10 border-blue-500/20',
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

  // Exercise results
  if (endpoint === '/exercises' || endpoint.startsWith('/exercises/muscle/')) {
    const items = Array.isArray(data) ? data : data?.data || data?.items || [];
    if (items.length === 0) return isAr ? 'مفيش تمارين اتلاقت' : 'No exercises found';
    const list = items.slice(0, 8).map((ex: any) =>
      `• ${isAr ? (ex.nameAr || ex.name) : ex.name}${ex.primaryMuscle ? ` (${ex.primaryMuscle})` : ''}`
    ).join('\n');
    const total = data?.total || items.length;
    return `${isAr ? `اتلاقى ${total} تمرين:` : `Found ${total} exercises:`}\n${list}${total > 8 ? `\n${isAr ? `... و ${total - 8} كمان` : `... and ${total - 8} more`}` : ''}`;
  }

  // Food results
  if (endpoint === '/foods' || endpoint === '/nutrition/foods') {
    const items = Array.isArray(data) ? data : data?.data || data?.items || [];
    if (items.length === 0) return isAr ? 'مفيش أكل اتلاقى' : 'No food found';
    const list = items.slice(0, 8).map((f: any) =>
      `• ${isAr ? (f.nameAr || f.name) : f.name} — ${f.caloriesPer100g || f.calories || '?'} cal`
    ).join('\n');
    const total = data?.total || items.length;
    return `${isAr ? `اتلاقى ${total} أكلة:` : `Found ${total} foods:`}\n${list}${total > 8 ? `\n${isAr ? `... و ${total - 8} كمان` : `... and ${total - 8} more`}` : ''}`;
  }

  // Today's workout
  if (endpoint === '/workouts/today') {
    if (!data || (!data.name && !data.exercises)) return isAr ? 'مفيش تمرين النهارده لسه' : 'No workout scheduled for today';
    const name = isAr ? (data.nameAr || data.name) : data.name;
    const exCount = data.exercises?.length || 0;
    return `${isAr ? 'تمرين النهارده:' : "Today's workout:"} ${name || ''}\n${isAr ? `${exCount} تمارين` : `${exCount} exercises`}`;
  }

  // Workout history
  if (endpoint === '/workouts/history') {
    const items = Array.isArray(data) ? data : data?.data || data?.items || [];
    if (items.length === 0) return isAr ? 'مفيش تاريخ تمارين' : 'No workout history';
    return `${isAr ? `${items.length} تمرين مسجل` : `${items.length} workouts logged`}`;
  }

  // Daily nutrition
  if (endpoint === '/nutrition/today' || endpoint === '/nutrition/daily') {
    if (!data || !data.totalCalories) return isAr ? 'مسجلتش أي وجبات النهارده' : 'No meals logged today';
    return `${isAr ? 'النهارده:' : 'Today:'} ${data.totalCalories || 0} cal | P: ${data.totalProtein || 0}g | C: ${data.totalCarbs || 0}g | F: ${data.totalFat || 0}g`;
  }

  // Health metrics dashboard
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

  // Health metrics by type
  if (endpoint.startsWith('/health-metrics/type/')) {
    const items = Array.isArray(data) ? data : [];
    if (items.length === 0) return isAr ? 'مفيش بيانات لسه' : 'No data recorded yet';
    const latest = items[0];
    return `${isAr ? 'آخر قراءة:' : 'Latest:'} ${latest.value} ${latest.unit || ''} (${new Date(latest.recordedAt || latest.createdAt).toLocaleDateString()})`;
  }

  // Programs
  if (endpoint === '/programs') {
    const items = Array.isArray(data) ? data : data?.data || data?.items || [];
    if (items.length === 0) return isAr ? 'مفيش برامج متاحة' : 'No programs available';
    const list = items.slice(0, 6).map((p: any) =>
      `• ${isAr ? (p.nameAr || p.name) : p.name}${p.level ? ` (${p.level})` : ''}`
    ).join('\n');
    return `${isAr ? `${items.length} برنامج:` : `${items.length} programs:`}\n${list}`;
  }

  // Weight history
  if (endpoint === '/progress/weight') {
    const items = Array.isArray(data) ? data : [];
    if (items.length === 0) return isAr ? 'مفيش سجل وزن' : 'No weight history';
    const latest = items[0];
    return `${isAr ? 'آخر وزن:' : 'Latest weight:'} ${latest.weight || latest.value} kg`;
  }

  // Active program
  if (endpoint === '/programs/active' || endpoint === '/workouts/plans/active') {
    if (!data) return isAr ? 'مفيش برنامج نشط حالياً' : 'No active program';
    return `${isAr ? 'البرنامج النشط:' : 'Active program:'} ${isAr ? (data.nameAr || data.name) : data.name}`;
  }

  // Generic fallback
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
  // Map state machine endpoints to real API calls

  // ── EXERCISES ──
  if (endpoint === '/exercises') {
    const searchParams: Record<string, string> = {};
    if (params?.muscle) searchParams.primaryMuscle = params.muscle;
    if (params?.equipment) searchParams.equipment = params.equipment;
    if (params?.difficulty) searchParams.difficulty = params.difficulty;
    if (params?.category) searchParams.category = params.category;
    searchParams.limit = '10';
    return exercisesApi.search(searchParams as any);
  }

  if (endpoint.startsWith('/exercises/muscle/')) {
    const muscle = endpoint.split('/').pop()!;
    return exercisesApi.getByMuscle(muscle);
  }

  // ── FOODS ──
  if (endpoint === '/foods') {
    // Use the generic api.get since foods endpoint accepts various params
    const searchParams: Record<string, string> = { limit: '10' };
    if (params?.category) searchParams.category = params.category;
    if (params?.isEgyptian) searchParams.isEgyptian = params.isEgyptian;
    if (params?.highProtein) searchParams.highProtein = params.highProtein;
    if (params?.lowCal) searchParams.lowCal = params.lowCal;
    if (params?.brand) searchParams.brand = params.brand;
    if (params?.tags) searchParams.tags = params.tags;
    return api.get('/foods', searchParams);
  }

  if (endpoint === '/nutrition/foods') {
    return nutritionApi.searchFoods(params?.query || '');
  }

  // ── NUTRITION ──
  if (endpoint === '/nutrition/today' || endpoint === '/nutrition/daily') {
    return nutritionApi.getDailyLog();
  }

  if (endpoint === '/nutrition/log') {
    return nutritionApi.logMeal(params as any);
  }

  if (endpoint === '/nutrition/log-water') {
    return api.post('/nutrition/water', { ml: Number(params?.ml || 250) });
  }

  if (endpoint === '/nutrition/water-today') {
    return api.get('/nutrition/water/today');
  }

  if (endpoint === '/nutrition/suggest') {
    return api.get('/nutrition/suggestions');
  }

  if (endpoint === '/nutrition/calculate') {
    return api.get('/nutrition/calculate', params);
  }

  if (endpoint === '/nutrition/set-targets') {
    return api.post('/nutrition/targets', params);
  }

  if (endpoint === '/nutrition/set-plan') {
    return api.post('/nutrition/plan', params);
  }

  // ── WORKOUTS ──
  if (endpoint === '/workouts/today') {
    return workoutsApi.getTodayWorkout();
  }

  if (endpoint === '/workouts/history') {
    const days = params?.days === 'all' ? undefined : { limit: Number(params?.days || 7) };
    return workoutsApi.getHistory(days as any);
  }

  if (endpoint === '/workouts/log') {
    return workoutsApi.logWorkout(params as any);
  }

  if (endpoint === '/workouts/log-rest') {
    return api.post('/workouts/log', { type: 'rest', reason: params?.reason });
  }

  if (endpoint === '/workouts/log-activity') {
    return api.post('/workouts/log', { type: params?.type, duration: Number(params?.duration) });
  }

  if (endpoint === '/workouts/create-quick') {
    return api.post('/workouts/quick', { type: params?.type });
  }

  if (endpoint === '/workouts/generate') {
    return api.post('/workouts/generate', { split: params?.split, exerciseCount: Number(params?.count) });
  }

  if (endpoint === '/workouts/current-exercises') {
    return workoutsApi.getTodayWorkout();
  }

  if (endpoint === '/workouts/swap-exercise') {
    return api.post('/workouts/swap', params);
  }

  if (endpoint === '/workouts/add-exercise') {
    return api.post('/workouts/exercises', params);
  }

  if (endpoint === '/workouts/rate') {
    return api.post('/workouts/rate', { rating: Number(params?.rating) });
  }

  // ── HEALTH ──
  if (endpoint === '/health/log' || endpoint === '/health-metrics') {
    const type = params?.type;
    const value = params?.value;
    if (!type || !value) return null;
    return healthMetricsApi.create({ type: type as any, value: Number(value), recordedAt: new Date().toISOString() } as any);
  }

  if (endpoint === '/health/recovery-score') {
    return healthMetricsApi.getDashboard();
  }

  if (endpoint === '/health/recovery-detail' || endpoint === '/health/recovery-history') {
    return healthMetricsApi.getDashboard();
  }

  if (endpoint === '/health/sleep' || endpoint === '/health/sleep/last-night') {
    return healthMetricsApi.getByType('SLEEP_HOURS' as any, 7);
  }

  if (endpoint === '/health/sleep/trend') {
    return healthMetricsApi.getByType('SLEEP_HOURS' as any, 30);
  }

  if (endpoint === '/health/heart') {
    return healthMetricsApi.getByType('HEART_RATE_RESTING' as any, 30);
  }

  if (endpoint === '/health/strain' || endpoint === '/health/activity/today') {
    return healthMetricsApi.getDashboard();
  }

  if (endpoint === '/health/calories-burned') {
    return healthMetricsApi.getByType('CALORIES_BURNED' as any, 7);
  }

  if (endpoint === '/health/log-injury') {
    return userProfileApi.addInjury({ bodyPart: params?.bodyPart as any, status: 'active' } as any);
  }

  if (endpoint === '/health/set-reminder') {
    return api.post('/notifications/reminder', params);
  }

  // ── PROGRESS ──
  if (endpoint === '/progress/weight' || endpoint === '/health/log' && params?.type === 'WEIGHT') {
    if (actionType === 'write') {
      return progressApi.logWeight({ weight: Number(params?.value || params?.weight) });
    }
    return progressApi.getWeightHistory();
  }

  if (endpoint === '/profile/set-goal') {
    return api.patch('/users/me', { fitnessGoal: params?.goal });
  }

  // ── PROGRAMS ──
  if (endpoint === '/programs') {
    return programsApi.getAll();
  }

  if (endpoint === '/programs/active') {
    return workoutsApi.getActivePlan();
  }

  if (endpoint === '/programs/start') {
    return api.post('/workouts/plans/activate', params);
  }

  // ── DEVICES ──
  if (endpoint === '/devices/connect') {
    return api.post('/devices/connect', params);
  }

  if (endpoint === '/devices/my') {
    return api.get('/devices');
  }

  if (endpoint === '/devices/disconnect') {
    return api.post('/devices/disconnect', params);
  }

  if (endpoint === '/devices/sync-frequency') {
    return api.patch('/devices/sync', params);
  }

  if (endpoint === '/devices/set-permissions') {
    return api.patch('/devices/permissions', params);
  }

  if (endpoint === '/devices/delete-all-data') {
    return api.delete('/devices/data');
  }

  // ── GENERIC FALLBACK ──
  if (actionType === 'write') {
    return api.post(endpoint, params);
  }
  return api.get(endpoint, params);
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
    <div className="mx-2 p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-start gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm" dir={isAr ? 'rtl' : 'ltr'}>{text}</p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onCancel} className="flex-1 text-xs h-8">
          {isAr ? 'لأ' : 'Cancel'}
        </Button>
        <Button size="sm" onClick={onConfirm} className="flex-1 text-xs h-8 bg-amber-500 hover:bg-amber-600 text-white">
          {isAr ? 'أيوه، أكيد' : 'Yes, confirm'}
        </Button>
      </div>
    </div>
  );
}

// ─── Option Button ─────────────────────────────────────────
function OptionButton({
  option,
  isAr,
  onSelect,
  disabled,
}: {
  option: ChatOption;
  isAr: boolean;
  onSelect: () => void;
  disabled: boolean;
}) {
  const label = isAr ? option.label.ar : option.label.en;
  const isBack = option.nextState === 'ROOT' || label.includes('Back') || label.includes('رجوع');

  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`
        w-full text-left px-3 py-2.5 rounded-xl border transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isBack
          ? 'border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-muted/50 text-muted-foreground'
          : 'border-border hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]'
        }
      `}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-2">
        {option.icon && <span className="text-base flex-shrink-0">{option.icon}</span>}
        <span className="text-sm font-medium flex-1">{label}</span>
        <ArrowRight className={`h-3.5 w-3.5 text-muted-foreground flex-shrink-0 ${isAr ? 'rotate-180' : ''}`} />
      </div>
    </button>
  );
}

// ─── Main Guided Chat Component ────────────────────────────
export default function GuidedChat() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const router = useRouter();

  const [currentStateId, setCurrentStateId] = useState(INITIAL_STATE);
  const [history, setHistory] = useState<ChatEntry[]>([]);
  const [stateStack, setStateStack] = useState<string[]>([]);
  const [pendingAction, setPendingAction] = useState<{ action: StateAction; nextState: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get current state
  let currentState: ChatState | null = null;
  try {
    currentState = getState(currentStateId);
  } catch {
    currentState = getState(INITIAL_STATE);
    setCurrentStateId(INITIAL_STATE);
  }

  // Add bot message on state change
  useEffect(() => {
    if (!currentState?.botMessage) return;

    const msg = isAr ? currentState.botMessage.ar : currentState.botMessage.en;
    const lastBot = history.filter(h => h.type === 'bot').pop();
    if (lastBot?.stateId === currentState.id) return;

    setHistory(prev => [...prev, {
      id: `bot-${Date.now()}`,
      type: 'bot',
      text: msg,
      stateId: currentState!.id,
      domain: currentState!.domain,
      timestamp: Date.now(),
    }]);

    // Execute onEnter fetch action
    if (currentState.onEnter && (currentState.onEnter.type === 'fetch' || currentState.onEnter.type === 'read') && currentState.onEnter.endpoint) {
      handleFetchAction(currentState.onEnter);
    }
  }, [currentStateId]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, pendingAction, isLoading]);

  // Fetch data and add result to chat
  const handleFetchAction = useCallback(async (action: StateAction) => {
    if (!action.endpoint) return;

    setIsLoading(true);
    try {
      const data = await callApi(action.type, action.endpoint, action.params);
      const text = formatApiResult(action.endpoint, action.params, data, isAr);
      setHistory(prev => [...prev, {
        id: `data-${Date.now()}`,
        type: 'data',
        text,
        timestamp: Date.now(),
        success: true,
      }]);
    } catch (err: any) {
      const errorMsg = err?.message?.includes('401') || err?.message?.includes('403')
        ? (isAr ? 'سجّل دخول الأول' : 'Please log in first')
        : (isAr ? 'فشل تحميل البيانات' : 'Failed to load data');
      setHistory(prev => [...prev, {
        id: `data-${Date.now()}`,
        type: 'data',
        text: errorMsg,
        timestamp: Date.now(),
        success: false,
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [isAr]);

  // Execute a write action and add result to chat
  const handleWriteAction = useCallback(async (action: StateAction) => {
    if (!action.endpoint) return;

    setIsLoading(true);
    try {
      const data = await callApi('write', action.endpoint, action.params);
      const text = formatApiResult(action.endpoint, action.params, data, isAr);
      setHistory(prev => [...prev, {
        id: `data-${Date.now()}`,
        type: 'data',
        text: isAr ? 'تم بنجاح ✅' : 'Done ✅',
        timestamp: Date.now(),
        success: true,
      }]);
    } catch (err: any) {
      const errorMsg = err?.message?.includes('401') || err?.message?.includes('403')
        ? (isAr ? 'سجّل دخول الأول' : 'Please log in first')
        : (isAr ? 'حصل خطأ' : 'Something went wrong');
      setHistory(prev => [...prev, {
        id: `data-${Date.now()}`,
        type: 'data',
        text: errorMsg,
        timestamp: Date.now(),
        success: false,
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [isAr]);

  // Execute an action
  const executeAction = useCallback(async (action: StateAction) => {
    if (action.type === 'navigate' && action.route) {
      router.push(action.route);
      return;
    }

    if ((action.type === 'fetch' || action.type === 'read') && action.endpoint) {
      await handleFetchAction(action);
      return;
    }

    if (action.type === 'write' && action.endpoint) {
      await handleWriteAction(action);
      return;
    }
  }, [router, handleFetchAction, handleWriteAction]);

  // Handle option selection
  const handleSelect = useCallback((option: ChatOption) => {
    const label = isAr ? option.label.ar : option.label.en;
    setHistory(prev => [...prev, {
      id: `user-${Date.now()}`,
      type: 'user',
      text: label,
      optionId: option.id,
      icon: option.icon,
      timestamp: Date.now(),
    }]);

    // Check if action needs confirmation
    if (option.action?.requiresConfirmation) {
      setPendingAction({ action: option.action, nextState: option.nextState });
      return;
    }

    // Execute action if present
    if (option.action) {
      executeAction(option.action);
    }

    // Transition to next state
    transitionTo(option.nextState);
  }, [isAr, executeAction]);

  // Transition to a new state
  const transitionTo = useCallback((nextStateId: string) => {
    setStateStack(prev => [...prev, currentStateId]);
    setCurrentStateId(nextStateId);
    setPendingAction(null);
  }, [currentStateId]);

  // Confirm a pending action
  const handleConfirm = useCallback(() => {
    if (!pendingAction) return;

    setHistory(prev => [...prev, {
      id: `confirm-${Date.now()}`,
      type: 'confirm',
      text: isAr ? 'تم التأكيد ✅' : 'Confirmed ✅',
      timestamp: Date.now(),
    }]);

    executeAction(pendingAction.action);
    transitionTo(pendingAction.nextState);
  }, [pendingAction, isAr, executeAction, transitionTo]);

  // Cancel pending action
  const handleCancel = useCallback(() => {
    setHistory(prev => [...prev, {
      id: `cancel-${Date.now()}`,
      type: 'confirm',
      text: isAr ? 'تم الإلغاء ❌' : 'Cancelled ❌',
      timestamp: Date.now(),
    }]);
    setPendingAction(null);
  }, [isAr]);

  // Go back
  const handleBack = useCallback(() => {
    if (currentState?.back) {
      setStateStack(prev => [...prev, currentStateId]);
      setCurrentStateId(currentState.back!);
    } else if (stateStack.length > 0) {
      const prev = stateStack[stateStack.length - 1];
      setStateStack(s => s.slice(0, -1));
      setCurrentStateId(prev);
    }
    setPendingAction(null);
  }, [currentState, currentStateId, stateStack]);

  // Reset to root
  const handleReset = useCallback(() => {
    setCurrentStateId(INITIAL_STATE);
    setStateStack([]);
    setPendingAction(null);
    setHistory([]);
  }, []);

  if (!currentState) return null;

  const domainColor = DOMAIN_COLORS[currentState.domain] || DOMAIN_COLORS.root;
  const domainBg = DOMAIN_BG[currentState.domain] || DOMAIN_BG.root;
  const stateTitle = isAr ? currentState.text.ar : currentState.text.en;

  return (
    <div className="flex flex-col h-[600px] max-h-[80vh] border rounded-xl bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-muted/30">
        <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${domainColor} flex items-center justify-center`}>
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-sm truncate">{t.chat?.title || 'AI Coach'}</h1>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${domainBg}`}>
              {currentState.domain}
            </Badge>
            <span className="text-[10px] text-muted-foreground truncate">{stateTitle}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {currentStateId !== INITIAL_STATE && (
            <Button variant="ghost" size="sm" onClick={handleBack} className="h-8 w-8 p-0">
              <ChevronLeft className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />
            </Button>
          )}
          {stateStack.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 w-8 p-0">
              <Home className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      {stateStack.length > 0 && (
        <div className="px-4 py-1.5 border-b bg-muted/10 overflow-x-auto">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="cursor-pointer hover:text-foreground" onClick={handleReset}>ROOT</span>
            {stateStack.slice(-3).map((sid, i) => {
              try {
                const s = getState(sid);
                const label = isAr ? s.text.ar : s.text.en;
                return (
                  <span key={`${sid}-${i}`} className="flex items-center gap-1">
                    <span>→</span>
                    <span>{label}</span>
                  </span>
                );
              } catch {
                return null;
              }
            })}
            <span>→</span>
            <span className="text-foreground font-medium">{stateTitle}</span>
          </div>
        </div>
      )}

      {/* Chat History + Current State */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {history.map((entry) => {
            if (entry.type === 'bot') {
              return (
                <div key={entry.id} className="flex gap-2.5 animate-in slide-in-from-left-2 duration-200">
                  <Avatar className="h-7 w-7 flex-shrink-0 mt-0.5">
                    <AvatarFallback className={`bg-gradient-to-br ${DOMAIN_COLORS[entry.domain || 'root']} text-white text-[10px]`}>
                      <Bot className="h-3.5 w-3.5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-3.5 py-2 max-w-[85%]">
                    <p className="text-sm whitespace-pre-wrap" dir={isAr ? 'rtl' : 'ltr'}>{entry.text}</p>
                  </div>
                </div>
              );
            }

            if (entry.type === 'user') {
              return (
                <div key={entry.id} className="flex gap-2 justify-end animate-in slide-in-from-right-2 duration-200">
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-3.5 py-2 max-w-[85%]">
                    <p className="text-sm" dir={isAr ? 'rtl' : 'ltr'}>
                      {entry.icon && <span className="mr-1">{entry.icon}</span>}
                      {entry.text}
                    </p>
                  </div>
                </div>
              );
            }

            if (entry.type === 'data') {
              return (
                <div key={entry.id} className="flex gap-2.5 animate-in slide-in-from-left-2 duration-200">
                  <Avatar className="h-7 w-7 flex-shrink-0 mt-0.5">
                    <AvatarFallback className={entry.success
                      ? 'bg-green-500/20 text-green-600 dark:text-green-400 text-[10px]'
                      : 'bg-red-500/20 text-red-600 dark:text-red-400 text-[10px]'
                    }>
                      {entry.success ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`rounded-2xl rounded-tl-sm px-3.5 py-2 max-w-[85%] ${
                    entry.success ? 'bg-green-500/5 border border-green-500/20' : 'bg-red-500/5 border border-red-500/20'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap" dir={isAr ? 'rtl' : 'ltr'}>{entry.text}</p>
                  </div>
                </div>
              );
            }

            if (entry.type === 'confirm') {
              return (
                <div key={entry.id} className="flex justify-center">
                  <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {entry.text}
                  </span>
                </div>
              );
            }

            return null;
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-2.5">
              <Avatar className="h-7 w-7 flex-shrink-0">
                <AvatarFallback className={`bg-gradient-to-br ${domainColor} text-white text-[10px]`}>
                  <Bot className="h-3.5 w-3.5" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-2xl px-4 py-2.5">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Confirmation Dialog */}
      {pendingAction && (
        <ConfirmDialog
          action={pendingAction.action}
          isAr={isAr}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      {/* Options — the core of the guided chat */}
      {!pendingAction && currentState.options.length > 0 && (
        <div className="border-t bg-background p-3">
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
            {currentState.options.map((option) => (
              <OptionButton
                key={option.id}
                option={option}
                isAr={isAr}
                onSelect={() => handleSelect(option)}
                disabled={isLoading}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
