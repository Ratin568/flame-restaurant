import {
  APP_URL,
  DEFAULT_CURRENCY,
} from '../core/config';
import type {PaymentContext} from '../core/types';

export async function createZarinPalPayment(
  ctx: PaymentContext,
) {
  const merchant =
    process.env.ZARINPAL_MERCHANT_ID;

  if (!merchant) {
    throw new Error(
      'ZarinPal is not configured',
    );
  }

  if (ctx.currency !== 'IRR') {
    throw new Error(
      'ZarinPal requires IRR',
    );
  }

  const response = await fetch(
    'https://payment.zarinpal.com/pg/v4/payment/request.json',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchant_id: merchant,
        amount: Math.round(ctx.amount),
        description: `Flame order ${ctx.orderNumber}`,
        callback_url:
          `${APP_URL}/api/payments/zarinpal/callback` +
          `?transaction=${ctx.transactionId}` +
          `&locale=${ctx.locale}` +
          `&tracking_token=${encodeURIComponent(
            ctx.trackingToken,
          )}`,
      }),
      cache: 'no-store',
    },
  );

  const data = await response.json();

  if (
    !response.ok ||
    data.data?.code !== 100
  ) {
    throw new Error(
      data.errors?.message ||
        'ZarinPal request failed',
    );
  }

  return {
    kind: 'redirect' as const,
    url: `https://www.zarinpal.com/pg/StartPay/${data.data.authority}`,
    sessionId: data.data.authority,
  };
}

export {DEFAULT_CURRENCY};