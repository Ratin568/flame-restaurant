import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {
  completePaymentTransaction,
  markPaymentFailed,
} from '@/features/payments/core/complete';

export async function POST(req: Request) {
  const form = await req.formData();

  const secret = String(form.get('secret') || '');
  const expected =
    process.env.MOCK_WEBHOOK_SECRET || 'flame-local-test-secret';

  if (secret !== expected) {
    return new Response('Invalid mock webhook secret', {
      status: 401,
    });
  }

  const transactionId = String(form.get('transactionId') || '');
  const status = String(form.get('status') || '');

  const amountRaw = form.get('amount');
  const currencyRaw = form.get('currency');

  const p = await db.paymentTransaction.findUnique({
    where: {id: transactionId},
    include: {order: true},
  });

  if (!p || p.provider !== 'MOCK') {
    return new Response('Invalid mock transaction', {
      status: 404,
    });
  }

  if (status === 'paid') {
    const amount =
      amountRaw != null ? Number(String(amountRaw)) : Number(p.amount);

    if (!Number.isFinite(amount) || amount < 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid payment amount',
          transactionId: p.id,
        },
        {status: 400},
      );
    }

    const currency =
      currencyRaw != null
        ? String(currencyRaw).trim().toUpperCase()
        : p.currency;

    try {
      await completePaymentTransaction({
        transactionId: p.id,
        provider: 'MOCK',
        providerPaymentId: `mock_pay_${p.id}`,
        providerTransactionId: `mock_tx_${p.id}`,
        amountMinor: Math.round(amount * 100),
        currency,
      });

      return NextResponse.json({
        ok: true,
        status: 'paid',
        transactionId: p.id,
        orderNumber: p.order.orderNumber,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Payment completion failed';

      return NextResponse.json(
        {
          ok: false,
          error: message,
          transactionId: p.id,
          orderNumber: p.order.orderNumber,
        },
        {status: 400},
      );
    }
  }

  if (!['failed', 'canceled'].includes(status)) {
    return new Response('Invalid mock status', {
      status: 400,
    });
  }

  await markPaymentFailed(
    p.id,
    `Mock payment ${status}`,
    status === 'canceled',
  );

  return NextResponse.json({
    ok: true,
    status,
    transactionId: p.id,
    orderNumber: p.order.orderNumber,
  });
}