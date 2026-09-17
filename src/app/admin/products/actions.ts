'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {db} from '@/lib/db';
import {requireAdmin} from '@/lib/auth/admin';
import {auditLog} from '@/lib/audit';
import {routing, type Locale} from '@/i18n/routing';
import {z} from 'zod';

async function guard() {
  const admin = await requireAdmin();
  if (!admin) redirect('/admin');
}

export type ProductFormState = {error?: string};

// ─── زبان‌ها به‌صورت داینامیک از routing (تک منبع حقیقت) ───
const LOCALES = [...routing.locales] as [Locale, ...Locale[]];

const translationSchema = z.object({
  locale: z.enum(LOCALES),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  description: z.string().trim().min(2, 'Description must be at least 2 characters').max(2000),
});

const productSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug (a-z, 0-9, dashes)'),
  categoryId: z.string().min(1, 'Category is required'),
  basePrice: z.coerce.number({message: 'Invalid price'}).min(0, 'Price cannot be negative').max(10000),
  calories: z.number().int().min(0).max(5000).nullable(),
  prepTime: z.number().int().min(1).max(240).nullable(),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
  isVegetarian: z.boolean(),
  isSpicy: z.boolean(),
  translations: z.array(translationSchema).min(1, 'At least the English translation is required'),
  variants: z
    .array(
      z.object({
        name: z.string().trim().min(1, 'Variant name is required').max(80),
        priceDelta: z.number(),
        isDefault: z.boolean(),
      }),
    )
    .max(10),
  modifiers: z
    .array(z.object({name: z.string().trim().min(1, 'Modifier name is required').max(80), price: z.number().min(0)}))
    .max(20),
});

type ProductInput = z.infer<typeof productSchema>;

// ─── نتیجه به‌صورت Discriminated Union — دیگر هیچ ابهامی برای TS نیست ───
type ParsedProduct = {success: true; data: ProductInput} | {success: false; error: string};

function optionalInt(value: FormDataEntryValue | null): number | null {
  const s = String(value ?? '').trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function parseProductForm(formData: FormData): ParsedProduct {
  const flags = {
    isAvailable: Boolean(formData.get('isAvailable')),
    isFeatured: Boolean(formData.get('isFeatured')),
    isVegetarian: Boolean(formData.get('isVegetarian')),
    isSpicy: Boolean(formData.get('isSpicy')),
  };

  let translations: unknown;
  let variants: unknown;
  let modifiers: unknown;
  try {
    translations = JSON.parse(String(formData.get('translations') ?? '[]'));
    variants = JSON.parse(String(formData.get('variants') ?? '[]'));
    modifiers = JSON.parse(String(formData.get('modifiers') ?? '[]'));
  } catch {
    return {success: false, error: 'Corrupted form data'};
  }

  const result = productSchema.safeParse({
    slug: formData.get('slug'),
    categoryId: formData.get('categoryId'),
    basePrice: formData.get('basePrice'),
    calories: optionalInt(formData.get('calories')),
    prepTime: optionalInt(formData.get('prepTime')),
    ...flags,
    translations,
    variants,
    modifiers,
  });

  if (!result.success) {
    return {success: false, error: result.error.issues[0]?.message ?? 'Invalid input'};
  }

  // ─── قوانین ترجمه‌ها: یکتا بودن + انگلیسی الزامی ───
  const locales = result.data.translations.map((t) => t.locale);
  if (new Set(locales).size !== locales.length) {
    return {success: false, error: 'Duplicate language in translations'};
  }
  if (!locales.includes('en')) {
    return {success: false, error: 'English translation is required (it is the fallback base)'};
  }

  return {success: true, data: result.data};
}

/** دقیقاً یک variant پیش‌فرض؛ اگر هیچ‌کدام نبود، اولین */
function normalizeVariants(variants: ProductInput['variants']) {
  if (variants.length === 0) return [];
  const firstDefault = variants.findIndex((v) => v.isDefault);
  const defaultIndex = firstDefault === -1 ? 0 : firstDefault;
  return variants.map((v, i) => ({...v, isDefault: i === defaultIndex}));
}

export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const parsed = parseProductForm(formData);
  if (!parsed.success) return {error: parsed.error};
  const data = parsed.data;

  const exists = await db.product.findUnique({where: {slug: data.slug}});
  if (exists) return {error: `Slug "${data.slug}" is already taken`};

  const category = await db.category.findUnique({where: {id: data.categoryId}});
  if (!category) return {error: 'Invalid category'};

  await db.product.create({
    data: {
      slug: data.slug,
      categoryId: data.categoryId,
      basePrice: data.basePrice,
      calories: data.calories,
      prepTime: data.prepTime ?? 15,
      isAvailable: data.isAvailable,
      isFeatured: data.isFeatured,
      isVegetarian: data.isVegetarian,
      isSpicy: data.isSpicy,
      sortOrder: await db.product.count({where: {categoryId: data.categoryId}}),
      translations: {create: data.translations},
      variants: {create: normalizeVariants(data.variants)},
      modifiers: {create: data.modifiers},
    },
  });

  void auditLog('product.create', {slug: data.slug, categoryId: data.categoryId});

  revalidatePath('/admin/products');
  revalidatePath('/', 'layout');
  redirect('/admin/products');
}

