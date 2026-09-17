'use server';

import {revalidatePath} from 'next/cache';
import type {OrderStatus} from '@/generated/prisma/client';
import {db} from '@/lib/db';
import {requireAdmin} from '@/lib/auth/admin';
import {auditLog} from '@/lib/audit';
import {z} from 'zod';

const statusSchema = z.enum([
  'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SHIPPING', 'DELIVERED', 'CANCELLED',
]);

export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;

  const orderId = String(formData.get('orderId') ?? '');
  const parsed = statusSchema.safeParse(formData.get('status'));
  if (!orderId || !parsed.success) return;

  await db.$transaction([
    db.order.update({where: {id: orderId}, data: {status: parsed.data as OrderStatus}}),
    db.orderStatusLog.create({data: {orderId, status: parsed.data as OrderStatus}}),
  ]);

  void auditLog('order.status.update', {orderId, status: parsed.data});

  revalidatePath('/admin/orders');
}