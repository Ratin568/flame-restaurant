import type {Metadata} from 'next';
import {routing, type Locale} from '@/i18n/routing';
import {siteConfig} from '@/config/site';
import {absoluteLocalizedUrl, buildLanguageUrls} from './url';

export function buildAlternates(path: string, locale: Locale = routing.defaultLocale): Metadata['alternates'] {
  const base = siteConfig.domain.replace(/\/$/, '');
  return {
    canonical: absoluteLocalizedUrl(base, path, locale, routing.defaultLocale),
    languages: buildLanguageUrls(base, path, routing.locales, routing.defaultLocale),
  };
}

export function buildOgMetadata(title: string, description: string, path: string, locale: Locale = routing.defaultLocale): Metadata {
  const base = siteConfig.domain.replace(/\/$/, '');
  const canonical = absoluteLocalizedUrl(base, path, locale, routing.defaultLocale);
  return {
    title,
    description,
    alternates: buildAlternates(path, locale),
    openGraph: {title: `${title} | ${siteConfig.name}`, description, url: canonical, siteName: siteConfig.name, type: 'website', images: [{url: `${base}/branding/icon-512.png`, width: 512, height: 512, alt: `${siteConfig.name} brand mark`}]},
    twitter: {card: 'summary_large_image', title: `${title} | ${siteConfig.name}`, description, images: [`${base}/branding/icon-512.png`]},
  };
}
