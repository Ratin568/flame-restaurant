import {db} from '@/lib/db';
import {setReservationStatusAction} from './actions';

export const dynamic = 'force-dynamic';

const STATUSES = ['PENDING', 'CONFIRMED', 'SEATED', 'CANCELLED', 'NO_SHOW'] as const;

const badgeStyles: Record<string, string> = {
  PENDING: 'bg-yellow-500/15 text-yellow-600',
  CONFIRMED: 'bg-green-500/15 text-green-600',
  SEATED: 'bg-blue-500/15 text-blue-600',
  CANCELLED: 'bg-red-500/15 text-red-600',
  NO_SHOW: 'bg-muted text-muted-foreground',
};

export default async function AdminReservationsPage() {
  const reservations = await db.reservation.findMany({
    orderBy: {date: 'asc'},
    include: {branch: {select: {slug: true}}, user: {select: {name: true}}},
    take: 100,
  });

  const fmt = (d: Date) =>
    new Intl.DateTimeFormat('en-US', {dateStyle: 'medium', timeStyle: 'short'}).format(d);

  return (
    <div>
      <h1 className="text-2xl font-black">Reservations</h1>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        {reservations.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">No reservations yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                <th className="px-4 py-3 text-start font-medium">When</th>
                <th className="px-4 py-3 text-start font-medium">Branch</th>
                <th className="px-4 py-3 text-start font-medium">Guests</th>
                <th className="px-4 py-3 text-start font-medium">Booked by</th>
                <th className="px-4 py-3 text-start font-medium">Notes</th>
                <th className="px-4 py-3 text-start font-medium">Status</th>
                <th className="px-4 py-3 text-start font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-3 font-medium">{fmt(r.date)}</td>
                  <td className="px-4 py-3">{r.branch.slug}</td>
                  <td className="px-4 py-3">{r.guests}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.user?.name ?? 'Guest'}</td>
                  <td className="max-w-40 truncate px-4 py-3 text-muted-foreground">{r.notes ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeStyles[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <form action={setReservationStatusAction} className="flex gap-1">
                      <input type="hidden" name="id" value={r.id} />
                      <select name="status" defaultValue={r.status} className="h-8 rounded-md border border-border bg-card px-1.5 text-xs outline-none">
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