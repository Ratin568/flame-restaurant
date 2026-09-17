'use client';

import {useState} from 'react';
import {Pencil, Plus, X} from 'lucide-react';
import {TranslationsEditor, type TranslationMap} from '@/app/admin/components/translations-editor';
import {createCategoryAction, updateCategoryAction} from './actions';

const inputCls =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary';

/** فرم ساخت دسته جدید */
export function CategoryCreateForm() {
  const [open, setOpen] = useState(false);
  const [translations, setTranslations] = useState<TranslationMap>({});

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Plus className="size-4" /> New Category
      </button>
    );
  }

  return (
    <form action={createCategoryAction} className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">New Category</h2>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-4 max-w-xs">
        <label className="text-xs text-muted-foreground">Slug (a-z, 0-9, dashes)</label>
        <input name="slug" required dir="ltr" placeholder="combos" className={`${inputCls} mt-1`} />
      </div>

      <div className="mt-4">
        <TranslationsEditor value={translations} onChange={setTranslations} descriptionRequired={false} descriptionOptional />
      </div>

      <button className="mt-4 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
        Create Category
      </button>
    </form>
  );
}

/** ویرایش درجای یک دسته */
export function CategoryEditForm({
  id,
  sort,
  translations,
}: {
  id: string;
  sort: number;
  translations: TranslationMap;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<TranslationMap>(translations);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Edit category"
      >
        <Pencil className="size-4" />
      </button>
    );
  }

  return (
    <form action={updateCategoryAction} className="w-full rounded-lg border border-border bg-background p-4">
      <input type="hidden" name="id" value={id} />
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">Edit Category</h3>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-md p-1 text-muted-foreground hover:bg-muted">
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-3 max-w-[120px]">
        <label className="text-xs text-muted-foreground">Sort order</label>
        <input name="sort" type="number" defaultValue={sort} className={`${inputCls} mt-1`} />
      </div>

      <div className="mt-3">
        <TranslationsEditor value={value} onChange={setValue} descriptionRequired={false} descriptionOptional />
      </div>

      <button className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
        Save
      </button>
    </form>
  );
}