import {hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {routing, type Locale} from './routing';

/**
 * خواندن و اعتبارسنجی params در صفحات [locale]
 * - لوکال نامعتبر → 404
 * - setRequestLocale برای رندر استاتیک next-intl
 * - تایپ locale از string به union دقیق باریک می‌شود (Type-Safe)
 */
export async function resolveLocaleParams<T extends {locale: string}>(
  params: Promise<T>,
): Promise<Omit<T, 'locale'> & {locale: Locale}> {
  const resolved = await params;
  const locale = resolved.locale;

  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return {...resolved, locale} as Omit<T, 'locale'> & {locale: Locale};
}