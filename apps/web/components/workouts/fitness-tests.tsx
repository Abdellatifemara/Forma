'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Trophy,
  Timer,
  Flame,
  Heart,
  Ruler,
  X,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';

// ─── RATING NORMS ───────────────────────────────────────────────────────────
// Based on ACSM, Cooper Institute, and NSCA standards
// Keys: [gender][ageGroup] → thresholds for [poor, fair, good, excellent]

type Rating = 'poor' | 'below_average' | 'average' | 'good' | 'excellent';

interface NormTable {
  male: Record<string, number[]>;
  female: Record<string, number[]>;
}

function getAgeGroup(age: number): string {
  if (age < 20) return '15-19';
  if (age < 30) return '20-29';
  if (age < 40) return '30-39';
  if (age < 50) return '40-49';
  if (age < 60) return '50-59';
  return '60+';
}

function getRating(value: number, norms: number[], higherIsBetter = true): Rating {
  // norms = [poor_max, below_avg_max, avg_max, good_max]
  // anything above good_max = excellent
  if (higherIsBetter) {
    if (value <= norms[0]) return 'poor';
    if (value <= norms[1]) return 'below_average';
    if (value <= norms[2]) return 'average';
    if (value <= norms[3]) return 'good';
    return 'excellent';
  } else {
    // Lower is better (e.g., resting heart rate, run time)
    if (value >= norms[0]) return 'poor';
    if (value >= norms[1]) return 'below_average';
    if (value >= norms[2]) return 'average';
    if (value >= norms[3]) return 'good';
    return 'excellent';
  }
}

// ─── PUSHUP NORMS (reps in 60 seconds) ────────────────────────────────────
// Source: ACSM Guidelines for Exercise Testing and Prescription
const pushupNorms: NormTable = {
  male: {
    '15-19': [18, 24, 30, 39],
    '20-29': [16, 22, 28, 36],
    '30-39': [12, 17, 24, 30],
    '40-49': [10, 14, 20, 25],
    '50-59': [7, 10, 15, 20],
    '60+':   [5, 8, 12, 16],
  },
  female: {
    '15-19': [12, 17, 22, 30],
    '20-29': [10, 14, 20, 27],
    '30-39': [8, 12, 16, 24],
    '40-49': [5, 8, 13, 18],
    '50-59': [3, 6, 10, 14],
    '60+':   [2, 4, 8, 12],
  },
};

// ─── PLANK HOLD NORMS (seconds) ───────────────────────────────────────────
// Source: Fitness testing standards composite
const plankNorms: NormTable = {
  male: {
    '15-19': [20, 40, 60, 90],
    '20-29': [20, 40, 60, 90],
    '30-39': [15, 35, 55, 80],
    '40-49': [10, 30, 50, 75],
    '50-59': [10, 25, 40, 60],
    '60+':   [5, 20, 35, 50],
  },
  female: {
    '15-19': [15, 30, 50, 75],
    '20-29': [15, 30, 50, 75],
    '30-39': [12, 25, 45, 65],
    '40-49': [10, 20, 35, 55],
    '50-59': [8, 15, 30, 45],
    '60+':   [5, 12, 25, 40],
  },
};

// ─── WALL SIT NORMS (seconds) ─────────────────────────────────────────────
const wallSitNorms: NormTable = {
  male: {
    '15-19': [20, 35, 55, 80],
    '20-29': [20, 35, 55, 80],
    '30-39': [15, 30, 50, 75],
    '40-49': [12, 25, 40, 60],
    '50-59': [10, 20, 35, 50],
    '60+':   [8, 15, 25, 40],
  },
  female: {
    '15-19': [15, 25, 40, 60],
    '20-29': [15, 25, 40, 60],
    '30-39': [12, 20, 35, 55],
    '40-49': [10, 18, 30, 45],
    '50-59': [8, 15, 25, 35],
    '60+':   [5, 10, 20, 30],
  },
};

// ─── RESTING HEART RATE NORMS (lower is better) ──────────────────────────
// Source: American Heart Association
const restingHRNorms: NormTable = {
  male: {
    '15-19': [90, 78, 68, 58],
    '20-29': [92, 80, 70, 60],
    '30-39': [94, 82, 72, 62],
    '40-49': [96, 84, 74, 64],
    '50-59': [98, 86, 76, 66],
    '60+':   [100, 88, 78, 68],
  },
  female: {
    '15-19': [94, 82, 72, 62],
    '20-29': [96, 84, 74, 64],
    '30-39': [98, 86, 76, 66],
    '40-49': [100, 88, 78, 68],
    '50-59': [100, 90, 80, 70],
    '60+':   [100, 92, 82, 72],
  },
};

