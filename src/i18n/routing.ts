import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: [
    'en', 'fa', 'ar', 'zh', 'es',
    'fr', 'de', 'ru', 'tr', 'pt', 'it', 'ja',
  ],
  defaultLocale: 'en',
  localePrefix: 'as-needed', // en بدون پیشوند، بقیه: /fa/menu
});

export type Locale = (typeof routing.locales)[number];

export const rtlLocales: Locale[] = ['fa', 'ar'];

export const localeNames: Record<Locale, string> = {
  en: 'English', fa: 'فارسی', ar: 'العربية', zh: '中文',
  es: 'Español', fr: 'Français', de: 'Deutsch', ru: 'Русский',
  tr: 'Türkçe', pt: 'Português', it: 'Italiano', ja: '日本語',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧', fa: '🇮🇷', ar: '🇸🇦', zh: '🇨🇳', es: '🇪🇸',
  fr: '🇫🇷', de: '🇩🇪', ru: '🇷🇺', tr: '🇹🇷', pt: '🇵🇹',
  it: '🇮🇹', ja: '🇯🇵',
};