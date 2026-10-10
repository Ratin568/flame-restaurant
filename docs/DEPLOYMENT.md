# Deployment Guide

## Required configuration

- `DATABASE_URL`: PostgreSQL connection string for the target environment.
- `NEXT_PUBLIC_APP_URL`: canonical public HTTPS origin, without a trailing slash.
- `REDIS_URL`: required for shared rate limiting across multiple instances.
- `EMAIL_PROVIDER`: `gmail` or `resend`.
- Gmail: `GMAIL_SMTP_USER`, `GMAIL_SMTP_APP_PASSWORD`, and optionally `GMAIL_SMTP_HOST`, `GMAIL_SMTP_PORT`, `GMAIL_SMTP_SECURE`, `GMAIL_FROM`.
- Resend: `RESEND_API_KEY` and a verified sender in `EMAIL_FROM`.
- Payment-provider secrets only for providers enabled for that deployment.
- Keep mock payment enabled only in local development.

## Release sequence

1. Build and test the candidate in CI.
2. Back up the database and verify that the backup file is non-empty; periodically test restore separately.
3. Deploy code and run `npx prisma migrate deploy` before serving traffic that requires the new schema/index.
4. Confirm `/api/health` reports database readiness without exposing internals.
5. Perform a sandbox payment and email smoke test using non-customer accounts.
6. Monitor server logs, payment failures, authentication failures and order creation errors.
7. If rollback is needed, redeploy the previous application artifact. Do not automatically reverse a migration that only adds an index; assess data and compatibility first.

## Docker (local development)

`docker compose up -d postgres redis` starts the local services. The Compose password default is development-only. Override it for any shared environment and do not expose database ports publicly.


## Reservation time zone

Set `RESTAURANT_TIME_ZONE` to the restaurant's IANA time-zone identifier (for example, `Europe/Rome` or `Asia/Tehran`). Reservation form values are interpreted in this zone, converted to an instant, and nonexistent local times during daylight-saving transitions are rejected. The code default is `UTC`; do not leave that default for a restaurant in another time zone.

## Hardening verification

Run `npm run test:unit`, `npm run qa:i18n`, `npm run qa:static`, `npm run test:integration`, `npm run typecheck`, `npm run lint`, and `npm run build`. The integration test requires a migrated PostgreSQL database and checks the additive migration and atomic coupon-use guard. A green local static/unit run is not a substitute for browser/E2E, provider sandbox, accessibility, and restore/rollback verification.
