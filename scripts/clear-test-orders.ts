import {db} from '../src/lib/db';

async function main() {
  const orders = await db.order.findMany({
    select: {
      id: true,
      orderNumber: true,
    },
  });

  console.log(`Found ${orders.length} orders.`);

  if (orders.length === 0) {
    console.log('No orders to delete.');
    return;
  }

  await db.$transaction(async tx => {
    const orderIds = orders.map(order => order.id);

    await tx.paymentTransaction.deleteMany({
      where: {
        orderId: {
          in: orderIds,
        },
      },
    });

    await tx.orderStatusLog.deleteMany({
      where: {
        orderId: {
          in: orderIds,
        },
      },
    });

    await tx.orderItem.deleteMany({
      where: {
        orderId: {
          in: orderIds,
        },
      },
    });

    await tx.order.deleteMany({
      where: {
        id: {
          in: orderIds,
        },
      },
    });
  });

  console.log(`Deleted ${orders.length} orders successfully.`);
}

main()
  .catch(error => {
    console.error('Failed to clear orders:', error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });