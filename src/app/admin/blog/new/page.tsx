import Link from 'next/link';
import {ArrowLeft} from 'lucide-react';
import {BlogForm} from '../blog-form';

export const dynamic = 'force-dynamic';

export default function NewBlogPostPage() {
  return (
    <div>
      <Link href="/admin/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Blog
      </Link>
      <h1 className="mt-2 text-2xl font-black">New Post</h1>

      <BlogForm
        mode="create"
        defaults={{
          slug: '',
          author: '',
          isPublished: false,
          translations: {},
        }}
      />
    </div>
  );
}