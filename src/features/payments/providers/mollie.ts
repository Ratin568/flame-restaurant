import {APP_URL} from '../core/config';
import type {PaymentContext} from '../core/types';

export async function createMolliePayment(
  ctx: PaymentContext,
) {
  const key = process.env.MOLLIE_API_KEY;

  if (!key) {
    throw new Error(
      'Mollie is not configured',
    );
  }

  const response = await fetch(
    'https://api.mollie.com/v2/payments',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: {
          currency: ctx.currency,
          value: ctx.amount.toFixed(2),
        },
        description: `Flame order ${ctx.orderNumber}`,
        redirectUrl:
          `${APP_URL}/api/payments/mollie/success` +
          `?transaction=${ctx.transactionId}` +
          `&locale=${ctx.locale}` +
          `&tracking_token=${encodeURIComponent(
            ctx.trackingToken,
          )}`,
        webhookUrl:
          `${APP_URL}/api/payments/mollie/webhook`,
        metadata: {
          transactionId: ctx.transactionId,
          orderId: ctx.orderId,
          orderNumber: ctx.orderNumber,
        },
        locale:
          ctx.locale.replace('-', '_'),
      }),
      cache: 'no-store',
    },
  );

  const data = await response.json();

  if (
    !response.ok ||
    !data._links?.checkout?.href
  ) {
    throw new Error(
      data.detail ||
        'Mollie payment creation failed',
    );
  }

  return {
    kind: 'redirect' as const,
    url: data._links.checkout.href,
    sessionId: data.id,
  };
}

export async function getMolliePayment(
  id: string,
) {
  const key = process.env.MOLLIE_API_KEY;

  if (!key) {
    throw new Error(
      'Mollie is not configured',
    );
  }

  const response = await fetch(
    `https://api.mollie.com/v2/payments/${encodeURIComponent(
      id,
    )}`,
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
      data.detail ||
        'Mollie payment lookup failed',
    );
  }

  return data;
}

export async function refundMollie(
  paymentId: string,
  amount: number,
  currency: string,
) {
  const key = process.env.MOLLIE_API_KEY;

  if (!key) {
    throw new Error(
      'Mollie is not configured',
    );
  }

  const response = await fetch(
    `https://api.mollie.com/v2/payments/${encodeURIComponent(
      paymentId,
    )}/refunds`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: {
          value: amount.toFixed(2),
          currency,
        },
      }),
      cache: 'no-store',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || 'Mollie refund failed',
    );
  }

  return data;
}