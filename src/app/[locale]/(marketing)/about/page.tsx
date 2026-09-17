import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {resolveLocaleParams} from '@/i18n/params';
import {buildOgMetadata} from '@/lib/seo/metadata';

type Props = {params: Promise<{locale: string}>};

export const revalidate = 86400;

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await resolveLocaleParams(params);
  const t = await getTranslations({locale, namespace: 'about'});
  return buildOgMetadata(t('title'), t('story1'), '/about');
}

export default async function AboutPage({params}: Props) {
  await resolveLocaleParams(params);
  const t = await getTranslations('about');

  const stats = [
    {value: '500K+', label: t('statOrders')},
    {value: '2', label: t('statBranches')},
    {value: '10', label: t('statYears')},
  ];

  const values = [
    {title: t('value1Title'), text: t('value1Text')},
    {title: t('value2Title'), text: t('value2Text')},
    {title: t('value3Title'), text: t('value3Text')},
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-black sm:text-4xl">{t('title')}</h1>

      <section className="mt-10">
        <h2 className="text-xl font-bold">{t('storyTitle')}</h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">{t('story1')}</p>
        <p className="mt-3 leading-relaxed text-muted-foreground">{t('story2')}</p>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold">{t('statsTitle')}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-5 text-center">
              <p className="text-3xl font-black text-primary">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold">{t('valuesTitle')}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {values.map((value) => (
            <div key={value.title} className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-semibold">{value.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{value.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}