export async function updateProductAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const id = String(formData.get('id') ?? '');
  if (!id) return {error: 'Missing product id'};

  const parsed = parseProductForm(formData);
  if (!parsed.success) return {error: parsed.error};
  const data = parsed.data;

  const product = await db.product.findUnique({where: {id}});
  if (!product) return {error: 'Product not found'};

  const slugClash = await db.product.findUnique({where: {slug: data.slug}});
  if (slugClash && slugClash.id !== id) return {error: `Slug "${data.slug}" is already taken`};

  const category = await db.category.findUnique({where: {id: data.categoryId}});
  if (!category) return {error: 'Invalid category'};

  const variants = normalizeVariants(data.variants);

  await db.$transaction(async (tx) => {
    await tx.product.update({
      where: {id},
      data: {
        slug: data.slug,
        categoryId: data.categoryId,
        basePrice: data.basePrice,
        calories: data.calories,
        prepTime: data.prepTime ?? 15,
        isAvailable: data.isAvailable,
        isFeatured: data.isFeatured,
        isVegetarian: data.isVegetarian,
        isSpicy: data.isSpicy,
      },
    });

    // متن‌ها/سایزها/افزودنی‌ها: پاک و بازسازی — منبع حقیقت همیشه فرم است
    await tx.productTranslation.deleteMany({where: {productId: id}});
    await tx.productTranslation.createMany({
      data: data.translations.map((t) => ({...t, productId: id})),
    });
    await tx.productVariant.deleteMany({where: {productId: id}});
    if (variants.length > 0) {
      await tx.productVariant.createMany({data: variants.map((v) => ({...v, productId: id}))});
    }
    await tx.modifier.deleteMany({where: {productId: id}});
    if (data.modifiers.length > 0) {
      await tx.modifier.createMany({data: data.modifiers.map((m) => ({...m, productId: id}))});
    }
  });

  void auditLog('product.update', {id, slug: data.slug});

  revalidatePath('/admin/products');
  revalidatePath('/', 'layout');
  redirect('/admin/products');
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  // محصولی که در سفارش‌ها هست حذف نمی‌شود (تاریخچه!) — مخفی می‌شود
  const orderCount = await db.orderItem.count({where: {productId: id}});
  if (orderCount > 0) {
    await db.product.update({where: {id}, data: {isAvailable: false}});
    void auditLog('product.hide-instead-of-delete', {id, reason: 'has-orders'});
    redirect('/admin/products?error=has-orders');
  }

  await db.product.delete({where: {id}});

  void auditLog('product.delete', {id});

  revalidatePath('/admin/products');
  revalidatePath('/', 'layout');
  redirect('/admin/products');
}

export async function toggleProductAvailabilityAction(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get('id') ?? '');
  const next = String(formData.get('next')) === 'true';
  if (!id) return;

  await db.product.update({where: {id}, data: {isAvailable: next}});

  void auditLog('product.toggle.availability', {id, next});

  revalidatePath('/admin/products');
  revalidatePath('/', 'layout');
  redirect('/admin/products');
}

export async function toggleProductFeaturedAction(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get('id') ?? '');
  const next = String(formData.get('next')) === 'true';
  if (!id) return;

  await db.product.update({where: {id}, data: {isFeatured: next}});

  void auditLog('product.toggle.featured', {id, next});

  revalidatePath('/admin/products');
  revalidatePath('/', 'layout');
  redirect('/admin/products');
}