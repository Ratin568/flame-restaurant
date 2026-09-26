import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {
  completePaymentTransaction,
  markPaymentFailed,
} from '@/features/payments/core/complete';
import {capturePayPalOrder} from '@/features/payments/providers/paypal';

export async function GET(req: Request) {
  const u = new URL(req.url);

  const transaction =
    u.searchParams.get('transaction');

  const locale =
    u.searchParams.get('locale') || 'en';

  // PayPal's own order token.
  const token =
    u.searchParams.get('token');

  // Flame's private tracking credential.
  const trackingToken =
    u.searchParams.get('tracking_token');

  if (
    !transaction ||
    !token ||
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
      payment.provider !== 'PAYPAL' ||
      payment.providerSessionId !== token
    ) {
      throw new Error(
        'Invalid PayPal transaction',
      );
    }

    const data =
      await capturePayPalOrder(token);

    const capture =
      data.purchase_units?.[0]?.payments
        ?.captures?.[0];

    if (
      data.status !== 'COMPLETED' ||
      !capture?.amount
    ) {
      throw new Error(
        'PayPal capture not completed',
      );
    }

    if (
      capture.amount.currency_code !==
        payment.currency ||
      Number(capture.amount.value) !==
        Number(payment.amount)
    ) {
      throw new Error(
        'PayPal amount mismatch',
      );
    }

    await completePaymentTransaction({
      transactionId: payment.id,
      provider: 'PAYPAL',
      providerPaymentId: capture.id,
      providerTransactionId: capture.id,
      amountMinor: Math.round(
        Number(payment.amount) * 100,
      ),
      currency: payment.currency,
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
        : 'PayPal payment failed',
    );

    return NextResponse.redirect(
      new URL(
        `/${locale}/checkout?payment=failed`,
        u,
      ),
    );
  }
}