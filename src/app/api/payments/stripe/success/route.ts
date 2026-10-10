import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {toMinorUnits} from '@/features/payments/core/currency';
import {completePaymentTransaction, markPaymentFailed} from '@/features/payments/core/complete';
import {getStripeSession} from '@/features/payments/providers/stripe';
import {hashTrackingToken} from '@/lib/order-tracking';

export async function GET(req: Request) {
  const u = new URL(req.url);
  const transaction = u.searchParams.get('transaction');
  const locale = u.searchParams.get('locale') || 'en';
  const sessionId = u.searchParams.get('session_id');
  const trackingToken = u.searchParams.get('tracking_token')?.trim();
  if (!transaction || !sessionId || !trackingToken) return NextResponse.redirect(new URL(`/${locale}/checkout?payment=invalid`, u));
  try {
    const p = await db.paymentTransaction.findUnique({where:{id:transaction},include:{order:true}});
    if (!p || p.provider !== 'STRIPE' || p.providerSessionId !== sessionId || p.order.trackingTokenHash !== hashTrackingToken(trackingToken)) throw new Error('Invalid Stripe transaction');
    const s = await getStripeSession(sessionId);
    if (s.payment_status !== 'paid' || s.currency?.toUpperCase() !== p.currency || s.amount_total !== toMinorUnits(Number(p.amount), p.currency)) throw new Error('Stripe payment verification failed');
    await completePaymentTransaction({transactionId:p.id,provider:'STRIPE',providerPaymentId:s.payment_intent??sessionId,providerTransactionId:s.payment_intent??sessionId,amountMinor:s.amount_total,currency:s.currency});
    return NextResponse.redirect(new URL(`/${locale}/order/success?token=${encodeURIComponent(trackingToken)}`,u));
  } catch (e) { if (transaction) await markPaymentFailed(transaction,e instanceof Error?e.message:'Stripe verification failed'); return NextResponse.redirect(new URL(`/${locale}/checkout?payment=failed`,u)); }
}
