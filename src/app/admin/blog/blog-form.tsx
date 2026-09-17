'use client';

import {useActionState, useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {routing} from '@/i18n/routing';
import {createPostAction, updatePostAction, type BlogFormState} from './actions';

const initialState: BlogFormState = {};

const inputCls =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary';

export type BlogFormDefaults = {
  id?: string;
  slug: string;
  author: string;
  isPublished: boolean;
  /** کلیدهای زبان → فیلدهای بلاگ */
  translations: Record<string, {title: string; excerpt: string; content: string} | undefined>;
};

export function BlogForm({
  defaults,
  mode,
}: {
  defaults: BlogFormDefaults;
  mode: 'create' | 'edit';
}) {
  const [state, formAction, pending] = useActionState(
    mode === 'create' ? createPostAction : updatePostAction,
    initialState,
  );

  const [translations, setTranslations] = useState(defaults.translations);

  function handleSubmit(formData: FormData) {
    const filled = Object.entries(translations)
      .filter(([, t]) => t?.title?.trim() && t?.excerpt?.trim() && t?.content?.trim())
      .map(([locale, t]) => ({
        locale,
        title: t!.title.trim(),
        excerpt: t!.excerpt.trim(),
        content: t!.content.trim(),
      }));
    formData.set('translations', JSON.stringify(filled));
    formAction(formData);
  }

  return (
    <form action={handleSubmit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-bold">Basics</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-muted-foreground">Slug (URL)</label>
              <Input name="slug" required defaultValue={defaults.slug} dir="ltr" placeholder="how-we-grill" className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Author</label>
              <Input name="author" defaultValue={defaults.author} className="mt-1" />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-bold">Content (all languages)</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            English is required. Each language: title + excerpt + full article content.
          </p>
          <div className="mt-4">
            <BlogTranslationsEditor value={translations} onChange={setTranslations} />
          </div>
        </section>
      </div>

      <aside className="h-fit space-y-4 rounded-xl border border-border bg-card p-5 lg:sticky lg:top-6">
        <h2 className="font-bold">{mode === 'create' ? 'Create Post' : 'Save Changes'}</h2>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublished" defaultChecked={defaults.isPublished} className="size-4 accent-[var(--primary)]" />
          Published (visible on site)
        </label>

        {state?.error && (
          <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">{state.error}</p>
        )}

        {mode === 'edit' && <input type="hidden" name="id" value={defaults.id} />}

        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? 'Saving...' : mode === 'create' ? 'Create Post' : 'Save Changes'}
        </Button>
      </aside>
    </form>
  );
}

/**
 * ادیتور ترجمه‌های بلاگ — دقیقاً ۱۲ تب زبان استاندارد (routing.locales)
 * فیلدها: title / excerpt / content (به‌جای name/description محصولات)
 */
function BlogTranslationsEditor({
  value,
  onChange,
}: {
  value: Record<string, {title: string; excerpt: string; content: string} | undefined>;
  onChange: (next: Record<string, {title: string; excerpt: string; content: string} | undefined>) => void;
}) {
  const [active, setActive] = useState<string>('en');
  const locales = routing.locales; // همیشه دقیقاً ۱۲ زبان — بدون تکرار ممکن

  const current = value[active] ?? {title: '', excerpt: '', content: ''};
  const isRtl = active === 'fa' || active === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';

  function update(patch: Partial<{title: string; excerpt: string; content: string}>) {
    onChange({
      ...value,
      [active]: {...(value[active] ?? {title: '', excerpt: '', content: ''}), ...patch},
    });
  }

  function copyFromEnglish() {
    const en = value.en;
    if (en) onChange({...value, [active]: {...en}});
  }

  return (
    <div>
      {/* ─── تب زبان‌ها ─── */}
      <div className="flex flex-wrap gap-1.5">
        {locales.map((locale) => {
          const filled = Boolean(value[locale]?.title?.trim());
          return (
            <button
              key={locale}
              type="button"
              onClick={() => setActive(locale)}
              className={`rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                active === locale
                  ? 'border-primary bg-primary/10 font-semibold text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              {locale}
              {filled && ' ✓'}
            </button>
          );
        })}
      </div>

      {/* ─── فیلدهای زبان فعال ─── */}
      <div className="mt-3 space-y-3 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">
            {active.toUpperCase()}
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
              className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
            >
              Copy from English
            </button>
          )}
        </div>

        <input
          value={current.title}
          onChange={(e) => update({title: e.target.value})}
          dir={dir}
          placeholder="Article title..."
          className={inputCls}
        />
        <textarea
          value={current.excerpt}
          onChange={(e) => update({excerpt: e.target.value})}
          dir={dir}
          rows={2}
          placeholder="Short excerpt (shown in list)..."
          className={inputCls}
        />
        <textarea
          value={current.content}
          onChange={(e) => update({content: e.target.value})}
          dir={dir}
          rows={14}
          placeholder="Full article content..."
          className={`${inputCls} font-mono text-xs leading-relaxed`}
        />
      </div>
    </div>
  );
}