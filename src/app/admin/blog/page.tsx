import Link from 'next/link';
import {Pencil, Plus, Trash2} from 'lucide-react';
import {db} from '@/lib/db';
import {deletePostAction, togglePostPublishedAction} from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
  const posts = await db.blogPost.findMany({
    orderBy: {createdAt: 'desc'},
    include: {translations: true, _count: {select: {translations: true, views: true}}},
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black">Blog</h1>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" /> New Post
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        {posts.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">
            No posts yet — write your first SEO article!
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                <th className="px-4 py-3 text-start font-medium">Title</th>
                <th className="px-4 py-3 text-start font-medium">Languages</th>
                <th className="px-4 py-3 text-start font-medium">Views</th>
                <th className="px-4 py-3 text-start font-medium">Status</th>
                <th className="px-4 py-3 text-start font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const title = post.translations.find((t) => t.locale === 'en')?.title ?? post.slug;
                return (
                  <tr key={post.id} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-3">
                      <span className="font-medium">{title}</span>
                      <span className="block text-xs text-muted-foreground" dir="ltr">{post.slug}</span>
                    </td>
                    <td className="px-4 py-3">🌍 {post._count.translations}/12</td>
                    <td className="px-4 py-3">{post._count.views}</td>

                    <td className="px-4 py-3">
                      <form action={togglePostPublishedAction}>
                        <input type="hidden" name="id" value={post.id} />
                        <input type="hidden" name="next" value={String(!post.isPublished)} />
                        <button
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-opacity hover:opacity-80 ${
                            post.isPublished ? 'bg-green-500/15 text-green-600' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {post.isPublished ? 'Published' : 'Draft'}
                        </button>
                      </form>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/blog/${post.id}`}
                          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label={`Edit ${title}`}
                        >
                          <Pencil className="size-4" />
                        </Link>
                        <form action={deletePostAction}>
                          <input type="hidden" name="id" value={post.id} />
                          <button
                            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-600"
                            aria-label={`Delete ${title}`}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}