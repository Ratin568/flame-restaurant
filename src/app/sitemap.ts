import type {MetadataRoute} from 'next';
import {routing} from '@/i18n/routing';
import {db} from '@/lib/db';
import {siteConfig} from '@/config/site';
import {absoluteLocalizedUrl, buildLanguageUrls} from '@/lib/seo/url';

export const dynamic = 'force-dynamic';

const STATIC_PATHS = ['/', '/menu', '/branches', '/reserve', '/about', '/contact', '/faq', '/blog', '/legal/terms', '/legal/privacy', '/legal/refund'];
const baseUrl = siteConfig.domain.replace(/\/$/, '');

function localizedUrl(path: string, locale: string): string {
  return absoluteLocalizedUrl(baseUrl, path, locale, routing.defaultLocale);
}

function languageAlternates(path: string): Record<string, string> {
  return buildLanguageUrls(baseUrl, path, routing.locales, routing.defaultLocale);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([
    db.product.findMany({
      where: {isAvailable: true, category: {isActive: true}},
      select: {slug: true, category: {select: {slug: true}}, updatedAt: true},
      take: 1000,
      orderBy: {updatedAt: 'desc'},
    }),
    db.blogPost.findMany({
      where: {isPublished: true},
      select: {slug: true, updatedAt: true},
      orderBy: {updatedAt: 'desc'},
      take: 500,
    }),
  ]);

  const entries: MetadataRoute.Sitemap = [];
  for (const path of STATIC_PATHS) {
    entries.push({
      url: localizedUrl(path, routing.defaultLocale),
      changeFrequency: path === '/' ? 'daily' : 'weekly',
      priority: path === '/' ? 1 : 0.7,
      alternates: {languages: languageAlternates(path)},
    });
  }
  for (const product of products) {
    const path = `/menu/${product.category.slug}/${product.slug}`;
    entries.push({url: localizedUrl(path, routing.defaultLocale), lastModified: product.updatedAt, changeFrequency: 'weekly', priority: 0.8, alternates: {languages: languageAlternates(path)}});
  }
  for (const post of posts) {
    const path = `/blog/${post.slug}`;
    entries.push({url: localizedUrl(path, routing.defaultLocale), lastModified: post.updatedAt, changeFrequency: 'monthly', priority: 0.6, alternates: {languages: languageAlternates(path)}});
  }
  return entries;
}
