import {db} from '@/lib/db';
import {refundStripe} from '../providers/stripe';
import {refundPayPal} from '../providers/paypal';
import {refundAdyen} from '../providers/adyen';
import {refundMollie} from '../providers/mollie';

type RefundExternalResponse = {
  id?: string;
  pspReference?: string;
  [key: string]: unknown;
};

export async function refundPaymentTransaction(
  transactionId: string,
  amount?: number,
) {
  const payment = await db.paymentTransaction.findUnique({
    where: {id: transactionId},
    include: {order: true},
  });

  if (!payment || payment.status !== 'PAID') {
    throw new Error('Only paid transactions can be refunded');
  }

  const originalAmount = Number(payment.amount);

  const previousRefund =
    typeof payment.metadata === 'object' && payment.metadata
      ? Number(
          (payment.metadata as Record<string, unknown>).refundedAmount ?? 0,
        )
      : 0;

  const value =
    amount == null ? originalAmount - previousRefund : amount;

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Invalid refund amount');
  }

  if (previousRefund + value > originalAmount + 0.0001) {
    throw new Error('Refund amount exceeds the paid amount');
  }

  let external: RefundExternalResponse;

  switch (payment.provider) {
    case 'MOCK':
      external = {
        id: `mock_refund_${payment.id}_${Date.now()}`,
      };
      break;

    case 'STRIPE':
      external = await refundStripe(
        payment.providerPaymentId!,
        Math.round(value * 100),
      );
      break;

    case 'PAYPAL':
      external = await refundPayPal(
        payment.providerTransactionId!,
        value,
        payment.currency,
      );
      break;

    case 'ADYEN':
      external = await refundAdyen(
        payment.providerTransactionId!,
        Math.round(value * 100),
        payment.currency,
      );
      break;

    case 'MOLLIE':
      external = await refundMollie(
        payment.providerPaymentId!,
        value,
        payment.currency,
      );
      break;

    default:
      throw new Error(
        `Refunds are not supported for ${payment.provider}`,
      );
  }

  const totalRefunded = previousRefund + value;
  const fullRefund =
    totalRefunded >= originalAmount - 0.0001;

  const metadata = {
    ...(typeof payment.metadata === 'object' && payment.metadata
      ? payment.metadata
      : {}),
    refundedAmount: totalRefunded,
    lastRefund: {
      amount: value,
      externalId:
        external.id ??
        external.pspReference ??
        null,
      createdAt: new Date().toISOString(),
    },
  };

  await db.paymentTransaction.update({
    where: {id: payment.id},
    data: {
      status: fullRefund ? 'REFUNDED' : 'PAID',
      metadata,
    },
  });

  if (fullRefund) {
    await db.order.update({
      where: {id: payment.orderId},
      data: {paymentStatus: 'REFUNDED'},
    });
  }

  return external;
}