import type {MetadataRoute} from 'next';
import {routing} from '@/i18n/routing';
import {db} from '@/lib/db';
import {siteConfig} from '@/config/site';

export const dynamic = 'force-dynamic'; // دیتابیس می‌خواند

/** صفحات ثابت */
const STATIC_PATHS = [
  '/',
  '/menu',
  '/branches',
  '/reserve',
  '/about',
  '/contact',
  '/faq',
  '/blog',
  '/legal/terms',
  '/legal/privacy',
  '/legal/refund',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.domain;

  // محصولات از دیتابیس
  const products = await db.product.findMany({
    where: {isAvailable: true},
    select: {slug: true, category: {select: {slug: true}}, updatedAt: true},
    take: 500,
  });

  const entries: MetadataRoute.Sitemap = [];

  const makeAlternates = (path: string) => {
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      languages[locale] =
        locale === routing.defaultLocale ? `${baseUrl}${path}` : `${baseUrl}/${locale}${path}`;
    }
    return languages;
  };

  // صفحات ثابت × ۱۲ زبان (با hreflang)
  for (const path of STATIC_PATHS) {
    entries.push({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: path === '/' ? 1 : 0.7,
      alternates: {languages: makeAlternates(path)},
    });
  }

  // محصولات × ۱۲ زبان
  for (const product of products) {
    const path = `/menu/${product.category.slug}/${product.slug}`;
    entries.push({
      url: `${baseUrl}${path}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {languages: makeAlternates(path)},
    });
  }

  return entries;
}