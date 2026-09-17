import {Trash2} from 'lucide-react';
import {formatPriceUsd} from '@/lib/money';
import {createCouponAction, deleteCouponAction, toggleCouponActiveAction} from './actions';
import {db} from '@/lib/db';

export const dynamic = 'force-dynamic';

const inputCls = 'w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none';

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: Promise<{error?: string}>;
}) {
  const {error} = await searchParams;

  const coupons = await db.coupon.findMany({orderBy: {createdAt: 'desc'}});

  return (
    <div>
      <h1 className="text-2xl font-black">Coupons</h1>

      {error && (
        <p className="mt-4 rounded-lg bg-yellow-500/10 px-4 py-3 text-sm text-yellow-600">
          {error === 'code' ? 'This coupon code already exists.' : 'Invalid coupon data.'}
        </p>
      )}

      {/* کوپن جدید */}
      <form action={createCouponAction} className="mt-6 grid gap-3 rounded-xl border border-border bg-card p-5 lg:grid-cols-6">
        <div>
          <label className="text-xs text-muted-foreground">Code</label>
          <input name="code" required dir="ltr" placeholder="FLAME5" className={`${inputCls} mt-1 uppercase`} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Type</label>
          <select name="type" className={`${inputCls} mt-1`}>
            <option value="PERCENT">% Percent</option>
            <option value="FIXED">$ Fixed</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Value</label>
          <input name="value" required type="number" step="0.01" min="0.01" dir="ltr" placeholder="10" className={`${inputCls} mt-1`} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Min order ($)</label>
          <input name="minOrder" type="number" step="0.01" min="0" dir="ltr" className={`${inputCls} mt-1`} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Max uses</label>
          <input name="maxUses" type="number" min="1" dir="ltr" className={`${inputCls} mt-1`} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Expires</label>
          <input name="expiresAt" type="date" dir="ltr" className={`${inputCls} mt-1`} />
        </div>
        <div className="lg:col-span-6">
          <button className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            Create Coupon
          </button>
        </div>
      </form>

      {/* لیست */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        {coupons.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">No coupons yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                <th className="px-4 py-3 text-start font-medium">Code</th>
                <th className="px-4 py-3 text-start font-medium">Discount</th>
                <th className="px-4 py-3 text-start font-medium">Min order</th>
                <th className="px-4 py-3 text-start font-medium">Used</th>
                <th className="px-4 py-3 text-start font-medium">Expires</th>
                <th className="px-4 py-3 text-start font-medium">Status</th>
                <th className="px-4 py-3 text-start font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => {
                const expired = coupon.expiresAt && coupon.expiresAt < new Date();
                return (
                  <tr key={coupon.code} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-3 font-mono font-bold text-primary" dir="ltr">{coupon.code}</td>
                    <td className="px-4 py-3">
                      {coupon.type === 'PERCENT' ? `${Number(coupon.value)}%` : formatPriceUsd(Number(coupon.value))}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {coupon.minOrder ? formatPriceUsd(Number(coupon.minOrder)) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {coupon.usedCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : ''}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {coupon.expiresAt
                        ? new Intl.DateTimeFormat('en-US', {dateStyle: 'medium'}).format(coupon.expiresAt)
                        : 'Never'}
                      {expired && <span className="ms-1 text-red-600">(expired)</span>}
                    </td>
                    <td className="px-4 py-3">
                      <form action={toggleCouponActiveAction}>
                        <input type="hidden" name="code" value={coupon.code} />
                        <input type="hidden" name="next" value={String(!coupon.isActive)} />
                        <button className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-opacity hover:opacity-80 ${coupon.isActive ? 'bg-green-500/15 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                          {coupon.isActive ? 'Active' : 'Off'}
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-3">
                      <form action={deleteCouponAction}>
                        <input type="hidden" name="code" value={coupon.code} />
                        <button className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-600" aria-label={`Delete ${coupon.code}`}>
                          <Trash2 className="size-4" />
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}