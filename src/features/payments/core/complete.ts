import {db} from '@/lib/db';
import type {PaymentProvider} from '@/generated/prisma/client';

export async function completePaymentTransaction(input: {
  transactionId: string;
  provider: PaymentProvider;
  providerPaymentId?: string;
  providerTransactionId?: string;
  amountMinor?: number;
  currency?: string;
}) {
  return db.$transaction(async tx => {
    const payment = await tx.paymentTransaction.findUnique({
      where: {id: input.transactionId},
      include: {order: true},
    });

    if (!payment) throw new Error('Payment transaction not found');
    if (payment.status === 'PAID') return payment;
    if (payment.provider !== input.provider) throw new Error('Payment provider mismatch');
    if (!['PENDING', 'PROCESSING'].includes(payment.status)) {
      throw new Error(`Payment transaction is ${payment.status}`);
    }

    if (input.amountMinor != null && Math.round(Number(payment.amount) * 100) !== input.amountMinor) {
      throw new Error('Payment amount mismatch');
    }
    if (input.currency && payment.currency !== input.currency.toUpperCase()) {
      throw new Error('Payment currency mismatch');
    }

    // The conditional update is the idempotency/concurrency guard. Only the
    // request that changes the transaction to PAID may apply side effects.
    const claimed = await tx.paymentTransaction.updateMany({
      where: {id: payment.id, status: {in: ['PENDING', 'PROCESSING']}},
      data: {
        status: 'PAID',
        providerPaymentId: input.providerPaymentId,
        providerTransactionId: input.providerTransactionId,
        paidAt: new Date(),
        failureReason: null,
      },
    });

    if (claimed.count === 0) {
      return tx.paymentTransaction.findUniqueOrThrow({where: {id: payment.id}});
    }

    await tx.order.update({where: {id: payment.orderId}, data: {paymentStatus: 'PAID'}});

    if (payment.order.couponCode) {
      // Consume the coupon with a single conditional UPDATE. PostgreSQL
      // evaluates the capacity predicate and the increment atomically, so
      // concurrent payment completions cannot push usedCount above maxUses.
      const couponConsumed = await tx.$executeRaw`
        UPDATE "coupons"
        SET "usedCount" = "usedCount" + 1
        WHERE "code" = ${payment.order.couponCode}
          AND "isActive" = true
          AND ("expiresAt" IS NULL OR "expiresAt" > NOW())
          AND ("maxUses" IS NULL OR "usedCount" < "maxUses")
      `;

      if (couponConsumed !== 1) {
        throw new Error('Coupon is no longer available');
      }
    }

    if (payment.order.userId) {
      await tx.user.update({
        where: {id: payment.order.userId},
        data: {loyaltyPoints: {increment: Math.floor(Number(payment.order.total) / 10)}},
      });
    }

    return tx.paymentTransaction.findUniqueOrThrow({where: {id: payment.id}});
  });
}

export async function markPaymentFailed(transactionId: string, reason: string, canceled = false) {
  return db.paymentTransaction.updateMany({
    where: {id: transactionId, status: {in: ['PENDING', 'PROCESSING']}},
    data: {
      status: canceled ? 'CANCELED' : 'FAILED',
      failureReason: reason.slice(0, 500),
    },
  });
}