// ─── SIT AND REACH NORMS (cm past toes, can be negative) ─────────────────
// Source: ACSM sit-and-reach test norms
const sitReachNorms: NormTable = {
  male: {
    '15-19': [-5, 5, 15, 25],
    '20-29': [-8, 2, 12, 22],
    '30-39': [-10, 0, 10, 20],
    '40-49': [-12, -2, 8, 18],
    '50-59': [-14, -4, 6, 16],
    '60+':   [-16, -6, 4, 14],
  },
  female: {
    '15-19': [-2, 8, 18, 28],
    '20-29': [-5, 5, 15, 25],
    '30-39': [-7, 3, 13, 23],
    '40-49': [-9, 1, 11, 21],
    '50-59': [-11, -1, 9, 19],
    '60+':   [-13, -3, 7, 17],
  },
};

// ─── BMI CATEGORIES ───────────────────────────────────────────────────────
function getBMIRating(bmi: number): Rating {
  if (bmi < 16 || bmi >= 35) return 'poor';
  if (bmi < 18.5 || bmi >= 30) return 'below_average';
  if (bmi < 20 || bmi >= 25) return 'average';
  if (bmi < 22.5) return 'excellent';
  return 'good';
}

function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  if (bmi < 35) return 'Obese (Class I)';
  if (bmi < 40) return 'Obese (Class II)';
  return 'Obese (Class III)';
}

// ─── TEST DEFINITIONS ─────────────────────────────────────────────────────

type TestType = 'timed_count' | 'hold_timer' | 'manual_input' | 'calculated';

interface FitnessTestDef {
  id: string;
  category: 'strength' | 'flexibility' | 'cardio' | 'body_composition';
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  instructionsEn: string[];
  instructionsAr: string[];
  type: TestType;
  unit: string;
  unitAr: string;
  duration?: number; // seconds for timed tests
  getNorms: (gender: string, ageGroup: string) => number[];
  higherIsBetter: boolean;
  icon: 'strength' | 'flexibility' | 'cardio' | 'body';
  calculate?: (inputs: Record<string, number>) => number;
  inputs?: { key: string; labelEn: string; labelAr: string; unit: string }[];
}

