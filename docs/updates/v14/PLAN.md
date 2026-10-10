# Flame v14 — Integrated Update Plan

**Base:** `flamev14.zip` (Library snapshot, 739,338 bytes; 316 ZIP entries)
**Candidate:** `flamev14-patch.zip`
**Date:** 2026-10-09

## Scope

Apply the requested update tracks 6–30 as one patch against the v14 source. Items 20 (Flame + FlameBasic merge) and 26 (portfolio/marketing proof work) are `REMOVED FROM SCOPE` and were not implemented.

## Implemented in this patch

1. Extracted deterministic money calculations into `pricing-math.ts`; reject invalid financial values and add unit tests.
2. Validate checkout quantities to 1–99 and reject duplicate/unknown modifiers instead of silently ignoring tampered cart payloads.
3. Reservation date/time validation uses `RESTAURANT_TIME_ZONE`, rejects malformed/impossible/past/DST-gap times, and checks exact-slot conflicts plus overlapping seat capacity under a Serializable transaction. Add branch duration/capacity defaults and query indexes through additive migration.
4. Email delivery now returns a typed result and reports unconfigured providers as failure; the existing Gmail/Resend provider switch is retained.
5. Add a generic event email for order status, payment success/failure and reservation lifecycle changes when a valid customer email is available. Guest order/reservation email fields are optional and existing records remain valid.
6. Add reservation and coupon audit events; order status changes remain paired with status history in a transaction.
7. Rate limiting falls back to bounded process-local windows when Redis is missing/unavailable, with an explicit warning. This is not distributed protection.
8. Add reduced-motion, focus-visible and narrow-table overflow CSS safeguards.
9. Health endpoint does not leak database errors and disables caching.
10. Add locale-correct canonical/hreflang metadata, sitemap alternates/blog entries, safe JSON-LD and factual llms.txt; private/token pages are noindex. Add route loading/error boundaries and skip navigation.
11. Verify payment amount in ISO currency minor units and disable MOCK payments in production; payment failure status is persisted to the order.
12. Add 15 unit tests, PostgreSQL migration/coupon-concurrency integration test, built-app HTTP smoke checks, static QA, i18n audit and CI workflow.

## Existing capabilities preserved

The source already contains localized routing and 12 locale dictionaries, Prisma/PostgreSQL, Redis integration, auth/session/2FA flows, payment provider adapters and callback completion logic, email templates, SEO routes, and admin modules. Existing implementations were not wholesale rewritten.

## Important boundaries

- No live credentials, production DB, payment sandbox, browser session, or deployed host were available.
- Reservation capacity and duration now have database defaults. Per-branch admin UI is not included; configure branch values in the database until that UI exists. Database concurrency checks are CI-gated and were not executed locally.
- Email idempotency keys are correlation hints in the current provider adapter. Gmail SMTP does not guarantee deduplication. Full TypeScript, lint, build, database integration, HTTP smoke, accessibility, mobile, email delivery and provider sandbox checks were not run in this environment.
