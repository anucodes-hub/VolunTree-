import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import hiTranslations from './locales/hi.json';
import taTranslations from './locales/ta.json';
import mrTranslations from './locales/mr.json';
import teTranslations from './locales/te.json';
import knTranslations from './locales/kn.json';
import paTranslations from './locales/pa.json';

const savedLanguage = localStorage.getItem('preferred-language') || navigator.language.split('-')[0];

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      hi: { translation: hiTranslations },
      ta: { translation: taTranslations },
      mr: { translation: mrTranslations },
      te: { translation: teTranslations },
      kn: { translation: knTranslations },
      pa: { translation: paTranslations },
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('preferred-language', lng);
});

export default i18n;
