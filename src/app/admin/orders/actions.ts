'use server';

import {revalidatePath} from 'next/cache';
import type {OrderStatus} from '@/generated/prisma/client';
import {db} from '@/lib/db';
import {requireAdmin} from '@/lib/auth/admin';
import {auditLog} from '@/lib/audit';
import {sendBusinessEventEmail} from '@/lib/email-templates';
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

  try {
    const changed = await db.$transaction(async (tx) => {
      const updated = await tx.order.updateMany({
        where: {id: orderId, status: {not: parsed.data as OrderStatus}},
        data: {status: parsed.data as OrderStatus},
      });
      if (updated.count !== 1) return false;
      await tx.orderStatusLog.create({data: {orderId, status: parsed.data as OrderStatus}});
      return true;
    });
    if (!changed) return;
  } catch (error) {
    console.error('[admin] order status update failed', error instanceof Error ? error.message : 'unknown error');
    return;
  }

  await auditLog('order.status.update', {orderId, status: parsed.data});
  try {
    const order = await db.order.findUnique({where: {id: orderId}, select: {orderNumber: true, customerEmail: true, user: {select: {email: true}}}});
    const notificationEmail = order?.customerEmail || order?.user?.email;
    if (order && notificationEmail) {
      const labels: Record<string, string> = {
        PENDING: 'Order received', CONFIRMED: 'Order confirmed', PREPARING: 'Your order is being prepared',
        READY: 'Your order is ready', SHIPPING: 'Your order is on the way', DELIVERED: 'Your order was delivered',
        CANCELLED: 'Your order was cancelled',
      };
      void sendBusinessEventEmail(notificationEmail, {
        eventKey: `order-status-${parsed.data.toLowerCase()}`,
        title: labels[parsed.data],
        message: `The status of your Flame order has changed to ${parsed.data.toLowerCase()}.`,
        reference: order.orderNumber,
      }).then((result) => { if (!result.ok) console.error('[notification] order status email failed', result.error); });
    }
  } catch (error) {
    console.error('[notification] order status lookup failed', error instanceof Error ? error.message : 'unknown error');
  }

  revalidatePath('/admin/orders');
}