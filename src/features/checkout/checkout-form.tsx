'use client';

import {useState, useTransition} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {useCartStore} from '@/stores/cart';
import {placeOrderAction} from './actions';
import {formatPrice} from '@/lib/money';

const DELIVERY_FEE = 2.99;
const FREE_DELIVERY_OVER = 25;

type OrderType = 'DELIVERY' | 'PICKUP' | 'DINE_IN';

export function CheckoutForm() {
  const t = useTranslations('checkout');
  const tCart = useTranslations('cart');
  const locale = useLocale();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const [pending, startTransition] = useTransition();

  const [orderType, setOrderType] = useState<OrderType>('DELIVERY');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const displayDiscount = appliedCoupon ? subtotal * 0.1 : 0;
  const deliveryFee = orderType === 'DELIVERY' ? (subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE) : 0;
  const total = subtotal - displayDiscount + deliveryFee;

  // برچسب‌های تایپ‌شده — به جای کلید داینامیک t(type.toLowerCase())
  const orderTypeLabels: Record<OrderType, string> = {
    DELIVERY: t('delivery'),
    PICKUP: t('pickup'),
    DINE_IN: t('dineIn'),
  };

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">{t('emptyCart')}</h1>
        <Link href="/menu" className="mt-4 inline-block">
          <Button>🍔 {tCart('emptyCta')}</Button>
        </Link>
      </main>
    );
  }

  function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    if (couponInput.trim().toUpperCase() === 'WELCOME10') {
      setAppliedCoupon(couponInput.trim().toUpperCase());
      setCouponMsg(t('couponApplied', {amount: formatPrice(subtotal * 0.1, locale)}));
    } else {
      setAppliedCoupon(null);
      setCouponMsg(t('couponInvalid'));
    }
  }

  function handleSubmit(formData: FormData) {
    formData.set('items', JSON.stringify(items));
    startTransition(async () => {
      try {
        await placeOrderAction(formData);
      } finally {
        // همیشه اجرا می‌شود — حتی وقتی action با redirect تمام می‌شود
        clear();
      }
    });
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-black">{t('title')}</h1>

      <form action={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          {/* نوع سفارش */}
          <div>
            <h2 className="text-sm font-semibold">{t('orderType')}</h2>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(Object.keys(orderTypeLabels) as OrderType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOrderType(type)}
                  className={`rounded-lg border px-3 py-3 text-sm font-medium transition-colors ${
                    orderType === type
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {orderTypeLabels[type]}
                </button>
              ))}
            </div>
            <input type="hidden" name="orderType" value={orderType} />
          </div>

          {/* مشخصات */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="text-sm font-medium">{t('name')}</label>
              <Input id="name" name="name" required minLength={2} className="mt-1.5" />
            </div>
            <div>
              <label htmlFor="phone" className="text-sm font-medium">{t('phone')}</label>
              <Input id="phone" name="phone" type="tel" required className="mt-1.5" dir="ltr" />
            </div>
          </div>

          {/* آدرس فقط برای DELIVERY */}
          {orderType === 'DELIVERY' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="address" className="text-sm font-medium">{t('address')}</label>
                <Input id="address" name="address" required className="mt-1.5" placeholder={t('addressPlaceholder')} />
              </div>
              <div>
                <label htmlFor="city" className="text-sm font-medium">{t('city')}</label>
                <Input id="city" name="city" className="mt-1.5" />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="notes" className="text-sm font-medium">{t('notes')}</label>
            <Input id="notes" name="notes" className="mt-1.5" placeholder={t('notesPlaceholder')} />
          </div>

          {/* کوپن */}
          <div>
            <label htmlFor="coupon" className="text-sm font-medium">{t('coupon')}</label>
            <div className="mt-1.5 flex gap-2">
              <Input
                id="coupon"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="flex-1"
                dir="ltr"
                placeholder="WELCOME10"
              />
              <Button type="button" variant="secondary" onClick={handleApplyCoupon}>
                {t('couponApply')}
              </Button>
            </div>
            {couponMsg && (
              <p className={`mt-2 text-sm ${appliedCoupon ? 'text-green-600' : 'text-destructive'}`}>
                {couponMsg}
              </p>
            )}
            <input type="hidden" name="coupon" value={appliedCoupon ?? ''} />
          </div>
        </div>

        {/* خلاصه سفارش */}
        <aside className="h-fit space-y-3 rounded-xl border border-border bg-card p-6 lg:sticky lg:top-24">
          <h2 className="font-bold">{t('summary')}</h2>

          <ul className="space-y-2 text-sm">
            {items.map((item) => (
              <li key={item.itemId} className="flex justify-between gap-2">
                <span className="min-w-0 truncate">
                  {item.quantity}× {item.name}
                  {item.variant && ` (${item.variant.name})`}
                </span>
                <span className="whitespace-nowrap">{formatPrice(item.unitPrice * item.quantity, locale)}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-1.5 border-t border-border pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{tCart('subtotal')}</span>
              <span>{formatPrice(subtotal, locale)}</span>
            </div>
            {displayDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>{t('coupon')} (WELCOME10)</span>
                <span>−{formatPrice(displayDiscount, locale)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">{tCart('delivery')}</span>
              <span>{deliveryFee === 0 ? tCart('free') : formatPrice(deliveryFee, locale)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-lg font-black">
              <span>{tCart('total')}</span>
              <span className="text-primary">{formatPrice(total, locale)}</span>
            </div>
          </div>

          <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            {t('cashOnly')}
          </p>

          {pending ? (
            <Button className="w-full" size="lg" disabled>...</Button>
          ) : (
            <Button type="submit" className="w-full" size="lg">🔥 {t('placeOrder')}</Button>
          )}
        </aside>
      </form>
    </main>
  );
}