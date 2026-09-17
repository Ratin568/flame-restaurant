import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ArrowLeft} from 'lucide-react';
import {db} from '@/lib/db';
import {ProductForm} from '../product-form';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{id: string}>;
}) {
  const {id} = await params;

  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: {id},
      include: {translations: true, variants: true, modifiers: true},
    }),
    db.category.findMany({
      orderBy: {sort: 'asc'},
      include: {translations: true},
    }),
  ]);

  if (!product) notFound();

  const en = product.translations.find((t) => t.locale === 'en');
  const fa = product.translations.find((t) => t.locale === 'fa');

  return (
    <div>
      <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Products
      </Link>
      <h1 className="mt-2 text-2xl font-black">Edit: {en?.name ?? product.slug}</h1>

      <ProductForm
        mode="edit"
        categories={categories.map((c) => ({
          id: c.id,
          name: c.translations.find((t) => t.locale === 'en')?.name ?? c.slug,
        }))}
        defaults={{
          id: product.id,
          slug: product.slug,
          categoryId: product.categoryId,
          basePrice: String(product.basePrice),
          calories: product.calories != null ? String(product.calories) : '',
          prepTime: product.prepTime != null ? String(product.prepTime) : '15',
          isAvailable: product.isAvailable,
          isFeatured: product.isFeatured,
          isVegetarian: product.isVegetarian,
          isSpicy: product.isSpicy,
          translations: {
            en: en ? {name: en.name, description: en.description} : undefined,
            fa: fa ? {name: fa.name, description: fa.description} : undefined,
          },
          variants: product.variants.map((v) => ({
            name: v.name,
            priceDelta: String(v.priceDelta),
            isDefault: v.isDefault,
          })),
          modifiers: product.modifiers.map((m) => ({
            name: m.name,
            price: String(m.price),
          })),
        }}
      />
    </div>
  );
}