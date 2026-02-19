export { translations, type Language, type TranslationKeys } from './translations';
export { LanguageProvider, useLanguage, useTranslations } from './context';

// Helper hook to pick the right bilingual field based on current language
import { useLanguage } from './context';

export function useBilingualField() {
  const { lang } = useLanguage();
  return function pick<T>(en: T, ar: T): T {
    return lang === 'ar' ? (ar || en) : en;
  };
}
