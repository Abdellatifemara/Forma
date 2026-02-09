'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  CheckCircle2,
  Circle,
  ChevronRight,
  Trophy,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useResearchTests, useResearchTest, useSubmitTest } from '@/hooks/use-research';
import { SurveyModal } from '@/components/research/survey-modal';
import type { TestDetail } from '@/lib/api';

// Preference category colors - these questions help personalize the AI
const preferenceCategories: Record<string, { icon: string; color: string; bgColor: string }> = {
  test_workout_logging: { icon: '💪', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
  test_nutrition_tracking: { icon: '🥗', color: 'text-green-400', bgColor: 'bg-green-500/10' },
  test_body_tracking: { icon: '📊', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  test_schedule_lifestyle: { icon: '📅', color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
  test_goals_motivation: { icon: '🎯', color: 'text-red-400', bgColor: 'bg-red-500/10' },
  test_social_community: { icon: '👥', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  test_coach_interaction: { icon: '🏋️', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
  test_onboarding_depth: { icon: '🚀', color: 'text-pink-400', bgColor: 'bg-pink-500/10' },
  test_notifications: { icon: '🔔', color: 'text-indigo-400', bgColor: 'bg-indigo-500/10' },
  test_feature_priority: { icon: '⭐', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
  test_pricing_value: { icon: '💰', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  test_app_experience: { icon: '📱', color: 'text-violet-400', bgColor: 'bg-violet-500/10' },
  test_equipment: { icon: '🏠', color: 'text-slate-400', bgColor: 'bg-slate-500/10' },
  test_injuries: { icon: '🩹', color: 'text-rose-400', bgColor: 'bg-rose-500/10' },
  test_ramadan: { icon: '🌙', color: 'text-teal-400', bgColor: 'bg-teal-500/10' },
};

export default function PersonalizationPage() {
  const { data, isLoading } = useResearchTests();
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [activeTest, setActiveTest] = useState<TestDetail | null>(null);

  const { data: testDetail, isLoading: loadingTest } = useResearchTest(selectedTest || '');
  const submitMutation = useSubmitTest();

  // When test detail loads, set it as active
  if (testDetail && !testDetail.completed && selectedTest && !activeTest) {
    setActiveTest(testDetail);
  }

  const handleTestClick = (code: string, completed: boolean) => {
    if (completed) return;
    setSelectedTest(code);
  };

  const handleCloseTest = () => {
    setActiveTest(null);
    setSelectedTest(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const tests = data?.tests || [];
  const progress = data?.progress || 0;
  const completedCount = data?.completedTests || 0;
  const totalCount = data?.totalTests || 0;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-purple-500/10 p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.15),transparent_50%)]" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500">
              <ClipboardList className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Personalize Your Experience</h1>
              <p className="text-muted-foreground">
                Answer a few questions to get tailored recommendations
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Personalization progress</span>
              <span className="text-sm font-medium">{completedCount}/{totalCount} completed</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {progress === 100 && (
            <div className="mt-4 flex items-center gap-2 text-green-400">
              <Trophy className="h-5 w-5" />
              <span className="font-medium">All done! Your experience is now fully personalized.</span>
            </div>
          )}
        </div>
      </div>

      {/* Incentive banner */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <p className="font-medium">The more you share, the better your recommendations</p>
            <p className="text-sm text-muted-foreground">
              Your preferences help us give you personalized workouts, nutrition plans, and coaching tips
            </p>
          </div>
        </div>
      </div>

      {/* Preference questions */}
      <div className="space-y-3">
        {tests.map((test) => {
          const category = preferenceCategories[test.code] || {
            icon: '📋',
            color: 'text-muted-foreground',
            bgColor: 'bg-muted',
          };

          return (
            <button
              key={test.id}
              onClick={() => handleTestClick(test.code, test.completed)}
              disabled={test.completed || loadingTest}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-xl border transition-all',
                test.completed
                  ? 'border-green-500/30 bg-green-500/5 cursor-default'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer',
                selectedTest === test.code && loadingTest && 'opacity-70'
              )}
            >
              <div className={cn('p-3 rounded-xl text-2xl', category.bgColor)}>
                {category.icon}
              </div>

              <div className="flex-1 text-left">
                <h3 className="font-medium">{test.title}</h3>
                <p className="text-sm text-muted-foreground">{test.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {test.questionCount} questions
                </p>
              </div>

              <div className="flex items-center gap-2">
                {test.completed ? (
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                ) : selectedTest === test.code && loadingTest ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Test Modal */}
      {activeTest && (
        <SurveyModal
          survey={{
            id: activeTest.id,
            code: activeTest.code,
            title: activeTest.title,
            titleAr: activeTest.titleAr,
            description: activeTest.description,
            descriptionAr: activeTest.descriptionAr,
            questions: activeTest.questions,
          }}
          onClose={handleCloseTest}
          onComplete={handleCloseTest}
          language="en"
        />
      )}
    </div>
  );
}