const fitnessTests: FitnessTestDef[] = [
  // ── STRENGTH ──
  {
    id: 'pushup_60s',
    category: 'strength',
    nameEn: 'Pushup Test (60s)',
    nameAr: 'اختبار الضغط (60 ثانية)',
    descriptionEn: 'How many pushups can you do in 60 seconds?',
    descriptionAr: 'كام ضغطة تقدر تعمل في 60 ثانية؟',
    instructionsEn: [
      'Get into pushup position — hands shoulder-width apart',
      'Lower your chest to the ground, then push back up',
      'Full range of motion: arms fully extended at top, chest near floor at bottom',
      'Count every complete rep in 60 seconds',
      'You can rest in the up position, but the timer keeps going',
    ],
    instructionsAr: [
      'خد وضع الضغط — الأيدين على مستوى الكتف',
      'نزّل صدرك للأرض وارجع اطلع',
      'حركة كاملة: الذراعين ممدودين فوق، الصدر قريب من الأرض تحت',
      'عدّ كل تكرار كامل في 60 ثانية',
      'ممكن ترتاح في الوضع العلوي بس التايمر بيفضل شغال',
    ],
    type: 'timed_count',
    unit: 'reps',
    unitAr: 'تكرار',
    duration: 60,
    getNorms: (g, a) => (g === 'female' ? pushupNorms.female : pushupNorms.male)[a] || pushupNorms.male['20-29'],
    higherIsBetter: true,
    icon: 'strength',
  },
  {
    id: 'plank_hold',
    category: 'strength',
    nameEn: 'Plank Hold',
    nameAr: 'اختبار البلانك',
    descriptionEn: 'How long can you hold a plank?',
    descriptionAr: 'قد إيه تقدر تمسك بلانك؟',
    instructionsEn: [
      'Get into forearm plank position — elbows under shoulders',
      'Keep your body in a straight line from head to heels',
      'Engage your core — don\'t let your hips sag or pike up',
      'Hold as long as you can with proper form',
      'Stop when your form breaks down',
    ],
    instructionsAr: [
      'خد وضع البلانك على الذراعين — الكوع تحت الكتف',
      'خلي جسمك خط مستقيم من الراس للكعب',
      'شدّ بطنك — متخليش وسطك ينزل أو يطلع',
      'امسك أطول وقت تقدر بفورم صح',
      'وقّف لما الفورم يبوظ',
    ],
    type: 'hold_timer',
    unit: 'seconds',
    unitAr: 'ثانية',
    getNorms: (g, a) => (g === 'female' ? plankNorms.female : plankNorms.male)[a] || plankNorms.male['20-29'],
    higherIsBetter: true,
    icon: 'strength',
  },
  {
    id: 'wall_sit',
    category: 'strength',
    nameEn: 'Wall Sit Hold',
    nameAr: 'اختبار الجلوس على الحيط',
    descriptionEn: 'How long can you hold a wall sit?',
    descriptionAr: 'قد إيه تقدر تمسك وضع الجلوس على الحيط؟',
    instructionsEn: [
      'Stand with your back flat against a wall',
      'Slide down until your thighs are parallel to the floor (90° at knees)',
      'Feet shoulder-width apart, about 2 feet from the wall',
      'Keep your back flat against the wall the entire time',
      'Hold as long as you can — stop when you can\'t maintain position',
    ],
    instructionsAr: [
      'قف وظهرك ملزوق بالحيط',
      'انزل لحد ما الفخذين يكونوا موازيين للأرض (90 درجة عند الركبة)',
      'الرجلين على مستوى الكتف، بعيد عن الحيط حوالي 60 سم',
      'خلي ظهرك ملزوق بالحيط طول الوقت',
      'امسك أطول وقت — وقّف لما متقدرش تحافظ على الوضع',
    ],
    type: 'hold_timer',
    unit: 'seconds',
    unitAr: 'ثانية',
    getNorms: (g, a) => (g === 'female' ? wallSitNorms.female : wallSitNorms.male)[a] || wallSitNorms.male['20-29'],
    higherIsBetter: true,
    icon: 'strength',
  },
  // ── FLEXIBILITY ──
  {
    id: 'sit_and_reach',
    category: 'flexibility',
    nameEn: 'Sit and Reach',
    nameAr: 'اختبار المرونة (الجلوس والمد)',
    descriptionEn: 'How far past your toes can you reach?',
    descriptionAr: 'قد إيه تقدر توصل بعد صوابعك؟',
    instructionsEn: [
      'Sit on the floor with legs straight out in front of you',
      'Feet flat against a box or wall',
      'Slowly reach forward as far as you can',
      'Hold the furthest point for 2 seconds',
      'Measure in cm: 0 = toes, negative = before toes, positive = past toes',
    ],
    instructionsAr: [
      'اقعد على الأرض رجليك ممدودة قدامك',
      'القدمين على الحيط أو الصندوق',
      'امد إيديك قدام ببطء أقصى ما تقدر',
      'امسك أبعد نقطة لمدة ثانيتين',
      'قيس بالسنتيمتر: 0 = أصابع الرجل، سالب = قبلها، موجب = بعدها',
    ],
    type: 'manual_input',
    unit: 'cm',
    unitAr: 'سم',
    getNorms: (g, a) => (g === 'female' ? sitReachNorms.female : sitReachNorms.male)[a] || sitReachNorms.male['20-29'],
    higherIsBetter: true,
    icon: 'flexibility',
  },
  // ── CARDIO ──
  {
    id: 'resting_hr',
    category: 'cardio',
    nameEn: 'Resting Heart Rate',
    nameAr: 'معدل ضربات القلب في الراحة',
    descriptionEn: 'What is your resting heart rate?',
    descriptionAr: 'إيه معدل ضربات قلبك وانت مرتاح؟',
    instructionsEn: [
      'Sit quietly for at least 5 minutes — no phone, no talking',
      'Place two fingers on the side of your neck (carotid artery) or inner wrist (radial artery)',
      'Count your heartbeats for 60 seconds using a timer',
      'Or count for 15 seconds and multiply by 4',
      'Best done first thing in the morning before getting out of bed',
    ],
    instructionsAr: [
      'اقعد بهدوء لمدة 5 دقائق على الأقل — من غير موبايل أو كلام',
      'حط صباعين على جنب الرقبة (الشريان السباتي) أو المعصم من جوا',
      'عدّ ضربات القلب لمدة 60 ثانية',
      'أو عدّ لمدة 15 ثانية واضرب في 4',
      'أفضل وقت هو أول ما تصحى الصبح قبل ما تقوم من السرير',
    ],
    type: 'manual_input',
    unit: 'bpm',
    unitAr: 'نبضة/دقيقة',
    getNorms: (g, a) => (g === 'female' ? restingHRNorms.female : restingHRNorms.male)[a] || restingHRNorms.male['20-29'],
    higherIsBetter: false,
    icon: 'cardio',
  },
  // ── BODY COMPOSITION ──
  {
    id: 'bmi',
    category: 'body_composition',
    nameEn: 'BMI Calculator',
    nameAr: 'حساب مؤشر كتلة الجسم',
    descriptionEn: 'Calculate your Body Mass Index',
    descriptionAr: 'احسب مؤشر كتلة جسمك',
    instructionsEn: [
      'Enter your weight in kilograms',
      'Enter your height in centimeters',
      'BMI = weight (kg) / height (m)²',
      'Note: BMI doesn\'t account for muscle mass — muscular people may show "overweight"',
      'Use alongside body fat % for a more complete picture',
    ],
    instructionsAr: [
      'دخّل وزنك بالكيلوجرام',
      'دخّل طولك بالسنتيمتر',
      'BMI = الوزن (كجم) / الطول (م)²',
      'ملحوظة: الـ BMI مش بياخد العضلات في الاعتبار — الناس العضلية ممكن تظهر "زيادة وزن"',
      'استخدمه مع نسبة الدهون عشان تاخد صورة أكمل',
    ],
    type: 'calculated',
    unit: 'kg/m²',
    unitAr: 'كجم/م²',
    getNorms: () => [35, 30, 25, 22.5], // lower is better for BMI (inverted)
    higherIsBetter: false,
    icon: 'body',
    calculate: (inputs) => {
      const weight = inputs.weight || 0;
      const height = (inputs.height || 170) / 100; // cm to m
      if (height === 0) return 0;
      return Math.round((weight / (height * height)) * 10) / 10;
    },
    inputs: [
      { key: 'weight', labelEn: 'Weight', labelAr: 'الوزن', unit: 'kg' },
      { key: 'height', labelEn: 'Height', labelAr: 'الطول', unit: 'cm' },
    ],
  },
  {
    id: 'waist_hip_ratio',
    category: 'body_composition',
    nameEn: 'Waist-to-Hip Ratio',
    nameAr: 'نسبة الخصر للورك',
    descriptionEn: 'Measure your waist-to-hip ratio',
    descriptionAr: 'قيس نسبة الخصر للورك',
    instructionsEn: [
      'Measure your waist at the narrowest point (usually at belly button level)',
      'Measure your hips at the widest point',
      'Both measurements in centimeters',
      'Healthy ratio: Men < 0.9, Women < 0.85',
      'Higher ratios indicate more abdominal fat and higher health risk',
    ],
    instructionsAr: [
      'قيس الخصر عند أضيق نقطة (عادة عند السرة)',
      'قيس الورك عند أعرض نقطة',
      'القياسين بالسنتيمتر',
      'نسبة صحية: رجال أقل من 0.9، ستات أقل من 0.85',
      'نسبة أعلى معناها دهون بطن أكتر ومخاطر صحية أعلى',
    ],
    type: 'calculated',
    unit: 'ratio',
    unitAr: 'نسبة',
    getNorms: (g) => g === 'female' ? [0.95, 0.90, 0.85, 0.75] : [1.0, 0.95, 0.90, 0.85],
    higherIsBetter: false,
    icon: 'body',
    calculate: (inputs) => {
      const waist = inputs.waist || 0;
      const hip = inputs.hip || 1;
      if (hip === 0) return 0;
      return Math.round((waist / hip) * 100) / 100;
    },
    inputs: [
      { key: 'waist', labelEn: 'Waist', labelAr: 'الخصر', unit: 'cm' },
      { key: 'hip', labelEn: 'Hip', labelAr: 'الورك', unit: 'cm' },
    ],
  },
];

