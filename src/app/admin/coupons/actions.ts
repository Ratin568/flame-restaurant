'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {db} from '@/lib/db';
import {requireAdmin} from '@/lib/auth/admin';
import {z} from 'zod';

async function guard() {
  const admin = await requireAdmin();
  if (!admin) redirect('/admin');
}

export async function createCouponAction(formData: FormData): Promise<void> {
  await guard();

  const parsed = z
    .object({
      code: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,30}$/),
      type: z.enum(['PERCENT', 'FIXED']),
      value: z.coerce.number().positive(),
      minOrder: z.coerce.number().min(0).nullable(),
      maxUses: z.coerce.number().int().positive().nullable(),
      expiresAt: z.string().nullable(),
    })
    .safeParse({
      code: formData.get('code'),
      type: formData.get('type'),
      value: formData.get('value'),
      minOrder: String(formData.get('minOrder') ?? '').trim() || null,
      maxUses: String(formData.get('maxUses') ?? '').trim() || null,
      expiresAt: String(formData.get('expiresAt') ?? '').trim() || null,
    });

  const invalidValue =
    parsed.success &&
    ((parsed.data.type === 'PERCENT' && parsed.data.value > 100) ||
      (parsed.data.type === 'FIXED' && parsed.data.value > 1000));
  if (!parsed.success || invalidValue) redirect('/admin/coupons?error=invalid');

  const exists = await db.coupon.findUnique({where: {code: parsed.data!.code}});
  if (exists) redirect('/admin/coupons?error=code');

  const {code, type, value, minOrder, maxUses, expiresAt} = parsed.data!;

  await db.coupon.create({
    data: {
      code,
      type,
      value,
      minOrder,
      maxUses,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  revalidatePath('/admin/coupons');
  redirect('/admin/coupons');
}

export async function toggleCouponActiveAction(formData: FormData): Promise<void> {
  await guard();
  const code = String(formData.get('code') ?? '');
  const next = String(formData.get('next')) === 'true';
  if (!code) return;

  await db.coupon.update({where: {code}, data: {isActive: next}});

  revalidatePath('/admin/coupons');
  redirect('/admin/coupons');
}

export async function deleteCouponAction(formData: FormData): Promise<void> {
  await guard();
  const code = String(formData.get('code') ?? '');
  if (!code) return;

  await db.coupon.delete({where: {code}});

  revalidatePath('/admin/coupons');
  redirect('/admin/coupons');
}