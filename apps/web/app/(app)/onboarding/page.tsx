'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Dumbbell,
  Scale,
  Activity,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Flame,
  Heart,
  Zap,
  TrendingUp,
  Sparkles,
  Check,
  Home,
  Building2,
  TreePine,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { usersApi } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';

// Static config arrays are defined inside the component to access isAr

export default function OnboardingPage() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const steps = [
    { id: 'goal', title: isAr ? 'هدفك' : 'Your Goal', icon: Target, description: isAr ? 'إيه اللي جابك هنا؟' : 'What brings you here?' },
    { id: 'experience', title: isAr ? 'الخبرة' : 'Experience', icon: Dumbbell, description: isAr ? 'رحلتك في الفيتنس' : 'Your fitness journey' },
    { id: 'body', title: isAr ? 'قياسات الجسم' : 'Body Stats', icon: Scale, description: isAr ? 'عشان نخصصلك البرنامج' : 'Help us personalize' },
    { id: 'activity', title: isAr ? 'مستوى النشاط' : 'Activity Level', icon: Activity, description: isAr ? 'روتينك اليومي' : 'Your daily routine' },
    { id: 'equipment', title: isAr ? 'الأدوات' : 'Equipment', icon: Home, description: isAr ? 'بتتمرن فين؟' : 'Where you train' },
    { id: 'fitness_test', title: isAr ? 'اختبار سريع' : 'Quick Test', icon: TrendingUp, description: isAr ? 'اختياري — اعرف مستواك' : 'Optional — know your level' },
  ];

  const goals = [
    { value: 'LOSE_WEIGHT', label: isAr ? 'نزول وزن' : 'Lose Weight', description: isAr ? 'حرق دهون وتخسيس' : 'Burn fat and slim down', icon: Flame, color: 'from-orange-500 to-red-500' },
    { value: 'BUILD_MUSCLE', label: isAr ? 'بناء عضل' : 'Build Muscle', description: isAr ? 'زيادة حجم وقوة' : 'Gain size and strength', icon: Dumbbell, color: 'from-blue-500 to-blue-600' },
    { value: 'GET_STRONGER', label: isAr ? 'زيادة قوة' : 'Get Stronger', description: isAr ? 'ارفع أتقل' : 'Increase your lifts', icon: TrendingUp, color: 'from-rose-500 to-pink-500' },
    { value: 'IMPROVE_HEALTH', label: isAr ? 'تحسين الصحة' : 'Improve Health', description: isAr ? 'حس بتحسن كل يوم' : 'Feel better daily', icon: Heart, color: 'from-green-500 to-emerald-500' },
    { value: 'INCREASE_ENDURANCE', label: isAr ? 'تحمّل' : 'Endurance', description: isAr ? 'استمر أكتر وأقوى' : 'Go longer & harder', icon: Zap, color: 'from-yellow-500 to-orange-500' },
  ];

  const experienceLevels = [
    {
      value: 'BEGINNER',
      label: isAr ? 'مبتدئ' : 'Beginner',
      description: isAr ? 'أنا جديد في الفيتنس' : "I'm new to fitness",
      detail: isAr ? 'تمام! هنبدأ معاك من الأساسيات' : 'Perfect! We\'ll start with the fundamentals',
      weeks: isAr ? '٠-٦ شهور' : '0-6 months'
    },
    {
      value: 'INTERMEDIATE',
      label: isAr ? 'متوسط' : 'Intermediate',
      description: isAr ? 'بتمرن بانتظام' : 'I train regularly',
      detail: isAr ? 'هنوصلك لمستوى أعلى' : 'We\'ll push your boundaries further',
      weeks: isAr ? '٦ شهور - سنتين' : '6 months - 2 years'
    },
    {
      value: 'ADVANCED',
      label: isAr ? 'متقدم' : 'Advanced',
      description: isAr ? 'عندي خبرة' : 'I\'m experienced',
      detail: isAr ? 'جاهز للتقدم الجدي' : 'Ready for serious progression',
      weeks: isAr ? '+٢ سنين' : '2+ years'
    },
  ];

  const activityLevels = [
    { value: 'SEDENTARY', label: isAr ? 'قليل الحركة' : 'Sedentary', description: isAr ? 'مفيش تمارين تقريباً' : 'Little to no exercise', icon: '🪑', multiplier: 1.2 },
    { value: 'LIGHT', label: isAr ? 'نشاط خفيف' : 'Lightly Active', description: isAr ? 'تمارين خفيفة ١-٣ أيام/أسبوع' : 'Light exercise 1-3 days/week', icon: '🚶', multiplier: 1.375 },
    { value: 'MODERATE', label: isAr ? 'نشاط متوسط' : 'Moderately Active', description: isAr ? 'تمارين متوسطة ٣-٥ أيام/أسبوع' : 'Moderate exercise 3-5 days/week', icon: '🏃', multiplier: 1.55 },
    { value: 'ACTIVE', label: isAr ? 'نشيط جداً' : 'Very Active', description: isAr ? 'تمارين شاقة ٦-٧ أيام/أسبوع' : 'Hard exercise 6-7 days/week', icon: '💪', multiplier: 1.725 },
    { value: 'VERY_ACTIVE', label: isAr ? 'رياضي محترف' : 'Athlete', description: isAr ? 'مستوى رياضي محترف' : 'Professional athlete level', icon: '🏆', multiplier: 1.9 },
  ];

  const workoutLocations = [
    { value: 'gym', label: isAr ? 'جيم' : 'Gym', description: isAr ? 'أجهزة كاملة' : 'Full equipment access', icon: Building2 },
    { value: 'home', label: isAr ? 'البيت' : 'Home', description: isAr ? 'أدوات محدودة' : 'Limited equipment', icon: Home },
    { value: 'outdoor', label: isAr ? 'في الهوا' : 'Outdoor', description: isAr ? 'حدائق وتمارين بالجسم' : 'Parks & bodyweight', icon: TreePine },
    { value: 'work', label: isAr ? 'المكتب' : 'Office', description: isAr ? 'جلسات سريعة' : 'Quick sessions', icon: Briefcase },
  ];

  const equipmentOptions = [
    { value: 'DUMBBELLS', label: isAr ? 'دمبلز' : 'Dumbbells' },
    { value: 'BARBELL', label: isAr ? 'بار' : 'Barbell' },
    { value: 'KETTLEBELL', label: isAr ? 'كيتل بل' : 'Kettlebell' },
    { value: 'RESISTANCE_BANDS', label: isAr ? 'أحبال مقاومة' : 'Resistance Bands' },
    { value: 'PULL_UP_BAR', label: isAr ? 'بار عقلة' : 'Pull-up Bar' },
    { value: 'BENCH', label: isAr ? 'بنش' : 'Bench' },
    { value: 'CABLE_MACHINE', label: isAr ? 'جهاز كابل' : 'Cable Machine' },
    { value: 'TREADMILL', label: isAr ? 'مشاية' : 'Treadmill' },
    { value: 'ROWING_MACHINE', label: isAr ? 'جهاز تجديف' : 'Rowing Machine' },
    { value: 'BODYWEIGHT', label: isAr ? 'بدون أدوات' : 'Bodyweight Only' },
  ];
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    goal: '',
    experience: '',
    currentWeight: '',
    height: '',
    targetWeight: '',
    activityLevel: '',
    workoutLocation: '',
    equipment: [] as string[],
    pushups: '',
    plankSeconds: '',
  });

  // Load any stored onboarding data from signup
  useEffect(() => {
    const stored = localStorage.getItem('onboarding-data');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setFormData(prev => ({
          ...prev,
          goal: data.goal?.toUpperCase().replace('-', '_') || '',
          experience: data.experience?.toUpperCase() || '',
        }));
        localStorage.removeItem('onboarding-data');
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }, []);

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleEquipment = (value: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(value)
        ? prev.equipment.filter(e => e !== value)
        : [...prev.equipment, value]
    }));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await usersApi.updateOnboarding({
        fitnessGoal: formData.goal,
        fitnessLevel: formData.experience,
        activityLevel: formData.activityLevel,
        heightCm: parseFloat(formData.height),
        currentWeightKg: parseFloat(formData.currentWeight),
        targetWeightKg: formData.targetWeight ? parseFloat(formData.targetWeight) : undefined,
        equipment: formData.equipment,
        workoutLocation: formData.workoutLocation || undefined,
      });
      // Save fitness test results to localStorage if provided
      if (formData.pushups || formData.plankSeconds) {
        const existing = JSON.parse(localStorage.getItem('forma_fitness_tests') || '{}');
        const now = new Date().toISOString();
        if (formData.pushups) {
          if (!existing['pushup_60s']) existing['pushup_60s'] = [];
          existing['pushup_60s'].push({ testId: 'pushup_60s', value: parseInt(formData.pushups), rating: 'average', date: now });
        }
        if (formData.plankSeconds) {
          if (!existing['plank_hold']) existing['plank_hold'] = [];
          existing['plank_hold'].push({ testId: 'plank_hold', value: parseInt(formData.plankSeconds), rating: 'average', date: now });
        }
        localStorage.setItem('forma_fitness_tests', JSON.stringify(existing));
      }
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : (isAr ? 'فشل حفظ البيانات' : 'Failed to save profile'));
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!formData.goal;
      case 1:
        return !!formData.experience;
      case 2:
        return !!formData.currentWeight && !!formData.height;
      case 3:
        return !!formData.activityLevel;
      case 4:
        return formData.equipment.length > 0;
      case 5:
        return true; // Optional step — always can proceed
      default:
        return false;
    }
  };

  // Calculate estimated daily calories (Mifflin-St Jeor)
  const estimatedCalories = (() => {
    const w = parseFloat(formData.currentWeight);
    const h = parseFloat(formData.height);
    if (!w || !h) return 0;
    const age = 25; // Default assumption
    const bmr = 10 * w + 6.25 * h - 5 * age + 5; // Male default
    const multiplier = activityLevels.find(l => l.value === formData.activityLevel)?.multiplier || 1.55;
    return Math.round(bmr * multiplier);
  })();

  return (
    <div className="min-h-screen bg-background">
      <div className="container flex min-h-screen flex-col items-center justify-center py-8">
        <div className="w-full max-w-xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary">
              FORMA
            </h2>
            <p className="text-muted-foreground mt-1">{t.onboarding.letsGetStarted}</p>
          </div>

          {/* Step Indicators */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                  <div key={step.id} className="flex items-center">
                    <div className={cn(
                      "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300",
                      isActive && "bg-primary shadow-lg shadow-primary/25",
                      isCompleted && "bg-primary",
                      !isActive && !isCompleted && "bg-muted/50 border border-border/50"
                    )}>
                      {isCompleted ? (
                        <Check className="h-5 w-5 text-white" />
                      ) : (
                        <Icon className={cn(
                          "h-5 w-5",
                          isActive ? "text-white" : "text-muted-foreground"
                        )} />
                      )}
                      {isActive && (
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                          <span className="text-xs text-primary font-medium">{step.title}</span>
                        </div>
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={cn(
                        "w-8 h-0.5 mx-1",
                        index < currentStep ? "bg-primary" : "bg-border/50"
                      )} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-2 h-1 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mb-6">
            {isAr ? `الخطوة ${currentStep + 1} من ${steps.length}` : `Step ${currentStep + 1} of ${steps.length}`}
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-border/50 bg-card p-6"
            >
              {/* Step 0: Goal Selection */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">{t.onboarding.whatIsYourGoal}</h1>
                    <p className="text-muted-foreground">{t.onboarding.letsGetStarted}</p>
                  </div>
                  <div className="grid gap-3">
                    {goals.map((goal) => {
                      const Icon = goal.icon;
                      const isSelected = formData.goal === goal.value;

                      return (
                        <button
                          key={goal.value}
                          onClick={() => setFormData({ ...formData, goal: goal.value })}
                          className={cn(
                            "relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left group",
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-border/50 bg-muted/20 hover:border-primary/50 hover:bg-muted/30"
                          )}
                        >
                          <div className={cn(
                            "flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br transition-all",
                            goal.color,
                            isSelected ? "shadow-lg" : "opacity-70 group-hover:opacity-100"
                          )}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{goal.label}</p>
                            <p className="text-sm text-muted-foreground">{goal.description}</p>
                          </div>
                          {isSelected && (
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 1: Experience Level */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">{t.onboarding.fitnessLevel}</h1>
                    <p className="text-muted-foreground">{isAr ? 'هنظبط التمارين على مستواك' : "We'll tailor your workouts accordingly"}</p>
                  </div>
                  <div className="grid gap-4">
                    {experienceLevels.map((level) => {
                      const isSelected = formData.experience === level.value;

                      return (
                        <button
                          key={level.value}
                          onClick={() => setFormData({ ...formData, experience: level.value })}
                          className={cn(
                            "relative p-5 rounded-xl border-2 transition-all text-left",
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-border/50 bg-muted/20 hover:border-primary/50"
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-lg">{level.label}</p>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                  {level.weeks}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{level.description}</p>
                              <p className="text-xs text-primary">{level.detail}</p>
                            </div>
                            {isSelected && (
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary flex-shrink-0">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: Body Stats */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">{isAr ? 'قولنا عن جسمك' : 'Tell us about your body'}</h1>
                    <p className="text-muted-foreground">{isAr ? 'ده بيساعدنا نحسب احتياجاتك الغذائية' : 'This helps us calculate your nutrition needs'}</p>
                  </div>
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">{isAr ? 'الوزن الحالي' : 'Current Weight'}</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="75"
                            value={formData.currentWeight}
                            onChange={(e) => setFormData({ ...formData, currentWeight: e.target.value })}
                            className="bg-muted/50 border-border/50 pr-12"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">kg</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">{isAr ? 'الطول' : 'Height'}</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="175"
                            value={formData.height}
                            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                            className="bg-muted/50 border-border/50 pr-12"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">cm</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{isAr ? 'الوزن المستهدف' : 'Target Weight'} <span className="text-muted-foreground">{isAr ? '(اختياري)' : '(optional)'}</span></Label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="70"
                          value={formData.targetWeight}
                          onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                          className="bg-muted/50 border-border/50 pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">kg</span>
                      </div>
                    </div>

                    {/* BMI Preview */}
                    {formData.currentWeight && formData.height && (
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-3">
                          <Sparkles className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium">
                              {isAr ? 'مؤشر كتلة الجسم: ' : 'Your BMI: '}{(parseFloat(formData.currentWeight) / Math.pow(parseFloat(formData.height) / 100, 2)).toFixed(1)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {isAr ? 'هنستخدم ده عشان نخصصلك الخطة' : "We'll use this to personalize your plan"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Activity Level */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">{isAr ? 'قد إيه بتتحرك؟' : 'How active are you?'}</h1>
                    <p className="text-muted-foreground">{isAr ? 'غير التمارين المخططة' : 'Outside of planned workouts'}</p>
                  </div>
                  <div className="grid gap-3">
                    {activityLevels.map((level) => {
                      const isSelected = formData.activityLevel === level.value;

                      return (
                        <button
                          key={level.value}
                          onClick={() => setFormData({ ...formData, activityLevel: level.value })}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-border/50 bg-muted/20 hover:border-primary/50"
                          )}
                        >
                          <span className="text-2xl">{level.icon}</span>
                          <div className="flex-1">
                            <p className="font-semibold">{level.label}</p>
                            <p className="text-sm text-muted-foreground">{level.description}</p>
                          </div>
                          {isSelected && (
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 4: Equipment */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">{isAr ? 'عندك إيه من الأدوات؟' : 'What equipment do you have?'}</h1>
                    <p className="text-muted-foreground">{isAr ? 'اختار كل اللي عندك' : 'Select all that apply'}</p>
                  </div>

                  {/* Workout Location */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">{isAr ? 'بتتمرن فين عادةً؟' : 'Where do you usually train?'}</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {workoutLocations.map((location) => {
                        const Icon = location.icon;
                        const isSelected = formData.workoutLocation === location.value;

                        return (
                          <button
                            key={location.value}
                            onClick={() => setFormData({ ...formData, workoutLocation: location.value })}
                            className={cn(
                              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                              isSelected
                                ? "border-primary bg-primary/10"
                                : "border-border/50 bg-muted/20 hover:border-primary/50"
                            )}
                          >
                            <Icon className={cn(
                              "h-6 w-6",
                              isSelected ? "text-primary" : "text-muted-foreground"
                            )} />
                            <div className="text-center">
                              <p className="font-medium text-sm">{location.label}</p>
                              <p className="text-xs text-muted-foreground">{location.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Equipment Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">{isAr ? 'الأدوات المتاحة' : 'Available Equipment'}</Label>
                    <div className="flex flex-wrap gap-2">
                      {equipmentOptions.map((eq) => {
                        const isSelected = formData.equipment.includes(eq.value);

                        return (
                          <button
                            key={eq.value}
                            onClick={() => toggleEquipment(eq.value)}
                            className={cn(
                              "px-4 py-2 rounded-full text-sm font-medium transition-all",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border/50"
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3 me-1 inline" />}
                            {eq.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              {/* Step 5: Optional Fitness Test */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">{isAr ? 'اختبار لياقة سريع' : 'Quick Fitness Test'}</h1>
                    <p className="text-muted-foreground">{isAr ? 'اختياري — ممكن تعمله بعدين' : 'Optional — you can do this later too'}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-border/50 bg-muted/20 space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Dumbbell className="h-4 w-4 text-forma-orange" />
                        {isAr ? 'كام ضغطة في دقيقة؟' : 'Push-ups in 60 seconds?'}
                      </Label>
                      <Input
                        type="number"
                        placeholder={isAr ? 'مثال: 20' : 'e.g. 20'}
                        value={formData.pushups}
                        onChange={(e) => setFormData({ ...formData, pushups: e.target.value })}
                        className="bg-background"
                      />
                    </div>

                    <div className="p-4 rounded-xl border border-border/50 bg-muted/20 space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        {isAr ? 'بلانك — كام ثانية؟' : 'Plank hold — how many seconds?'}
                      </Label>
                      <Input
                        type="number"
                        placeholder={isAr ? 'مثال: 45' : 'e.g. 45'}
                        value={formData.plankSeconds}
                        onChange={(e) => setFormData({ ...formData, plankSeconds: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                  </div>

                  {/* Daily Calorie Estimate */}
                  {estimatedCalories > 0 && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-forma-orange/10 to-orange-500/10 border border-forma-orange/20">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-forma-orange/20 flex items-center justify-center">
                          <Flame className="h-5 w-5 text-forma-orange" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            {isAr ? 'السعرات اليومية المقدرة' : 'Estimated Daily Calories'}
                          </p>
                          <p className="text-2xl font-bold text-forma-orange">{estimatedCalories} kcal</p>
                          <p className="text-[10px] text-muted-foreground">
                            {isAr ? 'تقدير مبدئي — هيتحدث بعد كده' : 'Initial estimate — will be refined over time'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-center text-muted-foreground">
                    {isAr ? 'ممكن تسيب الخانات فاضية وتعمل الاختبار بعدين من صفحة التمارين' : 'You can leave these blank and take the tests later from the Workouts page'}
                  </p>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="me-2 h-4 w-4" />
              {t.common.back}
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="btn-primary"
              >
                {t.common.continue}
                <ChevronRight className="ms-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!canProceed() || isLoading}
                className="btn-primary"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    {isAr ? 'جاري التجهيز...' : 'Setting up...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="me-2 h-4 w-4" />
                    {t.onboarding.complete}
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Skip Option */}
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t.onboarding.skip}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
