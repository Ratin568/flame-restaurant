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
import {
  enabledProviders,
  DEFAULT_CURRENCY,
  assertSupportedCurrency,
} from '@/features/payments/core/config';
import {createProviderPayment} from '@/features/payments/core/provider';
import {createTrackingCredentials} from '@/lib/order-tracking';

const checkoutSchema = z.object({
  orderType: z.enum(['DELIVERY', 'PICKUP', 'DINE_IN']),
  name: z.string().min(2).max(80),
  phone: z.string().min(7).max(20),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
  coupon: z.string().max(40).optional(),
  paymentProvider: z.enum([
    'MOCK',
    'STRIPE',
    'PAYPAL',
    'ADYEN',
    'MOLLIE',
    'ZARINPAL',
    'CASH',
  ]),
});

const itemsSchema = z.array(
  z.object({
    productId: z.string().min(1),
    variant: z
      .object({
        id: z.string().min(1),
        name: z.string(),
        priceDelta: z.number(),
      })
      .nullable(),
    modifiers: z.array(
      z.object({
        id: z.string().min(1),
        name: z.string(),
        price: z.number(),
      }),
    ),
    quantity: z.number().int().positive(),
  }),
);

function generateOrderNumber() {
  return `FL-${new Date().getFullYear()}-${Math.floor(
    10000 + Math.random() * 90000,
  )}`;
}

