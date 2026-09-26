import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {getAdyenPaymentLink} from '@/features/payments/providers/adyen';
import {completePaymentTransaction} from '@/features/payments/core/complete';

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
      payment.provider !== 'ADYEN' ||
      !payment.providerSessionId
    ) {
      throw new Error(
        'Invalid Adyen transaction',
      );
    }

    const data =
      await getAdyenPaymentLink(
        payment.providerSessionId,
      );

    if (data.status !== 'completed') {
      throw new Error(
        `Adyen payment is ${data.status}`,
      );
    }

    if (
      data.amount &&
      (
        data.amount.currency !==
          payment.currency ||
        Number(data.amount.value) !==
          Math.round(
            Number(payment.amount) * 100,
          )
      )
    ) {
      throw new Error(
        'Adyen amount mismatch',
      );
    }

    await completePaymentTransaction({
      transactionId: payment.id,
      provider: 'ADYEN',
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
  } catch {
    return NextResponse.redirect(
      new URL(
        `/${locale}/checkout?payment=pending`,
        u,
      ),
    );
  }
}