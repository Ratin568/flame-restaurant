'use client';

import {useState} from 'react';
import {Check, Copy} from 'lucide-react';
import {routing, localeNames, localeFlags, rtlLocales, type Locale} from '@/i18n/routing';

export type TranslationEntry = {name: string; description: string};
export type TranslationMap = Record<string, TranslationEntry | undefined>;

export function TranslationsEditor({
  value,
  onChange,
  descriptionRequired,
  descriptionOptional,
}: {
  value: TranslationMap;
  onChange: (next: TranslationMap) => void;
  /** محصولات: true (توضیح الزامی) | دسته‌ها: false (توضیح اختیاری) */
  descriptionRequired: boolean;
  descriptionOptional?: boolean;
}) {
  const [active, setActive] = useState<Locale>('en');
  const locales = routing.locales;

  const current = value[active] ?? {name: '', description: ''};
  const isRtl = (rtlLocales as readonly string[]).includes(active);
  const dir = isRtl ? 'rtl' : 'ltr';

  function update(locale: string, patch: Partial<TranslationEntry>) {
    onChange({
      ...value,
      [locale]: {...(value[locale] ?? {name: '', description: ''}), ...patch},
    });
  }

  function copyFromEnglish() {
    const en = value.en;
    if (en) onChange({...value, [active]: {name: en.name, description: en.description}});
  }

  const inputCls =
    'w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary';

  return (
    <div>
      {/* ─── تب زبان‌ها ─── */}
      <div className="flex flex-wrap gap-1.5">
        {locales.map((locale) => {
          const filled = Boolean(value[locale]?.name?.trim());
          return (
            <button
              key={locale}
              type="button"
              onClick={() => setActive(locale)}
              className={`relative flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                active === locale
                  ? 'border-primary bg-primary/10 font-semibold text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              <span>{localeFlags[locale]}</span>
              <span className="hidden sm:inline">{localeNames[locale]}</span>
              <span className="sm:hidden">{locale}</span>
              {filled && (
                <span className="absolute -end-1 -top-1 grid size-4 place-items-center rounded-full bg-green-500 text-white">
                  <Check className="size-2.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── فیلدهای زبان فعال ─── */}
      <div className="mt-3 space-y-3 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">
            {localeFlags[active]} {localeNames[active]}
            {active === 'en' && (
              <span className="ms-2 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                REQUIRED — fallback base
              </span>
            )}
          </span>
          {active !== 'en' && (
            <button
              type="button"
              onClick={copyFromEnglish}
              className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Copy className="size-3" /> Copy from English
            </button>
          )}
        </div>

        <input
          value={current.name}
          onChange={(e) => update(active, {name: e.target.value})}
          dir={dir}
          placeholder={`Name in ${localeNames[active]}...`}
          className={inputCls}
        />
        <textarea
          value={current.description}
          onChange={(e) => update(active, {description: e.target.value})}
          dir={dir}
          rows={3}
          placeholder={
            descriptionOptional
              ? `Description in ${localeNames[active]} (optional)...`
              : `Description in ${localeNames[active]}...`
          }
          className={inputCls}
        />

        {!descriptionRequired && descriptionOptional && (
          <p className="text-xs text-muted-foreground">Description is optional for categories.</p>
        )}
      </div>
    </div>
  );
}