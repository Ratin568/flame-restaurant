import 'dotenv/config';
import {randomUUID} from 'node:crypto';
import {db} from '../../src/lib/db';

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required for integration tests');
  await db.$queryRaw`SELECT 1`;
  console.log('PASS database connection');

  const requiredColumns = new Set([
    'orders.customerEmail',
    'reservations.contactEmail',
    'branches.reservationCapacity',
    'branches.reservationDurationMinutes',
  ]);
  const columns = await db.$queryRaw<Array<{table_name: string; column_name: string}>>`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name IN ('orders', 'reservations', 'branches')
  `;
  for (const column of columns) requiredColumns.delete(`${column.table_name}.${column.column_name}`);
  if (requiredColumns.size) throw new Error(`Migration columns missing: ${[...requiredColumns].join(', ')}`);
  console.log('PASS v14 additive migration columns');

  const code = `QA-${randomUUID().replaceAll('-', '').slice(0, 16).toUpperCase()}`;
  try {
    await db.coupon.create({data: {code, type: 'PERCENT', value: 10, maxUses: 1, usedCount: 0, isActive: true}});
    const results = await Promise.all(Array.from({length: 12}, () => db.$executeRaw`
      UPDATE "coupons"
      SET "usedCount" = "usedCount" + 1
      WHERE "code" = ${code}
        AND "isActive" = true
        AND ("maxUses" IS NULL OR "usedCount" < "maxUses")
    `));
    const accepted = results.reduce((sum, count) => sum + count, 0);
    const coupon = await db.coupon.findUniqueOrThrow({where: {code}});
    if (accepted !== 1 || coupon.usedCount !== 1) {
      throw new Error(`Coupon concurrency guard failed: accepted=${accepted}, usedCount=${coupon.usedCount}`);
    }
    console.log('PASS atomic coupon cap under 12 concurrent updates');
  } finally {
    await db.coupon.deleteMany({where: {code}});
  }
}

main()
  .catch((error) => {
    console.error('FAIL database integration test:', error instanceof Error ? error.message : 'unknown error');
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
