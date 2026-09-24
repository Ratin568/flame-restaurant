import crypto from 'node:crypto';
import {NextResponse} from 'next/server';
import {
  completePaymentTransaction,
  markPaymentFailed,
} from '@/features/payments/core/complete';

type StripeMetadata = {
  transactionId?: unknown;
};

type StripePaymentError = {
  message?: unknown;
};

type StripeWebhookObject = {
  id?: unknown;
  metadata?: StripeMetadata | null;
  payment_status?: unknown;
  payment_intent?: unknown;
  amount_total?: unknown;
  amount_received?: unknown;
  currency?: unknown;
  last_payment_error?: StripePaymentError | null;
};

type StripeWebhookEvent = {
  type?: unknown;
  data?: {
    object?: StripeWebhookObject;
  };
};

function verifyStripeSignature(
  body: string,
  signature: string,
  secret: string,
) {
  const pairs = signature
    .split(',')
    .map((part) => part.split('='));

  const timestamp = pairs.find(([key]) => key === 't')?.[1];
  const signatures = pairs
    .filter(([key]) => key === 'v1')
    .map(([, value]) => value);

  if (!timestamp || !signatures.length) {
    return false;
  }

  const age = Math.abs(
    Math.floor(Date.now() / 1000) - Number(timestamp),
  );

  if (!Number.isFinite(age) || age > 300) {
    return false;
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${body}`, 'utf8')
    .digest('hex');

  return signatures.some((value) => {
    const a = Buffer.from(expected, 'hex');
    const b = Buffer.from(value, 'hex');

    return (
      a.length === b.length &&
      crypto.timingSafeEqual(a, b)
    );
  });
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (
    !signature ||
    !secret ||
    !verifyStripeSignature(body, signature, secret)
  ) {
    return new NextResponse('Invalid signature', {
      status: 400,
    });
  }

  let event: StripeWebhookEvent;

  try {
    const parsed: unknown = JSON.parse(body);

    if (
      typeof parsed !== 'object' ||
      parsed === null
    ) {
      return new NextResponse('Invalid JSON', {
        status: 400,
      });
    }

    event = parsed as StripeWebhookEvent;
  } catch {
    return new NextResponse('Invalid JSON', {
      status: 400,
    });
  }

  const object = event.data?.object;
  const metadata = object?.metadata ?? {};
  const transactionId = metadata.transactionId;

  if (!isString(transactionId) || transactionId.length === 0) {
    return NextResponse.json({
      received: true,
    });
  }

  try {
    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      if (
        object?.payment_status === 'paid'
      ) {
        const providerPaymentId =
          isString(object.payment_intent)
            ? object.payment_intent
            : isString(object.id)
              ? object.id
              : undefined;

        if (!providerPaymentId) {
          throw new Error(
            'Stripe payment ID is missing',
          );
        }

        await completePaymentTransaction({
          transactionId,
          provider: 'STRIPE',
          providerPaymentId,
          providerTransactionId: providerPaymentId,
          amountMinor: isNumber(object.amount_total)
            ? object.amount_total
            : undefined,
          currency: isString(object.currency)
            ? object.currency
            : undefined,
        });
      }
    } else if (
      event.type === 'payment_intent.succeeded'
    ) {
      if (!isString(object?.id)) {
        throw new Error(
          'Stripe payment intent ID is missing',
        );
      }

      await completePaymentTransaction({
        transactionId,
        provider: 'STRIPE',
        providerPaymentId: object.id,
        providerTransactionId: object.id,
        amountMinor: isNumber(object.amount_received)
          ? object.amount_received
          : undefined,
        currency: isString(object.currency)
          ? object.currency
          : undefined,
      });
    } else if (
      event.type === 'checkout.session.async_payment_failed' ||
      event.type === 'payment_intent.payment_failed'
    ) {
      const message =
        isString(object?.last_payment_error?.message)
          ? object.last_payment_error.message
          : 'Stripe payment failed';

      await markPaymentFailed(
        transactionId,
        message,
      );
    }
  } catch {
    return new NextResponse(
      'Webhook processing failed',
      {status: 500},
    );
  }

  return NextResponse.json({
    received: true,
  });
}