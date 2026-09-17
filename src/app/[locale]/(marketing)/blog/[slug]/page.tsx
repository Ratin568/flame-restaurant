import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {Eye} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {getPostBySlug, recordPostView} from '@/features/blog/queries';
import {resolveLocaleParams} from '@/i18n/params';
import {buildOgMetadata} from '@/lib/seo/metadata';
import {breadcrumbSchema, JsonLdScript} from '@/lib/seo/schema';

type Props = {params: Promise<{locale: string; slug: string}>};

export const revalidate = 300;

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale, slug} = await resolveLocaleParams(params);
  const post = await getPostBySlug(slug, locale);
  if (!post) return {};
  return buildOgMetadata(post.title, post.excerpt, `/blog/${slug}`);
}

export default async function BlogPostPage({params}: Props) {
  const {locale, slug} = await resolveLocaleParams(params);

  const post = await getPostBySlug(slug, locale);
  if (!post) notFound();

  const t = await getTranslations('blog');
  void recordPostView(post.id); // fire-and-forget

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLdScript
        data={breadcrumbSchema([
          {name: 'Blog', url: '/blog'},
          {name: post.title, url: `/blog/${post.slug}`},
        ])}
      />

      <Link href="/blog" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
        ← {t('backToBlog')}
      </Link>

      <article className="mt-6">
        <header>
          <h1 className="text-3xl font-black leading-tight sm:text-4xl">{post.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {post.author && <span>{t('byAuthor')} <strong className="text-foreground">{post.author}</strong></span>}
            {post.publishedAt && (
              <span>
                {new Intl.DateTimeFormat(locale, {dateStyle: 'long'}).format(post.publishedAt)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="size-4" /> {post.views} {t('views')}
            </span>
          </div>
        </header>

        <div className="mt-8 space-y-4">
          {post.content.split('\n\n').map((paragraph, i) => {
            if (paragraph.startsWith('## ')) {
              return (
                <h2 key={i} className="pt-4 text-2xl font-bold">
                  {paragraph.slice(3)}
                </h2>
              );
            }
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={i} className="pt-2 text-xl font-semibold">
                  {paragraph.slice(4)}
                </h3>
              );
            }
            return (
              <p key={i} className="leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            );
          })}
        </div>
      </article>
    </main>
  );
}