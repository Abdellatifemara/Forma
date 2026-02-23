'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Scale,
  Heart,
  Droplets,
  Activity,
  TrendingUp,
  TrendingDown,
  Plus,
  Loader2,
  Target,
  Ruler,
  Moon,
  Footprints,
  Smartphone,
  ChevronRight,
  Zap,
  Brain,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { healthMetricsApi, healthDataApi, type HealthMetricType, type CreateHealthMetricData, type SleepData } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import Link from 'next/link';

/* =========================================================
   RECOVERY SCORE RING — SVG circular progress indicator
   Color-coded: green >= 70, yellow 50-69, red < 50
   ========================================================= */

function RecoveryRing({ score, size = 180 }: { score: number; size?: number }) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 70 ? '#22C55E' : score >= 50 ? '#EAB308' : '#EF4444';
  const label = score >= 70 ? 'Good' : score >= 50 ? 'Moderate' : 'Low';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="progress-ring">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-muted-foreground font-medium mt-0.5">{label}</span>
      </div>
    </div>
  );
}

/* =========================================================
   STRAIN GAUGE — Horizontal segmented bar (0–21 scale)
   Inspired by WHOOP but with our own visual identity
   ========================================================= */

function StrainGauge({ strain, maxStrain = 21 }: { strain: number; maxStrain?: number }) {
  const segments = 21;
  const filledSegments = Math.round((strain / maxStrain) * segments);

  // Color gradient: blue(light) → teal → yellow → orange → red(max)
  const getSegmentColor = (index: number) => {
    const ratio = index / segments;
    if (ratio < 0.25) return 'bg-blue-400';
    if (ratio < 0.45) return 'bg-primary';
    if (ratio < 0.65) return 'bg-yellow-400';
    if (ratio < 0.8) return 'bg-orange-400';
    return 'bg-red-500';
  };

  const level = strain <= 5 ? 'Light' : strain <= 10 ? 'Moderate' : strain <= 15 ? 'Hard' : 'Max';

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{strain.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">/ {maxStrain}</span>
        </div>
        <span className="text-sm font-medium text-muted-foreground">{level}</span>
      </div>
      <div className="flex gap-[3px]">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-3 flex-1 rounded-sm transition-all duration-500',
              i < filledSegments ? getSegmentColor(i) : 'bg-muted',
              i < filledSegments ? 'opacity-100' : 'opacity-100'
            )}
            style={{
              transitionDelay: `${i * 30}ms`,
            }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-muted-foreground">0</span>
        <span className="text-[10px] text-muted-foreground">7</span>
        <span className="text-[10px] text-muted-foreground">14</span>
        <span className="text-[10px] text-muted-foreground">21</span>
      </div>
    </div>
  );
}

/* =========================================================
   SLEEP BREAKDOWN — Stacked horizontal bar
   Shows REM / Deep / Light / Awake segments
   ========================================================= */

