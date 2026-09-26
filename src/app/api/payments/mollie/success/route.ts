import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {getMolliePayment} from '@/features/payments/providers/mollie';
import {
  completePaymentTransaction,
  markPaymentFailed,
} from '@/features/payments/core/complete';

export async function GET(req: Request) {
  const u = new URL(req.url);

  const transaction =
    u.searchParams.get('transaction');

  const locale =
    u.searchParams.get('locale') || 'en';

  const trackingToken =
    u.searchParams.get('tracking_token');

  if (!transaction || !trackingToken) {
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
      payment.provider !== 'MOLLIE' ||
      !payment.providerSessionId
    ) {
      throw new Error(
        'Invalid Mollie transaction',
      );
    }

    const data =
      await getMolliePayment(
        payment.providerSessionId,
      );

    if (
      data.status !== 'paid' &&
      data.status !== 'authorized'
    ) {
      throw new Error(
        `Mollie payment is ${data.status}`,
      );
    }

    if (
      data.amount.currency !==
        payment.currency ||
      Number(data.amount.value) !==
        Number(payment.amount)
    ) {
      throw new Error(
        'Mollie amount mismatch',
      );
    }

    await completePaymentTransaction({
      transactionId: payment.id,
      provider: 'MOLLIE',
      providerPaymentId: data.id,
      providerTransactionId: data.id,
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
        : 'Mollie payment failed',
    );

    return NextResponse.redirect(
      new URL(
        `/${locale}/checkout?payment=failed`,
        u,
      ),
    );
  }
}