'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { translations, Language, TranslationKeys } from './translations';

interface LanguageContextType {
  lang: Language;
  language: Language;  // alias for lang
  setLang: (lang: Language) => void;
  t: TranslationKeys;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get saved language preference
    const savedLang = localStorage.getItem('forma-lang') as Language | null;
    if (savedLang && (savedLang === 'en' || savedLang === 'ar')) {
      setLangState(savedLang);
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = savedLang;
      document.body.style.fontFamily = savedLang === 'ar' ? 'Cairo, sans-serif' : '';
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('forma-lang', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
    document.body.style.fontFamily = newLang === 'ar' ? 'Cairo, sans-serif' : '';
  };

  const value: LanguageContextType = {
    lang,
    language: lang,  // alias for lang
    setLang,
    t: translations[lang] as unknown as TranslationKeys,
    isRTL: lang === 'ar',
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ ...value, t: translations.en as unknown as TranslationKeys }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Shorthand hook for just translations
export function useTranslations() {
  const { t } = useLanguage();
  return t;
}
