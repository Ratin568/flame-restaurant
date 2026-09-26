import {APP_URL} from '../core/config';
import type {PaymentContext} from '../core/types';

export async function createStripePayment(
  ctx: PaymentContext,
) {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error('Stripe is not configured');
  }

  const body = new URLSearchParams();

  body.set('mode', 'payment');

  body.set(
    'success_url',
    `${APP_URL}/api/payments/stripe/success?transaction=${ctx.transactionId}&locale=${ctx.locale}&tracking_token=${encodeURIComponent(ctx.trackingToken)}&session_id={CHECKOUT_SESSION_ID}`,
  );

  body.set(
    'cancel_url',
    `${APP_URL}/${ctx.locale}/checkout?payment=canceled`,
  );

  body.set(
    'client_reference_id',
    ctx.transactionId,
  );

  body.set(
    'payment_intent_data[metadata][transactionId]',
    ctx.transactionId,
  );

  body.set(
    'payment_intent_data[metadata][orderId]',
    ctx.orderId,
  );

  body.set(
    'payment_intent_data[metadata][orderNumber]',
    ctx.orderNumber,
  );

  body.set(
    'automatic_tax[enabled]',
    'false',
  );

  body.set(
    'payment_method_collection',
    'always',
  );

  body.set(
    'line_items[0][price_data][currency]',
    ctx.currency.toLowerCase(),
  );

  body.set(
    'line_items[0][price_data][product_data][name]',
    `Flame order ${ctx.orderNumber}`,
  );

  body.set(
    'line_items[0][price_data][unit_amount]',
    String(Math.round(ctx.amount * 100)),
  );

  body.set(
    'line_items[0][quantity]',
    '1',
  );

  body.set(
    'metadata[transactionId]',
    ctx.transactionId,
  );

  body.set(
    'metadata[orderId]',
    ctx.orderId,
  );

  body.set(
    'metadata[orderNumber]',
    ctx.orderNumber,
  );

  const response = await fetch(
    'https://api.stripe.com/v1/checkout/sessions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type':
          'application/x-www-form-urlencoded',
        'Idempotency-Key': ctx.transactionId,
      },
      body,
      cache: 'no-store',
    },
  );

  const data = await response.json();

  if (!response.ok || !data.url) {
    throw new Error(
      data.error?.message ||
        'Stripe checkout creation failed',
    );
  }

  return {
    kind: 'redirect' as const,
    url: data.url,
    sessionId: data.id,
  };
}

export async function getStripeSession(
  id: string,
) {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error('Stripe is not configured');
  }

  const response = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(
      id,
    )}?expand[]=payment_intent`,
    {
      headers: {
        Authorization: `Bearer ${key}`,
      },
      cache: 'no-store',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message ||
        'Stripe session lookup failed',
    );
  }

  return data;
}

export async function refundStripe(
  paymentId: string,
  amountMinor?: number,
) {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error('Stripe is not configured');
  }

  const body = new URLSearchParams({
    payment_intent: paymentId,
  });

  if (amountMinor) {
    body.set(
      'amount',
      String(amountMinor),
    );
  }

  const response = await fetch(
    'https://api.stripe.com/v1/refunds',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type':
          'application/x-www-form-urlencoded',
      },
      body,
      cache: 'no-store',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message ||
        'Stripe refund failed',
    );
  }

  return data;
}