// ─── RATING UI HELPERS ────────────────────────────────────────────────────

const ratingConfig: Record<Rating, { label: string; labelAr: string; color: string; bg: string }> = {
  poor: { label: 'Poor', labelAr: 'ضعيف', color: 'text-red-500', bg: 'bg-red-500/20' },
  below_average: { label: 'Below Average', labelAr: 'تحت المتوسط', color: 'text-orange-500', bg: 'bg-orange-500/20' },
  average: { label: 'Average', labelAr: 'متوسط', color: 'text-yellow-500', bg: 'bg-yellow-500/20' },
  good: { label: 'Good', labelAr: 'جيد', color: 'text-emerald-500', bg: 'bg-emerald-500/20' },
  excellent: { label: 'Excellent', labelAr: 'ممتاز', color: 'text-primary', bg: 'bg-primary/20' },
};

const categoryConfig = {
  strength: { icon: Flame, labelEn: 'Strength', labelAr: 'القوة', color: 'text-red-400', bg: 'bg-red-500/20' },
  flexibility: { icon: Ruler, labelEn: 'Flexibility', labelAr: 'المرونة', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  cardio: { icon: Heart, labelEn: 'Cardio', labelAr: 'القلب', color: 'text-pink-400', bg: 'bg-pink-500/20' },
  body_composition: { icon: Trophy, labelEn: 'Body Composition', labelAr: 'تكوين الجسم', color: 'text-purple-400', bg: 'bg-purple-500/20' },
};

// ─── RESULT STORAGE ───────────────────────────────────────────────────────

interface TestResult {
  testId: string;
  value: number;
  rating: Rating;
  date: string;
}

function saveTestResult(result: TestResult) {
  const stored = localStorage.getItem('forma_fitness_tests') || '{}';
  const results = JSON.parse(stored);
  if (!results[result.testId]) results[result.testId] = [];
  results[result.testId].push(result);
  localStorage.setItem('forma_fitness_tests', JSON.stringify(results));
}

function getTestHistory(testId: string): TestResult[] {
  const stored = localStorage.getItem('forma_fitness_tests') || '{}';
  const results = JSON.parse(stored);
  return results[testId] || [];
}

function getLatestResult(testId: string): TestResult | null {
  const history = getTestHistory(testId);
  return history.length > 0 ? history[history.length - 1] : null;
}

// ─── PROFILE HELPERS ──────────────────────────────────────────────────────

function getUserProfile(): { age: number; gender: string; weight: number; height: number } {
  // Try to get from localStorage (profile cache)
  try {
    const cached = localStorage.getItem('forma_user_profile');
    if (cached) {
      const profile = JSON.parse(cached);
      return {
        age: profile.age || 25,
        gender: profile.gender || 'male',
        weight: profile.currentWeightKg || 75,
        height: profile.heightCm || 170,
      };
    }
  } catch {}
  return { age: 25, gender: 'male', weight: 75, height: 170 };
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────

// Timer component for hold tests
function HoldTimer({ onComplete }: { onComplete: (seconds: number) => void }) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  };

  const stop = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    onComplete(seconds);
  };

  const reset = () => {
    setIsRunning(false);
    setSeconds(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-6xl font-mono font-bold tabular-nums">
        {mins > 0 && <span>{mins}:</span>}
        <span>{secs.toString().padStart(2, '0')}</span>
      </div>
      <div className="flex gap-3">
        {!isRunning ? (
          <Button onClick={start} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8">
            <Play className="h-5 w-5" />
            {seconds === 0 ? 'Start' : 'Resume'}
          </Button>
        ) : (
          <Button onClick={stop} variant="destructive" className="gap-2 px-8">
            <Pause className="h-5 w-5" />
            Stop
          </Button>
        )}
        {seconds > 0 && !isRunning && (
          <Button onClick={reset} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}

// Countdown timer for timed count tests (e.g., pushups in 60s)
function CountdownTimer({
  duration,
  onComplete,
}: {
  duration: number;
  onComplete: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [count, setCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          setTimeout(onComplete, 100);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className={cn(
        'text-6xl font-mono font-bold tabular-nums transition-colors',
        timeLeft <= 10 && isRunning && 'text-red-500',
        timeLeft <= 5 && isRunning && 'animate-pulse'
      )}>
        {mins}:{secs.toString().padStart(2, '0')}
      </div>

      {isRunning && (
        <div className="flex flex-col items-center gap-4">
          <div className="text-4xl font-bold">{count}</div>
          <Button
            onClick={() => setCount(c => c + 1)}
            className="h-20 w-20 rounded-full bg-primary hover:bg-primary/90 text-white text-2xl font-bold shadow-lg"
          >
            +1
          </Button>
          <p className="text-sm text-muted-foreground">Tap for each rep</p>
        </div>
      )}

      {!isRunning && timeLeft === duration && (
        <Button onClick={start} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8">
          <Play className="h-5 w-5" />
          Start Timer
        </Button>
      )}

      {!isRunning && timeLeft === 0 && (
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Time&apos;s up!</p>
          <p className="text-3xl font-bold text-primary">{count} reps</p>
        </div>
      )}
    </div>
  );
}

// Individual test runner
function TestRunner({
  test,
  onComplete,
  onBack,
}: {
  test: FitnessTestDef;
  onComplete: (value: number) => void;
  onBack: () => void;
}) {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [phase, setPhase] = useState<'instructions' | 'test' | 'result'>('instructions');
  const [result, setResult] = useState<number | null>(null);
  const [manualValue, setManualValue] = useState('');
  const [calcInputs, setCalcInputs] = useState<Record<string, number>>({});
  const [countdownCount, setCountdownCount] = useState(0);
  const profile = getUserProfile();
  const ageGroup = getAgeGroup(profile.age);

  const handleComplete = (value: number) => {
    setResult(value);
    setPhase('result');
  };

  const handleSave = () => {
    if (result === null) return;
    const norms = test.getNorms(profile.gender, ageGroup);
    const testRating = test.id === 'bmi'
      ? getBMIRating(result)
      : getRating(result, norms, test.higherIsBetter);

    saveTestResult({
      testId: test.id,
      value: result,
      rating: testRating,
      date: new Date().toISOString(),
    });
    onComplete(result);
  };

  const norms = test.getNorms(profile.gender, ageGroup);
  const rating = result !== null
    ? (test.id === 'bmi' ? getBMIRating(result) : getRating(result, norms, test.higherIsBetter))
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold">{isAr ? test.nameAr : test.nameEn}</h2>
          <p className="text-sm text-muted-foreground">{isAr ? test.descriptionAr : test.descriptionEn}</p>
        </div>
      </div>

      {/* Instructions Phase */}
      {phase === 'instructions' && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">{isAr ? 'التعليمات' : 'Instructions'}</h3>
            <ol className="space-y-3">
              {(isAr ? test.instructionsAr : test.instructionsEn).map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-medium">
                    {i + 1}
                  </span>
                  <span className="text-sm">{step}</span>
                </li>
              ))}
            </ol>
            <Button onClick={() => setPhase('test')} className="w-full gap-2 mt-4">
              <Play className="h-4 w-4" />
              {isAr ? 'يلا نبدأ' : 'Start Test'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Test Phase */}
      {phase === 'test' && (
        <Card>
          <CardContent className="p-6">
            {test.type === 'hold_timer' && (
              <HoldTimer onComplete={handleComplete} />
            )}

            {test.type === 'timed_count' && (
              <CountdownTimer
                duration={test.duration || 60}
                onComplete={() => setPhase('result')}
              />
            )}

            {test.type === 'manual_input' && (
              <div className="flex flex-col items-center gap-4">
                <p className="text-muted-foreground">{isAr ? 'دخّل القيمة:' : 'Enter your result:'}</p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={manualValue}
                    onChange={(e) => setManualValue(e.target.value)}
                    className="w-32 text-center text-2xl font-bold h-14"
                    placeholder="0"
                  />
                  <span className="text-muted-foreground font-medium">{isAr ? test.unitAr : test.unit}</span>
                </div>
                <Button
                  onClick={() => handleComplete(parseFloat(manualValue) || 0)}
                  disabled={!manualValue}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isAr ? 'تأكيد' : 'Submit'}
                </Button>
              </div>
            )}

            {test.type === 'calculated' && test.inputs && (
              <div className="flex flex-col items-center gap-4">
                {test.inputs.map((input) => (
                  <div key={input.key} className="flex items-center gap-2">
                    <label className="text-sm font-medium w-20">{isAr ? input.labelAr : input.labelEn}</label>
                    <Input
                      type="number"
                      value={calcInputs[input.key] || ''}
                      onChange={(e) => setCalcInputs({ ...calcInputs, [input.key]: parseFloat(e.target.value) || 0 })}
                      className="w-28 text-center h-11"
                      placeholder="0"
                    />
                    <span className="text-sm text-muted-foreground">{input.unit}</span>
                  </div>
                ))}
                <Button
                  onClick={() => {
                    const val = test.calculate!(calcInputs);
                    handleComplete(val);
                  }}
                  disabled={test.inputs.some(inp => !calcInputs[inp.key])}
                  className="gap-2 mt-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isAr ? 'احسب' : 'Calculate'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Result Phase */}
      {phase === 'result' && result !== null && rating && (
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-full', ratingConfig[rating].bg)}>
              <Trophy className={cn('h-5 w-5', ratingConfig[rating].color)} />
              <span className={cn('font-bold', ratingConfig[rating].color)}>
                {isAr ? ratingConfig[rating].labelAr : ratingConfig[rating].label}
              </span>
            </div>

            <div className="text-5xl font-bold">
              {result} <span className="text-lg text-muted-foreground font-normal">{isAr ? test.unitAr : test.unit}</span>
            </div>

            {test.id === 'bmi' && (
              <p className="text-sm text-muted-foreground">
                {getBMICategory(result)}
              </p>
            )}

            {/* Rating scale visualization */}
            <div className="flex justify-center gap-1 mt-4">
              {(['poor', 'below_average', 'average', 'good', 'excellent'] as Rating[]).map((r) => (
                <div
                  key={r}
                  className={cn(
                    'h-2 w-10 rounded-full transition-all',
                    r === rating ? ratingConfig[r].bg.replace('/20', '') : 'bg-muted'
                  )}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground px-1">
              <span>{isAr ? 'ضعيف' : 'Poor'}</span>
              <span>{isAr ? 'ممتاز' : 'Excellent'}</span>
            </div>

            <Button onClick={handleSave} className="w-full gap-2 mt-4">
              <Save className="h-4 w-4" />
              {isAr ? 'احفظ النتيجة' : 'Save Result'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────

export function FitnessTests({ onClose }: { onClose?: () => void }) {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  const activeTest = fitnessTests.find(t => t.id === selectedTest);

  if (activeTest) {
    return (
      <div className="space-y-4">
        {onClose && (
          <div className="flex justify-end">
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <TestRunner
          test={activeTest}
          onComplete={() => setSelectedTest(null)}
          onBack={() => setSelectedTest(null)}
        />
      </div>
    );
  }

  // Group tests by category
  const categories = Object.keys(categoryConfig) as (keyof typeof categoryConfig)[];

  return (
    <div className="space-y-6">
      {onClose && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Timer className="h-6 w-6 text-forma-orange" />
              {isAr ? 'اختبارات اللياقة' : 'Fitness Tests'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isAr ? 'اعرف مستواك وتابع تقدمك' : 'Know your level and track your progress'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {categories.map((cat) => {
        const config = categoryConfig[cat];
        const Icon = config.icon;
        const testsInCategory = fitnessTests.filter(t => t.category === cat);
        if (testsInCategory.length === 0) return null;

        return (
          <div key={cat} className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <div className={cn('p-1.5 rounded-lg', config.bg)}>
                <Icon className={cn('h-4 w-4', config.color)} />
              </div>
              {isAr ? config.labelAr : config.labelEn}
            </h2>
            <div className="space-y-2">
              {testsInCategory.map((test) => {
                const latest = getLatestResult(test.id);
                return (
                  <button
                    key={test.id}
                    onClick={() => setSelectedTest(test.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-card hover:border-primary/50 hover:bg-muted/50 transition-all text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">{isAr ? test.nameAr : test.nameEn}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {isAr ? test.descriptionAr : test.descriptionEn}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {latest && (
                        <Badge className={cn('text-xs', ratingConfig[latest.rating].bg, ratingConfig[latest.rating].color)}>
                          {latest.value} {test.unit}
                        </Badge>
                      )}
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Export for use in workouts page quick action
export { fitnessTests, type TestResult, getLatestResult, getTestHistory };