function SleepBreakdown({ totalHours, sleepStages, isAr }: { totalHours: number; sleepStages?: SleepData['stages'] | null; isAr: boolean }) {
  const hasRealStages = sleepStages && (sleepStages.deep.hours > 0 || sleepStages.rem.hours > 0);

  const stages = hasRealStages
    ? {
        rem: { pct: sleepStages.rem.percentage / 100, hours: sleepStages.rem.hours, color: 'bg-purple-500', label: isAr ? 'REM' : 'REM' },
        deep: { pct: sleepStages.deep.percentage / 100, hours: sleepStages.deep.hours, color: 'bg-blue-600', label: isAr ? '\u0639\u0645\u064A\u0642' : 'Deep' },
        light: { pct: sleepStages.light.percentage / 100, hours: sleepStages.light.hours, color: 'bg-sky-400', label: isAr ? '\u062E\u0641\u064A\u0641' : 'Light' },
        awake: { pct: sleepStages.awake.percentage / 100, hours: sleepStages.awake.hours, color: 'bg-muted-foreground/30', label: isAr ? '\u0645\u0633\u062A\u064A\u0642\u0638' : 'Awake' },
      }
    : null;

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-bold">{totalHours.toFixed(1)}</span>
        <span className="text-sm text-muted-foreground">{isAr ? '\u0633\u0627\u0639\u0627\u062A' : 'hours'}</span>
      </div>

      {stages ? (
        <>
          {/* Stacked bar */}
          <div className="flex h-7 rounded-full overflow-hidden">
            {Object.entries(stages).map(([key, stage]) => (
              <div
                key={key}
                className={cn('transition-all duration-700', stage.color)}
                style={{ width: `${stage.pct * 100}%` }}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
            {Object.entries(stages).map(([key, stage]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={cn('h-2.5 w-2.5 rounded-full', stage.color)} />
                <span className="text-xs text-muted-foreground">
                  {stage.label} {stage.hours.toFixed(1)}h
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-xs text-muted-foreground mt-2">
          {isAr ? 'قم بمزامنة جهازك لرؤية مراحل النوم' : 'Sync your wearable to see sleep stages'}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   HRV SPARKLINE — 7-dot connected line chart
   ========================================================= */

function HrvSparkline({ data }: { data: number[] }) {
  if (data.length === 0) return null;

  const width = 240;
  const height = 60;
  const padding = 8;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: padding + (i / (data.length - 1 || 1)) * innerW,
    y: padding + innerH - ((v - min) / range) * innerH,
    value: v,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  return (
    <div className="relative">
      <svg width={width} height={height} className="w-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {/* Line */}
        <path d={pathD} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3.5"
            fill="white"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            className="sparkline-dot"
          />
        ))}
      </svg>
    </div>
  );
}

/* =========================================================
   WEIGHT CHART — Dots-connected line (not bar chart)
   ========================================================= */

function WeightChart({ isAr }: { isAr: boolean }) {
  const { data: history, isLoading } = useQuery({
    queryKey: ['health-metric-history', 'WEIGHT'],
    queryFn: () => healthMetricsApi.getByType('WEIGHT', 90),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {isAr ? '\u0645\u0641\u064A\u0634 \u0628\u064A\u0627\u0646\u0627\u062A \u0648\u0632\u0646 \u0644\u0633\u0647. \u0627\u0628\u062F\u0623 \u062A\u062A\u0628\u0651\u0639 \u0639\u0634\u0627\u0646 \u062A\u0634\u0648\u0641 \u062A\u0642\u062F\u0645\u0643!' : 'No weight data yet. Start tracking to see your progress!'}
      </div>
    );
  }

  const minWeight = Math.min(...history.map((h) => h.value)) - 1;
  const maxWeight = Math.max(...history.map((h) => h.value)) + 1;
  const range = maxWeight - minWeight || 1;

  const width = 600;
  const height = 160;
  const padX = 40;
  const padY = 16;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const points = history.map((entry, i) => ({
    x: padX + (i / (history.length - 1 || 1)) * innerW,
    y: padY + innerH - ((entry.value - minWeight) / range) * innerH,
    value: entry.value,
    date: entry.date,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="relative overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
          <line
            key={pct}
            x1={padX}
            x2={width - padX}
            y1={padY + innerH * (1 - pct)}
            y2={padY + innerH * (1 - pct)}
            stroke="hsl(var(--border))"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}
        {/* Area fill */}
        <path
          d={`${pathD} L ${points[points.length - 1].x} ${padY + innerH} L ${points[0].x} ${padY + innerH} Z`}
          fill="hsl(var(--primary) / 0.06)"
        />
        {/* Line */}
        <path d={pathD} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="white"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
        ))}
        {/* Y-axis labels */}
        <text x={padX - 6} y={padY + 4} textAnchor="end" className="fill-muted-foreground" fontSize="10">{maxWeight.toFixed(0)}</text>
        <text x={padX - 6} y={padY + innerH + 4} textAnchor="end" className="fill-muted-foreground" fontSize="10">{minWeight.toFixed(0)}</text>
      </svg>
    </div>
  );
}

/* =========================================================
   CONNECT DEVICE CTA
   ========================================================= */

function ConnectDeviceCTA({ isAr }: { isAr: boolean }) {
  const devices = [
    { name: 'Apple Health', icon: '🍎' },
    { name: 'Google Fit', icon: '💚' },
    { name: 'WHOOP', icon: '💪' },
    { name: 'Garmin', icon: '🏃' },
    { name: 'OURA', icon: '💍' },
    { name: 'Fitbit', icon: '⌚' },
    { name: 'Samsung Health', icon: '📱' },
    { name: 'Apple Watch', icon: '⌚' },
  ];

  return (
    <Card className="card-premium border-dashed border-2 border-amber-500/20">
      <CardContent className="p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <Smartphone className="h-7 w-7 text-amber-500" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mb-1">
          <h3 className="font-semibold text-lg">
            {isAr ? 'وصّل جهازك' : 'Connect Your Device'}
          </h3>
          <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full px-2 py-0.5">
            {isAr ? 'تجريبي' : 'BETA'}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {isAr
            ? 'سجّل جهازك — الربط التلقائي هيبقى متاح مع التطبيق الموبايل. دلوقتي تقدر تسجّل بياناتك يدوي.'
            : 'Register your device — auto-sync coming with the mobile app. For now, log your data manually.'}
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-4">
          {devices.map((d) => (
            <div key={d.name} className="relative flex flex-col items-center gap-1">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center text-lg bg-muted">
                {d.icon}
              </div>
              <span className="text-[10px] text-muted-foreground">{d.name}</span>
            </div>
          ))}
        </div>
        <Button variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10" asChild>
          <Link href="/chat">
            <Sparkles className="h-4 w-4 me-2" />
            {isAr ? 'وصّل من الشات' : 'Connect via Chat'}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   METRIC CARD — Individual health metric with trend
   ========================================================= */

const getMetricCategories = (isAr: boolean) => ({
  body: {
    label: isAr ? '\u0642\u064A\u0627\u0633\u0627\u062A \u0627\u0644\u062C\u0633\u0645' : 'Body Measurements',
    icon: Scale,
    metrics: [
      { type: 'WEIGHT' as HealthMetricType, label: isAr ? '\u0627\u0644\u0648\u0632\u0646' : 'Weight', unit: 'kg', icon: Scale },
      { type: 'BODY_FAT_PERCENTAGE' as HealthMetricType, label: isAr ? '\u0646\u0633\u0628\u0629 \u0627\u0644\u062F\u0647\u0648\u0646' : 'Body Fat', unit: '%', icon: Target },
      { type: 'WAIST_CIRCUMFERENCE' as HealthMetricType, label: isAr ? '\u0645\u062D\u064A\u0637 \u0627\u0644\u0648\u0633\u0637' : 'Waist', unit: 'cm', icon: Ruler },
      { type: 'HIP_CIRCUMFERENCE' as HealthMetricType, label: isAr ? '\u0645\u062D\u064A\u0637 \u0627\u0644\u0623\u0631\u062F\u0627\u0641' : 'Hip', unit: 'cm', icon: Ruler },
    ],
  },
  vitals: {
    label: isAr ? '\u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629' : 'Vital Signs',
    icon: Heart,
    metrics: [
      { type: 'BLOOD_PRESSURE_SYSTOLIC' as HealthMetricType, label: isAr ? '\u0636\u063A\u0637 \u0627\u0644\u062F\u0645 (\u0627\u0646\u0642\u0628\u0627\u0636\u064A)' : 'Blood Pressure (Sys)', unit: 'mmHg', icon: Heart },
      { type: 'BLOOD_PRESSURE_DIASTOLIC' as HealthMetricType, label: isAr ? '\u0636\u063A\u0637 \u0627\u0644\u062F\u0645 (\u0627\u0646\u0628\u0633\u0627\u0637\u064A)' : 'Blood Pressure (Dia)', unit: 'mmHg', icon: Heart },
      { type: 'HEART_RATE_RESTING' as HealthMetricType, label: isAr ? '\u0646\u0628\u0636 \u0627\u0644\u0642\u0644\u0628 \u0648\u0642\u062A \u0627\u0644\u0631\u0627\u062D\u0629' : 'Resting Heart Rate', unit: 'bpm', icon: Activity },
    ],
  },
  blood: {
    label: isAr ? '\u062A\u062D\u0627\u0644\u064A\u0644 \u0627\u0644\u062F\u0645' : 'Blood Work',
    icon: Droplets,
    metrics: [
      { type: 'BLOOD_GLUCOSE_FASTING' as HealthMetricType, label: isAr ? '\u0633\u0643\u0631 \u0635\u0627\u064A\u0645' : 'Fasting Glucose', unit: 'mg/dL', icon: Droplets },
      { type: 'TOTAL_CHOLESTEROL' as HealthMetricType, label: isAr ? '\u0627\u0644\u0643\u0648\u0644\u064A\u0633\u062A\u0631\u0648\u0644 \u0627\u0644\u0643\u0644\u064A' : 'Total Cholesterol', unit: 'mg/dL', icon: Droplets },
      { type: 'LDL_CHOLESTEROL' as HealthMetricType, label: isAr ? '\u0643\u0648\u0644\u064A\u0633\u062A\u0631\u0648\u0644 LDL' : 'LDL Cholesterol', unit: 'mg/dL', icon: Droplets },
      { type: 'HDL_CHOLESTEROL' as HealthMetricType, label: isAr ? '\u0643\u0648\u0644\u064A\u0633\u062A\u0631\u0648\u0644 HDL' : 'HDL Cholesterol', unit: 'mg/dL', icon: Droplets },
      { type: 'TRIGLYCERIDES' as HealthMetricType, label: isAr ? '\u0627\u0644\u062F\u0647\u0648\u0646 \u0627\u0644\u062B\u0644\u0627\u062B\u064A\u0629' : 'Triglycerides', unit: 'mg/dL', icon: Droplets },
    ],
  },
  lifestyle: {
    label: isAr ? '\u0646\u0645\u0637 \u0627\u0644\u062D\u064A\u0627\u0629' : 'Lifestyle',
    icon: Activity,
    metrics: [
      { type: 'SLEEP_HOURS' as HealthMetricType, label: isAr ? '\u0627\u0644\u0646\u0648\u0645' : 'Sleep', unit: isAr ? '\u0633\u0627\u0639\u0627\u062A' : 'hours', icon: Moon },
      { type: 'WATER_INTAKE_ML' as HealthMetricType, label: isAr ? '\u0634\u0631\u0628 \u0627\u0644\u0645\u064A\u0629' : 'Water Intake', unit: isAr ? '\u0645\u0644' : 'ml', icon: Droplets },
      { type: 'STEPS' as HealthMetricType, label: isAr ? '\u0627\u0644\u062E\u0637\u0648\u0627\u062A' : 'Steps', unit: isAr ? '\u062E\u0637\u0648\u0629' : 'steps', icon: Footprints },
    ],
  },
});

function MetricCard({
  type,
  label,
  unit,
  icon: Icon,
  onAdd,
  isAr,
}: {
  type: HealthMetricType;
  label: string;
  unit: string;
  icon: React.ElementType;
  onAdd: (type: HealthMetricType) => void;
  isAr: boolean;
}) {
  const { data: latest, isLoading } = useQuery({
    queryKey: ['health-metric-latest', type],
    queryFn: () => healthMetricsApi.getLatest(type),
  });

  const { data: history } = useQuery({
    queryKey: ['health-metric-history', type],
    queryFn: () => healthMetricsApi.getByType(type, 30),
  });

  let trend: 'up' | 'down' | 'stable' = 'stable';
  let trendValue = 0;
  if (history && history.length >= 2) {
    const recent = history[history.length - 1].value;
    const previous = history[0].value;
    trendValue = recent - previous;
    if (trendValue > 0) trend = 'up';
    else if (trendValue < 0) trend = 'down';
  }

  return (
    <Card className="card-premium">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mt-1" />
              ) : latest ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{latest.value}</span>
                  <span className="text-sm text-muted-foreground">{unit}</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">{isAr ? '\u0645\u0641\u064A\u0634 \u0628\u064A\u0627\u0646\u0627\u062A' : 'No data'}</span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {trend !== 'stable' && trendValue !== 0 && (
              <div className={cn(
                'flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5',
                trend === 'up' ? 'text-red-600 bg-red-50 dark:bg-red-500/10' : 'text-green-600 bg-green-50 dark:bg-green-500/10'
              )}>
                {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{Math.abs(trendValue).toFixed(1)}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-primary/10"
              onClick={() => onAdd(type)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {latest && (
          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
            {isAr ? '\u0622\u062E\u0631 \u062A\u062D\u062F\u064A\u062B: ' : 'Last updated: '}{new Date(latest.date).toLocaleDateString(isAr ? 'ar-EG' : undefined)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/* =========================================================
   ADD METRIC DIALOG
   ========================================================= */

function AddMetricDialog({
  open,
  onOpenChange,
  selectedType,
  isAr,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedType: HealthMetricType | null;
  isAr: boolean;
}) {
  const queryClient = useQueryClient();
  const [type, setType] = useState<HealthMetricType | ''>(selectedType || '');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = getMetricCategories(isAr);
  const allMetrics = Object.values(categories).flatMap((cat) => cat.metrics);
  const selectedMetric = allMetrics.find((m) => m.type === type);

  const addMutation = useMutation({
    mutationFn: (data: CreateHealthMetricData) => healthMetricsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-metric-latest', type] });
      queryClient.invalidateQueries({ queryKey: ['health-metric-history', type] });
      queryClient.invalidateQueries({ queryKey: ['health-metrics-dashboard'] });
      onOpenChange(false);
      setValue('');
    },
  });

  const handleSubmit = () => {
    if (!type || !value) return;
    const numVal = parseFloat(value);
    if (isNaN(numVal) || numVal <= 0 || numVal > 10000) return;
    addMutation.mutate({
      type: type as HealthMetricType,
      value: numVal,
      unit: selectedMetric?.unit || '',
      date,
    });
  };

  useEffect(() => {
    if (selectedType && type !== selectedType) {
      setType(selectedType);
    }
  }, [selectedType]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isAr ? '\u0625\u0636\u0627\u0641\u0629 \u0642\u064A\u0627\u0633 \u0635\u062D\u064A' : 'Add Health Metric'}</DialogTitle>
          <DialogDescription>
            {isAr ? '\u0633\u062C\u0651\u0644 \u0642\u064A\u0627\u0633 \u0635\u062D\u064A \u062C\u062F\u064A\u062F' : 'Record a new health measurement'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>{isAr ? '\u0646\u0648\u0639 \u0627\u0644\u0642\u064A\u0627\u0633' : 'Metric Type'}</Label>
            <Select value={type} onValueChange={(v) => setType(v as HealthMetricType)}>
              <SelectTrigger>
                <SelectValue placeholder={isAr ? '\u0627\u062E\u062A\u0627\u0631 \u0627\u0644\u0642\u064A\u0627\u0633' : 'Select metric'} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categories).map(([key, category]) => (
                  <div key={key}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      {category.label}
                    </div>
                    {category.metrics.map((metric) => (
                      <SelectItem key={metric.type} value={metric.type}>
                        {metric.label} ({metric.unit})
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{isAr ? '\u0627\u0644\u0642\u064A\u0645\u0629' : 'Value'} {selectedMetric && `(${selectedMetric.unit})`}</Label>
            <Input
              type="number"
              step="0.1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={isAr ? `\u0627\u062F\u062E\u0644 ${selectedMetric?.label || '\u0627\u0644\u0642\u064A\u0645\u0629'}` : `Enter ${selectedMetric?.label.toLowerCase() || 'value'}`}
            />
          </div>

          <div className="space-y-2">
            <Label>{isAr ? '\u0627\u0644\u062A\u0627\u0631\u064A\u062E' : 'Date'}</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <Button
            className="w-full btn-primary"
            onClick={handleSubmit}
            disabled={!type || !value || addMutation.isPending}
          >
            {addMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin me-2" />
            ) : (
              <Plus className="h-4 w-4 me-2" />
            )}
            {isAr ? '\u0625\u0636\u0627\u0641\u0629 \u0642\u064A\u0627\u0633' : 'Add Metric'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
   MAIN HEALTH PAGE
   ========================================================= */


export default function HealthPage() {
  // Health dashboard available to all tiers — experimental feature
  return <HealthDashboard />;
}

function HealthDashboard() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const metricCategories = getMetricCategories(isAr);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedMetricType, setSelectedMetricType] = useState<HealthMetricType | null>(null);

  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['health-metrics-dashboard'],
    queryFn: () => healthMetricsApi.getDashboard(),
    retry: 1,
  });

  // Real wearable data from /health-data endpoints (graceful failure — these need wearable data)
  const { data: readiness } = useQuery({
    queryKey: ['health-data-readiness'],
    queryFn: () => healthDataApi.getReadiness(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const { data: strain } = useQuery({
    queryKey: ['health-data-strain'],
    queryFn: () => healthDataApi.getStrain(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const { data: sleepData } = useQuery({
    queryKey: ['health-data-sleep'],
    queryFn: () => healthDataApi.getSleep(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const { data: readinessTrend } = useQuery({
    queryKey: ['health-data-readiness-trend'],
    queryFn: () => healthDataApi.getReadinessTrend(7),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Derive display values from real API data (fallback to defaults for empty state)
  const recoveryScore = readiness?.score ?? 0;
  const strainScore = strain?.strain ?? 0;
  const sleepHours = sleepData?.totalHours ?? 0;

  // Get resting HR from readiness factors or latest health metric
  const rhrFactor = readiness?.factors?.find(f => f.name === 'Resting Heart Rate');
  const restingHR = rhrFactor?.value ?? 0;

  // HRV from readiness trend daily scores, or from factors
  const hrvFromTrend = readinessTrend?.daily?.map(d => d.score) ?? [];
  const hrvFactor = readiness?.factors?.find(f => f.name === 'Heart Rate Variability');
  const hrvLatest = hrvFactor?.value ?? (hrvFromTrend.length > 0 ? hrvFromTrend[hrvFromTrend.length - 1] : 0);
  const hrvData = hrvFromTrend.length > 0 ? hrvFromTrend : [hrvLatest];
  const hrvTrend = hrvData.length >= 2 ? hrvData[hrvData.length - 1] - hrvData[0] : 0;

  const hasWearableData = readiness?.factors && readiness.factors.length > 0;

  const handleAddMetric = (type: HealthMetricType) => {
    setSelectedMetricType(type);
    setAddDialogOpen(true);
  };

  return (
    <div className={cn('space-y-6 pb-20 lg:pb-8', isAr && 'text-right font-cairo')}>
      {/* Experimental Banner */}
      <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="p-2 rounded-lg bg-amber-500/10">
          <Sparkles className="h-5 w-5 text-amber-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
            {isAr ? 'ميزة تجريبية' : 'Experimental Feature'}
          </p>
          <p className="text-xs text-muted-foreground">
            {isAr
              ? 'لوحة الصحة وربط الأجهزة في مرحلة تجريبية. البيانات اليدوية شغّالة. ربط الأجهزة الذكية قريباً مع التطبيق الموبايل.'
              : 'Health dashboard & device sync are experimental. Manual data entry works now. Smartwatch sync coming with the mobile app.'}
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t.health.title}</h1>
          <p className="text-muted-foreground">{t.health.subtitle}</p>
        </div>
        <Button className="btn-primary" onClick={() => {
          setSelectedMetricType(null);
          setAddDialogOpen(true);
        }}>
          <Plus className={cn('h-4 w-4', isAr ? 'ms-2' : 'me-2')} />
          {isAr ? '\u0625\u0636\u0627\u0641\u0629 \u0642\u064A\u0627\u0633' : 'Add Metric'}
        </Button>
      </div>

      {/* ===== WHOOP-STYLE TOP SECTION ===== */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Recovery Score Ring */}
        <Card className="card-premium md:row-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-green-50 dark:bg-green-500/10">
                <Brain className="h-4 w-4 text-green-500" />
              </div>
              {isAr ? '\u0646\u0633\u0628\u0629 \u0627\u0644\u062A\u0639\u0627\u0641\u064A' : 'Recovery'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-2">
            <RecoveryRing score={recoveryScore} />
            <div className="grid grid-cols-2 gap-4 mt-6 w-full">
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <p className="text-lg font-bold">{hrvLatest}</p>
                <p className="text-xs text-muted-foreground">HRV (ms)</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <p className="text-lg font-bold">{restingHR}</p>
                <p className="text-xs text-muted-foreground">RHR (bpm)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strain Gauge */}
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-500/10">
                <Zap className="h-4 w-4 text-orange-500" />
              </div>
              {isAr ? '\u0645\u0639\u062F\u0644 \u0627\u0644\u0625\u062C\u0647\u0627\u062F' : 'Strain'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StrainGauge strain={strainScore} />
          </CardContent>
        </Card>

        {/* Sleep Breakdown */}
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/10">
                <Moon className="h-4 w-4 text-purple-500" />
              </div>
              {isAr ? '\u0627\u0644\u0646\u0648\u0645' : 'Sleep'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SleepBreakdown totalHours={sleepHours} sleepStages={sleepData?.stages} isAr={isAr} />
          </CardContent>
        </Card>

        {/* HRV Trend */}
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              {isAr ? '\u062A\u063A\u064A\u0631 HRV (7 \u0623\u064A\u0627\u0645)' : 'HRV Trend (7 days)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold">{hrvLatest}</span>
              <span className="text-sm text-muted-foreground">ms</span>
              {hrvTrend !== 0 && (
                <span className={cn(
                  'flex items-center gap-0.5 text-xs font-medium rounded-full px-2 py-0.5',
                  hrvTrend > 0 ? 'text-green-600 bg-green-50 dark:bg-green-500/10' : 'text-red-600 bg-red-50 dark:bg-red-500/10'
                )}>
                  {hrvTrend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {hrvTrend > 0 ? '+' : ''}{hrvTrend}
                </span>
              )}
            </div>
            <HrvSparkline data={hrvData} />
          </CardContent>
        </Card>

        {/* Resting Heart Rate */}
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10">
                <Heart className="h-4 w-4 text-red-500" />
              </div>
              {isAr ? '\u0646\u0628\u0636 \u0627\u0644\u0631\u0627\u062D\u0629' : 'Resting Heart Rate'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{restingHR}</span>
              <span className="text-sm text-muted-foreground">bpm</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-red-400 transition-all duration-700"
                  style={{ width: `${Math.min(100, (restingHR / 100) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {restingHR < 60 ? (isAr ? '\u0645\u0645\u062A\u0627\u0632' : 'Excellent') : restingHR < 70 ? (isAr ? '\u062C\u064A\u062F' : 'Good') : (isAr ? '\u0639\u0627\u062F\u064A' : 'Average')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connect Device CTA */}
      <ConnectDeviceCTA isAr={isAr} />

      {/* Dashboard Summary — from existing API */}
      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="card-premium">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Scale className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{isAr ? '\u0627\u0644\u0648\u0632\u0646' : 'Weight'}</p>
                  <p className="text-xl font-bold">
                    {dashboard.current.weight?.value || '-'} kg
                  </p>
                </div>
              </div>
              {dashboard.trends?.weightChange != null && (
                <p className={cn(
                  'text-xs mt-2 font-medium',
                  dashboard.trends.weightChange > 0 ? 'text-red-500' : 'text-green-500'
                )}>
                  {dashboard.trends.weightChange > 0 ? '+' : ''}
                  {dashboard.trends.weightChange.toFixed(1)} {isAr ? '\u0643\u062C\u0645 (\u0669\u0660 \u064A\u0648\u0645)' : 'kg (90 days)'}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <Target className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{isAr ? '\u0646\u0633\u0628\u0629 \u0627\u0644\u062F\u0647\u0648\u0646' : 'Body Fat'}</p>
                  <p className="text-xl font-bold">
                    {dashboard.current.bodyFat?.value || '-'}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10">
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{isAr ? '\u0636\u063A\u0637 \u0627\u0644\u062F\u0645' : 'Blood Pressure'}</p>
                  <p className="text-xl font-bold">
                    {dashboard.current.bloodPressure?.value || '-'} mmHg
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10">
                  <Droplets className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{isAr ? '\u0627\u0644\u0633\u0643\u0631' : 'Glucose'}</p>
                  <p className="text-xl font-bold">
                    {dashboard.current.glucose?.value || '-'} mg/dL
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Weight Trend Chart */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {isAr ? '\u062A\u062A\u0628\u0651\u0639 \u0627\u0644\u0648\u0632\u0646 (\u0669\u0660 \u064A\u0648\u0645)' : 'Weight Trend (90 Days)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WeightChart isAr={isAr} />
        </CardContent>
      </Card>

      {/* All Metrics by Category — Pill-style tabs */}
      <Tabs defaultValue="body" className="w-full">
        <TabsList className="w-full flex rounded-full bg-muted p-1 h-auto">
          <TabsTrigger value="body" className="flex-1 rounded-full text-sm py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-card">
            {isAr ? '\u0627\u0644\u062C\u0633\u0645' : 'Body'}
          </TabsTrigger>
          <TabsTrigger value="vitals" className="flex-1 rounded-full text-sm py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-card">
            {isAr ? '\u0627\u0644\u062D\u064A\u0648\u064A\u0629' : 'Vitals'}
          </TabsTrigger>
          <TabsTrigger value="blood" className="flex-1 rounded-full text-sm py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-card">
            {isAr ? '\u062A\u062D\u0627\u0644\u064A\u0644' : 'Blood'}
          </TabsTrigger>
          <TabsTrigger value="lifestyle" className="flex-1 rounded-full text-sm py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-card">
            {isAr ? '\u0646\u0645\u0637 \u0627\u0644\u062D\u064A\u0627\u0629' : 'Lifestyle'}
          </TabsTrigger>
        </TabsList>

        {Object.entries(metricCategories).map(([key, category]) => (
          <TabsContent key={key} value={key} className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {category.metrics.map((metric) => (
                <MetricCard
                  key={metric.type}
                  type={metric.type}
                  label={metric.label}
                  unit={metric.unit}
                  icon={metric.icon}
                  onAdd={handleAddMetric}
                  isAr={isAr}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Add Metric Dialog */}
      <AddMetricDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        selectedType={selectedMetricType}
        isAr={isAr}
      />
    </div>
  );
}
