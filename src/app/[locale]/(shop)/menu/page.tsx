import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {getMenu} from '@/features/menu/queries';
import {ProductCard} from '@/components/menu/product-card';
import {resolveLocaleParams} from '@/i18n/params';
import {buildOgMetadata} from '@/lib/seo/metadata';

export const revalidate = 60;

type Props = {params: Promise<{locale: string}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await resolveLocaleParams(params);
  const t = await getTranslations({locale, namespace: 'menu'});
  return buildOgMetadata(t('title'), t('subtitle'), '/menu');
}

export default async function MenuPage({params}: Props) {
  const {locale} = await resolveLocaleParams(params);

  const t = await getTranslations('menu');
  const categories = await getMenu(locale);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <header className="text-center">
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          {t('title')} <span className="text-primary">🔥</span>
        </h1>
        <p className="mt-3 text-muted-foreground">{t('subtitle')}</p>
      </header>

      {categories.map((category) => (
        <section key={category.id} id={category.slug} className="mt-14 scroll-mt-24">
          <h2 className="text-2xl font-bold">{category.name}</h2>
          {category.description && (
            <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
          )}

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {category.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categorySlug={category.slug}
                locale={locale}
              />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}