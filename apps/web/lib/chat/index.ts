/**
 * Forma Fitness — Premium Guided Chat State Machine
 *
 * 172 states across 9 domains:
 *   root (9) → workout (37) → nutrition (32) → health (44)
 *   → devices (11) → supplements → programs → progress → recovery (39 combined)
 *
 * Premium (299 LE/mo): Guided chat — user picks from premade options only
 * Premium+ (999 LE/mo): Free chat — full GPT conversation
 */

import type { ChatState } from './types';
export type { ChatState, ChatOption, StateAction, OptionCondition, Domain, HealthTable, HealthTableMetric, PermissionLevel } from './types';

import { rootStates } from './states-root';
import { workoutStates } from './states-workout';
import { nutritionStates } from './states-nutrition';
import { healthStates } from './states-health';
import { deviceStates } from './states-devices';
import { supplementStates, programStates, progressStates, recoveryStates } from './states-remaining';

// All states combined into a single array
export const ALL_STATES: ChatState[] = [
  ...rootStates,
  ...workoutStates,
  ...nutritionStates,
  ...healthStates,
  ...deviceStates,
  ...supplementStates,
  ...programStates,
  ...progressStates,
  ...recoveryStates,
];

// Map for O(1) lookup by state ID
export const STATE_MAP: Map<string, ChatState> = new Map(
  ALL_STATES.map(s => [s.id, s])
);

// Get a state by ID — throws if not found (programming error)
export function getState(id: string): ChatState {
  const state = STATE_MAP.get(id);
  if (!state) throw new Error(`Unknown chat state: ${id}`);
  return state;
}

// Get all states in a domain
export function getStatesByDomain(domain: ChatState['domain']): ChatState[] {
  return ALL_STATES.filter(s => s.domain === domain);
}

// Get the root/entry state
export const INITIAL_STATE = 'ROOT';

// Domain exports for direct access
export { rootStates } from './states-root';
export { workoutStates } from './states-workout';
export { nutritionStates } from './states-nutrition';
export { healthStates } from './states-health';
export { deviceStates } from './states-devices';
export { supplementStates, programStates, progressStates, recoveryStates } from './states-remaining';

// Stats
export const TOTAL_STATES = ALL_STATES.length;
