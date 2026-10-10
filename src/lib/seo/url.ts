/** Pure URL helpers shared by metadata and sitemap generation. */
export function localizedPath(path: string, locale: string, defaultLocale: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (locale === defaultLocale) return normalized;
  return `/${locale}${normalized === '/' ? '' : normalized}`;
}

export function absoluteLocalizedUrl(baseUrl: string, path: string, locale: string, defaultLocale: string): string {
  return `${baseUrl.replace(/\/$/, '')}${localizedPath(path, locale, defaultLocale)}`;
}

export function buildLanguageUrls(baseUrl: string, path: string, locales: readonly string[], defaultLocale: string): Record<string, string> {
  const urls: Record<string, string> = {};
  for (const locale of locales) urls[locale] = absoluteLocalizedUrl(baseUrl, path, locale, defaultLocale);
  urls['x-default'] = absoluteLocalizedUrl(baseUrl, path, defaultLocale, defaultLocale);
  return urls;
}

/** Prevent HTML parser breakouts when serializing data into an application/ld+json script. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}
