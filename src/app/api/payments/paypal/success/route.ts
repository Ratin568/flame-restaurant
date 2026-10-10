import {NextResponse} from 'next/server';
import {db} from '@/lib/db'; import {toMinorUnits} from '@/features/payments/core/currency';
import {completePaymentTransaction, markPaymentFailed} from '@/features/payments/core/complete';
import {capturePayPalOrder} from '@/features/payments/providers/paypal';
import {hashTrackingToken} from '@/lib/order-tracking';

export async function GET(req: Request) {
  const u=new URL(req.url), transaction=u.searchParams.get('transaction'), locale=u.searchParams.get('locale')||'en', paypalToken=u.searchParams.get('token'), trackingToken=u.searchParams.get('tracking_token')?.trim();
  if(!transaction||!paypalToken||!trackingToken) return NextResponse.redirect(new URL(`/${locale}/checkout?payment=invalid`,u));
  try {
    const p=await db.paymentTransaction.findUnique({where:{id:transaction},include:{order:true}});
    if(!p||p.provider!=='PAYPAL'||p.providerSessionId!==paypalToken||p.order.trackingTokenHash!==hashTrackingToken(trackingToken)) throw new Error('Invalid PayPal transaction');
    const d=await capturePayPalOrder(paypalToken); const cap=d.purchase_units?.[0]?.payments?.captures?.[0];
    if(d.status!=='COMPLETED'||!cap?.amount||typeof cap.amount.currency_code!=='string'||typeof cap.amount.value!=='string') throw new Error('PayPal capture not completed');
    if(cap.amount.currency_code!==p.currency||toMinorUnits(Number(cap.amount.value), cap.amount.currency_code)!==toMinorUnits(Number(p.amount), p.currency)) throw new Error('PayPal amount mismatch');
    await completePaymentTransaction({transactionId:p.id,provider:'PAYPAL',providerPaymentId:cap.id,providerTransactionId:cap.id,amountMinor:toMinorUnits(Number(cap.amount.value), cap.amount.currency_code),currency:cap.amount.currency_code});
    return NextResponse.redirect(new URL(`/${locale}/order/success?token=${encodeURIComponent(trackingToken)}`,u));
  } catch(e) { await markPaymentFailed(transaction,e instanceof Error?e.message:'PayPal payment failed'); return NextResponse.redirect(new URL(`/${locale}/checkout?payment=failed`,u)); }
}
