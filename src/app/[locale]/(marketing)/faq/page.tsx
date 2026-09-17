import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {resolveLocaleParams} from '@/i18n/params';
import {buildOgMetadata} from '@/lib/seo/metadata';

type Props = {params: Promise<{locale: string}>};

export const revalidate = 86400;

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await resolveLocaleParams(params);
  const t = await getTranslations({locale, namespace: 'faq'});
  return buildOgMetadata(t('title'), t('subtitle'), '/faq');
}

const FAQ_ITEMS = [
  {q: 'q1', a: 'a1'},
  {q: 'q2', a: 'a2'},
  {q: 'q3', a: 'a3'},
  {q: 'q4', a: 'a4'},
  {q: 'q5', a: 'a5'},
  {q: 'q6', a: 'a6'},
  {q: 'q7', a: 'a7'},
  {q: 'q8', a: 'a8'},
] as const;

export default async function FaqPage({params}: Props) {
  const {locale} = await resolveLocaleParams(params);
  const t = await getTranslations('faq');

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: t(item.q),
      acceptedAnswer: {'@type': 'Answer', text: t(item.a)},
    })),
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{__html: JSON.stringify(faqSchema)}}
      />

      <header className="text-center">
        <h1 className="text-3xl font-black sm:text-4xl">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
      </header>

      <div className="mt-8 space-y-3">
        {FAQ_ITEMS.map((item) => (
          <details key={item.q} className="group rounded-xl border border-border bg-card px-5 py-4">
            <summary className="cursor-pointer list-none font-semibold transition-colors group-open:text-primary">
              {t(item.q)}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(item.a)}</p>
          </details>
        ))}
      </div>
    </main>
  );
}