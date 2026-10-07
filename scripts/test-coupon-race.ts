import 'dotenv/config';

import {db} from '@/lib/db';
import {completePaymentTransaction} from '@/features/payments/core/complete';

const args = process.argv.slice(2);

function getArg(name: string, fallback: string): string {
  const index = args.indexOf(`--${name}`);

  if (index === -1) {
    return fallback;
  }

  return args[index + 1] ?? fallback;
}

async function main() {
  const concurrency = Math.max(
    2,
    Math.min(1000, Number(getArg('concurrency', '100'))),
  );

  const runId = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  const couponCode = `RACE_TEST_${runId}`.toUpperCase();

  const orderIds: string[] = [];
  const transactionIds: string[] = [];

  console.log('');
  console.log('🔥 Flame Coupon Race Condition Test');
  console.log('====================================');
  console.log(`Concurrency : ${concurrency}`);
  console.log(`Coupon      : ${couponCode}`);
  console.log('');

  try {
    // ---------------------------------------------------------
    // 1. Create temporary coupon
    // ---------------------------------------------------------

    await db.coupon.create({
      data: {
        code: couponCode,
        type: 'PERCENT',
        value: 10,
        maxUses: 1,
        usedCount: 0,
        isActive: true,
      },
    });

    console.log('✅ Temporary coupon created (maxUses = 1)');

    // ---------------------------------------------------------
    // 2. Create independent orders + payment transactions
    // ---------------------------------------------------------

    for (let i = 0; i < concurrency; i++) {
      const order = await db.order.create({
        data: {
          orderNumber: `RACE-${runId}-${i}`,
          type: 'DELIVERY',
          status: 'PENDING',

          subtotal: 100,
          discount: 10,
          deliveryFee: 0,
          tax: 0,
          total: 90,

          paymentStatus: 'UNPAID',
          paymentProvider: 'MOCK',

          couponCode,

          paymentTransactions: {
            create: {
              provider: 'MOCK',
              status: 'PENDING',
              amount: 90,
              currency: 'EUR',
              idempotencyKey: `race-${runId}-${i}`,
            },
          },
        },

        include: {
          paymentTransactions: true,
        },
      });

      orderIds.push(order.id);

      const payment = order.paymentTransactions[0];

      if (!payment) {
        throw new Error(
          `Payment transaction missing for order ${order.id}`,
        );
      }

      transactionIds.push(payment.id);
    }

    console.log(
      `✅ Created ${concurrency} pending payment transactions`,
    );

    console.log('');

    // ---------------------------------------------------------
    // 3. Start all completion attempts together
    // ---------------------------------------------------------

    let release!: () => void;

    const gate = new Promise<void>(resolve => {
      release = resolve;
    });

    const startedAt = performance.now();

    const requests = transactionIds.map(
      (transactionId, index) =>
        gate.then(async () => {
          try {
            await completePaymentTransaction({
              transactionId,
              provider: 'MOCK',
              providerPaymentId:
                `race-payment-${runId}-${index}`,
              providerTransactionId:
                `race-transaction-${runId}-${index}`,
            });

            return {
              success: true,
              transactionId,
              error: null,
            };
          } catch (error) {
            return {
              success: false,
              transactionId,
              error:
                error instanceof Error
                  ? error.message
                  : String(error),
            };
          }
        }),
    );

    // Release all requests at once
    release();

    const results = await Promise.all(requests);

    const elapsed = performance.now() - startedAt;

    // ---------------------------------------------------------
    // 4. Read final database state
    // ---------------------------------------------------------

    const coupon = await db.coupon.findUnique({
      where: {
        code: couponCode,
      },
    });

    const payments =
      await db.paymentTransaction.findMany({
        where: {
          id: {
            in: transactionIds,
          },
        },
        select: {
          id: true,
          status: true,
        },
      });

    const successful = results.filter(
      result => result.success,
    );

    const failed = results.filter(
      result => !result.success,
    );

    const paidPayments = payments.filter(
      payment => payment.status === 'PAID',
    );

    const pendingPayments = payments.filter(
      payment => payment.status === 'PENDING',
    );

    // ---------------------------------------------------------
    // 5. Results
    // ---------------------------------------------------------

    console.log('📊 RESULTS');
    console.log('===========');
    console.log(`Requests sent       : ${concurrency}`);
    console.log(
      `Successful payments : ${successful.length}`,
    );
    console.log(
      `Failed payments     : ${failed.length}`,
    );
    console.log(
      `Coupon usedCount    : ${coupon?.usedCount ?? 'N/A'}`,
    );
    console.log(
      `Coupon maxUses      : ${coupon?.maxUses ?? 'N/A'}`,
    );
    console.log(
      `PAID transactions   : ${paidPayments.length}`,
    );
    console.log(
      `PENDING transactions: ${pendingPayments.length}`,
    );
    console.log(
      `Elapsed             : ${elapsed.toFixed(2)} ms`,
    );

    console.log('');

    // ---------------------------------------------------------
    // 6. Failure messages
    // ---------------------------------------------------------

    const errorCounts = new Map<string, number>();

    for (const result of failed) {
      if (!result.error) continue;

      errorCounts.set(
        result.error,
        (errorCounts.get(result.error) ?? 0) + 1,
      );
    }

    if (errorCounts.size > 0) {
      console.log('❌ Failure messages:');

      for (const [message, count] of errorCounts) {
        console.log(`   ${count}x ${message}`);
      }

      console.log('');
    }

    // ---------------------------------------------------------
    // 7. Validate
    // ---------------------------------------------------------

    const raceConditionProtected =
      coupon?.usedCount === 1 &&
      paidPayments.length === 1 &&
      pendingPayments.length === concurrency - 1 &&
      successful.length === 1;

    if (raceConditionProtected) {
      console.log(
        '🟢 RACE CONDITION TEST PASSED',
      );

      console.log('');
      console.log(
        'Exactly ONE payment consumed the coupon.',
      );
      console.log(
        'Coupon usage never exceeded maxUses.',
      );
      console.log(
        'All competing transactions were prevented from consuming it.',
      );
    } else {
      console.log(
        '🔴 RACE CONDITION TEST FAILED',
      );

      console.log('');
      console.log(
        'The final database state does NOT match the expected atomic behavior.',
      );
    }

    console.log('');

    // ---------------------------------------------------------
    // 8. Cleanup
    // ---------------------------------------------------------

    console.log('🧹 Cleaning up test data...');

    await db.order.deleteMany({
      where: {
        id: {
          in: orderIds,
        },
      },
    });

    await db.coupon.delete({
      where: {
        code: couponCode,
      },
    });

    console.log('✅ Test data removed.');
    console.log('');

    process.exitCode = raceConditionProtected
      ? 0
      : 1;
  } catch (error) {
    console.error('');
    console.error('💥 TEST ERROR');

    console.error(
      error instanceof Error
        ? error.stack
        : error,
    );

    // Emergency cleanup
    try {
      if (orderIds.length > 0) {
        await db.order.deleteMany({
          where: {
            id: {
              in: orderIds,
            },
          },
        });
      }

      await db.coupon.deleteMany({
        where: {
          code: couponCode,
        },
      });

      console.log('');
      console.log(
        '🧹 Emergency cleanup completed.',
      );
    } catch (cleanupError) {
      console.error('');
      console.error(
        '⚠️ Cleanup failed:',
        cleanupError,
      );
    }

    process.exitCode = 1;
  } finally {
    await db.$disconnect();
  }
}

void main();