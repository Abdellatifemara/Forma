'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Dumbbell,
  FileText,
  Flame,
  Heart,
  Loader2,
  Target,
  Users,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { programsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n';

type Step = 'basics' | 'schedule' | 'goal' | 'review';

const goals = [
  { id: 'muscle_building', name: 'Muscle Building', nameAr: '\u0628\u0646\u0627\u0621 \u0627\u0644\u0639\u0636\u0644\u0627\u062a', icon: Dumbbell, color: 'cyan' },
  { id: 'fat_loss', name: 'Fat Loss', nameAr: '\u062d\u0631\u0642 \u0627\u0644\u062f\u0647\u0648\u0646', icon: Flame, color: 'orange' },
  { id: 'strength', name: 'Strength', nameAr: '\u0627\u0644\u0642\u0648\u0629', icon: Zap, color: 'purple' },
  { id: 'endurance', name: 'Endurance', nameAr: '\u0627\u0644\u062a\u062d\u0645\u0644', icon: Heart, color: 'red' },
  { id: 'general_fitness', name: 'General Fitness', nameAr: '\u0627\u0644\u0644\u064a\u0627\u0642\u0629 \u0627\u0644\u0639\u0627\u0645\u0629', icon: Target, color: 'green' },
];

const levels = [
  { id: 'beginner', name: 'Beginner', nameAr: '\u0645\u0628\u062a\u062f\u0626', description: 'New to training, less than 6 months experience', descriptionAr: '\u062c\u062f\u064a\u062f \u0639\u0644\u0649 \u0627\u0644\u062a\u0645\u0631\u064a\u0646\u060c \u0623\u0642\u0644 \u0645\u0646 6 \u0634\u0647\u0648\u0631 \u062e\u0628\u0631\u0629' },
  { id: 'intermediate', name: 'Intermediate', nameAr: '\u0645\u062a\u0648\u0633\u0637', description: '6 months to 2 years of consistent training', descriptionAr: '\u0645\u0646 6 \u0634\u0647\u0648\u0631 \u0644\u0633\u0646\u062a\u064a\u0646 \u062a\u0645\u0631\u064a\u0646 \u0645\u0646\u062a\u0638\u0645' },
  { id: 'advanced', name: 'Advanced', nameAr: '\u0645\u062a\u0642\u062f\u0645', description: '2+ years of structured training experience', descriptionAr: '\u0623\u0643\u062a\u0631 \u0645\u0646 \u0633\u0646\u062a\u064a\u0646 \u062a\u0645\u0631\u064a\u0646 \u0645\u0646\u0638\u0645' },
];

const frequencies = [
  { days: 3, name: '3 Days', nameAr: '3 \u0623\u064a\u0627\u0645', description: 'Full body or upper/lower split', descriptionAr: '\u062c\u0633\u0645 \u0643\u0627\u0645\u0644 \u0623\u0648 \u062a\u0642\u0633\u064a\u0645 \u0639\u0644\u0648\u064a/\u0633\u0641\u0644\u064a' },
  { days: 4, name: '4 Days', nameAr: '4 \u0623\u064a\u0627\u0645', description: 'Upper/lower or push/pull split', descriptionAr: '\u0639\u0644\u0648\u064a/\u0633\u0641\u0644\u064a \u0623\u0648 \u062f\u0641\u0639/\u0633\u062d\u0628' },
  { days: 5, name: '5 Days', nameAr: '5 \u0623\u064a\u0627\u0645', description: 'Body part split or push/pull/legs', descriptionAr: '\u062a\u0642\u0633\u064a\u0645 \u0639\u0636\u0644\u0627\u062a \u0623\u0648 \u062f\u0641\u0639/\u0633\u062d\u0628/\u0631\u062c\u0644' },
  { days: 6, name: '6 Days', nameAr: '6 \u0623\u064a\u0627\u0645', description: 'Push/pull/legs x2 or advanced split', descriptionAr: '\u062f\u0641\u0639/\u0633\u062d\u0628/\u0631\u062c\u0644 x2 \u0623\u0648 \u062a\u0642\u0633\u064a\u0645 \u0645\u062a\u0642\u062f\u0645' },
];

export default function NewProgramPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [currentStep, setCurrentStep] = useState<Step>('basics');
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    nameEn: '',
    nameAr: '',
    descriptionEn: '',
    descriptionAr: '',
    durationWeeks: 8,
    frequency: 4,
    level: 'intermediate',
    goal: 'muscle_building',
    priceEGP: null as number | null,
  });

  const steps: { id: Step; name: string }[] = [
    { id: 'basics', name: isAr ? '\u0627\u0644\u0623\u0633\u0627\u0633\u064a\u0627\u062a' : 'Basics' },
    { id: 'schedule', name: isAr ? '\u0627\u0644\u062c\u062f\u0648\u0644' : 'Schedule' },
    { id: 'goal', name: isAr ? '\u0627\u0644\u0647\u062f\u0641 \u0648\u0627\u0644\u0645\u0633\u062a\u0648\u0649' : 'Goal & Level' },
    { id: 'review', name: isAr ? '\u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629' : 'Review' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const canProceed = () => {
    switch (currentStep) {
      case 'basics':
        return formData.nameEn.trim().length > 0;
      case 'schedule':
        return formData.durationWeeks > 0 && formData.frequency > 0;
      case 'goal':
        return formData.goal && formData.level;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const program = await programsApi.create({
        nameEn: formData.nameEn,
        nameAr: formData.nameAr || undefined,
        descriptionEn: formData.descriptionEn || undefined,
        descriptionAr: formData.descriptionAr || undefined,
        durationWeeks: formData.durationWeeks,
        priceEGP: formData.priceEGP ?? undefined,
        sourceType: 'manual',
      });
      toast({
        title: isAr ? '\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062c' : 'Program created',
        description: isAr ? '\u062f\u0644\u0648\u0642\u062a\u064a \u0623\u0636\u0641 \u0623\u064a\u0627\u0645 \u0627\u0644\u062a\u0645\u0631\u064a\u0646 \u0648\u0627\u0644\u062a\u0645\u0627\u0631\u064a\u0646.' : 'Now add workout days and exercises.',
      });
      router.push(`/trainer/programs/${program.id}`);
    } catch (error: any) {
      toast({
        title: isAr ? '\u0641\u0634\u0644 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062c' : 'Failed to create program',
        description: error?.message || (isAr ? '\u062d\u0627\u0648\u0644 \u062a\u0627\u0646\u064a.' : 'Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const selectedGoal = goals.find((g) => g.id === formData.goal);
  const selectedLevel = levels.find((l) => l.id === formData.level);
  const selectedFrequency = frequencies.find((f) => f.days === formData.frequency);

  return (
    <div className="space-y-6 pb-8" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/trainer/programs">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isAr ? '\u0625\u0646\u0634\u0627\u0621 \u0628\u0631\u0646\u0627\u0645\u062c' : 'Create Program'}</h1>
          <p className="text-muted-foreground">{isAr ? '\u0627\u0628\u0646\u064a \u0628\u0631\u0646\u0627\u0645\u062c \u062a\u0645\u0627\u0631\u064a\u0646 \u0645\u062e\u0635\u0635 \u062e\u0637\u0648\u0629 \u0628\u062e\u0637\u0648\u0629' : 'Build a custom workout program step by step'}</p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="glass border-border/50">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = step.id === currentStep;
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                        isCompleted && 'border-green-500 bg-green-500/20',
                        isCurrent && 'border-primary bg-primary/20',
                        !isCompleted && !isCurrent && 'border-border/50'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5 text-green-400" />
                      ) : (
                        <span
                          className={cn(
                            'text-sm font-semibold',
                            isCurrent ? 'text-primary' : 'text-muted-foreground'
                          )}
                        >
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <span
                      className={cn(
                        'mt-2 text-sm font-medium',
                        isCurrent ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'mx-4 h-0.5 w-16 sm:w-24',
                        index < currentStepIndex ? 'bg-green-500' : 'bg-border/50'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card className="glass border-border/50">
        <CardContent className="py-8">
          {currentStep === 'basics' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                <h2 className="text-2xl font-bold">{isAr ? '\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062c' : 'Program Details'}</h2>
                <p className="text-muted-foreground mt-2">
                  {isAr ? '\u0627\u0628\u062f\u0623 \u0628\u062a\u0633\u0645\u064a\u0629 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062c \u0648\u0625\u0636\u0627\u0641\u0629 \u0648\u0635\u0641' : 'Start by naming your program and adding a description'}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>{isAr ? '(\u0625\u0646\u062c\u0644\u064a\u0632\u064a) *\u0627\u0633\u0645 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062c' : 'Program Name (English) *'}</Label>
                  <Input
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder={isAr ? '\u0645\u062b\u0627\u0644: 12-Week Transformation Program' : 'e.g., 12-Week Transformation Program'}
                    className="mt-1.5 bg-muted/50 border-border/50"
                  />
                </div>

                <div>
                  <Label>{isAr ? '(\u0639\u0631\u0628\u064a) \u0627\u0633\u0645 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062c' : 'Program Name (Arabic)'}</Label>
                  <Input
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    placeholder="\u0645\u062b\u0627\u0644: \u0628\u0631\u0646\u0627\u0645\u062c \u0627\u0644\u062a\u062d\u0648\u0644 \u0644\u0645\u062f\u0629 12 \u0623\u0633\u0628\u0648\u0639"
                    className="mt-1.5 bg-muted/50 border-border/50"
                    dir="rtl"
                  />
                </div>

                <div>
                  <Label>{isAr ? '(\u0625\u0646\u062c\u0644\u064a\u0632\u064a) \u0627\u0644\u0648\u0635\u0641' : 'Description (English)'}</Label>
                  <Textarea
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    placeholder={isAr ? '\u0648\u0635\u0641 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062c \u0628\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a...' : 'Describe what this program offers and who it\'s for...'}
                    className="mt-1.5 bg-muted/50 border-border/50 min-h-[100px]"
                  />
                </div>

                <div>
                  <Label>{isAr ? '(\u0639\u0631\u0628\u064a) \u0627\u0644\u0648\u0635\u0641' : 'Description (Arabic)'}</Label>
                  <Textarea
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    placeholder="\u0648\u0635\u0641 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062c..."
                    className="mt-1.5 bg-muted/50 border-border/50 min-h-[100px]"
                    dir="rtl"
                  />
                </div>

                <div>
                  <Label>{isAr ? '\u0627\u0644\u0633\u0639\u0631 (\u062c.\u0645) - \u0633\u064a\u0628\u0647 \u0641\u0627\u0636\u064a \u0644\u0648 \u0644\u0644\u0645\u0634\u062a\u0631\u0643\u064a\u0646 \u0628\u0633' : 'Price (EGP) - Leave empty for subscription-only'}</Label>
                  <Input
                    type="number"
                    value={formData.priceEGP ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priceEGP: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    placeholder={isAr ? '\u0645\u062b\u0627\u0644: 500' : 'e.g., 500'}
                    className="mt-1.5 bg-muted/50 border-border/50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {isAr ? '\u0644\u0648 \u0641\u0627\u0636\u064a\u060c \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062c \u062f\u0647 \u0647\u064a\u0643\u0648\u0646 \u0645\u062a\u0627\u062d \u0644\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u0634\u062a\u0631\u0643\u064a\u0646 \u0628\u0633' : 'If left empty, this program will only be available to subscribed clients'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'schedule' && (
            <div className="space-y-8 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                <h2 className="text-2xl font-bold">{isAr ? '\u062c\u062f\u0648\u0644 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062c' : 'Program Schedule'}</h2>
                <p className="text-muted-foreground mt-2">
                  {isAr ? '\u062d\u062f\u062f \u0627\u0644\u0645\u062f\u0629 \u0648\u062a\u0643\u0631\u0627\u0631 \u0627\u0644\u062a\u062f\u0631\u064a\u0628' : 'Set the duration and training frequency'}
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold">{isAr ? '\u0645\u062f\u0629 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062c' : 'Program Duration'}</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    {isAr ? '\u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062c \u062f\u0647 \u0647\u064a\u0643\u0648\u0646 \u0643\u0627\u0645 \u0623\u0633\u0628\u0648\u0639\u061f' : 'How many weeks will this program run?'}
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    {[4, 6, 8, 12].map((weeks) => (
                      <div
                        key={weeks}
                        onClick={() => setFormData({ ...formData, durationWeeks: weeks })}
                        className={cn(
                          'cursor-pointer rounded-xl border-2 p-4 text-center transition-all',
                          formData.durationWeeks === weeks
                            ? 'border-primary bg-primary/10'
                            : 'border-border/50 hover:border-primary/30'
                        )}
                      >
                        <p className="text-2xl font-bold">{weeks}</p>
                        <p className="text-sm text-muted-foreground">{isAr ? '\u0623\u0633\u0627\u0628\u064a\u0639' : 'weeks'}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Label className="text-sm">{isAr ? '\u0623\u0648 \u0627\u062f\u062e\u0644 \u0645\u062f\u0629 \u0645\u062e\u0635\u0635\u0629' : 'Or enter custom duration'}</Label>
                    <Input
                      type="number"
                      value={formData.durationWeeks}
                      onChange={(e) =>
                        setFormData({ ...formData, durationWeeks: parseInt(e.target.value) || 0 })
                      }
                      className="mt-1.5 bg-muted/50 border-border/50 w-32"
                      min={1}
                      max={52}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">{isAr ? '\u062a\u0643\u0631\u0627\u0631 \u0627\u0644\u062a\u062f\u0631\u064a\u0628' : 'Training Frequency'}</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    {isAr ? '\u0643\u0627\u0645 \u064a\u0648\u0645 \u0641\u064a \u0627\u0644\u0623\u0633\u0628\u0648\u0639 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0647\u064a\u062a\u0645\u0631\u0646\u0648\u0627\u061f' : 'How many days per week will clients train?'}
                  </p>
                  <div className="grid gap-3">
                    {frequencies.map((freq) => (
                      <div
                        key={freq.days}
                        onClick={() => setFormData({ ...formData, frequency: freq.days })}
                        className={cn(
                          'cursor-pointer rounded-xl border-2 p-4 transition-all',
                          formData.frequency === freq.days
                            ? 'border-primary bg-primary/10'
                            : 'border-border/50 hover:border-primary/30'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{isAr ? freq.nameAr : freq.name}</p>
                            <p className="text-sm text-muted-foreground">{isAr ? freq.descriptionAr : freq.description}</p>
                          </div>
                          <div className="flex gap-1">
                            {Array.from({ length: 7 }).map((_, i) => (
                              <div
                                key={i}
                                className={cn(
                                  'h-3 w-3 rounded-full',
                                  i < freq.days ? 'bg-primary' : 'bg-muted'
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'goal' && (
            <div className="space-y-8 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <Target className="h-12 w-12 mx-auto mb-4 text-green-400" />
                <h2 className="text-2xl font-bold">{isAr ? '\u0627\u0644\u0647\u062f\u0641 \u0648\u0627\u0644\u0645\u0633\u062a\u0648\u0649' : 'Goal & Level'}</h2>
                <p className="text-muted-foreground mt-2">
                  {isAr ? '\u062d\u062f\u062f \u0627\u0644\u0647\u062f\u0641 \u0627\u0644\u0623\u0633\u0627\u0633\u064a \u0648\u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u0635\u0639\u0648\u0628\u0629' : 'Define the primary goal and difficulty level'}
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold">{isAr ? '\u0627\u0644\u0647\u062f\u0641 \u0627\u0644\u0623\u0633\u0627\u0633\u064a' : 'Primary Goal'}</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    {isAr ? '\u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0647\u064a\u062d\u0642\u0642\u0648\u0627 \u0625\u064a\u0647 \u0628\u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062c \u062f\u0647\u061f' : 'What will clients achieve with this program?'}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {goals.map((goal) => {
                      const Icon = goal.icon;
                      return (
                        <div
                          key={goal.id}
                          onClick={() => setFormData({ ...formData, goal: goal.id })}
                          className={cn(
                            'cursor-pointer rounded-xl border-2 p-4 text-center transition-all',
                            formData.goal === goal.id
                              ? 'border-primary bg-primary/10'
                              : 'border-border/50 hover:border-primary/30'
                          )}
                        >
                          <div
                            className={cn(
                              'mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-3',
                              `bg-${goal.color}-500/20`
                            )}
                          >
                            <Icon className={cn('h-6 w-6', `text-${goal.color}-400`)} />
                          </div>
                          <p className="font-semibold">{isAr ? goal.nameAr : goal.name}</p>
                          <p className="text-sm text-muted-foreground">{isAr ? goal.name : goal.nameAr}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">{isAr ? '\u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u0635\u0639\u0648\u0628\u0629' : 'Difficulty Level'}</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    {isAr ? '\u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062c \u062f\u0647 \u0645\u062a\u0635\u0645\u0645 \u0644\u0645\u064a\u0646\u061f' : 'Who is this program designed for?'}
                  </p>
                  <div className="grid gap-3">
                    {levels.map((level) => (
                      <div
                        key={level.id}
                        onClick={() => setFormData({ ...formData, level: level.id })}
                        className={cn(
                          'cursor-pointer rounded-xl border-2 p-4 transition-all',
                          formData.level === level.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border/50 hover:border-primary/30'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              'h-3 w-3 rounded-full',
                              level.id === 'beginner' && 'bg-green-500',
                              level.id === 'intermediate' && 'bg-yellow-500',
                              level.id === 'advanced' && 'bg-red-500'
                            )}
                          />
                          <div>
                            <p className="font-semibold">{isAr ? level.nameAr : level.name}</p>
                            <p className="text-sm text-muted-foreground">{isAr ? level.descriptionAr : level.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <Check className="h-12 w-12 mx-auto mb-4 text-green-400" />
                <h2 className="text-2xl font-bold">{isAr ? '\u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629 \u0648\u0627\u0644\u0625\u0646\u0634\u0627\u0621' : 'Review & Create'}</h2>
                <p className="text-muted-foreground mt-2">
                  {isAr ? '\u0631\u0627\u062c\u0639 \u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062c \u0642\u0628\u0644 \u0627\u0644\u0625\u0646\u0634\u0627\u0621' : 'Review your program details before creating'}
                </p>
              </div>

              <div className="space-y-4">
                <Card className="bg-muted/30 border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{isAr ? '\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062c' : 'Program Details'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isAr ? '\u0627\u0644\u0627\u0633\u0645' : 'Name'}</span>
                      <span className="font-medium">{formData.nameEn || (isAr ? '\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u062a\u062d\u062f\u064a\u062f' : 'Not set')}</span>
                    </div>
                    {formData.nameAr && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{isAr ? '\u0627\u0644\u0627\u0633\u0645 (\u0639\u0631\u0628\u064a)' : 'Name (Arabic)'}</span>
                        <span className="font-medium" dir="rtl">
                          {formData.nameAr}
                        </span>
                      </div>
                    )}
                    {formData.descriptionEn && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{isAr ? '\u0627\u0644\u0648\u0635\u0641' : 'Description'}</span>
                        <span className="font-medium text-right max-w-[200px] truncate">
                          {formData.descriptionEn}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-muted/30 border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{isAr ? '\u0627\u0644\u062c\u062f\u0648\u0644' : 'Schedule'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isAr ? '\u0627\u0644\u0645\u062f\u0629' : 'Duration'}</span>
                      <span className="font-medium">{formData.durationWeeks} {isAr ? '\u0623\u0633\u0627\u0628\u064a\u0639' : 'weeks'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isAr ? '\u0627\u0644\u062a\u0643\u0631\u0627\u0631' : 'Frequency'}</span>
                      <span className="font-medium">{formData.frequency} {isAr ? '\u0623\u064a\u0627\u0645/\u0627\u0644\u0623\u0633\u0628\u0648\u0639' : 'days/week'}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30 border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{isAr ? '\u0627\u0644\u0647\u062f\u0641 \u0648\u0627\u0644\u0645\u0633\u062a\u0648\u0649' : 'Goal & Level'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isAr ? '\u0627\u0644\u0647\u062f\u0641' : 'Primary Goal'}</span>
                      <span className="font-medium">{isAr ? selectedGoal?.nameAr : selectedGoal?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isAr ? '\u0627\u0644\u0635\u0639\u0648\u0628\u0629' : 'Difficulty'}</span>
                      <span className="font-medium capitalize">{isAr ? selectedLevel?.nameAr : formData.level}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30 border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{isAr ? '\u0627\u0644\u062a\u0633\u0639\u064a\u0631' : 'Pricing'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isAr ? '\u0627\u0644\u0633\u0639\u0631' : 'Price'}</span>
                      <span className="font-medium">
                        {formData.priceEGP ? `${formData.priceEGP} ${isAr ? '\u062c.\u0645' : 'EGP'}` : (isAr ? '\u0644\u0644\u0645\u0634\u062a\u0631\u0643\u064a\u0646 \u0641\u0642\u0637' : 'Subscription only')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStepIndex === 0}
          className="border-border/50"
        >
          <ArrowLeft className={cn('h-4 w-4', isAr ? 'ms-2' : 'me-2')} />
          {isAr ? '\u0631\u062c\u0648\u0639' : 'Back'}
        </Button>

        {currentStep === 'review' ? (
          <Button onClick={handleCreate} disabled={isCreating} className="btn-primary">
            {isCreating ? (
              <>
                <Loader2 className={cn('h-4 w-4 animate-spin', isAr ? 'ms-2' : 'me-2')} />
                {isAr ? '\u062c\u0627\u0631\u064a \u0627\u0644\u0625\u0646\u0634\u0627\u0621...' : 'Creating...'}
              </>
            ) : (
              <>
                {isAr ? '\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062c' : 'Create Program'}
                <ArrowRight className={cn('h-4 w-4', isAr ? 'me-2' : 'ms-2')} />
              </>
            )}
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={!canProceed()} className="btn-primary">
            {isAr ? '\u0645\u062a\u0627\u0628\u0639\u0629' : 'Continue'}
            <ArrowRight className={cn('h-4 w-4', isAr ? 'me-2' : 'ms-2')} />
          </Button>
        )}
      </div>
    </div>
  );
}
