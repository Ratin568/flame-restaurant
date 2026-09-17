import {db} from '@/lib/db';

// ─── تایپ‌های View: چیزی که UI لازم داره (نه کل رکورد دیتابیس) ───
export type MenuProduct = {
  id: string;
  slug: string;
  price: number;
  calories: number | null;
  isSpicy: boolean;
  isVegetarian: boolean;
  isFeatured: boolean;
  name: string;
  description: string;
};

export type MenuCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  products: MenuProduct[];
};

export async function getMenu(locale: string): Promise<MenuCategory[]> {
  const categories = await db.category.findMany({
    where: {isActive: true},
    orderBy: {sort: 'asc'},
    include: {
      translations: true,
      products: {
        where: {isAvailable: true},
        orderBy: {sortOrder: 'asc'},
        include: {translations: true},
      },
    },
  });

  // ترجمه زبان فعلی؛ اگر نبود → انگلیسی (fallback)
  const pick = <T extends {locale: string}>(list: T[]) =>
    list.find((item) => item.locale === locale) ?? list.find((item) => item.locale === 'en');

  return categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: pick(category.translations)?.name ?? category.slug,
    description: pick(category.translations)?.description ?? null,
    products: category.products.map((product) => ({
      id: product.id,
      slug: product.slug,
      price: Number(product.basePrice), // Decimal → number برای UI
      calories: product.calories,
      isSpicy: product.isSpicy,
      isVegetarian: product.isVegetarian,
      isFeatured: product.isFeatured,
      name: pick(product.translations)?.name ?? product.slug,
      description: pick(product.translations)?.description ?? '',
    })),
  }));
}

export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  calories: number | null;
  prepTime: number | null;
  isSpicy: boolean;
  isVegetarian: boolean;
  categorySlug: string;
  categoryName: string;
  variants: {id: string; name: string; priceDelta: number; isDefault: boolean}[];
  modifiers: {id: string; name: string; price: number}[];
};

export async function getProductBySlug(
  categorySlug: string,
  slug: string,
  locale: string,
): Promise<ProductDetail | null> {
  const product = await db.product.findFirst({
    where: {
      slug,
      isAvailable: true,
      category: {slug: categorySlug, isActive: true},
    },
    include: {
      category: {include: {translations: true}},
      variants: {orderBy: {priceDelta: 'asc'}},
      modifiers: true,
      translations: true,
    },
  });
  if (!product) return null;

  const pick = <T extends {locale: string}>(list: T[]) =>
    list.find((item) => item.locale === locale) ?? list.find((item) => item.locale === 'en');

  return {
    id: product.id,
    slug: product.slug,
    name: pick(product.translations)?.name ?? product.slug,
    description: pick(product.translations)?.description ?? '',
    price: Number(product.basePrice),
    calories: product.calories,
    prepTime: product.prepTime,
    isSpicy: product.isSpicy,
    isVegetarian: product.isVegetarian,
    categorySlug: product.category.slug,
    categoryName: pick(product.category.translations)?.name ?? product.category.slug,
    variants: product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      priceDelta: Number(v.priceDelta),
      isDefault: v.isDefault,
    })),
    modifiers: product.modifiers.map((m) => ({
      id: m.id,
      name: m.name,
      price: Number(m.price),
    })),
  };
}