import type {
  MuscleGroup,
  EquipmentType,
  FitnessGoal,
  ActivityLevel,
  ExperienceLevel,
  MealType,
  SubscriptionPlan,
  DifficultyLevel,
} from '@forma/types';

// ============================================
// Constants
// ============================================

export const COLORS = {
  formaTeal: '#00D4AA',
  formaTealDark: '#00B894',
  formaTealLight: '#00F5C4',
  background: '#0A0A0A',
  foreground: '#FAFAFA',
  muted: '#27272A',
  mutedForeground: '#A1A1AA',
  destructive: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
} as const;

export const MUSCLE_GROUPS: { value: MuscleGroup; label: string; labelAr: string }[] = [
  { value: 'chest', label: 'Chest', labelAr: 'صدر' },
  { value: 'back', label: 'Back', labelAr: 'ظهر' },
  { value: 'shoulders', label: 'Shoulders', labelAr: 'أكتاف' },
  { value: 'biceps', label: 'Biceps', labelAr: 'باي' },
  { value: 'triceps', label: 'Triceps', labelAr: 'تراي' },
  { value: 'forearms', label: 'Forearms', labelAr: 'ساعد' },
  { value: 'core', label: 'Core', labelAr: 'بطن' },
  { value: 'quadriceps', label: 'Quadriceps', labelAr: 'فخذ أمامي' },
  { value: 'hamstrings', label: 'Hamstrings', labelAr: 'فخذ خلفي' },
  { value: 'glutes', label: 'Glutes', labelAr: 'مؤخرة' },
  { value: 'calves', label: 'Calves', labelAr: 'سمانة' },
  { value: 'full_body', label: 'Full Body', labelAr: 'جسم كامل' },
];

export const EQUIPMENT_TYPES: { value: EquipmentType; label: string; labelAr: string }[] = [
  { value: 'barbell', label: 'Barbell', labelAr: 'بار' },
  { value: 'dumbbell', label: 'Dumbbell', labelAr: 'دمبل' },
  { value: 'cable', label: 'Cable', labelAr: 'كابل' },
  { value: 'machine', label: 'Machine', labelAr: 'جهاز' },
  { value: 'bodyweight', label: 'Bodyweight', labelAr: 'وزن الجسم' },
  { value: 'kettlebell', label: 'Kettlebell', labelAr: 'كيتل بيل' },
  { value: 'resistance_band', label: 'Resistance Band', labelAr: 'حبل مقاومة' },
  { value: 'other', label: 'Other', labelAr: 'أخرى' },
  { value: 'none', label: 'None', labelAr: 'بدون' },
];

export const FITNESS_GOALS: { value: FitnessGoal; label: string; labelAr: string; icon: string }[] = [
  { value: 'lose_weight', label: 'Lose Weight', labelAr: 'خسارة وزن', icon: '🔥' },
  { value: 'build_muscle', label: 'Build Muscle', labelAr: 'بناء عضلات', icon: '💪' },
  { value: 'maintain', label: 'Maintain', labelAr: 'المحافظة', icon: '⚖️' },
  { value: 'improve_fitness', label: 'Improve Fitness', labelAr: 'تحسين اللياقة', icon: '🏃' },
  { value: 'gain_strength', label: 'Gain Strength', labelAr: 'زيادة القوة', icon: '🏋️' },
];

export const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; labelAr: string; description: string }[] = [
  { value: 'sedentary', label: 'Sedentary', labelAr: 'قليل الحركة', description: 'Little or no exercise' },
  { value: 'light', label: 'Lightly Active', labelAr: 'نشاط خفيف', description: '1-3 days/week' },
  { value: 'moderate', label: 'Moderately Active', labelAr: 'نشاط معتدل', description: '3-5 days/week' },
  { value: 'active', label: 'Very Active', labelAr: 'نشاط عالي', description: '6-7 days/week' },
  { value: 'very_active', label: 'Extra Active', labelAr: 'نشاط مكثف', description: 'Athlete level' },
];

export const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string; labelAr: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', labelAr: 'مبتدئ', description: 'New to fitness or less than 6 months' },
  { value: 'intermediate', label: 'Intermediate', labelAr: 'متوسط', description: '6 months to 2 years experience' },
  { value: 'advanced', label: 'Advanced', labelAr: 'متقدم', description: 'More than 2 years experience' },
];

export const DIFFICULTY_LEVELS: { value: DifficultyLevel; label: string; labelAr: string }[] = [
  { value: 'beginner', label: 'Beginner', labelAr: 'مبتدئ' },
  { value: 'intermediate', label: 'Intermediate', labelAr: 'متوسط' },
  { value: 'advanced', label: 'Advanced', labelAr: 'متقدم' },
];

export const MEAL_TYPES: { value: MealType; label: string; labelAr: string; icon: string }[] = [
  { value: 'breakfast', label: 'Breakfast', labelAr: 'فطور', icon: '🌅' },
  { value: 'lunch', label: 'Lunch', labelAr: 'غداء', icon: '☀️' },
  { value: 'dinner', label: 'Dinner', labelAr: 'عشاء', icon: '🌙' },
  { value: 'snack', label: 'Snack', labelAr: 'وجبة خفيفة', icon: '🍎' },
];

