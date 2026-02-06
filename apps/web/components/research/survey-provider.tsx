'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAvailableSurvey } from '@/hooks/use-research';
import { SurveyModal } from './survey-modal';
import type { Survey } from '@/lib/api';

interface SurveyContextValue {
  triggerSurvey: (trigger: string) => void;
  showSurvey: (survey: Survey) => void;
  dismissSurvey: () => void;
  currentSurvey: Survey | null;
}

const SurveyContext = createContext<SurveyContextValue | null>(null);

export function useSurveyTrigger() {
  const context = useContext(SurveyContext);
  if (!context) {
    throw new Error('useSurveyTrigger must be used within SurveyProvider');
  }
  return context;
}

interface SurveyProviderProps {
  children: ReactNode;
  language?: 'en' | 'ar';
}

export function SurveyProvider({ children, language = 'en' }: SurveyProviderProps) {
  const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null);
  const [currentTrigger, setCurrentTrigger] = useState<string | undefined>(undefined);

  // Fetch available survey when trigger is set
  const { data: availableSurvey } = useAvailableSurvey(currentTrigger);

  // Show survey when available
  const triggerSurvey = useCallback((trigger: string) => {
    setCurrentTrigger(trigger);
    // The useAvailableSurvey hook will fetch the survey
    // Once data is available, we show it
  }, []);

  const showSurvey = useCallback((survey: Survey) => {
    setCurrentSurvey(survey);
  }, []);

  const dismissSurvey = useCallback(() => {
    setCurrentSurvey(null);
    setCurrentTrigger(undefined);
  }, []);

  // When survey becomes available, show it
  if (availableSurvey && !currentSurvey && currentTrigger) {
    setCurrentSurvey(availableSurvey);
    setCurrentTrigger(undefined);
  }

  return (
    <SurveyContext.Provider value={{ triggerSurvey, showSurvey, dismissSurvey, currentSurvey }}>
      {children}
      {currentSurvey && (
        <SurveyModal
          survey={currentSurvey}
          onClose={dismissSurvey}
          onComplete={dismissSurvey}
          language={language}
        />
      )}
    </SurveyContext.Provider>
  );
}
