import type {OrderStatus} from '@/generated/prisma/client';
import {db} from '@/lib/db';
import {formatPriceUsd} from '@/lib/money';
import {OrderStatusBadge} from '../components/status-badge';
import {updateOrderStatusAction} from './actions';

export const dynamic = 'force-dynamic';

const STATUSES = [
  'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SHIPPING', 'DELIVERED', 'CANCELLED',
] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{status?: string}>;
}) {
  const {status} = await searchParams;
  const filter = (STATUSES as readonly string[]).includes(status ?? '')
    ? (status as OrderStatus)
    : undefined;

  const orders = await db.order.findMany({
    where: filter ? {status: filter} : undefined,
    orderBy: {createdAt: 'desc'},
    take: 100,
    include: {_count: {select: {items: true}}},
  });

  const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat('en-US', {dateStyle: 'short', timeStyle: 'short'}).format(d);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black">Orders</h1>

        {/* فیلتر بدون JS — فرم GET */}
        <form className="flex gap-2">
          <select
            name="status"
            defaultValue={filter ?? ''}
            className="h-9 rounded-md border border-border bg-card px-2 text-sm outline-none"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button className="h-9 rounded-md border border-border px-3 text-sm font-medium transition-colors hover:bg-muted">
            Filter
          </button>
        </form>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        {orders.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">No orders found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                <th className="px-4 py-3 text-start font-medium">Order</th>
                <th className="px-4 py-3 text-start font-medium">Type</th>
                <th className="px-4 py-3 text-start font-medium">Status</th>
                <th className="px-4 py-3 text-start font-medium">Items</th>
                <th className="px-4 py-3 text-start font-medium">Total</th>
                <th className="px-4 py-3 text-start font-medium">Date</th>
                <th className="px-4 py-3 text-start font-medium">Change Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-primary">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3">{order.type}</td>
                  <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-4 py-3">{order._count.items}</td>
                  <td className="px-4 py-3 font-semibold">{formatPriceUsd(Number(order.total))}</td>
                  <td className="px-4 py-3 text-muted-foreground">{fmtDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <form action={updateOrderStatusAction} className="flex gap-1">
                      <input type="hidden" name="orderId" value={order.id} />
                      <select
                        name="status"
                        defaultValue={order.status}
                        className="h-8 rounded-md border border-border bg-card px-1.5 text-xs outline-none"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button className="h-8 rounded-md bg-primary px-2.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                        Set
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}