import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ArrowLeft} from 'lucide-react';
import {db} from '@/lib/db';
import {BlogForm} from '../blog-form';

export const dynamic = 'force-dynamic';

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{id: string}>;
}) {
  const {id} = await params;

  const post = await db.blogPost.findUnique({
    where: {id},
    include: {translations: true},
  });
  if (!post) notFound();

  const translations = Object.fromEntries(
    post.translations.map((t) => [
      t.locale,
      {title: t.title, excerpt: t.excerpt, content: t.content},
    ]),
  );

  return (
    <div>
      <Link href="/admin/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Blog
      </Link>
      <h1 className="mt-2 text-2xl font-black">Edit: {post.translations[0]?.title ?? post.slug}</h1>

      <BlogForm
        mode="edit"
        defaults={{
          id: post.id,
          slug: post.slug,
          author: post.author ?? '',
          isPublished: post.isPublished,
          translations,
        }}
      />
    </div>
  );
}