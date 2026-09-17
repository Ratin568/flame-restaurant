import Link from 'next/link';
import {Clock, DollarSign, Package, ShoppingCart} from 'lucide-react';
import {db} from '@/lib/db';
import {formatPriceUsd} from '@/lib/money';
import {OrderStatusBadge} from './components/status-badge';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayAgg, todayCount, pendingCount, productCount, recentOrders] = await Promise.all([
    db.order.aggregate({_sum: {total: true}, where: {createdAt: {gte: today}}}),
    db.order.count({where: {createdAt: {gte: today}}}),
    db.order.count({where: {status: 'PENDING'}}),
    db.product.count(),
    db.order.findMany({orderBy: {createdAt: 'desc'}, take: 8}),
  ]);

  const cards = [
    {label: "Today's Revenue", value: formatPriceUsd(Number(todayAgg._sum.total ?? 0)), icon: DollarSign},
    {label: "Today's Orders", value: String(todayCount), icon: ShoppingCart},
    {label: 'Pending Orders', value: String(pendingCount), icon: Clock},
    {label: 'Total Products', value: String(productCount), icon: Package},
  ];

  const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat('en-US', {dateStyle: 'short', timeStyle: 'short'}).format(d);

  return (
    <div>
      <h1 className="text-2xl font-black">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({label, value, icon: Icon}) => (
          <div key={label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Icon className="size-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-bold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-primary hover:underline">
            View all →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No orders yet — place a test order from the site!
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-start text-xs uppercase text-muted-foreground">
                <th className="px-5 py-3 text-start font-medium">Order</th>
                <th className="px-5 py-3 text-start font-medium">Type</th>
                <th className="px-5 py-3 text-start font-medium">Status</th>
                <th className="px-5 py-3 text-start font-medium">Total</th>
                <th className="px-5 py-3 text-start font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-border/50 last:border-0">
                  <td className="px-5 py-3 font-mono text-xs font-bold text-primary">{order.orderNumber}</td>
                  <td className="px-5 py-3">{order.type}</td>
                  <td className="px-5 py-3"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-5 py-3 font-semibold">{formatPriceUsd(Number(order.total))}</td>
                  <td className="px-5 py-3 text-muted-foreground">{fmtDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}