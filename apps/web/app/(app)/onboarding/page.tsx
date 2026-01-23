'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Dumbbell,
  Scale,
  Ruler,
  Activity,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const steps = [
  { id: 'goal', title: 'Your Goal', icon: Target },
  { id: 'experience', title: 'Experience', icon: Dumbbell },
  { id: 'body', title: 'Body Stats', icon: Scale },
  { id: 'activity', title: 'Activity Level', icon: Activity },
];

const goals = [
  { value: 'lose-weight', label: 'Lose Weight', emoji: '🔥' },
  { value: 'build-muscle', label: 'Build Muscle', emoji: '💪' },
  { value: 'get-stronger', label: 'Get Stronger', emoji: '🏋️' },
  { value: 'improve-health', label: 'Improve Health', emoji: '❤️' },
  { value: 'increase-endurance', label: 'Increase Endurance', emoji: '🏃' },
];

const experienceLevels = [
  { value: 'beginner', label: 'Beginner', description: "I'm new to fitness" },
  { value: 'intermediate', label: 'Intermediate', description: '1-2 years experience' },
  { value: 'advanced', label: 'Advanced', description: '3+ years experience' },
];

const activityLevels = [
  { value: 1.2, label: 'Sedentary', description: 'Little to no exercise' },
  { value: 1.375, label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
  { value: 1.55, label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
  { value: 1.725, label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
  { value: 1.9, label: 'Athlete', description: 'Professional athlete level' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    goal: '',
    experience: '',
    weight: '',
    height: '',
    targetWeight: '',
    activityLevel: 1.55,
  });

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

  const handleComplete = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    router.push('/app/dashboard');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!formData.goal;
      case 1:
        return !!formData.experience;
      case 2:
        return !!formData.weight && !!formData.height;
      case 3:
        return !!formData.activityLevel;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forma-navy to-forma-navy-light">
      <div className="container flex min-h-screen flex-col items-center justify-center py-12">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between text-sm text-white/60">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{steps[currentStep].title}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && (
                <div className="space-y-4">
                  <h1 className="text-center text-2xl font-bold text-white">
                    What's your main fitness goal?
                  </h1>
                  <p className="text-center text-white/60">
                    This helps us personalize your experience
                  </p>
                  <div className="mt-8 grid gap-3">
                    {goals.map((goal) => (
                      <Card
                        key={goal.value}
                        className={`cursor-pointer border-2 transition-all ${
                          formData.goal === goal.value
                            ? 'border-forma-teal bg-forma-teal/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                        onClick={() => setFormData({ ...formData, goal: goal.value })}
                      >
                        <CardContent className="flex items-center gap-4 p-4">
                          <span className="text-2xl">{goal.emoji}</span>
                          <span className="font-medium text-white">{goal.label}</span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <h1 className="text-center text-2xl font-bold text-white">
                    What's your fitness experience?
                  </h1>
                  <p className="text-center text-white/60">
                    We'll adjust your workouts accordingly
                  </p>
                  <div className="mt-8 grid gap-3">
                    {experienceLevels.map((level) => (
                      <Card
                        key={level.value}
                        className={`cursor-pointer border-2 transition-all ${
                          formData.experience === level.value
                            ? 'border-forma-teal bg-forma-teal/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                        onClick={() => setFormData({ ...formData, experience: level.value })}
                      >
                        <CardContent className="p-4">
                          <p className="font-medium text-white">{level.label}</p>
                          <p className="text-sm text-white/60">{level.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <h1 className="text-center text-2xl font-bold text-white">
                    Tell us about your body
                  </h1>
                  <p className="text-center text-white/60">
                    This helps us calculate your nutrition needs
                  </p>
                  <div className="mt-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white/80">Current Weight (kg)</Label>
                        <Input
                          type="number"
                          placeholder="75"
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                          className="border-white/20 bg-white/10 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80">Height (cm)</Label>
                        <Input
                          type="number"
                          placeholder="175"
                          value={formData.height}
                          onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                          className="border-white/20 bg-white/10 text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80">Target Weight (kg) - Optional</Label>
                      <Input
                        type="number"
                        placeholder="70"
                        value={formData.targetWeight}
                        onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                        className="border-white/20 bg-white/10 text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h1 className="text-center text-2xl font-bold text-white">
                    How active are you?
                  </h1>
                  <p className="text-center text-white/60">
                    Outside of planned workouts
                  </p>
                  <div className="mt-8 grid gap-3">
                    {activityLevels.map((level) => (
                      <Card
                        key={level.value}
                        className={`cursor-pointer border-2 transition-all ${
                          formData.activityLevel === level.value
                            ? 'border-forma-teal bg-forma-teal/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                        onClick={() => setFormData({ ...formData, activityLevel: level.value })}
                      >
                        <CardContent className="p-4">
                          <p className="font-medium text-white">{level.label}</p>
                          <p className="text-sm text-white/60">{level.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="text-white/60 hover:text-white"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                variant="forma"
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="forma"
                onClick={handleComplete}
                disabled={!canProceed() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Get Started
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
