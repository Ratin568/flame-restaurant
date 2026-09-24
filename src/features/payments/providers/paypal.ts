import {APP_URL} from '../core/config';
import type {PaymentContext} from '../core/types';

type PayPalLink = {
  rel?: string;
  href?: string;
};

type PayPalAmount = {
  currency_code?: string;
  value?: string;
};

type PayPalCapture = {
  id?: string;
  status?: string;
  amount?: PayPalAmount;
};

type PayPalPayments = {
  captures?: PayPalCapture[];
};

type PayPalPurchaseUnit = {
  payments?: PayPalPayments;
};

type PayPalOrderResponse = {
  id?: string;
  message?: string;
  links?: PayPalLink[];
};

type PayPalCaptureResponse = {
  id?: string;
  status?: string;
  purchase_units?: PayPalPurchaseUnit[];
  [key: string]: unknown;
};

type PayPalRefundResponse = {
  id?: string;
  status?: string;
  [key: string]: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getMessage(data: unknown, fallback: string): string {
  if (
    isRecord(data) &&
    typeof data.message === 'string' &&
    data.message.length > 0
  ) {
    return data.message;
  }

  return fallback;
}

function base() {
  return process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

async function token(): Promise<string> {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;

  if (!id || !secret) {
    throw new Error('PayPal is not configured');
  }

  const response = await fetch(`${base()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });

  const data: unknown = await response.json();

  if (!response.ok) {
    throw new Error(getMessage(data, 'PayPal authentication failed'));
  }

  if (
    !isRecord(data) ||
    typeof data.access_token !== 'string' ||
    data.access_token.length === 0
  ) {
    throw new Error('PayPal authentication response is invalid');
  }

  return data.access_token;
}

export async function paypalToken(): Promise<string> {
  return token();
}

export async function createPayPalPayment(ctx: PaymentContext) {
  const accessToken = await token();

  const response = await fetch(`${base()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': ctx.transactionId,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: ctx.transactionId,
          custom_id: ctx.transactionId,
          invoice_id: ctx.orderNumber,
          amount: {
            currency_code: ctx.currency,
            value: ctx.amount.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: 'Flame',
        user_action: 'PAY_NOW',
        return_url:
          `${APP_URL}/api/payments/paypal/success` +
          `?transaction=${encodeURIComponent(ctx.transactionId)}` +
          `&locale=${encodeURIComponent(ctx.locale)}`,
        cancel_url:
          `${APP_URL}/${ctx.locale}/checkout?payment=canceled`,
      },
    }),
    cache: 'no-store',
  });

  const data: unknown = await response.json();

  if (!response.ok) {
    throw new Error(
      getMessage(data, 'PayPal order creation failed'),
    );
  }

  if (!isRecord(data)) {
    throw new Error('Invalid PayPal order response');
  }

  const order = data as PayPalOrderResponse;

  if (!order.id) {
    throw new Error('PayPal order ID missing');
  }

  const approvalLink = order.links?.find(
    (link) =>
      link.rel === 'approve' &&
      typeof link.href === 'string',
  )?.href;

  if (!approvalLink) {
    throw new Error('PayPal approval URL missing');
  }

  return {
    kind: 'redirect' as const,
    url: approvalLink,
    sessionId: order.id,
  };
}

export async function capturePayPalOrder(
  id: string,
): Promise<PayPalCaptureResponse> {
  const accessToken = await token();

  const response = await fetch(
    `${base()}/v2/checkout/orders/${encodeURIComponent(id)}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': id,
      },
      body: '{}',
      cache: 'no-store',
    },
  );

  const data: unknown = await response.json();

  if (!response.ok) {
    throw new Error(
      getMessage(data, 'PayPal capture failed'),
    );
  }

  if (!isRecord(data)) {
    throw new Error('Invalid PayPal capture response');
  }

  return data as PayPalCaptureResponse;
}

export async function refundPayPal(
  captureId: string,
  amount?: number,
  currency?: string,
): Promise<PayPalRefundResponse> {
  const accessToken = await token();

  const body =
    amount != null && currency
      ? JSON.stringify({
          amount: {
            value: amount.toFixed(2),
            currency_code: currency,
          },
        })
      : '{}';

  const response = await fetch(
    `${base()}/v2/payments/captures/${encodeURIComponent(captureId)}/refund`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': crypto.randomUUID(),
      },
      body,
      cache: 'no-store',
    },
  );

  const data: unknown = await response.json();

  if (!response.ok) {
    throw new Error(
      getMessage(data, 'PayPal refund failed'),
    );
  }

  if (!isRecord(data)) {
    throw new Error('Invalid PayPal refund response');
  }

  return data as PayPalRefundResponse;
}