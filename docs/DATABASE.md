# Database Notes

- PostgreSQL is the system of record. Prisma schema: `prisma/schema.prisma`.
- Migrations are in `prisma/migrations/`; deploy them before application rollout with `npx prisma migrate deploy`.
- `20261009000000_v14_hardening` adds a non-destructive composite index on reservation branch/date/status plus nullable `reservations.contactEmail` and `orders.customerEmail` fields. Existing rows are preserved.
- Checkout prices are re-derived from current database product, variant, and modifier prices. Client-supplied prices are not trusted.
- Payment completion uses a conditional state transition and an atomic coupon usage increment for paid orders.
- Reservation creation checks exact branch/time conflicts inside a serializable transaction. This protects a specific slot; the schema does not define a seating-capacity model or reservation duration, so the app must not claim those policies are enforced.
- Back up PostgreSQL before applying migrations. Verify restore procedures in the target environment; a backup that has not been restored in a test is not a verified backup.

## Reservation capacity settings

The additive v14 migration adds `branches.reservationCapacity` (default 40 seats) and `branches.reservationDurationMinutes` (default 90 minutes). Reservation creation checks exact-slot conflicts and overlapping intervals under a Serializable transaction, then rejects a request that would exceed the configured seat capacity. Set `RESTAURANT_TIME_ZONE` to the branch's actual IANA time zone. These settings currently have safe database defaults; configure per-branch values directly in the database until a branch-settings admin UI is implemented.

The migration also adds indexes for availability-filtered products, published blog sitemap queries, and branch/date/status reservation lookups. Apply migrations to a backup-tested database before deployment.
