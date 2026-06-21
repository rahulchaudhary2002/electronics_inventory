import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import ne from './locales/ne';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            ne: { translation: ne },
        },
        fallbackLng: 'ne',
        defaultNS: 'translation',
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['cookie', 'navigator'],
            caches: ['cookie'],
            lookupCookie: 'electro_lang',
            cookieOptions: { path: '/', sameSite: 'lax' },
        },
    });

export default i18n;
