'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Check, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface SurveyQuestion {
  id: string;
  type: 'single_choice' | 'multiple_choice' | 'scale' | 'text';
  question: string;
  questionAr?: string;
  options?: { value: string; label: string; labelAr?: string }[];
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
  required?: boolean;
}

interface Survey {
  id: string;
  code: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  questions: SurveyQuestion[];
}

interface SurveyModalProps {
  survey: Survey;
  onClose: () => void;
  onComplete?: () => void;
  language?: 'en' | 'ar';
}

const researchApi = {
  submitSurvey: (surveyId: string, responses: Record<string, unknown>) =>
    api.post(`/research/surveys/${surveyId}/respond`, { responses }),
};

export function SurveyModal({ survey, onClose, onComplete, language = 'en' }: SurveyModalProps) {
  const queryClient = useQueryClient();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const isRTL = language === 'ar';

  const submitMutation = useMutation({
    mutationFn: () => researchApi.submitSurvey(survey.id, responses),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableSurvey'] });
      onComplete?.();
      onClose();
    },
  });

  const question = survey.questions[currentQuestion];
  const isLastQuestion = currentQuestion === survey.questions.length - 1;
  const canProceed = !question.required || responses[question.id] !== undefined;

  const handleNext = () => {
    if (isLastQuestion) {
      submitMutation.mutate();
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const setResponse = (value: unknown) => {
    setResponses({ ...responses, [question.id]: value });
  };

  const getQuestionText = (q: SurveyQuestion) =>
    isRTL && q.questionAr ? q.questionAr : q.question;

  const getOptionLabel = (opt: { label: string; labelAr?: string }) =>
    isRTL && opt.labelAr ? opt.labelAr : opt.label;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className={cn(
        'w-full max-w-lg rounded-2xl border border-border bg-card shadow-xl',
        isRTL && 'text-right'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold">
                {isRTL && survey.titleAr ? survey.titleAr : survey.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isRTL ? `سؤال ${currentQuestion + 1} من ${survey.questions.length}` :
                  `Question ${currentQuestion + 1} of ${survey.questions.length}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((currentQuestion + 1) / survey.questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="p-6">
          <h4 className="text-lg font-medium mb-6">{getQuestionText(question)}</h4>

          {/* Single/Multiple Choice */}
          {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
            <div className="space-y-2">
              {question.options?.map((option) => {
                const isSelected = question.type === 'multiple_choice'
                  ? Array.isArray(responses[question.id]) &&
                    (responses[question.id] as string[]).includes(option.value)
                  : responses[question.id] === option.value;

                const handleClick = () => {
                  if (question.type === 'multiple_choice') {
                    const current = (responses[question.id] as string[]) || [];
                    if (isSelected) {
                      setResponse(current.filter((v) => v !== option.value));
                    } else {
                      setResponse([...current, option.value]);
                    }
                  } else {
                    setResponse(option.value);
                  }
                };

                return (
                  <button
                    key={option.value}
                    onClick={handleClick}
                    className={cn(
                      'w-full flex items-center gap-3 p-4 rounded-xl border transition-all',
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 hover:border-border',
                      isRTL && 'flex-row-reverse'
                    )}
                  >
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                        question.type === 'multiple_choice' && 'rounded',
                        isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                      )}
                    >
                      {isSelected && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <span className="flex-1">{getOptionLabel(option)}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Scale */}
          {question.type === 'scale' && (
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-3">
                <span>{question.scaleMinLabel}</span>
                <span>{question.scaleMaxLabel}</span>
              </div>
              <div className="flex gap-2">
                {Array.from(
                  { length: (question.scaleMax || 5) - (question.scaleMin || 1) + 1 },
                  (_, i) => (question.scaleMin || 1) + i
                ).map((value) => (
                  <button
                    key={value}
                    onClick={() => setResponse(value)}
                    className={cn(
                      'flex-1 py-4 rounded-xl border text-lg font-bold transition-all',
                      responses[question.id] === value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border/50 hover:border-border'
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Text */}
          {question.type === 'text' && (
            <textarea
              value={(responses[question.id] as string) || ''}
              onChange={(e) => setResponse(e.target.value)}
              className={cn(
                'w-full p-4 rounded-xl bg-muted/50 border border-border/50 resize-none',
                'focus:outline-none focus:ring-2 focus:ring-primary/50',
                isRTL && 'text-right'
              )}
              rows={4}
              placeholder={isRTL ? 'اكتب إجابتك هنا...' : 'Type your answer here...'}
            />
          )}
        </div>

        {/* Footer */}
        <div className={cn(
          'flex gap-3 p-4 border-t border-border/50',
          isRTL && 'flex-row-reverse'
        )}>
          {currentQuestion > 0 && (
            <Button variant="outline" onClick={handleBack}>
              {isRTL ? 'السابق' : 'Back'}
            </Button>
          )}
          <Button
            className="flex-1"
            onClick={handleNext}
            disabled={!canProceed || submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isLastQuestion ? (
              isRTL ? 'إرسال' : 'Submit'
            ) : (
              isRTL ? 'التالي' : 'Next'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Mini survey trigger button (shows when survey is available)
 */
interface SurveyTriggerProps {
  survey: Survey;
  language?: 'en' | 'ar';
}

export function SurveyTrigger({ survey, language = 'en' }: SurveyTriggerProps) {
  const [showSurvey, setShowSurvey] = useState(false);
  const isRTL = language === 'ar';

  return (
    <>
      <button
        onClick={() => setShowSurvey(true)}
        className={cn(
          'fixed bottom-24 right-4 z-40 flex items-center gap-2 px-4 py-2 rounded-full',
          'bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all',
          'animate-bounce-subtle',
          isRTL && 'left-4 right-auto flex-row-reverse'
        )}
      >
        <MessageSquare className="h-4 w-4" />
        <span className="text-sm font-medium">
          {isRTL ? 'شارك رأيك' : 'Share feedback'}
        </span>
      </button>

      {showSurvey && (
        <SurveyModal
          survey={survey}
          onClose={() => setShowSurvey(false)}
          language={language}
        />
      )}
    </>
  );
}