export async function placeOrderAction(
  formData: FormData,
): Promise<void> {
  const localeRaw = String(formData.get('locale') ?? '');

  const locale = (
    routing.locales as readonly string[]
  ).includes(localeRaw)
    ? (localeRaw as Locale)
    : routing.defaultLocale;

  const hdrs = await headers();

  const rl = await rateLimit(
    `order:${getClientIp(hdrs)}`,
    10,
    600,
  );

  if (!rl.allowed) {
    redirect('/cart', locale);
  }

  const parsed = checkoutSchema.safeParse({
    orderType: formData.get('orderType'),
    name: formData.get('name'),
    phone: formData.get('phone'),
    address: formData.get('address') || undefined,
    city: formData.get('city') || undefined,
    notes: formData.get('notes') || undefined,
    coupon: formData.get('coupon') || undefined,
    paymentProvider: formData.get('paymentProvider'),
  });

  if (!parsed.success) {
    redirect('/checkout?error=required', locale);
  }

  let rawItems: unknown;

  try {
    rawItems = JSON.parse(
      String(formData.get('items') ?? '[]'),
    );
  } catch {
    redirect('/cart', locale);
  }

  const itemsParsed = itemsSchema.safeParse(rawItems);

  if (!itemsParsed.success) {
    redirect('/cart', locale);
  }

  const {
    orderType,
    name,
    phone,
    address,
    city,
    notes,
    coupon,
    paymentProvider,
  } = parsed.data;

  if (orderType === 'DELIVERY' && !address) {
    redirect('/checkout?error=required', locale);
  }

  if (!enabledProviders().includes(paymentProvider)) {
    redirect('/checkout?payment=unavailable', locale);
  }

  const pricing = await priceCart(
    locale,
    itemsParsed.data,
    coupon ?? null,
    orderType,
  );

  if (!pricing) {
    redirect('/cart', locale);
  }

  const session = await getSession();

  if (
    paymentProvider === 'ZARINPAL' &&
    Number(
      process.env.ZARINPAL_BASE_TO_IRR ||
        process.env.ZARINPAL_USD_TO_IRR ||
        0,
    ) <= 0
  ) {
    redirect('/checkout?payment=unavailable', locale);
  }

  const currency =
    paymentProvider === 'ZARINPAL'
      ? 'IRR'
      : DEFAULT_CURRENCY;

  assertSupportedCurrency(
    paymentProvider,
    currency,
  );

  const paymentAmount =
    paymentProvider === 'ZARINPAL'
      ? Math.round(
          pricing.total *
            Number(
              process.env.ZARINPAL_BASE_TO_IRR ||
                process.env.ZARINPAL_USD_TO_IRR ||
                0,
            ),
        )
      : pricing.total;

  const tracking = createTrackingCredentials();

  const order = await db.$transaction(async tx => {
    let orderNumber = generateOrderNumber();

    for (let i = 0; i < 8; i++) {
      if (
        !(await tx.order.findUnique({
          where: {orderNumber},
        }))
      ) {
        break;
      }

      orderNumber = generateOrderNumber();
    }

    const created = await tx.order.create({
      data: {
        orderNumber,
        trackingTokenHash: tracking.tokenHash,

        userId: session?.userId ?? null,
        type: orderType,

        subtotal: pricing.subtotal,
        discount: pricing.discount,
        deliveryFee: pricing.deliveryFee,
        tax: 0,
        total: pricing.total,

        paymentStatus: 'UNPAID',
        paymentProvider,
        couponCode: pricing.couponCode,

        paymentTransactions:
          paymentProvider === 'CASH'
            ? undefined
            : {
                create: {
                  provider: paymentProvider,
                  status: 'PENDING',
                  amount: paymentAmount,
                  currency,
                  idempotencyKey: `${orderNumber}:${paymentProvider}`,
                  metadata: {
                    locale,
                    pricingCurrency: DEFAULT_CURRENCY,
                  },
                },
              },

        addressSnapshot:
          orderType === 'DELIVERY' && address
            ? {
                name,
                phone,
                address,
                city: city ?? null,
              }
            : undefined,

        phone,
        notes,

        items: {
          create: pricing.lines.map(line => ({
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
      data: {
        orderId: created.id,
        status: 'PENDING',
      },
    });

    return created;
  });

  if (paymentProvider === 'CASH') {
    await sendConfirmation(
      session,
      name,
      order,
      pricing.lines,
      Number(pricing.total),
      tracking.token,
    );

    redirect(
      `/order/success?token=${encodeURIComponent(
        tracking.token,
      )}`,
      locale,
    );
  }

  const payment =
    await db.paymentTransaction.findFirstOrThrow({
      where: {orderId: order.id},
    });

  const amount = Number(payment.amount);

  let paymentResult: Awaited<
    ReturnType<typeof createProviderPayment>
  >;

  try {
    paymentResult = await createProviderPayment(
      paymentProvider,
      {
        transactionId: payment.id,
        orderId: order.id,
        orderNumber: order.orderNumber,
        trackingToken: tracking.token,
        amount,
        currency: payment.currency,
        locale,
        customerName: name,
        customerPhone: phone,
        customerEmail: session?.email,
      },
    );

    if (paymentResult.kind === 'redirect') {
      await db.paymentTransaction.update({
        where: {id: payment.id},
        data: {
          status: 'PROCESSING',
          providerSessionId:
            paymentResult.sessionId ?? null,
        },
      });
    }
  } catch (error) {
    await db.paymentTransaction.update({
      where: {id: payment.id},
      data: {
        status: 'FAILED',
        failureReason:
          error instanceof Error
            ? error.message
            : 'Payment initialization failed',
      },
    });

    redirect(
      '/checkout?payment=failed',
      locale,
    );
  }

  if (paymentResult.kind === 'redirect') {
    redirect(paymentResult.url, locale);
  }
}

async function sendConfirmation(
  session: {email: string} | null,
  name: string,
  order: {orderNumber: string},
  lines: {
    nameSnapshot: string;
    quantity: number;
  }[],
  total: number,
  trackingToken: string,
) {
  if (session) {
    void sendOrderConfirmationEmail(
      session.email,
      {
        name,
        orderNumber: order.orderNumber,
        lines: lines.map(x => ({
          nameSnapshot: x.nameSnapshot,
          quantity: x.quantity,
        })),
        total: formatPriceUsd(total),
        trackingToken,
      },
    );
  }
}