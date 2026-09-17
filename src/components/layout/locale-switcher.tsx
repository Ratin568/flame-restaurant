'use client';

import {useLocale, useTranslations} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/navigation';
import {routing, localeNames, type Locale} from '@/i18n/routing';

export function LocaleSwitcher() {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      aria-label={t('language')}
      value={locale}
      onChange={(e) => router.replace(pathname, {locale: e.target.value as Locale})}
      className="h-9 rounded-md border border-border bg-transparent px-2 text-sm outline-none"
    >
      {routing.locales.map((l) => (
        <option key={l} value={l}>
          {localeNames[l]}
        </option>
      ))}
    </select>
  );
}