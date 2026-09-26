import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {
  completePaymentTransaction,
  markPaymentFailed,
} from '@/features/payments/core/complete';

export async function GET(req: Request) {
  const u = new URL(req.url);

  const tx =
    u.searchParams.get('transaction');

  const authority =
    u.searchParams.get('Authority');

  const status =
    u.searchParams.get('Status');

  const locale =
    u.searchParams.get('locale') || 'en';

  const trackingToken =
    u.searchParams.get('tracking_token');

  if (
    !tx ||
    !authority ||
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
        where: {id: tx},
        include: {order: true},
      });

    if (
      !payment ||
      payment.provider !== 'ZARINPAL' ||
      payment.providerSessionId !==
        authority ||
      status !== 'OK'
    ) {
      throw new Error(
        'ZarinPal payment canceled or invalid',
      );
    }

    const merchant =
      process.env.ZARINPAL_MERCHANT_ID;

    if (!merchant) {
      throw new Error(
        'ZarinPal not configured',
      );
    }

    const response = await fetch(
      'https://payment.zarinpal.com/pg/v4/payment/verify.json',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          merchant_id: merchant,
          amount: Math.round(
            Number(payment.amount),
          ),
          authority,
        }),
        cache: 'no-store',
      },
    );

    const data =
      await response.json();

    if (
      !response.ok ||
      ![100, 101].includes(
        data.data?.code,
      )
    ) {
      throw new Error(
        'ZarinPal verification failed',
      );
    }

    await completePaymentTransaction({
      transactionId: payment.id,
      provider: 'ZARINPAL',
      providerPaymentId:
        data.data.ref_id
          ? String(data.data.ref_id)
          : authority,
      providerTransactionId:
        data.data.ref_id
          ? String(data.data.ref_id)
          : authority,
      amountMinor: undefined,
      currency: 'IRR',
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
      tx,
      error instanceof Error
        ? error.message
        : 'ZarinPal verification failed',
      status !== 'OK',
    );

    return NextResponse.redirect(
      new URL(
        `/${locale}/checkout?payment=failed`,
        u,
      ),
    );
  }
}