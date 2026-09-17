'use client';

import {useActionState, useState} from 'react';
import {Plus, Star, Trash2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {
  TranslationsEditor,
  type TranslationMap,
} from '@/app/admin/components/translations-editor';
import {
  createProductAction,
  updateProductAction,
  type ProductFormState,
} from './actions';

type CategoryOption = {id: string; name: string};
type VariantRow = {name: string; priceDelta: string; isDefault: boolean};
type ModifierRow = {name: string; price: string};

export type ProductFormDefaults = {
  id?: string;
  slug: string;
  categoryId: string;
  basePrice: string;
  calories: string;
  prepTime: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isVegetarian: boolean;
  isSpicy: boolean;
  translations: TranslationMap;
  variants: VariantRow[];
  modifiers: ModifierRow[];
};

const initialState: ProductFormState = {};

const inputCls =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none';

export function ProductForm({
  categories,
  defaults,
  mode,
}: {
  categories: CategoryOption[];
  defaults: ProductFormDefaults;
  mode: 'create' | 'edit';
}) {
  const [state, formAction, pending] = useActionState(
    mode === 'create' ? createProductAction : updateProductAction,
    initialState,
  );

  const [translations, setTranslations] = useState<TranslationMap>(defaults.translations);
  const [variants, setVariants] = useState<VariantRow[]>(defaults.variants);
  const [modifiers, setModifiers] = useState<ModifierRow[]>(defaults.modifiers);

  function handleSubmit(formData: FormData) {
    // فقط زبان‌هایی که name و description هر دو پر شده‌اند ارسال می‌شوند
    const filledTranslations = Object.entries(translations)
      .filter(([, t]) => t?.name?.trim() && t?.description?.trim())
      .map(([locale, t]) => ({locale, name: t!.name.trim(), description: t!.description.trim()}));

    formData.set('translations', JSON.stringify(filledTranslations));
    formData.set(
      'variants',
      JSON.stringify(
        variants.map((v) => ({name: v.name, priceDelta: Number(v.priceDelta || 0), isDefault: v.isDefault})),
      ),
    );
    formData.set(
      'modifiers',
      JSON.stringify(modifiers.map((m) => ({name: m.name, price: Number(m.price || 0)}))),
    );
    formAction(formData);
  }

  return (
    <form action={handleSubmit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-bold">Basics</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-muted-foreground">Slug (URL)</label>
              <Input name="slug" required defaultValue={defaults.slug} dir="ltr" placeholder="flame-double-burger" className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Category</label>
              <select name="categoryId" required defaultValue={defaults.categoryId} className={`${inputCls} mt-1`}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Base Price ($)</label>
              <Input name="basePrice" required type="number" step="0.01" min="0" defaultValue={defaults.basePrice} dir="ltr" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground">Calories</label>
                <Input name="calories" type="number" min="0" defaultValue={defaults.calories} dir="ltr" className="mt-1" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Prep (min)</label>
                <Input name="prepTime" type="number" min="1" defaultValue={defaults.prepTime} dir="ltr" className="mt-1" />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            {(
              [
                ['isAvailable', 'Available', defaults.isAvailable],
                ['isFeatured', '⭐ Featured', defaults.isFeatured],
                ['isVegetarian', '🥬 Vegetarian', defaults.isVegetarian],
                ['isSpicy', '🌶️ Spicy', defaults.isSpicy],
              ] as const
            ).map(([name, label, checked]) => (
              <label key={name} className="flex items-center gap-2">
                <input type="checkbox" name={name} defaultChecked={checked} className="size-4 accent-[var(--primary)]" />
                {label}
              </label>
            ))}
          </div>
        </section>

        {/* ─── ترجمه‌ها: هر ۱۲ زبان ─── */}
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-bold">Translations (all languages)</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            English is required — other languages are optional and fall back to English.
          </p>
          <div className="mt-4">
            <TranslationsEditor
              value={translations}
              onChange={setTranslations}
              descriptionRequired
            />
          </div>
        </section>

        {/* سایزها */}
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Variants (sizes)</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => setVariants((v) => [...v, {name: '', priceDelta: '0', isDefault: v.length === 0}])}>
              <Plus className="size-4" /> Add
            </Button>
          </div>
          {variants.length === 0 && (
            <p className="mt-3 text-sm text-muted-foreground">No variants — product has a single size.</p>
          )}
          <div className="mt-3 space-y-2">
            {variants.map((variant, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <input
                  value={variant.name}
                  onChange={(e) => setVariants((v) => v.map((x, j) => (j === i ? {...x, name: e.target.value} : x)))}
                  placeholder="Small / Medium..."
                  dir="ltr"
                  className={`${inputCls} min-w-32 flex-1`}
                />
                <input
                  value={variant.priceDelta}
                  onChange={(e) => setVariants((v) => v.map((x, j) => (j === i ? {...x, priceDelta: e.target.value} : x)))}
                  type="number" step="0.01" placeholder="+0.00" dir="ltr"
                  className={`${inputCls} w-28`}
                />
                <button
                  type="button"
                  onClick={() => setVariants((v) => v.map((x, j) => ({...x, isDefault: j === i})))}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                    variant.isDefault ? 'bg-yellow-500/15 text-yellow-600' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Star className="inline size-3" /> {variant.isDefault ? 'Default' : 'Set default'}
                </button>
                <Button type="button" variant="ghost" size="icon" aria-label="Remove" onClick={() => setVariants((v) => v.filter((_, j) => j !== i))}>
                  <Trash2 className="size-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* افزودنی‌ها */}
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Modifiers (extras)</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => setModifiers((m) => [...m, {name: '', price: '0'}])}>
              <Plus className="size-4" /> Add
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {modifiers.map((modifier, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <input
                  value={modifier.name}
                  onChange={(e) => setModifiers((m) => m.map((x, j) => (j === i ? {...x, name: e.target.value} : x)))}
                  placeholder="Extra Cheese..."
                  dir="ltr"
                  className={`${inputCls} min-w-32 flex-1`}
                />
                <input
                  value={modifier.price}
                  onChange={(e) => setModifiers((m) => m.map((x, j) => (j === i ? {...x, price: e.target.value} : x)))}
                  type="number" step="0.01" min="0" placeholder="1.50" dir="ltr"
                  className={`${inputCls} w-28`}
                />
                <Button type="button" variant="ghost" size="icon" aria-label="Remove" onClick={() => setModifiers((m) => m.filter((_, j) => j !== i))}>
                  <Trash2 className="size-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="h-fit space-y-4 rounded-xl border border-border bg-card p-5 lg:sticky lg:top-6">
        <h2 className="font-bold">{mode === 'create' ? 'Create Product' : 'Save Changes'}</h2>

        {state?.error && (
          <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">{state.error}</p>
        )}

        {mode === 'edit' && <input type="hidden" name="id" value={defaults.id} />}

        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Save Changes'}
        </Button>

        <p className="text-xs text-muted-foreground">
          On save, the public menu (all languages) is refreshed automatically.
        </p>
      </aside>
    </form>
  );
}