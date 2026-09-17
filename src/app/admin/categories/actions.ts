'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {db} from '@/lib/db';
import {requireAdmin} from '@/lib/auth/admin';
import {routing, type Locale} from '@/i18n/routing';
import {z} from 'zod';

async function guard() {
  const admin = await requireAdmin();
  if (!admin) redirect('/admin');
}

const LOCALES = [...routing.locales] as [Locale, ...Locale[]];

const categoryTranslationSchema = z.object({
  locale: z.enum(LOCALES),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  description: z.string().trim().max(300).optional(),
});

type ParsedTranslations =
  | {success: true; data: z.infer<typeof categoryTranslationSchema>[]}
  | {success: false; error: string};

function parseTranslations(formData: FormData): ParsedTranslations {
  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get('translations') ?? '[]'));
  } catch {
    return {success: false, error: 'Corrupted form data'};
  }

  const result = z.array(categoryTranslationSchema).safeParse(raw);
  if (!result.success) {
    return {success: false, error: result.error.issues[0]?.message ?? 'Invalid translations'};
  }

  const locales = result.data.map((t) => t.locale);
  if (new Set(locales).size !== locales.length) {
    return {success: false, error: 'Duplicate language in translations'};
  }
  if (!locales.includes('en')) {
    return {success: false, error: 'English name is required (fallback base)'};
  }

  return {success: true, data: result.data};
}

export async function createCategoryAction(formData: FormData): Promise<void> {
  await guard();

  const slug = String(formData.get('slug') ?? '').trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) redirect('/admin/categories?error=invalid');

  const parsed = parseTranslations(formData);
  if (!parsed.success) redirect('/admin/categories?error=invalid');

  const exists = await db.category.findUnique({where: {slug}});
  if (exists) redirect('/admin/categories?error=slug');

  await db.category.create({
    data: {
      slug,
      sort: await db.category.count(),
      translations: {
        create: parsed.data.map((t) => ({
          locale: t.locale,
          name: t.name,
          description: t.description ?? null,
        })),
      },
    },
  });

  revalidatePath('/admin/categories');
  revalidatePath('/', 'layout');
  redirect('/admin/categories');
}

export async function updateCategoryAction(formData: FormData): Promise<void> {
  await guard();

  const id = String(formData.get('id') ?? '');
  const sort = Number(formData.get('sort') ?? 0);
  if (!id || !Number.isFinite(sort)) redirect('/admin/categories?error=invalid');

  const parsed = parseTranslations(formData);
  if (!parsed.success) redirect('/admin/categories?error=invalid');

  await db.$transaction(async (tx) => {
    await tx.category.update({where: {id}, data: {sort}});
    // منبع حقیقت فرم است — پاک و بازسازی
    await tx.categoryTranslation.deleteMany({where: {categoryId: id}});
    await tx.categoryTranslation.createMany({
      data: parsed.data.map((t) => ({
        categoryId: id,
        locale: t.locale,
        name: t.name,
        description: t.description ?? null,
      })),
    });
  });

  revalidatePath('/admin/categories');
  revalidatePath('/', 'layout');
  redirect('/admin/categories');
}

export async function toggleCategoryActiveAction(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get('id') ?? '');
  const next = String(formData.get('next')) === 'true';
  if (!id) return;

  await db.category.update({where: {id}, data: {isActive: next}});

  revalidatePath('/admin/categories');
  revalidatePath('/', 'layout');
  redirect('/admin/categories');
}