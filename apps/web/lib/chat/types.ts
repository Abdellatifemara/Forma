// ─── Forma Guided Chat State Machine Types ────────────────────
// Premium (299 LE)  = GUIDED chat with premade options (NO free text, NO GPT)
// Premium+ (999 LE) = GUIDED chat with DEEPER options + smart GPT at leaf nodes

export interface ChatState {
  id: string;
  domain: Domain;
  text: { en: string; ar: string };
  // What the bot says when entering this state
  botMessage?: { en: string; ar: string };
  options: ChatOption[];
  // Action to execute when entering this state (e.g., fetch data)
  onEnter?: StateAction;
  // If true, this state shows dynamic data (fetched from API)
  dynamic?: boolean;
  // Back navigation — which state to return to
  back?: string;
  // Premium+ only: GPT-enhanced response when entering this state
  gptEnhanced?: GptEnhancedConfig;
  // Only show this state for certain tiers
  tier?: 'PREMIUM' | 'PREMIUM_PLUS';
}

export interface ChatOption {
  id: string;
  label: { en: string; ar: string };
  icon?: string; // emoji
  nextState: string;
  // Only show this option if condition is met
  condition?: OptionCondition;
  // Action to execute when this option is selected
  action?: StateAction;
}

export interface StateAction {
  type: 'read' | 'write' | 'navigate' | 'fetch';
  // API endpoint to call
  endpoint?: string;
  // App route to navigate to
  route?: string;
  // Does this action need user confirmation before executing?
  requiresConfirmation?: boolean;
  // Confirmation message
  confirmText?: { en: string; ar: string };
  // Parameters to pass
  params?: Record<string, string>;
}

// ─── GPT-Enhanced Node Configuration ────────────────────────
// These nodes make ONE targeted GPT call with known context and intent.
// The state path tells us exactly what the user wants → zero ambiguity.

export interface GptEnhancedConfig {
  // What data to fetch from our APIs before calling GPT
  contextSources: GptContextSource[];
  // The prompt template — {placeholders} get replaced with context data
  promptTemplate: string;
  // Expected output format so we can parse/display it
  outputFormat: 'text' | 'list' | 'plan' | 'comparison' | 'analysis';
  // Which model to use (trade-off: speed vs quality)
  model: 'gpt-4o-mini' | 'gpt-4o';
  // Max tokens for response
  maxTokens?: number;
  // System prompt override (defaults to fitness coach)
  systemPrompt?: string;
  // Cache key — if set, cache result for N minutes
  cacheTtlMinutes?: number;
}

export interface GptContextSource {
  // What to fetch
  type: 'profile' | 'todayWorkout' | 'workoutHistory' | 'nutritionToday'
    | 'weightHistory' | 'healthMetrics' | 'activePlan' | 'exercises'
    | 'foods' | 'preferences' | 'injuries' | 'subscription';
  // Key to use in the prompt template
  key: string;
  // Optional filter params
  params?: Record<string, string>;
}

// ─── Option Conditions ──────────────────────────────────────

export type OptionCondition =
  | { type: 'hasDevice'; device?: string }
  | { type: 'noDevice' }
  | { type: 'hasPlan' }
  | { type: 'noPlan' }
  | { type: 'hasGoal'; goal?: string }
  | { type: 'tier'; tier: 'PREMIUM' | 'PREMIUM_PLUS' }
  | { type: 'gender'; gender: 'male' | 'female' }
  | { type: 'hasData'; metric: string }
  | { type: 'always' };

export type Domain =
  | 'root'
  | 'workout'
  | 'nutrition'
  | 'health'
  | 'progress'
  | 'programs'
  | 'supplements'
  | 'recovery'
  | 'quick'
  | 'device'
  | 'settings'
  | 'onboarding';

// ─── Health Tables (inspired by Whoop/Apple Watch/OURA/Garmin) ──

export interface HealthTable {
  id: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  metrics: HealthTableMetric[];
  source: 'manual' | 'device' | 'both';
}

export interface HealthTableMetric {
  key: string;
  label: { en: string; ar: string };
  unit: string;
  range?: { min: number; max: number; optimal?: { min: number; max: number } };
  frequency: 'realtime' | 'daily' | 'weekly' | 'monthly' | 'once';
}

// ─── Permission Protocol ─────────────────────────────────────
// C1: Read-only (no confirmation needed)
// C2: Profile/preference changes (confirm once)
// C3: Create/modify workout, nutrition, program data (confirm each time)
// D1: Delete data (always confirm with warning)

export type PermissionLevel = 'C1' | 'C2' | 'C3' | 'D1';
