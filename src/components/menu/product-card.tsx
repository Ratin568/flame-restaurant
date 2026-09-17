import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {Badge} from '@/components/ui/badge';
import {categoryEmoji} from './emoji';
import {formatPrice} from '@/lib/money';
import type {MenuProduct} from '@/features/menu/queries';

type Props = {
  product: MenuProduct;
  categorySlug: string;
  locale: string;
};

export async function ProductCard({product, categorySlug, locale}: Props) {
  const t = await getTranslations('menu');

  return (
    <Link
      href={`/menu/${categorySlug}/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="grid aspect-[16/10] place-items-center bg-gradient-to-br from-primary/15 via-card to-accent/10 text-6xl transition-transform duration-300 group-hover:scale-[1.02]">
        {categoryEmoji[categorySlug] ?? '🍽️'}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug">{product.name}</h3>
          <span className="whitespace-nowrap font-bold text-primary">
            {formatPrice(product.price, locale)}
          </span>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>

        <div className="flex items-center gap-1.5 pt-1">
          {product.isSpicy && <Badge variant="destructive">🌶️ {t('spicy')}</Badge>}
          {product.isVegetarian && <Badge className="bg-green-600 text-white">🥬 {t('veggie')}</Badge>}
          {product.calories && (
            <span className="ms-auto text-xs text-muted-foreground">
              {product.calories} {t('kcal')}
            </span>
          )}
        </div>

        <div className="mt-2 w-full rounded-md bg-primary py-2 text-center text-sm font-semibold text-primary-foreground transition-opacity group-hover:opacity-90">
          {t('addToCart')}
        </div>
      </div>
    </Link>
  );
}