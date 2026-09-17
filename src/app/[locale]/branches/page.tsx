import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {MapPin, Phone} from 'lucide-react';
import {getActiveBranches} from '@/features/branches/queries';
import {resolveLocaleParams} from '@/i18n/params';
import {buildOgMetadata} from '@/lib/seo/metadata';
import {localBusinessSchema, JsonLdScript} from '@/lib/seo/schema';

type Props = {params: Promise<{locale: string}>};

export const revalidate = 3600;

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await resolveLocaleParams(params);
  const t = await getTranslations({locale, namespace: 'branches'});
  return buildOgMetadata(t('title'), t('subtitle'), '/branches');
}

export default async function BranchesPage({params}: Props) {
  const {locale} = await resolveLocaleParams(params);
  const branches = await getActiveBranches();
  const t = await getTranslations('branches');

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      {branches.map((branch) => (
        <JsonLdScript key={branch.id} data={localBusinessSchema(branch)} />
      ))}

      <header className="text-center">
        <h1 className="text-3xl font-black sm:text-4xl">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
      </header>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {branches.map((branch) => {
          const mapsUrl = branch.lat && branch.lng
            ? `https://www.google.com/maps/search/?api=1&query=${branch.lat},${branch.lng}`
            : branch.address
              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address)}`
              : null;

          return (
            <article key={branch.id} className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-black">🔥 Flame {branch.slug}</h2>

              {branch.address && (
                <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  {branch.address}
                </p>
              )}

              {branch.phone && (
                <a
                  href={`tel:${branch.phone}`}
                  className="mt-2 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  dir="ltr"
                >
                  <Phone className="size-4 shrink-0" />
                  {branch.phone}
                </a>
              )}

              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <MapPin className="size-4" />
                  {t('openMaps')}
                </a>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}