'use client';

import {useState, useTransition} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {useCartStore} from '@/stores/cart';
import {placeOrderAction, validateCouponAction} from './actions';
import {formatPrice} from '@/lib/money';
import {
  CreditCard,
  WalletCards,
  Landmark,
  Banknote,
  ShieldCheck,
} from 'lucide-react';
import type {PaymentProviderName} from '@/features/payments/core/types';

const DELIVERY_FEE = 2.99;
const FREE_DELIVERY_OVER = 25;

type OrderType = 'DELIVERY' | 'PICKUP' | 'DINE_IN';

const icons: Record<
  PaymentProviderName,
  typeof CreditCard
> = {
  MOCK: CreditCard,
  STRIPE: CreditCard,
  PAYPAL: WalletCards,
  ADYEN: Landmark,
  MOLLIE: CreditCard,
  ZARINPAL: Landmark,
  CASH: Banknote,
};

export function CheckoutForm({
  enabledProviders,
  paymentIssue,
}: {
  enabledProviders: PaymentProviderName[];
  paymentIssue?: string;
}) {
  const t = useTranslations('checkout');
  const tCart = useTranslations('cart');
  const locale = useLocale();

  const items = useCartStore((s) => s.items);

  const [pending, startTransition] = useTransition();
  const [orderType, setOrderType] =
    useState<OrderType>('DELIVERY');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] =
    useState<string | null>(null);
  const [couponMsg, setCouponMsg] =
    useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] =
    useState(0);
  const [paymentProvider, setPaymentProvider] =
    useState<PaymentProviderName>(
      enabledProviders[0] ?? 'CASH',
    );

  const subtotal = items.reduce(
    (s, i) => s + i.unitPrice * i.quantity,
    0,
  );

  const displayDiscount = appliedCoupon
    ? couponDiscount
    : 0;

  const deliveryFee =
    orderType === 'DELIVERY'
      ? subtotal >= FREE_DELIVERY_OVER
        ? 0
        : DELIVERY_FEE
      : 0;

  const total =
    subtotal - displayDiscount + deliveryFee;

  const labels: Record<OrderType, string> = {
    DELIVERY: t('delivery'),
    PICKUP: t('pickup'),
    DINE_IN: t('dineIn'),
  };

  if (!items.length) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">
          {t('emptyCart')}
        </h1>

        <Link
          href="/menu"
          className="mt-4 inline-block"
        >
          <Button>
            🍔 {tCart('emptyCta')}
          </Button>
        </Link>
      </main>
    );
  }

  async function apply() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    const fd = new FormData();
    fd.set('coupon', code);
    fd.set('items', JSON.stringify(items));
    fd.set('locale', locale);
    fd.set('orderType', orderType);

    const result = await validateCouponAction(fd);

    if (result.valid && result.code) {
      setAppliedCoupon(result.code);
      setCouponDiscount(result.discount);
      setCouponMsg(
        t('couponApplied', {
          amount: formatPrice(result.discount, locale),
        }),
      );
    } else {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      setCouponMsg(t('couponInvalid'));
    }
  }

  function submit(fd: FormData) {
    fd.set('items', JSON.stringify(items));
    fd.set('locale', locale);
    fd.set(
      'paymentProvider',
      paymentProvider,
    );

    startTransition(() =>
      placeOrderAction(fd),
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-black">
        {t('title')}
      </h1>

      <form
        action={submit}
        className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]"
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold">
              {t('orderType')}
            </h2>

            <div className="mt-2 grid grid-cols-3 gap-2">
              {(Object.keys(labels) as OrderType[]).map(
                (x) => (
                  <button
                    key={x}
                    type="button"
                    onClick={() => {
                      setOrderType(x);
                      setAppliedCoupon(null);
                      setCouponDiscount(0);
                      setCouponMsg(null);
                    }}
                    className={`rounded-lg border px-3 py-3 text-sm font-medium transition-colors ${
                      orderType === x
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {labels[x]}
                  </button>
                ),
              )}
            </div>

            <input
              type="hidden"
              name="orderType"
              value={orderType}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="text-sm font-medium"
              >
                {t('name')}
              </label>

              <Input
                id="name"
                name="name"
                required
                minLength={2}
                className="mt-1.5"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="text-sm font-medium"
              >
                {t('phone')}
              </label>

              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                className="mt-1.5"
                dir="ltr"
              />
            </div>
          </div>

          {orderType === 'DELIVERY' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="address"
                  className="text-sm font-medium"
                >
                  {t('address')}
                </label>

                <Input
                  id="address"
                  name="address"
                  required
                  className="mt-1.5"
                  placeholder={t(
                    'addressPlaceholder',
                  )}
                />
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="text-sm font-medium"
                >
                  {t('city')}
                </label>

                <Input
                  id="city"
                  name="city"
                  className="mt-1.5"
                />
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="notes"
              className="text-sm font-medium"
            >
              {t('notes')}
            </label>

            <Input
              id="notes"
              name="notes"
              className="mt-1.5"
              placeholder={t(
                'notesPlaceholder',
              )}
            />
          </div>

          <div>
            <label
              htmlFor="coupon"
              className="text-sm font-medium"
            >
              {t('coupon')}
            </label>

            <div className="mt-1.5 flex gap-2">
              <Input
                id="coupon"
                value={couponInput}
                onChange={(e) =>
                  setCouponInput(e.target.value)
                }
                className="flex-1"
                dir="ltr"
                placeholder="WELCOME10"
              />

              <Button
                type="button"
                variant="secondary"
                onClick={apply}
              >
                {t('couponApply')}
              </Button>
            </div>

            {couponMsg && (
              <p
                className={`mt-2 text-sm ${
                  appliedCoupon
                    ? 'text-green-600'
                    : 'text-destructive'
                }`}
              >
                {couponMsg}
              </p>
            )}

            <input
              type="hidden"
              name="coupon"
              value={appliedCoupon ?? ''}
            />
          </div>

          <div>
            <h2 className="text-sm font-semibold">
              {t('paymentMethod')}
            </h2>

            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {enabledProviders.map((p) => {
                const Icon = icons[p];

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() =>
                      setPaymentProvider(p)
                    }
                    className={`flex items-center gap-3 rounded-xl border p-4 text-start transition-colors ${
                      paymentProvider === p
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Icon className="size-5" />

                    <span>
                      <span className="block font-semibold">
                        {t(
                          `payment_${p.toLowerCase()}` as Parameters<
                            typeof t
                          >[0],
                        )}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {t(
                          `payment_${p.toLowerCase()}_desc` as Parameters<
                            typeof t
                          >[0],
                        )}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="h-fit space-y-3 rounded-xl border border-border bg-card p-6 lg:sticky lg:top-24">
          <h2 className="font-bold">
            {t('summary')}
          </h2>

          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li
                key={i.itemId}
                className="flex justify-between gap-2"
              >
                <span className="min-w-0 truncate">
                  {i.quantity}× {i.name}
                  {i.variant &&
                    ` (${i.variant.name})`}
                </span>

                <span className="whitespace-nowrap">
                  {formatPrice(
                    i.unitPrice * i.quantity,
                    locale,
                  )}
                </span>
              </li>
            ))}
          </ul>

          <div className="space-y-1.5 border-t border-border pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {tCart('subtotal')}
              </span>

              <span>
                {formatPrice(
                  subtotal,
                  locale,
                )}
              </span>
            </div>

            {displayDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>
                  {t('coupon')} (WELCOME10)
                </span>

                <span>
                  −
                  {formatPrice(
                    displayDiscount,
                    locale,
                  )}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {tCart('delivery')}
              </span>

              <span>
                {deliveryFee === 0
                  ? tCart('free')
                  : formatPrice(
                      deliveryFee,
                      locale,
                    )}
              </span>
            </div>

            <div className="flex justify-between border-t border-border pt-2 text-lg font-black">
              <span>
                {tCart('total')}
              </span>

              <span className="text-primary">
                {formatPrice(
                  total,
                  locale,
                )}
              </span>
            </div>
          </div>

          {paymentIssue && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {t(
                `payment_${paymentIssue}` as Parameters<
                  typeof t
                >[0],
              )}
            </p>
          )}

          <p className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0" />
            {t('securePayment')}
          </p>

          {pending ? (
            <Button
              className="w-full"
              size="lg"
              disabled
            >
              ...
            </Button>
          ) : (
            <Button
              type="submit"
              className="w-full"
              size="lg"
            >
              🔥 {t('placeOrder')}
            </Button>
          )}
        </aside>
      </form>
    </main>
  );
}