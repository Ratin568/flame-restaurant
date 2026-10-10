import {db} from '@/lib/db';
import type {PaymentProvider} from '@/generated/prisma/client';
import {sendBusinessEventEmail} from '@/lib/email-templates';
import {toMinorUnits} from './currency';

export async function completePaymentTransaction(input: {
  transactionId: string;
  provider: PaymentProvider;
  providerPaymentId?: string;
  providerTransactionId?: string;
  amountMinor?: number;
  currency?: string;
}) {
  let newlyCompleted = false;
  const completedPayment = await db.$transaction(async tx => {
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

    if (input.amountMinor != null && toMinorUnits(Number(payment.amount), input.currency ?? payment.currency) !== input.amountMinor) {
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
    newlyCompleted = true;

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

  if (newlyCompleted) {
    try {
      const order = await db.order.findUnique({where: {id: completedPayment.orderId}, select: {orderNumber: true, customerEmail: true, user: {select: {email: true}}}});
      const email = order?.customerEmail || order?.user?.email;
      if (order && email) {
        const result = await sendBusinessEventEmail(email, {eventKey: 'payment-success', title: 'Payment received', message: 'Your payment was confirmed successfully.', reference: order.orderNumber});
        if (!result.ok) console.error('[notification] payment success email failed', result.error);
      }
    } catch (error) {
      console.error('[notification] payment success notification lookup failed', error instanceof Error ? error.message : 'unknown error');
    }
  }
  return completedPayment;
}

export async function markPaymentFailed(transactionId: string, reason: string, canceled = false) {
  const result = await db.$transaction(async (tx) => {
    const payment = await tx.paymentTransaction.findUnique({where: {id: transactionId}, select: {id: true, orderId: true}});
    if (!payment) return {count: 0, orderId: null as string | null};
    const changed = await tx.paymentTransaction.updateMany({
      where: {id: transactionId, status: {in: ['PENDING', 'PROCESSING']}},
      data: {
        status: canceled ? 'CANCELED' : 'FAILED',
        failureReason: reason.slice(0, 500),
      },
    });
    if (changed.count > 0 && !canceled) {
      await tx.order.update({where: {id: payment.orderId}, data: {paymentStatus: 'FAILED'}});
    }
    return {count: changed.count, orderId: payment.orderId};
  });
  if (result.count > 0 && !canceled) {
    try {
      const payment = await db.paymentTransaction.findUnique({where: {id: transactionId}, select: {order: {select: {orderNumber: true, customerEmail: true, user: {select: {email: true}}}}}});
      const order = payment?.order;
      const email = order?.customerEmail || order?.user?.email;
      if (order && email) {
        const delivery = await sendBusinessEventEmail(email, {eventKey: 'payment-failed', title: 'Payment could not be confirmed', message: 'We could not confirm your payment. Please review your order before trying again.', reference: order.orderNumber});
        if (!delivery.ok) console.error('[notification] payment failure email failed', delivery.error);
      }
    } catch (error) {
      console.error('[notification] payment failure notification lookup failed', error instanceof Error ? error.message : 'unknown error');
    }
  }
  return {count: result.count};
}
