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

type Step = 'basics' | 'schedule' | 'goal' | 'review';

const goals = [
  { id: 'muscle_building', name: 'Muscle Building', nameAr: 'بناء العضلات', icon: Dumbbell, color: 'cyan' },
  { id: 'fat_loss', name: 'Fat Loss', nameAr: 'حرق الدهون', icon: Flame, color: 'orange' },
  { id: 'strength', name: 'Strength', nameAr: 'القوة', icon: Zap, color: 'purple' },
  { id: 'endurance', name: 'Endurance', nameAr: 'التحمل', icon: Heart, color: 'red' },
  { id: 'general_fitness', name: 'General Fitness', nameAr: 'اللياقة العامة', icon: Target, color: 'green' },
];

const levels = [
  { id: 'beginner', name: 'Beginner', description: 'New to training, less than 6 months experience' },
  { id: 'intermediate', name: 'Intermediate', description: '6 months to 2 years of consistent training' },
  { id: 'advanced', name: 'Advanced', description: '2+ years of structured training experience' },
];

const frequencies = [
  { days: 3, name: '3 Days', description: 'Full body or upper/lower split' },
  { days: 4, name: '4 Days', description: 'Upper/lower or push/pull split' },
  { days: 5, name: '5 Days', description: 'Body part split or push/pull/legs' },
  { days: 6, name: '6 Days', description: 'Push/pull/legs x2 or advanced split' },
];

export default function NewProgramPage() {
  const router = useRouter();
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
    { id: 'basics', name: 'Basics' },
    { id: 'schedule', name: 'Schedule' },
    { id: 'goal', name: 'Goal & Level' },
    { id: 'review', name: 'Review' },
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
      // TODO: Call API to create program
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push('/trainer/programs/new-program-id');
    } catch {
      // Handle error silently - show toast in production
    } finally {
      setIsCreating(false);
    }
  };

  const selectedGoal = goals.find((g) => g.id === formData.goal);
  const selectedLevel = levels.find((l) => l.id === formData.level);
  const selectedFrequency = frequencies.find((f) => f.days === formData.frequency);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/trainer/programs">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Program</h1>
          <p className="text-muted-foreground">Build a custom workout program step by step</p>
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
                <FileText className="h-12 w-12 mx-auto mb-4 text-cyan-400" />
                <h2 className="text-2xl font-bold">Program Details</h2>
                <p className="text-muted-foreground mt-2">
                  Start by naming your program and adding a description
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Program Name (English) *</Label>
                  <Input
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="e.g., 12-Week Transformation Program"
                    className="mt-1.5 bg-muted/50 border-border/50"
                  />
                </div>

                <div>
                  <Label>Program Name (Arabic)</Label>
                  <Input
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    placeholder="مثال: برنامج التحول لمدة 12 أسبوع"
                    className="mt-1.5 bg-muted/50 border-border/50"
                    dir="rtl"
                  />
                </div>

                <div>
                  <Label>Description (English)</Label>
                  <Textarea
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    placeholder="Describe what this program offers and who it's for..."
                    className="mt-1.5 bg-muted/50 border-border/50 min-h-[100px]"
                  />
                </div>

                <div>
                  <Label>Description (Arabic)</Label>
                  <Textarea
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    placeholder="وصف البرنامج..."
                    className="mt-1.5 bg-muted/50 border-border/50 min-h-[100px]"
                    dir="rtl"
                  />
                </div>

                <div>
                  <Label>Price (EGP) - Leave empty for subscription-only</Label>
                  <Input
                    type="number"
                    value={formData.priceEGP ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priceEGP: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    placeholder="e.g., 500"
                    className="mt-1.5 bg-muted/50 border-border/50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    If left empty, this program will only be available to subscribed clients
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'schedule' && (
            <div className="space-y-8 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                <h2 className="text-2xl font-bold">Program Schedule</h2>
                <p className="text-muted-foreground mt-2">
                  Set the duration and training frequency
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold">Program Duration</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    How many weeks will this program run?
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
                        <p className="text-sm text-muted-foreground">weeks</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Label className="text-sm">Or enter custom duration</Label>
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
                  <Label className="text-base font-semibold">Training Frequency</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    How many days per week will clients train?
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
                            <p className="font-semibold">{freq.name}</p>
                            <p className="text-sm text-muted-foreground">{freq.description}</p>
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
                <h2 className="text-2xl font-bold">Goal & Level</h2>
                <p className="text-muted-foreground mt-2">
                  Define the primary goal and difficulty level
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold">Primary Goal</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    What will clients achieve with this program?
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
                          <p className="font-semibold">{goal.name}</p>
                          <p className="text-sm text-muted-foreground">{goal.nameAr}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">Difficulty Level</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Who is this program designed for?
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
                            <p className="font-semibold">{level.name}</p>
                            <p className="text-sm text-muted-foreground">{level.description}</p>
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
                <h2 className="text-2xl font-bold">Review & Create</h2>
                <p className="text-muted-foreground mt-2">
                  Review your program details before creating
                </p>
              </div>

              <div className="space-y-4">
                <Card className="bg-muted/30 border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Program Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium">{formData.nameEn || 'Not set'}</span>
                    </div>
                    {formData.nameAr && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name (Arabic)</span>
                        <span className="font-medium" dir="rtl">
                          {formData.nameAr}
                        </span>
                      </div>
                    )}
                    {formData.descriptionEn && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Description</span>
                        <span className="font-medium text-right max-w-[200px] truncate">
                          {formData.descriptionEn}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-muted/30 border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Schedule</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{formData.durationWeeks} weeks</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frequency</span>
                      <span className="font-medium">{formData.frequency} days/week</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30 border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Goal & Level</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Primary Goal</span>
                      <span className="font-medium">{selectedGoal?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Difficulty</span>
                      <span className="font-medium capitalize">{formData.level}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30 border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Pricing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-medium">
                        {formData.priceEGP ? `${formData.priceEGP} EGP` : 'Subscription only'}
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
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {currentStep === 'review' ? (
          <Button onClick={handleCreate} disabled={isCreating} className="btn-primary">
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create Program
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={!canProceed()} className="btn-primary">
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
