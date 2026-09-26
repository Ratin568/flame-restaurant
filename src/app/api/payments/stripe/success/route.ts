import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {
  completePaymentTransaction,
  markPaymentFailed,
} from '@/features/payments/core/complete';
import {getStripeSession} from '@/features/payments/providers/stripe';

export async function GET(req: Request) {
  const u = new URL(req.url);

  const transaction =
    u.searchParams.get('transaction');

  const locale =
    u.searchParams.get('locale') || 'en';

  const sessionId =
    u.searchParams.get('session_id');

  const trackingToken =
    u.searchParams.get('tracking_token');

  if (
    !transaction ||
    !sessionId ||
    !trackingToken
  ) {
    return NextResponse.redirect(
      new URL(
        `/${locale}/checkout?payment=invalid`,
        u,
      ),
    );
  }

  try {
    const payment =
      await db.paymentTransaction.findUnique({
        where: {id: transaction},
        include: {order: true},
      });

    if (
      !payment ||
      payment.provider !== 'STRIPE' ||
      payment.providerSessionId !== sessionId
    ) {
      throw new Error(
        'Invalid Stripe transaction',
      );
    }

    const session =
      await getStripeSession(sessionId);

    if (
      session.payment_status !== 'paid' ||
      session.currency?.toUpperCase() !==
        payment.currency ||
      session.amount_total !==
        Math.round(
          Number(payment.amount) * 100,
        )
    ) {
      throw new Error(
        'Stripe payment verification failed',
      );
    }

    await completePaymentTransaction({
      transactionId: payment.id,
      provider: 'STRIPE',
      providerPaymentId:
        session.payment_intent ??
        sessionId,
      providerTransactionId:
        session.payment_intent ??
        sessionId,
      amountMinor: session.amount_total,
      currency: session.currency,
    });

    return NextResponse.redirect(
      new URL(
        `/${locale}/order/success?token=${encodeURIComponent(
          trackingToken,
        )}`,
        u,
      ),
    );
  } catch (error) {
    await markPaymentFailed(
      transaction,
      error instanceof Error
        ? error.message
        : 'Stripe verification failed',
    );

    return NextResponse.redirect(
      new URL(
        `/${locale}/checkout?payment=failed`,
        u,
      ),
    );
  }
}