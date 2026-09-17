import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';
import {resolveLocaleParams} from '@/i18n/params';
import {restaurantSchema, JsonLdScript} from '@/lib/seo/schema';
import {db} from '@/lib/db';

export const revalidate = 3600;

export default async function HomePage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  await resolveLocaleParams(params);

  const t = await getTranslations('home');

  // میانگین امتیاز کل سایت (اگه نظری داشته باشیم)
  const agg = await db.review.aggregate({
    _avg: {rating: true},
    _count: {_all: true},
    where: {isApproved: true},
  });

  return (
    <main>
      <JsonLdScript
        data={restaurantSchema(
          agg._count._all > 0 && agg._avg.rating != null
            ? {value: Math.round(agg._avg.rating * 10) / 10, count: agg._count._all}
            : undefined,
        )}
      />
      <section className="flex min-h-svh flex-col items-center justify-center gap-6 text-center">
        <span className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm text-primary">
          {t('hero.badge')}
        </span>
        <h1 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-6xl font-black text-transparent">
          {t('hero.title')}
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">{t('hero.subtitle')}</p>
        <div className="flex gap-4">
          <Button size="lg">{t('hero.ctaPrimary')}</Button>
          <Link href="/menu">
            <Button size="lg" variant="outline">{t('hero.ctaSecondary')}</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}