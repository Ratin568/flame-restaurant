'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {db} from '@/lib/db';
import {requireAdmin} from '@/lib/auth/admin';
import {routing, type Locale} from '@/i18n/routing';
import {z} from 'zod';

async function guard() {
  const admin = await requireAdmin();
  if (!admin) redirect('/admin');
}

export type BlogFormState = {error?: string};

const LOCALES = [...routing.locales] as [Locale, ...Locale[]];

const blogTranslationSchema = z.object({
  locale: z.enum(LOCALES),
  title: z.string().trim().min(5).max(200),
  excerpt: z.string().trim().min(10).max(300),
  content: z.string().trim().min(50),
  seoTitle: z.string().trim().max(200).optional(),
  seoDescription: z.string().trim().max(300).optional(),
});

const postSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  author: z.string().trim().max(80).optional(),
  isPublished: z.boolean(),
  translations: z.array(blogTranslationSchema).min(1, 'At least the English translation is required'),
});

export async function createPostAction(
  _prev: BlogFormState,
  formData: FormData,
): Promise<BlogFormState> {
  const admin = await requireAdmin();
  if (!admin) return {error: 'Forbidden'};

  let translations: unknown;
  try {
    translations = JSON.parse(String(formData.get('translations') ?? '[]'));
  } catch {
    return {error: 'Corrupted form data'};
  }

  const parsed = postSchema.safeParse({
    slug: formData.get('slug'),
    author: formData.get('author') || undefined,
    isPublished: Boolean(formData.get('isPublished')),
    translations,
  });
  if (!parsed.success) return {error: parsed.error.issues[0]?.message ?? 'Invalid input'};

  const locales = parsed.data.translations.map((t) => t.locale);
  if (new Set(locales).size !== locales.length) return {error: 'Duplicate language'};
  if (!locales.includes('en')) return {error: 'English translation is required'};

  const exists = await db.blogPost.findUnique({where: {slug: parsed.data.slug}});
  if (exists) return {error: `Slug "${parsed.data.slug}" is already taken`};

  await db.blogPost.create({
    data: {
      slug: parsed.data.slug,
      author: parsed.data.author ?? admin.name,
      isPublished: parsed.data.isPublished,
      publishedAt: parsed.data.isPublished ? new Date() : null,
      translations: {create: parsed.data.translations},
    },
  });

  revalidatePath('/admin/blog');
  revalidatePath('/', 'layout');
  redirect('/admin/blog');
}

export async function updatePostAction(
  _prev: BlogFormState,
  formData: FormData,
): Promise<BlogFormState> {
  const admin = await requireAdmin();
  if (!admin) return {error: 'Forbidden'};

  const id = String(formData.get('id') ?? '');
  if (!id) return {error: 'Missing post id'};

  let translations: unknown;
  try {
    translations = JSON.parse(String(formData.get('translations') ?? '[]'));
  } catch {
    return {error: 'Corrupted form data'};
  }

  const parsed = postSchema.safeParse({
    slug: formData.get('slug'),
    author: formData.get('author') || undefined,
    isPublished: Boolean(formData.get('isPublished')),
    translations,
  });
  if (!parsed.success) return {error: parsed.error.issues[0]?.message ?? 'Invalid input'};

  const post = await db.blogPost.findUnique({where: {id}});
  if (!post) return {error: 'Post not found'};

  const slugClash = await db.blogPost.findUnique({where: {slug: parsed.data.slug}});
  if (slugClash && slugClash.id !== id) return {error: `Slug "${parsed.data.slug}" is already taken`};

  await db.$transaction(async (tx) => {
    await tx.blogPost.update({
      where: {id},
      data: {
        slug: parsed.data.slug,
        author: parsed.data.author ?? admin.name,
        isPublished: parsed.data.isPublished,
        // اولین بار که publish می‌شود، تاریخ ثبت می‌شود
        ...(parsed.data.isPublished && !post.publishedAt ? {publishedAt: new Date()} : {}),
      },
    });

    await tx.blogPostTranslation.deleteMany({where: {postId: id}});
    await tx.blogPostTranslation.createMany({
      data: parsed.data.translations.map((t) => ({...t, postId: id})),
    });
  });

  revalidatePath('/admin/blog');
  revalidatePath('/', 'layout');
  redirect('/admin/blog');
}

export async function togglePostPublishedAction(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get('id') ?? '');
  const next = String(formData.get('next')) === 'true';
  if (!id) return;

  const post = await db.blogPost.findUnique({where: {id}});
  if (!post) return;

  await db.blogPost.update({
    where: {id},
    data: {
      isPublished: next,
      ...(next && !post.publishedAt ? {publishedAt: new Date()} : {}),
    },
  });

  revalidatePath('/admin/blog');
  revalidatePath('/', 'layout');
  redirect('/admin/blog');
}

export async function deletePostAction(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  await db.blogPost.delete({where: {id}});

  revalidatePath('/admin/blog');
  revalidatePath('/', 'layout');
  redirect('/admin/blog');
}