import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {ReservationForm} from '@/features/reservations/reservation-form';
import {getActiveBranches} from '@/features/branches/queries';
import {resolveLocaleParams} from '@/i18n/params';
import {buildOgMetadata} from '@/lib/seo/metadata';

type Props = {params: Promise<{locale: string}>};

export const revalidate = 3600;

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await resolveLocaleParams(params);
  const t = await getTranslations({locale, namespace: 'reserve'});
  return buildOgMetadata(t('title'), t('subtitle'), '/reserve');
}

export default async function ReservePage({params}: Props) {
  const {locale} = await resolveLocaleParams(params);
  const branches = await getActiveBranches();
  const t = await getTranslations('reserve');

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <header className="text-center">
        <h1 className="text-3xl font-black sm:text-4xl">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
      </header>

      <div className="mt-8">
        <ReservationForm branches={branches.map((b) => ({id: b.id, slug: b.slug}))} />
      </div>
    </main>
  );
}