import {db} from '@/lib/db';
import {CategoryCreateForm, CategoryEditForm} from './category-forms';
import {toggleCategoryActiveAction} from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{error?: string}>;
}) {
  const {error} = await searchParams;

  const categories = await db.category.findMany({
    orderBy: {sort: 'asc'},
    include: {translations: true, _count: {select: {products: true}}},
  });

  return (
    <div>
      <h1 className="text-2xl font-black">Categories</h1>

      {error && (
        <p className="mt-4 rounded-lg bg-yellow-500/10 px-4 py-3 text-sm text-yellow-600">
          {error === 'slug'
            ? 'This slug is already taken.'
            : 'Invalid input — English name is required, check the fields.'}
        </p>
      )}

      <div className="mt-6">
        <CategoryCreateForm />
      </div>

      <div className="mt-6 space-y-3">
        {categories.map((cat) => {
          const en = cat.translations.find((t) => t.locale === 'en')?.name ?? cat.slug;
          const filledLocales = cat.translations.length;

          return (
            <div key={cat.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold">{en}</span>

                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                  🌍 {filledLocales}/12 languages
                </span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                  {cat._count.products} products
                </span>

                <div className="ms-auto flex items-center gap-2">
                  <CategoryEditForm
                    id={cat.id}
                    sort={cat.sort}
                    translations={Object.fromEntries(
                      cat.translations.map((t) => [
                        t.locale,
                        {name: t.name, description: t.description ?? ''},
                      ]),
                    )}
                  />
                  <form action={toggleCategoryActiveAction}>
                    <input type="hidden" name="id" value={cat.id} />
                    <input type="hidden" name="next" value={String(!cat.isActive)} />
                    <button
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-opacity hover:opacity-80 ${
                        cat.isActive ? 'bg-green-500/15 text-green-600' : 'bg-red-500/15 text-red-600'
                      }`}
                    >
                      {cat.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}