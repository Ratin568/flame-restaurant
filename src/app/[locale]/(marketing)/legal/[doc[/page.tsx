import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {resolveLocaleParams} from '@/i18n/params';

type Props = {params: Promise<{locale: string; doc: string}>};

const DOCS = {
  terms: {titleKey: 'termsTitle', bodyKey: 'termsBody'},
  privacy: {titleKey: 'privacyTitle', bodyKey: 'privacyBody'},
  refund: {titleKey: 'refundTitle', bodyKey: 'refundBody'},
} as const;

export const revalidate = 86400;

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale, doc} = await resolveLocaleParams(params);
  const valid = doc in DOCS;
  const t = await getTranslations({locale, namespace: 'legal'});
  return {title: valid ? t(DOCS[doc as keyof typeof DOCS].titleKey) : 'Legal'};
}

export default async function LegalPage({params}: Props) {
  const {locale, doc} = await resolveLocaleParams(params);

  if (!(doc in DOCS)) notFound();

  const {titleKey, bodyKey} = DOCS[doc as keyof typeof DOCS];
  const t = await getTranslations('legal');

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-black">{t(titleKey)}</h1>
      <p className="mt-2 text-xs text-muted-foreground">
        {t('lastUpdated')}: {new Intl.DateTimeFormat(locale, {dateStyle: 'long'}).format(new Date('2025-01-01'))}
      </p>
      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <p className="leading-relaxed text-muted-foreground">{t(bodyKey)}</p>
      </div>
    </main>
  );
}