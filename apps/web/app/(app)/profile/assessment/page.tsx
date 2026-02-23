'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronDown,
  Check,
  Loader2,
  Dumbbell,
  Heart,
  Activity,
  Moon,
  Scale,
  Pill,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useAssessment, useSaveAssessment } from '@/hooks/use-user';
import { useLanguage } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// --- Section wrapper: collapsible card ---
function Section({
  icon: Icon,
  title,
  filled,
  open,
  onToggle,
  children,
}: {
  icon: React.ElementType;
  title: string;
  filled: boolean;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn('transition-all', open && 'ring-2 ring-forma-orange/30')}>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-start"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl',
            filled ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'
          )}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">{title}</p>
            {filled && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <Check className="h-3 w-3" /> Saved
              </p>
            )}
          </div>
        </div>
        <ChevronDown className={cn('h-5 w-5 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <CardContent className="border-t pt-4 space-y-4">
          {children}
        </CardContent>
      )}
    </Card>
  );
}

// --- Number input helper ---
function NumberField({
  label,
  value,
  onChange,
  placeholder,
  min,
  max,
  unit,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  unit?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <div className="relative">
        <Input
          type="number"
          value={value ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === '' ? undefined : Number(v));
          }}
          placeholder={placeholder}
          min={min}
          max={max}
          className={unit ? 'pe-12' : ''}
        />
        {unit && (
          <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export default function AssessmentPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { toast } = useToast();
  const { data: assessment, isLoading } = useAssessment();
  const saveAssessment = useSaveAssessment();

  const [openSection, setOpenSection] = useState<string | null>(null);

  // --- Section states ---
  const [trainingHistory, setTrainingHistory] = useState({
    totalYearsTraining: undefined as number | undefined,
    currentLevel: '',
    preferredTrainingStyle: '',
    preferredSplitType: '',
    preferredRepRange: '',
    sportsBackground: [] as string[],
  });

  const [fitnessTests, setFitnessTests] = useState({
    pushUpMaxReps: undefined as number | undefined,
    plankHoldSeconds: undefined as number | undefined,
    pullUpMaxReps: undefined as number | undefined,
    benchPress1RM: undefined as number | undefined,
    squat1RM: undefined as number | undefined,
    deadlift1RM: undefined as number | undefined,
    bodyweightSquatMaxReps: undefined as number | undefined,
    canTouchToes: false,
  });

  const [healthProfile, setHealthProfile] = useState({
    hasHeartCondition: false,
    hasHighBloodPressure: false,
    hasDiabetes: false,
    diabetesType: undefined as number | undefined,
    hasAsthma: false,
    hasArthritis: false,
    hasHerniaHistory: false,
    hadRecentSurgery: false,
    surgeryDetails: '',
    hasDoctorClearance: false,
  });

  const [supplements, setSupplements] = useState({
    takesProteinPowder: false,
    proteinPowderType: '',
    takesCreatine: false,
    takesPreWorkout: false,
    otherSupplements: [] as string[],
  });

  const [lifestyle, setLifestyle] = useState({
    averageSleepHours: undefined as number | undefined,
    sleepQuality: '',
    currentStressLevel: '',
    targetWorkoutsPerWeek: undefined as number | undefined,
    maxWorkoutMinutes: undefined as number | undefined,
    preferredWorkoutTime: '',
    workType: '',
  });

  const [fasting, setFasting] = useState({
    doesIntermittentFasting: false,
    ifProtocol: '',
    eatingWindowStart: '',
    eatingWindowEnd: '',
    observesRamadan: false,
    ramadanActive: false,
    ramadanWorkoutTiming: '',
  });

  const [bodyComposition, setBodyComposition] = useState({
    currentWeightKg: undefined as number | undefined,
    heightCm: undefined as number | undefined,
    bodyFatPercent: undefined as number | undefined,
    bodyType: '',
    waistCm: undefined as number | undefined,
    hipsGlutesCm: undefined as number | undefined,
    chestCm: undefined as number | undefined,
  });

  // Populate from API data
  useEffect(() => {
    if (!assessment) return;
    if (assessment.trainingHistory) {
      const d = assessment.trainingHistory;
      setTrainingHistory({
        totalYearsTraining: d.totalYearsTraining ?? undefined,
        currentLevel: d.currentLevel ?? '',
        preferredTrainingStyle: d.preferredTrainingStyle ?? '',
        preferredSplitType: d.preferredSplitType ?? '',
        preferredRepRange: d.preferredRepRange ?? '',
        sportsBackground: d.sportsBackground ?? [],
      });
    }
    if (assessment.fitnessTests) {
      const d = assessment.fitnessTests;
      setFitnessTests({
        pushUpMaxReps: d.pushUpMaxReps ?? undefined,
        plankHoldSeconds: d.plankHoldSeconds ?? undefined,
        pullUpMaxReps: d.pullUpMaxReps ?? undefined,
        benchPress1RM: d.benchPress1RM ?? undefined,
        squat1RM: d.squat1RM ?? undefined,
        deadlift1RM: d.deadlift1RM ?? undefined,
        bodyweightSquatMaxReps: d.bodyweightSquatMaxReps ?? undefined,
        canTouchToes: d.canTouchToes ?? false,
      });
    }
    if (assessment.healthProfile) {
      const d = assessment.healthProfile;
      setHealthProfile({
        hasHeartCondition: d.hasHeartCondition ?? false,
        hasHighBloodPressure: d.hasHighBloodPressure ?? false,
        hasDiabetes: d.hasDiabetes ?? false,
        diabetesType: d.diabetesType ?? undefined,
        hasAsthma: d.hasAsthma ?? false,
        hasArthritis: d.hasArthritis ?? false,
        hasHerniaHistory: d.hasHerniaHistory ?? false,
        hadRecentSurgery: d.hadRecentSurgery ?? false,
        surgeryDetails: d.surgeryDetails ?? '',
        hasDoctorClearance: d.hasDoctorClearance ?? false,
      });
    }
    if (assessment.supplements) {
      const d = assessment.supplements;
      setSupplements({
        takesProteinPowder: d.takesProteinPowder ?? false,
        proteinPowderType: d.proteinPowderType ?? '',
        takesCreatine: d.takesCreatine ?? false,
        takesPreWorkout: d.takesPreWorkout ?? false,
        otherSupplements: d.otherSupplements ?? [],
      });
    }
    if (assessment.lifestyle) {
      const d = assessment.lifestyle;
      setLifestyle({
        averageSleepHours: d.averageSleepHours ?? undefined,
        sleepQuality: d.sleepQuality ?? '',
        currentStressLevel: d.currentStressLevel ?? '',
        targetWorkoutsPerWeek: d.targetWorkoutsPerWeek ?? undefined,
        maxWorkoutMinutes: d.maxWorkoutMinutes ?? undefined,
        preferredWorkoutTime: d.preferredWorkoutTime ?? '',
        workType: d.workType ?? '',
      });
    }
    if (assessment.fasting) {
      const d = assessment.fasting;
      setFasting({
        doesIntermittentFasting: d.doesIntermittentFasting ?? false,
        ifProtocol: d.ifProtocol ?? '',
        eatingWindowStart: d.eatingWindowStart ?? '',
        eatingWindowEnd: d.eatingWindowEnd ?? '',
        observesRamadan: d.observesRamadan ?? false,
        ramadanActive: d.ramadanActive ?? false,
        ramadanWorkoutTiming: d.ramadanWorkoutTiming ?? '',
      });
    }
    if (assessment.bodyComposition) {
      const d = assessment.bodyComposition;
      setBodyComposition({
        currentWeightKg: d.currentWeightKg ?? undefined,
        heightCm: d.heightCm ?? undefined,
        bodyFatPercent: d.bodyFatPercent ?? undefined,
        bodyType: d.bodyType ?? '',
        waistCm: d.waistCm ?? undefined,
        hipsGlutesCm: d.hipsGlutesCm ?? undefined,
        chestCm: d.chestCm ?? undefined,
      });
    }
  }, [assessment]);

  // --- Save a single section ---
  const saveSection = async (key: string, data: Record<string, unknown>) => {
    try {
      await saveAssessment.mutateAsync({ [key]: data } as any);
      toast({
        title: isAr ? 'تم الحفظ' : 'Saved',
        description: isAr ? 'تم حفظ البيانات بنجاح' : 'Your data has been saved successfully',
      });
    } catch {
      toast({
        title: isAr ? 'فشل الحفظ' : 'Save failed',
        variant: 'destructive',
      });
    }
  };

  // Check if section has data
  const isFilled = (key: string) => {
    if (!assessment) return false;
    const val = (assessment as any)[key];
    return val !== null && val !== undefined;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-forma-orange" />
      </div>
    );
  }

  const toggle = (key: string) => setOpenSection(openSection === key ? null : key);

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/profile">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isAr ? 'تقييم اللياقة' : 'Fitness Assessment'}</h1>
          <p className="text-sm text-muted-foreground">
            {isAr ? 'كل قسم بيحسّن التمارين بتاعتك — املا اللي تقدر عليه' : 'Each section improves your workouts — fill what you can'}
          </p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex gap-1.5">
        {['trainingHistory', 'fitnessTests', 'healthProfile', 'supplements', 'lifestyle', 'fasting', 'bodyComposition'].map((key) => (
          <div
            key={key}
            className={cn(
              'h-1.5 flex-1 rounded-full',
              isFilled(key) ? 'bg-green-500' : 'bg-muted'
            )}
          />
        ))}
      </div>

      {/* 1. Training History */}
      <Section
        icon={Dumbbell}
        title={isAr ? 'تاريخ التدريب' : 'Training History'}
        filled={isFilled('trainingHistory')}
        open={openSection === 'trainingHistory'}
        onToggle={() => toggle('trainingHistory')}
      >
        <NumberField
          label={isAr ? 'سنين التمرين' : 'Years Training'}
          value={trainingHistory.totalYearsTraining}
          onChange={(v) => setTrainingHistory({ ...trainingHistory, totalYearsTraining: v })}
          placeholder="0"
          min={0}
          max={50}
        />

        <div className="space-y-1.5">
          <Label>{isAr ? 'مستواك' : 'Your Level'}</Label>
          <Select
            value={trainingHistory.currentLevel}
            onValueChange={(v) => setTrainingHistory({ ...trainingHistory, currentLevel: v })}
          >
            <SelectTrigger><SelectValue placeholder={isAr ? 'اختار' : 'Select'} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="BEGINNER">{isAr ? 'مبتدئ' : 'Beginner'}</SelectItem>
              <SelectItem value="NOVICE">{isAr ? 'متمرن جديد' : 'Novice'}</SelectItem>
              <SelectItem value="INTERMEDIATE">{isAr ? 'متوسط' : 'Intermediate'}</SelectItem>
              <SelectItem value="ADVANCED">{isAr ? 'متقدم' : 'Advanced'}</SelectItem>
              <SelectItem value="ELITE">{isAr ? 'محترف' : 'Elite'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>{isAr ? 'أسلوب التدريب المفضل' : 'Preferred Training Style'}</Label>
          <Select
            value={trainingHistory.preferredTrainingStyle}
            onValueChange={(v) => setTrainingHistory({ ...trainingHistory, preferredTrainingStyle: v })}
          >
            <SelectTrigger><SelectValue placeholder={isAr ? 'اختار' : 'Select'} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="TRADITIONAL">{isAr ? 'تقليدي' : 'Traditional'}</SelectItem>
              <SelectItem value="CROSSFIT">{isAr ? 'كروس فت' : 'CrossFit'}</SelectItem>
              <SelectItem value="POWERLIFTING">{isAr ? 'باورليفتنج' : 'Powerlifting'}</SelectItem>
              <SelectItem value="BODYBUILDING">{isAr ? 'بودي بلدنج' : 'Bodybuilding'}</SelectItem>
              <SelectItem value="CALISTHENICS">{isAr ? 'كاليسثينكس' : 'Calisthenics'}</SelectItem>
              <SelectItem value="HIIT">{isAr ? 'تمارين عالية الشدة' : 'HIIT'}</SelectItem>
              <SelectItem value="FUNCTIONAL">{isAr ? 'فانكشنال' : 'Functional'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>{isAr ? 'نوع التقسيم المفضل' : 'Preferred Split'}</Label>
          <Select
            value={trainingHistory.preferredSplitType}
            onValueChange={(v) => setTrainingHistory({ ...trainingHistory, preferredSplitType: v })}
          >
            <SelectTrigger><SelectValue placeholder={isAr ? 'اختار' : 'Select'} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="FULL_BODY">{isAr ? 'جسم كامل' : 'Full Body'}</SelectItem>
              <SelectItem value="UPPER_LOWER">{isAr ? 'علوي/سفلي' : 'Upper/Lower'}</SelectItem>
              <SelectItem value="PPL">{isAr ? 'دفع/سحب/رجل' : 'Push/Pull/Legs'}</SelectItem>
              <SelectItem value="BRO_SPLIT">{isAr ? 'عضلة يوميا' : 'Bro Split'}</SelectItem>
              <SelectItem value="ARNOLD">{isAr ? 'أرنولد سبليت' : 'Arnold Split'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>{isAr ? 'نطاق التكرارات المفضل' : 'Preferred Rep Range'}</Label>
          <Select
            value={trainingHistory.preferredRepRange}
            onValueChange={(v) => setTrainingHistory({ ...trainingHistory, preferredRepRange: v })}
          >
            <SelectTrigger><SelectValue placeholder={isAr ? 'اختار' : 'Select'} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">{isAr ? 'أوزان ثقيلة (1-5)' : 'Heavy (1-5 reps)'}</SelectItem>
              <SelectItem value="MODERATE">{isAr ? 'متوسط (6-12)' : 'Moderate (6-12 reps)'}</SelectItem>
              <SelectItem value="HIGH">{isAr ? 'خفيف (12-20)' : 'Light (12-20 reps)'}</SelectItem>
              <SelectItem value="MIXED">{isAr ? 'مزيج' : 'Mixed'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="forma"
          className="w-full"
          disabled={saveAssessment.isPending}
          onClick={() => saveSection('trainingHistory', trainingHistory)}
        >
          {saveAssessment.isPending ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Check className="h-4 w-4 me-2" />}
          {isAr ? 'حفظ' : 'Save'}
        </Button>
      </Section>

      {/* 2. Fitness Tests */}
      <Section
        icon={Zap}
        title={isAr ? 'اختبارات اللياقة' : 'Fitness Tests'}
        filled={isFilled('fitnessTests')}
        open={openSection === 'fitnessTests'}
        onToggle={() => toggle('fitnessTests')}
      >
        <p className="text-sm text-muted-foreground">
          {isAr ? 'أجوبتك بتساعدنا نحدد مستواك الفعلي — مش لازم تملي كلهم' : 'Your answers help us determine your actual level — you don\'t need to fill all'}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <NumberField
            label={isAr ? 'أقصى ضغط' : 'Max Push-ups'}
            value={fitnessTests.pushUpMaxReps}
            onChange={(v) => setFitnessTests({ ...fitnessTests, pushUpMaxReps: v })}
            placeholder="0"
            min={0}
            max={200}
            unit={isAr ? 'تكرار' : 'reps'}
          />
          <NumberField
            label={isAr ? 'أقصى عقلة' : 'Max Pull-ups'}
            value={fitnessTests.pullUpMaxReps}
            onChange={(v) => setFitnessTests({ ...fitnessTests, pullUpMaxReps: v })}
            placeholder="0"
            min={0}
            max={100}
            unit={isAr ? 'تكرار' : 'reps'}
          />
        </div>

        <NumberField
          label={isAr ? 'ثبات البلانك' : 'Plank Hold'}
          value={fitnessTests.plankHoldSeconds}
          onChange={(v) => setFitnessTests({ ...fitnessTests, plankHoldSeconds: v })}
          placeholder="0"
          min={0}
          max={600}
          unit={isAr ? 'ثانية' : 'sec'}
        />

        <NumberField
          label={isAr ? 'أقصى سكوات بودي ويت' : 'Max Bodyweight Squats'}
          value={fitnessTests.bodyweightSquatMaxReps}
          onChange={(v) => setFitnessTests({ ...fitnessTests, bodyweightSquatMaxReps: v })}
          placeholder="0"
          min={0}
          max={200}
          unit={isAr ? 'تكرار' : 'reps'}
        />

        <div className="border-t pt-3">
          <p className="text-sm font-medium mb-3">{isAr ? 'PRs (اختياري)' : 'PRs (optional)'}</p>
          <div className="grid grid-cols-3 gap-2">
            <NumberField
              label={isAr ? 'بنش' : 'Bench'}
              value={fitnessTests.benchPress1RM}
              onChange={(v) => setFitnessTests({ ...fitnessTests, benchPress1RM: v })}
              placeholder="0"
              min={0}
              unit="kg"
            />
            <NumberField
              label={isAr ? 'سكوات' : 'Squat'}
              value={fitnessTests.squat1RM}
              onChange={(v) => setFitnessTests({ ...fitnessTests, squat1RM: v })}
              placeholder="0"
              min={0}
              unit="kg"
            />
            <NumberField
              label={isAr ? 'ديدلفت' : 'Deadlift'}
              value={fitnessTests.deadlift1RM}
              onChange={(v) => setFitnessTests({ ...fitnessTests, deadlift1RM: v })}
              placeholder="0"
              min={0}
              unit="kg"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label>{isAr ? 'تقدر تلمس صوابعك؟' : 'Can you touch your toes?'}</Label>
          <Switch
            checked={fitnessTests.canTouchToes}
            onCheckedChange={(v) => setFitnessTests({ ...fitnessTests, canTouchToes: v })}
          />
        </div>

        <Button
          variant="forma"
          className="w-full"
          disabled={saveAssessment.isPending}
          onClick={() => saveSection('fitnessTests', fitnessTests)}
        >
          {saveAssessment.isPending ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Check className="h-4 w-4 me-2" />}
          {isAr ? 'حفظ' : 'Save'}
        </Button>
      </Section>

      {/* 3. Health Profile */}
      <Section
        icon={Heart}
        title={isAr ? 'الصحة والإصابات' : 'Health & Injuries'}
        filled={isFilled('healthProfile')}
        open={openSection === 'healthProfile'}
        onToggle={() => toggle('healthProfile')}
      >
        <p className="text-sm text-muted-foreground">
          {isAr ? 'معلومات مهمة علشان نحميك من تمارين مش مناسبة' : 'Important info so we avoid exercises that could hurt you'}
        </p>

        {[
          { key: 'hasHeartCondition', en: 'Heart condition', ar: 'مشاكل في القلب' },
          { key: 'hasHighBloodPressure', en: 'High blood pressure', ar: 'ضغط دم عالي' },
          { key: 'hasDiabetes', en: 'Diabetes', ar: 'سكر' },
          { key: 'hasAsthma', en: 'Asthma', ar: 'ربو' },
          { key: 'hasArthritis', en: 'Arthritis', ar: 'التهاب مفاصل' },
          { key: 'hasHerniaHistory', en: 'Hernia history', ar: 'انزلاق غضروفي' },
          { key: 'hadRecentSurgery', en: 'Recent surgery', ar: 'عملية جراحية حديثة' },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <Label>{isAr ? item.ar : item.en}</Label>
            <Switch
              checked={(healthProfile as any)[item.key] ?? false}
              onCheckedChange={(v) => setHealthProfile({ ...healthProfile, [item.key]: v })}
            />
          </div>
        ))}

        {healthProfile.hasDiabetes && (
          <div className="space-y-1.5">
            <Label>{isAr ? 'نوع السكر' : 'Diabetes Type'}</Label>
            <Select
              value={String(healthProfile.diabetesType ?? '')}
              onValueChange={(v) => setHealthProfile({ ...healthProfile, diabetesType: Number(v) })}
            >
              <SelectTrigger><SelectValue placeholder={isAr ? 'اختار' : 'Select'} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{isAr ? 'النوع الأول' : 'Type 1'}</SelectItem>
                <SelectItem value="2">{isAr ? 'النوع التاني' : 'Type 2'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {healthProfile.hadRecentSurgery && (
          <div className="space-y-1.5">
            <Label>{isAr ? 'تفاصيل العملية' : 'Surgery details'}</Label>
            <Textarea
              value={healthProfile.surgeryDetails}
              onChange={(e) => setHealthProfile({ ...healthProfile, surgeryDetails: e.target.value })}
              placeholder={isAr ? 'إيه نوع العملية ومتى' : 'What surgery and when'}
              rows={2}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label>{isAr ? 'عندك إذن دكتور للتمارين؟' : 'Doctor clearance for exercise?'}</Label>
          <Switch
            checked={healthProfile.hasDoctorClearance}
            onCheckedChange={(v) => setHealthProfile({ ...healthProfile, hasDoctorClearance: v })}
          />
        </div>

        <Button
          variant="forma"
          className="w-full"
          disabled={saveAssessment.isPending}
          onClick={() => saveSection('healthProfile', healthProfile)}
        >
          {saveAssessment.isPending ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Check className="h-4 w-4 me-2" />}
          {isAr ? 'حفظ' : 'Save'}
        </Button>
      </Section>

      {/* 4. Supplements */}
      <Section
        icon={Pill}
        title={isAr ? 'المكملات' : 'Supplements'}
        filled={isFilled('supplements')}
        open={openSection === 'supplements'}
        onToggle={() => toggle('supplements')}
      >
        <p className="text-sm text-muted-foreground">
          {isAr ? 'المكملات بتأثر على حجم التمرين والريكفري' : 'Supplements affect your workout volume and recovery'}
        </p>

        <div className="flex items-center justify-between">
          <Label>{isAr ? 'بروتين باودر' : 'Protein Powder'}</Label>
          <Switch
            checked={supplements.takesProteinPowder}
            onCheckedChange={(v) => setSupplements({ ...supplements, takesProteinPowder: v })}
          />
        </div>

        {supplements.takesProteinPowder && (
          <div className="space-y-1.5">
            <Label>{isAr ? 'نوع البروتين' : 'Protein Type'}</Label>
            <Select
              value={supplements.proteinPowderType}
              onValueChange={(v) => setSupplements({ ...supplements, proteinPowderType: v })}
            >
              <SelectTrigger><SelectValue placeholder={isAr ? 'اختار' : 'Select'} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="whey">{isAr ? 'واي بروتين' : 'Whey'}</SelectItem>
                <SelectItem value="casein">{isAr ? 'كازين' : 'Casein'}</SelectItem>
                <SelectItem value="plant">{isAr ? 'بروتين نباتي' : 'Plant-based'}</SelectItem>
                <SelectItem value="blend">{isAr ? 'مزيج' : 'Blend'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label>{isAr ? 'كرياتين' : 'Creatine'}</Label>
          <Switch
            checked={supplements.takesCreatine}
            onCheckedChange={(v) => setSupplements({ ...supplements, takesCreatine: v })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>{isAr ? 'بري وورك أوت' : 'Pre-Workout'}</Label>
          <Switch
            checked={supplements.takesPreWorkout}
            onCheckedChange={(v) => setSupplements({ ...supplements, takesPreWorkout: v })}
          />
        </div>

        <Button
          variant="forma"
          className="w-full"
          disabled={saveAssessment.isPending}
          onClick={() => saveSection('supplements', supplements)}
        >
          {saveAssessment.isPending ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Check className="h-4 w-4 me-2" />}
          {isAr ? 'حفظ' : 'Save'}
        </Button>
      </Section>

      {/* 5. Lifestyle */}
      <Section
        icon={Moon}
        title={isAr ? 'نمط الحياة' : 'Lifestyle'}
        filled={isFilled('lifestyle')}
        open={openSection === 'lifestyle'}
        onToggle={() => toggle('lifestyle')}
      >
        <NumberField
          label={isAr ? 'ساعات النوم' : 'Sleep Hours'}
          value={lifestyle.averageSleepHours}
          onChange={(v) => setLifestyle({ ...lifestyle, averageSleepHours: v })}
          placeholder="7"
          min={0}
          max={24}
          unit={isAr ? 'ساعة' : 'hrs'}
        />

        <div className="space-y-1.5">
          <Label>{isAr ? 'جودة النوم' : 'Sleep Quality'}</Label>
          <Select
            value={lifestyle.sleepQuality}
            onValueChange={(v) => setLifestyle({ ...lifestyle, sleepQuality: v })}
          >
            <SelectTrigger><SelectValue placeholder={isAr ? 'اختار' : 'Select'} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="POOR">{isAr ? 'ضعيف' : 'Poor'}</SelectItem>
              <SelectItem value="FAIR">{isAr ? 'مقبول' : 'Fair'}</SelectItem>
              <SelectItem value="GOOD">{isAr ? 'كويس' : 'Good'}</SelectItem>
              <SelectItem value="EXCELLENT">{isAr ? 'ممتاز' : 'Excellent'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>{isAr ? 'مستوى الضغط النفسي' : 'Stress Level'}</Label>
          <Select
            value={lifestyle.currentStressLevel}
            onValueChange={(v) => setLifestyle({ ...lifestyle, currentStressLevel: v })}
          >
            <SelectTrigger><SelectValue placeholder={isAr ? 'اختار' : 'Select'} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">{isAr ? 'منخفض' : 'Low'}</SelectItem>
              <SelectItem value="MODERATE">{isAr ? 'متوسط' : 'Moderate'}</SelectItem>
              <SelectItem value="HIGH">{isAr ? 'عالي' : 'High'}</SelectItem>
              <SelectItem value="VERY_HIGH">{isAr ? 'عالي جدا' : 'Very High'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <NumberField
            label={isAr ? 'تمارين/أسبوع' : 'Workouts/week'}
            value={lifestyle.targetWorkoutsPerWeek}
            onChange={(v) => setLifestyle({ ...lifestyle, targetWorkoutsPerWeek: v })}
            placeholder="4"
            min={1}
            max={7}
          />
          <NumberField
            label={isAr ? 'أقصى مدة تمرين' : 'Max Duration'}
            value={lifestyle.maxWorkoutMinutes}
            onChange={(v) => setLifestyle({ ...lifestyle, maxWorkoutMinutes: v })}
            placeholder="60"
            min={10}
            max={180}
            unit={isAr ? 'دقيقة' : 'min'}
          />
        </div>

        <div className="space-y-1.5">
          <Label>{isAr ? 'وقت التمرين المفضل' : 'Preferred Workout Time'}</Label>
          <Select
            value={lifestyle.preferredWorkoutTime}
            onValueChange={(v) => setLifestyle({ ...lifestyle, preferredWorkoutTime: v })}
          >
            <SelectTrigger><SelectValue placeholder={isAr ? 'اختار' : 'Select'} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="EARLY_MORNING">{isAr ? 'الفجر (5-7)' : 'Early Morning (5-7)'}</SelectItem>
              <SelectItem value="MORNING">{isAr ? 'الصبح (7-10)' : 'Morning (7-10)'}</SelectItem>
              <SelectItem value="MIDDAY">{isAr ? 'الضهر (10-2)' : 'Midday (10-2)'}</SelectItem>
              <SelectItem value="AFTERNOON">{isAr ? 'العصر (2-5)' : 'Afternoon (2-5)'}</SelectItem>
              <SelectItem value="EVENING">{isAr ? 'المغرب (5-8)' : 'Evening (5-8)'}</SelectItem>
              <SelectItem value="NIGHT">{isAr ? 'بالليل (8-11)' : 'Night (8-11)'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>{isAr ? 'نوع الشغل' : 'Work Type'}</Label>
          <Select
            value={lifestyle.workType}
            onValueChange={(v) => setLifestyle({ ...lifestyle, workType: v })}
          >
            <SelectTrigger><SelectValue placeholder={isAr ? 'اختار' : 'Select'} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="SEDENTARY">{isAr ? 'مكتبي' : 'Sedentary (desk)'}</SelectItem>
              <SelectItem value="LIGHT_ACTIVE">{isAr ? 'حركة خفيفة' : 'Lightly Active'}</SelectItem>
              <SelectItem value="MODERATE_ACTIVE">{isAr ? 'حركة متوسطة' : 'Moderately Active'}</SelectItem>
              <SelectItem value="VERY_ACTIVE">{isAr ? 'حركة كتير' : 'Very Active'}</SelectItem>
              <SelectItem value="STUDENT">{isAr ? 'طالب' : 'Student'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="forma"
          className="w-full"
          disabled={saveAssessment.isPending}
          onClick={() => saveSection('lifestyle', lifestyle)}
        >
          {saveAssessment.isPending ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Check className="h-4 w-4 me-2" />}
          {isAr ? 'حفظ' : 'Save'}
        </Button>
      </Section>

      {/* 6. Fasting */}
      <Section
        icon={Activity}
        title={isAr ? 'الصيام' : 'Fasting'}
        filled={isFilled('fasting')}
        open={openSection === 'fasting'}
        onToggle={() => toggle('fasting')}
      >
        <div className="flex items-center justify-between">
          <Label>{isAr ? 'صيام متقطع' : 'Intermittent Fasting'}</Label>
          <Switch
            checked={fasting.doesIntermittentFasting}
            onCheckedChange={(v) => setFasting({ ...fasting, doesIntermittentFasting: v })}
          />
        </div>

        {fasting.doesIntermittentFasting && (
          <>
            <div className="space-y-1.5">
              <Label>{isAr ? 'البروتوكول' : 'Protocol'}</Label>
              <Select
                value={fasting.ifProtocol}
                onValueChange={(v) => setFasting({ ...fasting, ifProtocol: v })}
              >
                <SelectTrigger><SelectValue placeholder={isAr ? 'اختار' : 'Select'} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="16_8">16:8</SelectItem>
                  <SelectItem value="18_6">18:6</SelectItem>
                  <SelectItem value="20_4">20:4 (Warrior)</SelectItem>
                  <SelectItem value="OMAD">OMAD</SelectItem>
                  <SelectItem value="5_2">5:2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{isAr ? 'بداية الأكل' : 'Eating Start'}</Label>
                <Input
                  type="time"
                  value={fasting.eatingWindowStart}
                  onChange={(e) => setFasting({ ...fasting, eatingWindowStart: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{isAr ? 'نهاية الأكل' : 'Eating End'}</Label>
                <Input
                  type="time"
                  value={fasting.eatingWindowEnd}
                  onChange={(e) => setFasting({ ...fasting, eatingWindowEnd: e.target.value })}
                />
              </div>
            </div>
          </>
        )}

        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <Label>{isAr ? 'بتصوم رمضان' : 'Observes Ramadan'}</Label>
            <Switch
              checked={fasting.observesRamadan}
              onCheckedChange={(v) => setFasting({ ...fasting, observesRamadan: v })}
            />
          </div>
        </div>

        {fasting.observesRamadan && (
          <>
            <div className="flex items-center justify-between">
              <Label>{isAr ? 'رمضان دلوقتي نشط؟' : 'Ramadan currently active?'}</Label>
              <Switch
                checked={fasting.ramadanActive}
                onCheckedChange={(v) => setFasting({ ...fasting, ramadanActive: v })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>{isAr ? 'توقيت التمرين في رمضان' : 'Ramadan Workout Timing'}</Label>
              <Select
                value={fasting.ramadanWorkoutTiming}
                onValueChange={(v) => setFasting({ ...fasting, ramadanWorkoutTiming: v })}
              >
                <SelectTrigger><SelectValue placeholder={isAr ? 'اختار' : 'Select'} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEFORE_IFTAR">{isAr ? 'قبل الفطار' : 'Before Iftar'}</SelectItem>
                  <SelectItem value="AFTER_IFTAR">{isAr ? 'بعد الفطار' : 'After Iftar'}</SelectItem>
                  <SelectItem value="AFTER_TARAWEEH">{isAr ? 'بعد التراويح' : 'After Taraweeh'}</SelectItem>
                  <SelectItem value="BEFORE_SUHOOR">{isAr ? 'قبل السحور' : 'Before Suhoor'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <Button
          variant="forma"
          className="w-full"
          disabled={saveAssessment.isPending}
          onClick={() => saveSection('fasting', fasting)}
        >
          {saveAssessment.isPending ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Check className="h-4 w-4 me-2" />}
          {isAr ? 'حفظ' : 'Save'}
        </Button>
      </Section>

      {/* 7. Body Composition */}
      <Section
        icon={Scale}
        title={isAr ? 'تكوين الجسم' : 'Body Composition'}
        filled={isFilled('bodyComposition')}
        open={openSection === 'bodyComposition'}
        onToggle={() => toggle('bodyComposition')}
      >
        <div className="grid grid-cols-2 gap-3">
          <NumberField
            label={isAr ? 'الوزن' : 'Weight'}
            value={bodyComposition.currentWeightKg}
            onChange={(v) => setBodyComposition({ ...bodyComposition, currentWeightKg: v })}
            placeholder="75"
            min={30}
            max={300}
            unit="kg"
          />
          <NumberField
            label={isAr ? 'الطول' : 'Height'}
            value={bodyComposition.heightCm}
            onChange={(v) => setBodyComposition({ ...bodyComposition, heightCm: v })}
            placeholder="175"
            min={100}
            max={250}
            unit="cm"
          />
        </div>

        <NumberField
          label={isAr ? 'نسبة الدهون' : 'Body Fat %'}
          value={bodyComposition.bodyFatPercent}
          onChange={(v) => setBodyComposition({ ...bodyComposition, bodyFatPercent: v })}
          placeholder="15"
          min={3}
          max={70}
          unit="%"
        />

        <div className="space-y-1.5">
          <Label>{isAr ? 'نوع الجسم' : 'Body Type'}</Label>
          <Select
            value={bodyComposition.bodyType}
            onValueChange={(v) => setBodyComposition({ ...bodyComposition, bodyType: v })}
          >
            <SelectTrigger><SelectValue placeholder={isAr ? 'اختار' : 'Select'} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ECTOMORPH">{isAr ? 'نحيف (إكتومورف)' : 'Ectomorph (lean)'}</SelectItem>
              <SelectItem value="MESOMORPH">{isAr ? 'رياضي (ميزومورف)' : 'Mesomorph (athletic)'}</SelectItem>
              <SelectItem value="ENDOMORPH">{isAr ? 'ممتلئ (إندومورف)' : 'Endomorph (stocky)'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm font-medium">{isAr ? 'قياسات (اختياري)' : 'Measurements (optional)'}</p>
        <div className="grid grid-cols-3 gap-2">
          <NumberField
            label={isAr ? 'وسط' : 'Waist'}
            value={bodyComposition.waistCm}
            onChange={(v) => setBodyComposition({ ...bodyComposition, waistCm: v })}
            placeholder="80"
            min={40}
            unit="cm"
          />
          <NumberField
            label={isAr ? 'أرداف' : 'Hips'}
            value={bodyComposition.hipsGlutesCm}
            onChange={(v) => setBodyComposition({ ...bodyComposition, hipsGlutesCm: v })}
            placeholder="95"
            min={50}
            unit="cm"
          />
          <NumberField
            label={isAr ? 'صدر' : 'Chest'}
            value={bodyComposition.chestCm}
            onChange={(v) => setBodyComposition({ ...bodyComposition, chestCm: v })}
            placeholder="100"
            min={50}
            unit="cm"
          />
        </div>

        <Button
          variant="forma"
          className="w-full"
          disabled={saveAssessment.isPending}
          onClick={() => saveSection('bodyComposition', bodyComposition)}
        >
          {saveAssessment.isPending ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Check className="h-4 w-4 me-2" />}
          {isAr ? 'حفظ' : 'Save'}
        </Button>
      </Section>

      {/* Info note */}
      <div className="flex items-start gap-3 rounded-xl bg-forma-orange/5 border border-forma-orange/20 p-4">
        <AlertTriangle className="h-5 w-5 text-forma-orange mt-0.5 shrink-0" />
        <p className="text-sm text-muted-foreground">
          {isAr
            ? 'البيانات دي بتحسّن التمارين والتوصيات بتاعتك. كل ما تملي أكتر، كل ما التمارين تبقى أحسن ليك. مش لازم تملي كل حاجة مرة واحدة.'
            : 'This data improves your workouts and recommendations. The more you fill, the better your workouts get. You don\'t have to fill everything at once.'
          }
        </p>
      </div>
    </div>
  );
}
