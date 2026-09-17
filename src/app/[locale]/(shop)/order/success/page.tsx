import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {CheckCircle2} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';
import {db} from '@/lib/db';
import {resolveLocaleParams} from '@/i18n/params';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{locale: string}>;
  searchParams: Promise<{order?: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await resolveLocaleParams(params);
  const t = await getTranslations({locale, namespace: 'orderSuccess'});
  return {title: t('title')};
}

export default async function OrderSuccessPage({
  params,
  searchParams,
}: Props) {
  const {locale} = await resolveLocaleParams(params);
  const {order: orderNumber} = await searchParams;

  const order = orderNumber
    ? await db.order.findUnique({
        where: {orderNumber},
        include: {items: true},
      })
    : null;

  const t = await getTranslations('orderSuccess');
  const tCart = await getTranslations('cart');

  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center">
      <div className="grid size-20 place-items-center rounded-full bg-green-500/15">
        <CheckCircle2 className="size-10 text-green-500" />
      </div>
      <h1 className="mt-6 text-3xl font-black">{t('title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>

      {order && (
        <div className="mt-8 w-full space-y-4 rounded-xl border border-border bg-card p-6 text-start">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t('orderNumber')}</span>
            <span className="font-mono text-lg font-bold text-primary" dir="ltr">
              {order.orderNumber}
            </span>
          </div>

          <div className="border-t border-border pt-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between py-1 text-sm">
                <span>
                  {item.quantity}× {item.nameSnapshot}
                  {item.variant && ` (${item.variant})`}
                </span>
                <span>{formatPriceServer(Number(item.unitPrice) * item.quantity, locale)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between border-t border-border pt-3 font-bold">
            <span>{tCart('total')}</span>
            <span className="text-primary">{formatPriceServer(Number(order.total), locale)}</span>
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <Link href={`/order/track?number=${order?.orderNumber ?? ''}`}>
          <Button size="lg">📦 {t('trackCta')}</Button>
        </Link>
        <Link href="/menu">
          <Button size="lg" variant="outline">{t('menuCta')}</Button>
        </Link>
      </div>
    </main>
  );
}

function formatPriceServer(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {style: 'currency', currency: 'USD'}).format(value);
}