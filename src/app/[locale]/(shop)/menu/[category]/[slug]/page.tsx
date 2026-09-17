import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {Link} from '@/i18n/navigation';
import {Badge} from '@/components/ui/badge';
import {AddToCartForm} from '@/components/menu/add-to-cart-form';
import {categoryEmoji} from '@/components/menu/emoji';
import {getProductBySlug} from '@/features/menu/queries';
import {getApprovedReviews} from '@/features/reviews/queries';
import {ReviewsSection} from '@/components/reviews/reviews-section';
import {resolveLocaleParams} from '@/i18n/params';
import {formatPrice} from '@/lib/money';
import {productSchema, breadcrumbSchema, JsonLdScript} from '@/lib/seo/schema';
import {buildOgMetadata} from '@/lib/seo/metadata';

export const revalidate = 60;

type Props = {params: Promise<{locale: string; category: string; slug: string}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale, category, slug} = await resolveLocaleParams(params);
  const product = await getProductBySlug(category, slug, locale);
  if (!product) return {};

  return buildOgMetadata(product.name, product.description, `/${category}/${slug}`);
}

export default async function ProductPage({params}: Props) {
  const {locale, category, slug} = await resolveLocaleParams(params);

  const product = await getProductBySlug(category, slug, locale);
  if (!product) notFound();

  const reviews = await getApprovedReviews(product.id);

  const avg =
    reviews.count > 0 && reviews.average != null
      ? {value: reviews.average, count: reviews.count}
      : undefined;

  const t = await getTranslations('product');
  const tm = await getTranslations('menu');

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <JsonLdScript data={productSchema(product, product.categorySlug, avg)} />
      <JsonLdScript
        data={breadcrumbSchema([
          {name: tm('title'), url: '/menu'},
          {name: product.categoryName, url: `/menu#${product.categorySlug}`},
          {name: product.name, url: `/menu/${category}/${slug}`},
        ])}
      />

      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
        <Link href="/menu" className="transition-colors hover:text-foreground">{tm('title')}</Link>
        <span className="mx-2">/</span>
        <Link href={`/menu#${product.categorySlug}`} className="transition-colors hover:text-foreground">
          {product.categoryName}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="grid aspect-[4/3] place-items-center self-start rounded-2xl border border-border bg-gradient-to-br from-primary/15 via-card to-accent/10 text-8xl">
          {categoryEmoji[product.categorySlug] ?? '🍽️'}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.isSpicy && <Badge variant="destructive">🌶️ {tm('spicy')}</Badge>}
            {product.isVegetarian && <Badge className="bg-green-600 text-white">🥬 {tm('veggie')}</Badge>}
          </div>

          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{product.name}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {product.calories && <span>🔥 {product.calories} {tm('kcal')}</span>}
            {product.prepTime && <span>⏱️ ~{product.prepTime} {t('prepTime')}</span>}
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.price, locale)}
            </span>
          </div>

          <p className="mt-5 leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-8 border-t border-border pt-8">
            <AddToCartForm product={product} locale={locale} />
          </div>
        </div>
      </div>

      <ReviewsSection
        productId={product.id}
        categorySlug={product.categorySlug}
        slug={product.slug}
        summary={reviews}
        locale={locale}
      />
    </main>
  );
}