export const SUBSCRIPTION_PLANS: {
  value: SubscriptionPlan;
  label: string;
  labelAr: string;
  price: number;
  currency: string;
  features: string[];
}[] = [
  {
    value: 'free',
    label: 'Free',
    labelAr: 'مجاني',
    price: 0,
    currency: 'EGP',
    features: [
      'Basic workout tracking',
      'Food logging',
      'Progress photos',
      'Limited exercise library',
    ],
  },
  {
    value: 'pro',
    label: 'Pro',
    labelAr: 'برو',
    price: 99,
    currency: 'EGP',
    features: [
      'Everything in Free',
      'AI Coach (unlimited)',
      'Custom workout plans',
      'Detailed analytics',
      'Ad-free experience',
    ],
  },
  {
    value: 'elite',
    label: 'Elite',
    labelAr: 'إليت',
    price: 299,
    currency: 'EGP',
    features: [
      'Everything in Pro',
      'Personal trainer matching',
      'Video consultations',
      'Priority support',
      'Exclusive content',
    ],
  },
];

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', labelAr: 'الأحد', short: 'Sun' },
  { value: 1, label: 'Monday', labelAr: 'الاثنين', short: 'Mon' },
  { value: 2, label: 'Tuesday', labelAr: 'الثلاثاء', short: 'Tue' },
  { value: 3, label: 'Wednesday', labelAr: 'الأربعاء', short: 'Wed' },
  { value: 4, label: 'Thursday', labelAr: 'الخميس', short: 'Thu' },
  { value: 5, label: 'Friday', labelAr: 'الجمعة', short: 'Fri' },
  { value: 6, label: 'Saturday', labelAr: 'السبت', short: 'Sat' },
];

// ============================================
// Formatting Utilities
// ============================================

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString();
}

export function formatCurrency(amount: number, currency: string = 'EGP'): string {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatWeight(weight: number, unit: 'kg' | 'lbs' = 'kg'): string {
  return `${weight.toFixed(1)} ${unit}`;
}

export function formatDate(date: string | Date, locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(date: string | Date, locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d);
}

// ============================================
// Calculation Utilities
// ============================================

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

export function getBMICategory(bmi: number): { label: string; labelAr: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', labelAr: 'نقص وزن', color: 'yellow' };
  if (bmi < 25) return { label: 'Normal', labelAr: 'طبيعي', color: 'green' };
  if (bmi < 30) return { label: 'Overweight', labelAr: 'زيادة وزن', color: 'orange' };
  return { label: 'Obese', labelAr: 'سمنة', color: 'red' };
}

export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female'
): number {
  // Mifflin-St Jeor Equation
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === 'male' ? base + 5 : base - 161);
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return Math.round(bmr * multipliers[activityLevel]);
}

export function calculateMacros(
  calories: number,
  goal: FitnessGoal,
  weightKg: number
): { protein: number; carbs: number; fat: number } {
  let proteinPerKg: number;
  let fatPercentage: number;

  switch (goal) {
    case 'build_muscle':
    case 'gain_strength':
      proteinPerKg = 2.2;
      fatPercentage = 0.25;
      break;
    case 'lose_weight':
      proteinPerKg = 2.0;
      fatPercentage = 0.25;
      break;
    default:
      proteinPerKg = 1.6;
      fatPercentage = 0.3;
  }

  const protein = Math.round(weightKg * proteinPerKg);
  const fat = Math.round((calories * fatPercentage) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

  return { protein, carbs, fat };
}

export function calculateCalorieGoal(tdee: number, goal: FitnessGoal): number {
  switch (goal) {
    case 'lose_weight':
      return Math.round(tdee - 500);
    case 'build_muscle':
    case 'gain_strength':
      return Math.round(tdee + 300);
    default:
      return tdee;
  }
}

export function calculate1RM(weight: number, reps: number): number {
  // Brzycki formula
  if (reps === 1) return weight;
  return Math.round(weight * (36 / (37 - reps)));
}

// ============================================
// Validation Utilities
// ============================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain a number');
  }

  return { valid: errors.length === 0, errors };
}

export function isValidPhone(phone: string): boolean {
  // Egyptian phone number format
  const phoneRegex = /^(\+20|0)?1[0125][0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// ============================================
// Array Utilities
// ============================================

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const group = String(item[key]);
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// ============================================
// String Utilities
// ============================================

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ============================================
// Date Utilities
// ============================================

export function getStartOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfWeek(date: Date = new Date()): Date {
  const d = getStartOfWeek(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getStartOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getEndOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function getDaysBetween(start: Date, end: Date): number {
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

// ============================================
// Color Utilities
// ============================================

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function getContrastColor(hexColor: string): 'black' | 'white' {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return 'black';

  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? 'black' : 'white';
}

// ============================================
// Storage Utilities
// ============================================

export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

// ============================================
// Error Handling
// ============================================

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof Error && error.message === 'Network Error';
}

// ============================================
// Debounce & Throttle
// ============================================

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Re-export types
export type * from '@forma/types';
