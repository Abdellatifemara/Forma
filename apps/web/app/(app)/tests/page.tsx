'use client';

import { useState } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  ChevronRight,
  Trophy,
  Sparkles,
  Loader2,
  Dumbbell,
  Target,
  Utensils,
  Calendar,
  Heart,
  Brain,
  Settings,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useResearchTests, useResearchTest, useSubmitTest } from '@/hooks/use-research';
import { SurveyModal } from '@/components/research/survey-modal';
import type { TestDetail } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';

// Survey categories with icons matching the new comprehensive surveys
const surveyCategories: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  fitness_profile: {
    icon: <Activity className="h-6 w-6" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20'
  },
  body_goals: {
    icon: <Target className="h-6 w-6" />,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20'
  },
  training_style: {
    icon: <Dumbbell className="h-6 w-6" />,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20'
  },
  schedule: {
    icon: <Calendar className="h-6 w-6" />,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20'
  },
  nutrition_profile: {
    icon: <Utensils className="h-6 w-6" />,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20'
  },
  lifestyle: {
    icon: <Heart className="h-6 w-6" />,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20'
  },
  motivation: {
    icon: <Brain className="h-6 w-6" />,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20'
  },
  tracking_preferences: {
    icon: <Settings className="h-6 w-6" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20'
  },
};

// Fallback category
const defaultCategory = {
  icon: <ClipboardList className="h-6 w-6" />,
  color: 'text-muted-foreground',
  bgColor: 'bg-muted'
};

export default function PersonalizationPage() {
  const { t } = useLanguage();
  const { data, isLoading, error } = useResearchTests();
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

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load personalization options</p>
        <p className="text-sm text-muted-foreground mt-2">Please try again later</p>
      </div>
    );
  }

  const tests = data?.tests || [];
  const progress = data?.progress || 0;
  const completedCount = data?.completedTests || 0;
  const totalCount = data?.totalTests || tests.length || 0;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-purple-500/10 p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.15),transparent_50%)]" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-primary">
              <ClipboardList className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t.tests.title}</h1>
              <p className="text-muted-foreground">
                {t.tests.subtitle}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Personalization progress</span>
              <span className="text-sm font-medium">{completedCount}/{totalCount} {t.achievements.completed}</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
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

      {/* Show message if no tests */}
      {tests.length === 0 && (
        <div className="text-center py-12 rounded-xl border border-dashed">
          <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No personalization surveys available yet</p>
          <p className="text-sm text-muted-foreground mt-2">Check back soon!</p>
        </div>
      )}

      {/* Surveys list */}
      <div className="space-y-3">
        {tests.map((test) => {
          const category = surveyCategories[test.code] || defaultCategory;

          return (
            <button
              key={test.id}
              onClick={() => handleTestClick(test.code, test.completed)}
              disabled={test.completed || loadingTest}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left',
                test.completed
                  ? 'border-green-500/30 bg-green-500/5 cursor-default'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer',
                selectedTest === test.code && loadingTest && 'opacity-70'
              )}
            >
              <div className={cn('p-3 rounded-xl', category.bgColor, category.color)}>
                {category.icon}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{test.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{test.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {test.questionCount} questions
                </p>
              </div>

              <div className="flex-shrink-0 flex items-center gap-2">
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

      {/* Survey Modal */}
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
