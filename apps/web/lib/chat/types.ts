// ─── Premium Guided Chat State Machine Types ─────────────────
// Premium (299 LE) = GUIDED chat with premade options only (NO free text)
// Premium+ (999 LE) = FREE chat with GPT (separate system)

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
