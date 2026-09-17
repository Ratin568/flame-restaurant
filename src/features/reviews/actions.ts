'use server';

import {revalidatePath} from 'next/cache';
import {db} from '@/lib/db';
import {getSession} from '@/lib/auth/session';
import {z} from 'zod';

export type ReviewFormState = {status?: 'submitted' | 'already' | 'error'};

const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(2).max(1000),
});

export async function submitReviewAction(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  // منبع حقیقت سشن: سمت سرور — نه کلاینت
  const session = await getSession();
  if (!session) return {status: 'error'};

  const parsed = reviewSchema.safeParse({
    productId: formData.get('productId'),
    rating: formData.get('rating'),
    comment: formData.get('comment'),
  });
  if (!parsed.success) return {status: 'error'};

  const product = await db.product.findUnique({
    where: {id: parsed.data.productId},
    select: {id: true, slug: true, category: {select: {slug: true}}},
  });
  if (!product) return {status: 'error'};

  const existing = await db.review.findUnique({
    where: {productId_userId: {productId: product.id, userId: session.userId}},
  });
  if (existing) return {status: 'already'};

  // پیش‌فرض isApproved: false → مدیریتی (schema)
  await db.review.create({
    data: {
      productId: product.id,
      userId: session.userId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  });

  revalidatePath(`/menu/${product.category.slug}/${product.slug}`);

  return {status: 'submitted'};
}