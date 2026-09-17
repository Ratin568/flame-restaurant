import Link from 'next/link';
import {ArrowLeft} from 'lucide-react';
import {db} from '@/lib/db';
import {ProductForm} from '../product-form';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const categories = await db.category.findMany({
    where: {isActive: true},
    orderBy: {sort: 'asc'},
    include: {translations: true},
  });

  return (
    <div>
      <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Products
      </Link>
      <h1 className="mt-2 text-2xl font-black">New Product</h1>

      <ProductForm
        mode="create"
        categories={categories.map((c) => ({
          id: c.id,
          name: c.translations.find((t) => t.locale === 'en')?.name ?? c.slug,
        }))}
        defaults={{
          slug: '',
          categoryId: categories[0]?.id ?? '',
          basePrice: '',
          calories: '',
          prepTime: '15',
          isAvailable: true,
          isFeatured: false,
          isVegetarian: false,
          isSpicy: false,
          translations: {},
          variants: [],
          modifiers: [],
        }}
      />
    </div>
  );
}