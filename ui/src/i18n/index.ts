import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslations from './locales/en.json';
import arTranslations from './locales/ar.json';

// Language detector options
const languageDetector = new LanguageDetector();
languageDetector.addDetector({
  name: 'localStorage',
  lookup() {
    return localStorage.getItem('i18nextLng') || undefined;
  },
  cacheUserLanguage(lng: string) {
    localStorage.setItem('i18nextLng', lng);
  },
});

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      ar: {
        translation: arTranslations,
      },
    },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    react: {
      useSuspense: false,
    },
  });

// Set RTL for Arabic
i18n.on('languageChanged', (lng) => {
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
  
  // Add RTL class to body for TailwindCSS RTL support
  if (lng === 'ar') {
    document.body.classList.add('rtl');
  } else {
    document.body.classList.remove('rtl');
  }
});

export default i18n;
