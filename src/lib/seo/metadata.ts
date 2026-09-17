import type {Metadata} from 'next';
import {routing} from '@/i18n/routing';
import {siteConfig} from '@/config/site';

/**
 * alternateLanguages: hreflang برای همه ۱۲ زبان + x-default
 * این همان چیزی است که گوگل را از ترجمه‌های درست هر زبان باخبر می‌کند
 */
export function buildAlternates(path: string): Metadata['alternates'] {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = locale === routing.defaultLocale ? path : `/${locale}${path}`;
  }
  languages['x-default'] = path; // برای زبان‌های ناشناخته

  return {canonical: path, languages};
}

/** Open Graph + Twitter — پیش‌نمایش زیبا در اشتراک‌گذاری */
export function buildOgMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: buildAlternates(path),
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url: path,
      siteName: siteConfig.name,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${siteConfig.name}`,
      description,
    },
  };
}