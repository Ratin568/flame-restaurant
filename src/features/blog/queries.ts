import {db} from '@/lib/db';

export type BlogPostSummary = {
  slug: string;
  title: string;
  excerpt: string;
  author: string | null;
  publishedAt: Date | null;
  views: number;
};

export async function getPublishedPosts(locale: string): Promise<BlogPostSummary[]> {
  const posts = await db.blogPost.findMany({
    where: {isPublished: true},
    orderBy: {publishedAt: 'desc'},
    include: {
      translations: true,
      _count: {select: {views: true}},
    },
    take: 50,
  });

  // ⚠️ جنریک! خروجی تایپ کامل آیتم را حفظ می‌کند، نه فقط {locale}
  const pick = <T extends {locale: string}>(list: T[]): T | undefined =>
    list.find((t) => t.locale === locale) ?? list.find((t) => t.locale === 'en');

  return posts
    .map((post) => {
      const translation = pick(post.translations);
      if (!translation) return null;
      return {
        slug: post.slug,
        title: translation.title,
        excerpt: translation.excerpt,
        author: post.author,
        publishedAt: post.publishedAt,
        views: post._count.views,
      };
    })
    .filter((p): p is BlogPostSummary => p !== null);
}

export async function getPostBySlug(slug: string, locale: string) {
  const post = await db.blogPost.findFirst({
    where: {slug, isPublished: true},
    include: {translations: true, _count: {select: {views: true}}},
  });
  if (!post) return null;

  const pick = <T extends {locale: string}>(list: T[]): T | undefined =>
    list.find((t) => t.locale === locale) ?? list.find((t) => t.locale === 'en');

  const translation = pick(post.translations);
  if (!translation) return null;

  return {
    id: post.id,
    slug: post.slug,
    title: translation.title,
    excerpt: translation.excerpt,
    content: translation.content,
    author: post.author,
    publishedAt: post.publishedAt,
    views: post._count.views,
  };
}

/** ثبت بازدید (fire-and-forget از صفحه) */
export async function recordPostView(postId: string): Promise<void> {
  try {
    await db.blogView.create({data: {postId}});
  } catch {
    // بازدید مهم نیست که بشکند
  }
}