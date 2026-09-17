'use server';

import {headers} from 'next/headers';
import {db} from '@/lib/db';
import {getSession} from '@/lib/auth/session';
import {redirect} from '@/lib/redirects';
import {rateLimit, getClientIp} from '@/lib/rate-limit';
import {sendOrderConfirmationEmail} from '@/lib/email-templates';
import {formatPriceUsd} from '@/lib/money';
import {priceCart} from './pricing';
import {routing, type Locale} from '@/i18n/routing';
import {z} from 'zod';

const checkoutSchema = z.object({
  orderType: z.enum(['DELIVERY', 'PICKUP', 'DINE_IN']),
  name: z.string().min(2).max(80),
  phone: z.string().min(7).max(20),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
  coupon: z.string().max(40).optional(),
});

const itemsSchema = z.array(
  z.object({
    productId: z.string().min(1),
    variant: z
      .object({id: z.string().min(1), name: z.string(), priceDelta: z.number()})
      .nullable(),
    modifiers: z.array(z.object({id: z.string().min(1), name: z.string(), price: z.number()})),
    quantity: z.number().int(),
  }),
);

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `FL-${year}-${random}`;
}

export async function placeOrderAction(formData: FormData): Promise<void> {
  const localeRaw = String(formData.get('locale') ?? '');
  const validLocale = (routing.locales as readonly string[]).includes(localeRaw)
    ? (localeRaw as Locale)
    : routing.defaultLocale;

  // 🚦 ۱۰ سفارش در ۱۰ دقیقه به‌ازای هر IP
  const hdrs = await headers();
  const rl = await rateLimit(`order:${getClientIp(hdrs)}`, 10, 600);
  if (!rl.allowed) redirect('/cart', validLocale);

  const parsed = checkoutSchema.safeParse({
    orderType: formData.get('orderType'),
    name: formData.get('name'),
    phone: formData.get('phone'),
    address: formData.get('address') || undefined,
    city: formData.get('city') || undefined,
    notes: formData.get('notes') || undefined,
    coupon: formData.get('coupon') || undefined,
  });
  if (!parsed.success) redirect('/checkout?error=required', validLocale);

  let rawItems: unknown = null;
  try {
    rawItems = JSON.parse(String(formData.get('items') ?? '[]'));
  } catch {
    redirect('/cart', validLocale);
  }

  const itemsParsed = itemsSchema.safeParse(rawItems);
  if (!itemsParsed.success) redirect('/cart', validLocale);

  const {orderType, name, phone, address, city, notes, coupon} = parsed.data;

  if (orderType === 'DELIVERY' && !address) {
    redirect('/checkout?error=required', validLocale);
  }

  const pricing = await priceCart(validLocale, itemsParsed.data, coupon ?? null, orderType);
  if (!pricing) redirect('/cart', validLocale);

  const session = await getSession();

  // ─── تراکنش: همه یا هیچ ───
  const order = await db.$transaction(async (tx) => {
    let orderNumber = generateOrderNumber();
    for (let i = 0; i < 3; i++) {
      const clash = await tx.order.findUnique({where: {orderNumber}});
      if (!clash) break;
      orderNumber = generateOrderNumber();
    }

    const created = await tx.order.create({
      data: {
        orderNumber,
        userId: session?.userId ?? null,
        type: orderType,
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        deliveryFee: pricing.deliveryFee,
        total: pricing.total,
        paymentStatus: 'UNPAID',
        paymentProvider: 'CASH',
        couponCode: pricing.couponCode,
        addressSnapshot:
          orderType === 'DELIVERY' && address
            ? {name, phone, address, city: city ?? null}
            : undefined,
        phone,
        notes,
        items: {
          create: pricing.lines.map((line) => ({
            productId: line.productId,
            nameSnapshot: line.nameSnapshot,
            variant: line.variant,
            modifiers: line.modifiers,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
          })),
        },
      },
    });

    await tx.orderStatusLog.create({
      data: {orderId: created.id, status: 'PENDING'},
    });

    if (pricing.couponCode) {
      await tx.coupon.update({
        where: {code: pricing.couponCode},
        data: {usedCount: {increment: 1}},
      });
    }

    if (session) {
      await tx.user.update({
        where: {id: session.userId},
        data: {loyaltyPoints: {increment: Math.floor(pricing.total / 10)}},
      });
    }

    return created;
  });

  // ایمیل تایید — فقط برای کاربران لاگین؛ fire-and-forget
  if (session) {
    void sendOrderConfirmationEmail(session.email, {
      name,
      orderNumber: order.orderNumber,
      lines: pricing.lines.map((line) => ({
        nameSnapshot: line.nameSnapshot,
        quantity: line.quantity,
      })),
      total: formatPriceUsd(pricing.total),
    });
  }

  redirect(`/order/success?order=${order.orderNumber}`, validLocale);
}