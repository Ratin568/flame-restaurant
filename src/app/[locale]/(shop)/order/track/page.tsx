import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {Check, Clock} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {db} from '@/lib/db';
import {resolveLocaleParams} from '@/i18n/params';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{locale: string}>;
  searchParams: Promise<{number?: string}>;
};

const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SHIPPING', 'DELIVERED'] as const;

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await resolveLocaleParams(params);
  const t = await getTranslations({locale, namespace: 'track'});
  return {title: t('title')};
}

export default async function TrackPage({params, searchParams}: Props) {
  const {locale} = await resolveLocaleParams(params);
  const {number} = await searchParams;

  const t = await getTranslations('track');

  const order = number
    ? await db.order.findUnique({
        where: {orderNumber: number.trim().toUpperCase()},
        include: {statusHistory: {orderBy: {createdAt: 'asc'}}},
      })
    : null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-black">{t('title')}</h1>

      <form method="GET" className="mt-6 flex gap-2">
        <Input name="number" defaultValue={number} placeholder={t('placeholder')} dir="ltr" className="flex-1" />
        <Button type="submit">{t('cta')}</Button>
      </form>

      {number && !order && (
        <p className="mt-6 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {t('notFound')}
        </p>
      )}

      {order && (
        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-primary" dir="ltr">{order.orderNumber}</span>
            <span className="text-sm text-muted-foreground">{t(`status.${order.status}`)}</span>
          </div>

          {order.status === 'CANCELLED' ? (
            <p className="mt-4 text-sm text-destructive">{t('status.CANCELLED')}</p>
          ) : (
            <ol className="mt-6 space-y-4">
              {STATUS_FLOW.map((status, index) => {
                const log = order.statusHistory.find((h) => h.status === status);
                const currentIndex = STATUS_FLOW.indexOf(order.status as (typeof STATUS_FLOW)[number]);
                const done = index <= currentIndex;
                const isCurrent = status === order.status;

                return (
                  <li key={status} className="flex items-start gap-3">
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-full border-2 ${
                        done
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-muted-foreground'
                      }`}
                    >
                      {done ? <Check className="size-4" /> : <Clock className="size-4" />}
                    </span>
                    <div className="pt-1">
                      <p className={`text-sm font-medium ${isCurrent ? 'text-primary' : ''}`}>
                        {t(`status.${status}`)}
                      </p>
                      {log && (
                        <p className="text-xs text-muted-foreground">
                          {new Intl.DateTimeFormat(locale, {dateStyle: 'short', timeStyle: 'short'}).format(log.createdAt)}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}
    </main>
  );
}