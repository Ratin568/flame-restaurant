import Link from 'next/link';
import {Pencil, Plus, Trash2} from 'lucide-react';
import {db} from '@/lib/db';
import {formatPriceUsd} from '@/lib/money';
import {deleteProductAction, toggleProductAvailabilityAction, toggleProductFeaturedAction} from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{error?: string}>;
}) {
  const {error} = await searchParams;

  const products = await db.product.findMany({
    orderBy: [{categoryId: 'asc'}, {sortOrder: 'asc'}],
    include: {translations: true},
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black">Products</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" /> New Product
        </Link>
      </div>

      {error === 'has-orders' && (
        <p className="mt-4 rounded-lg bg-yellow-500/10 px-4 py-3 text-sm text-yellow-600">
          This product has orders in history, so it cannot be deleted — it was hidden from the menu instead.
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3 text-start font-medium">Product</th>
              <th className="px-4 py-3 text-start font-medium">Price</th>
              <th className="px-4 py-3 text-start font-medium">Featured</th>
              <th className="px-4 py-3 text-start font-medium">Availability</th>
              <th className="px-4 py-3 text-start font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const name = p.translations.find((t) => t.locale === 'en')?.name ?? p.slug;
              return (
                <tr key={p.id} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-3">
                    <span className="font-medium">{name}</span>
                    <span className="block text-xs text-muted-foreground" dir="ltr">{p.slug}</span>
                  </td>
                  <td className="px-4 py-3">{formatPriceUsd(Number(p.basePrice))}</td>

                  <td className="px-4 py-3">
                    <form action={toggleProductFeaturedAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="next" value={String(!p.isFeatured)} />
                      <button className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-opacity hover:opacity-80 ${p.isFeatured ? 'bg-yellow-500/15 text-yellow-600' : 'bg-muted text-muted-foreground'}`}>
                        {p.isFeatured ? '⭐ Featured' : 'Not featured'}
                      </button>
                    </form>
                  </td>

                  <td className="px-4 py-3">
                    <form action={toggleProductAvailabilityAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="next" value={String(!p.isAvailable)} />
                      <button className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-opacity hover:opacity-80 ${p.isAvailable ? 'bg-green-500/15 text-green-600' : 'bg-red-500/15 text-red-600'}`}>
                        {p.isAvailable ? 'Available' : 'Hidden'}
                      </button>
                    </form>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label={`Edit ${name}`}
                      >
                        <Pencil className="size-4" />
                      </Link>
                      <form action={deleteProductAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-600"
                          aria-label={`Delete ${name}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}