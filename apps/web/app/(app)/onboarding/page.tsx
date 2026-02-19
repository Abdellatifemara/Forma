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

const steps = [
  { id: 'goal', title: 'Your Goal', icon: Target, description: 'What brings you here?' },
  { id: 'experience', title: 'Experience', icon: Dumbbell, description: 'Your fitness journey' },
  { id: 'body', title: 'Body Stats', icon: Scale, description: 'Help us personalize' },
  { id: 'activity', title: 'Activity Level', icon: Activity, description: 'Your daily routine' },
  { id: 'equipment', title: 'Equipment', icon: Home, description: 'Where you train' },
];

const goals = [
  { value: 'LOSE_WEIGHT', label: 'Lose Weight', description: 'Burn fat and slim down', icon: Flame, color: 'from-orange-500 to-red-500' },
  { value: 'BUILD_MUSCLE', label: 'Build Muscle', description: 'Gain size and strength', icon: Dumbbell, color: 'from-cyan-500 to-blue-500' },
  { value: 'GET_STRONGER', label: 'Get Stronger', description: 'Increase your lifts', icon: TrendingUp, color: 'from-purple-500 to-pink-500' },
  { value: 'IMPROVE_HEALTH', label: 'Improve Health', description: 'Feel better daily', icon: Heart, color: 'from-green-500 to-emerald-500' },
  { value: 'INCREASE_ENDURANCE', label: 'Endurance', description: 'Go longer & harder', icon: Zap, color: 'from-yellow-500 to-orange-500' },
];

const experienceLevels = [
  {
    value: 'BEGINNER',
    label: 'Beginner',
    description: "I'm new to fitness",
    detail: 'Perfect! We\'ll start with the fundamentals',
    weeks: '0-6 months'
  },
  {
    value: 'INTERMEDIATE',
    label: 'Intermediate',
    description: 'I train regularly',
    detail: 'We\'ll push your boundaries further',
    weeks: '6 months - 2 years'
  },
  {
    value: 'ADVANCED',
    label: 'Advanced',
    description: 'I\'m experienced',
    detail: 'Ready for serious progression',
    weeks: '2+ years'
  },
];

const activityLevels = [
  { value: 'SEDENTARY', label: 'Sedentary', description: 'Little to no exercise', icon: '🪑', multiplier: 1.2 },
  { value: 'LIGHT', label: 'Lightly Active', description: 'Light exercise 1-3 days/week', icon: '🚶', multiplier: 1.375 },
  { value: 'MODERATE', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week', icon: '🏃', multiplier: 1.55 },
  { value: 'ACTIVE', label: 'Very Active', description: 'Hard exercise 6-7 days/week', icon: '💪', multiplier: 1.725 },
  { value: 'VERY_ACTIVE', label: 'Athlete', description: 'Professional athlete level', icon: '🏆', multiplier: 1.9 },
];

const workoutLocations = [
  { value: 'gym', label: 'Gym', description: 'Full equipment access', icon: Building2 },
  { value: 'home', label: 'Home', description: 'Limited equipment', icon: Home },
  { value: 'outdoor', label: 'Outdoor', description: 'Parks & bodyweight', icon: TreePine },
  { value: 'work', label: 'Office', description: 'Quick sessions', icon: Briefcase },
];

const equipmentOptions = [
  { value: 'DUMBBELLS', label: 'Dumbbells' },
  { value: 'BARBELL', label: 'Barbell' },
  { value: 'KETTLEBELL', label: 'Kettlebell' },
  { value: 'RESISTANCE_BANDS', label: 'Resistance Bands' },
  { value: 'PULL_UP_BAR', label: 'Pull-up Bar' },
  { value: 'BENCH', label: 'Bench' },
  { value: 'CABLE_MACHINE', label: 'Cable Machine' },
  { value: 'TREADMILL', label: 'Treadmill' },
  { value: 'ROWING_MACHINE', label: 'Rowing Machine' },
  { value: 'BODYWEIGHT', label: 'Bodyweight Only' },
];

export default function OnboardingPage() {
  const { t } = useLanguage();
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
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
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
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 container flex min-h-screen flex-col items-center justify-center py-8">
        <div className="w-full max-w-xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
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
                      isActive && "bg-gradient-to-br from-cyan-500 to-purple-500 shadow-lg shadow-primary/25",
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
          <div className="mb-8 h-1 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

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
              className="glass rounded-2xl p-6 border border-border/50"
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
                    <p className="text-muted-foreground">We'll tailor your workouts accordingly</p>
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
                    <h1 className="text-2xl font-bold mb-2">Tell us about your body</h1>
                    <p className="text-muted-foreground">This helps us calculate your nutrition needs</p>
                  </div>
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Current Weight</Label>
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
                        <Label className="text-sm font-medium">Height</Label>
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
                      <Label className="text-sm font-medium">Target Weight <span className="text-muted-foreground">(optional)</span></Label>
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
                              Your BMI: {(parseFloat(formData.currentWeight) / Math.pow(parseFloat(formData.height) / 100, 2)).toFixed(1)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              We'll use this to personalize your plan
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
                    <h1 className="text-2xl font-bold mb-2">How active are you?</h1>
                    <p className="text-muted-foreground">Outside of planned workouts</p>
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
                    <h1 className="text-2xl font-bold mb-2">What equipment do you have?</h1>
                    <p className="text-muted-foreground">Select all that apply</p>
                  </div>

                  {/* Workout Location */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Where do you usually train?</Label>
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
                    <Label className="text-sm font-medium">Available Equipment</Label>
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
                            {isSelected && <Check className="h-3 w-3 mr-1 inline" />}
                            {eq.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
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
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t.common.back}
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="btn-primary"
              >
                {t.common.continue}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!canProceed() || isLoading}
                className="btn-primary"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
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
