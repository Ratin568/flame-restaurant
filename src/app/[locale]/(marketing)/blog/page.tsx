import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {Eye} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {getPublishedPosts} from '@/features/blog/queries';
import {resolveLocaleParams} from '@/i18n/params';
import {buildOgMetadata} from '@/lib/seo/metadata';

type Props = {params: Promise<{locale: string}>};

export const revalidate = 300;

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await resolveLocaleParams(params);
  const t = await getTranslations({locale, namespace: 'blog'});
  return buildOgMetadata(t('title'), t('subtitle'), '/blog');
}

export default async function BlogPage({params}: Props) {
  const {locale} = await resolveLocaleParams(params);
  const posts = await getPublishedPosts(locale);
  const t = await getTranslations('blog');

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <header className="text-center">
        <h1 className="text-3xl font-black sm:text-4xl">📝 {t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
      </header>

      {posts.length === 0 ? (
        <p className="mt-12 rounded-xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
          {t('empty')}
        </p>
      ) : (
        <div className="mt-10 space-y-5">
          {posts.map((post) => (
            <article key={post.slug} className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-lg hover:shadow-primary/5">
              <Link href={`/blog/${post.slug}`} className="group block">
                <h2 className="text-xl font-bold transition-colors group-hover:text-primary">
                  {post.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {post.author && <span>{t('byAuthor')} {post.author}</span>}
                  {post.publishedAt && (
                    <span>
                      {new Intl.DateTimeFormat(locale, {dateStyle: 'medium'}).format(post.publishedAt)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye className="size-3.5" /> {post.views} {t('views')}
                  </span>
                  <span className="ms-auto font-semibold text-primary">{t('readMore')} →</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}