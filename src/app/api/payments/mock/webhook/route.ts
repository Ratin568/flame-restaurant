import {NextResponse} from 'next/server';
import {db} from '@/lib/db'; import {toMinorUnits} from '@/features/payments/core/currency';
import {completePaymentTransaction, markPaymentFailed} from '@/features/payments/core/complete';
import {hashTrackingToken} from '@/lib/order-tracking';

export async function POST(req: Request) {
  const form = await req.formData();
  const secret = String(form.get('secret') || '');
  const expected = process.env.MOCK_WEBHOOK_SECRET || 'flame-local-test-secret';
  if (secret !== expected) return new Response('Invalid mock webhook secret', {status:401});

  const transactionId = String(form.get('transactionId') || '');
  const status = String(form.get('status') || '');
  const trackingToken = String(form.get('trackingToken') || '').trim();
  const amountRaw = form.get('amount');
  const currencyRaw = form.get('currency');
  const locale = String(form.get('locale') || 'en');

  const p = await db.paymentTransaction.findUnique({where:{id:transactionId},include:{order:true}});
  if (!p || p.provider !== 'MOCK') return new Response('Invalid mock transaction', {status:404});
  if (!trackingToken || !p.order.trackingTokenHash || hashTrackingToken(trackingToken) !== p.order.trackingTokenHash) return new Response('Invalid tracking token', {status:403});

  if (status === 'paid') {
    const amount = amountRaw != null ? Number(String(amountRaw)) : Number(p.amount);
    if (!Number.isFinite(amount) || amount < 0) return NextResponse.json({ok:false,error:'Invalid payment amount',transactionId:p.id},{status:400});
    const currency = currencyRaw != null ? String(currencyRaw).trim().toUpperCase() : p.currency;
    try {
      await completePaymentTransaction({transactionId:p.id,provider:'MOCK',providerPaymentId:`mock_pay_${p.id}`,providerTransactionId:`mock_tx_${p.id}`,amountMinor:toMinorUnits(amount, currency),currency});
      return NextResponse.redirect(new URL(`/${locale}/order/success?token=${encodeURIComponent(trackingToken)}`,req.url));
    } catch(error) {
      return NextResponse.json({ok:false,error:error instanceof Error?error.message:'Payment completion failed',transactionId:p.id,orderNumber:p.order.orderNumber},{status:400});
    }
  }

  if (!['failed','canceled'].includes(status)) return new Response('Invalid mock status',{status:400});
  await markPaymentFailed(p.id,`Mock payment ${status}`,status==='canceled');
  return NextResponse.redirect(new URL(`/${locale}/checkout?payment=${status==='canceled'?'canceled':'failed'}`,req.url));
}
