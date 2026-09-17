'use client';

import {useLocale, useTranslations} from 'next-intl';
import {Minus, Plus, ShoppingBag, Trash2} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';
import {useCartStore} from '@/stores/cart';
import {formatPrice} from '@/lib/money';

const DELIVERY_FEE = 2.99;
const FREE_DELIVERY_OVER = 25;

export function CartView() {
  const t = useTranslations('cart');
  const locale = useLocale();
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;
  const total = subtotal + delivery;

  if (items.length === 0) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
        <ShoppingBag className="size-14 text-muted-foreground" />
        <h1 className="text-2xl font-bold">{t('empty')}</h1>
        <Link href="/menu">
          <Button size="lg">🍔 {t('emptyCta')}</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-black">{t('title')}</h1>

      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <div
            key={item.itemId}
            className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4"
          >
            <div className="min-w-0 flex-1">
              <Link
                href={`/menu/${item.categorySlug}/${item.slug}`}
                className="font-semibold transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {[item.variant?.name, ...item.modifiers.map((m) => m.name)]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              <p className="mt-1 text-sm text-primary">{formatPrice(item.unitPrice, locale)}</p>
            </div>

            <div className="flex items-center rounded-lg border border-border">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(item.itemId, item.quantity - 1)}
                aria-label="-"
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(item.itemId, item.quantity + 1)}
                aria-label="+"
              >
                <Plus className="size-4" />
              </Button>
            </div>

            <span className="w-20 text-end font-bold">
              {formatPrice(item.unitPrice * item.quantity, locale)}
            </span>

            <Button variant="ghost" size="icon" onClick={() => removeItem(item.itemId)} aria-label={t('remove')}>
              <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-2 rounded-xl border border-border bg-card p-6">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('subtotal')}</span>
          <span>{formatPrice(subtotal, locale)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('delivery')}</span>
          <span>{delivery === 0 ? t('free') : formatPrice(delivery, locale)}</span>
        </div>
        {subtotal < FREE_DELIVERY_OVER && (
          <p className="text-xs text-primary">
            🔥 {t('freeHint', {amount: formatPrice(FREE_DELIVERY_OVER - subtotal, locale)})}
          </p>
        )}
        <div className="flex justify-between border-t border-border pt-3 text-lg font-black">
          <span>{t('total')}</span>
          <span className="text-primary">{formatPrice(total, locale)}</span>
        </div>
        <Link href="/checkout" className="block pt-2">
          <Button size="lg" className="w-full">{t('checkout')}</Button>
        </Link>
      </div>
    </main>
  );
}