'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {db} from '@/lib/db';
import {requireAdmin} from '@/lib/auth/admin';

async function guard() {
  const admin = await requireAdmin();
  if (!admin) redirect('/admin');
}

/** بعد از هر تغییر، صفحه محصول مربوطه هم تازه می‌شود */
async function revalidateProductOfReview(productId: string) {
  const product = await db.product.findUnique({
    where: {id: productId},
    select: {slug: true, category: {select: {slug: true}}},
  });
  if (product) revalidatePath(`/menu/${product.category.slug}/${product.slug}`);
}

export async function setReviewApprovalAction(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get('id') ?? '');
  const next = String(formData.get('next')) === 'true';
  if (!id) return;

  const review = await db.review.findUnique({where: {id}, select: {productId: true}});
  if (!review) return;

  await db.review.update({where: {id}, data: {isApproved: next}});

  await revalidateProductOfReview(review.productId);
  revalidatePath('/admin/reviews');
}

export async function deleteReviewAction(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const review = await db.review.findUnique({where: {id}, select: {productId: true}});
  if (!review) return;

  await db.review.delete({where: {id}});

  await revalidateProductOfReview(review.productId);
  revalidatePath('/admin/reviews');
}