# Security Review Notes

## Implemented controls present in the codebase

- Server-side role checks for administrative actions and 2FA-aware admin session checks.
- Zod validation on authentication, checkout and reservation input paths.
- HttpOnly session handling and revocation flows in the auth feature.
- Rate limiting uses Redis when available and a process-local fallback when it is not.
- Payment state changes are conditional and provider/amount/currency are checked by the payment completion service when those values are supplied by the provider adapter.
- Health endpoint returns status-only information and does not expose SQL or connection details.
- Email delivery reports unconfigured providers as failures rather than success.

## Limitations / manual verification

- The process-local rate-limit fallback is not distributed; production multi-instance deployments must configure Redis and test outage behavior.
- Security headers and CSP must be verified against all configured payment widgets, analytics, image hosts and deployment domains before tightening further.
- No production credentials, external payment sandbox credentials, browser session, or deployed database were available for this code-only review.
- This document is not a penetration-test report or proof of production security.

## Operational rules

- Never commit `.env*`, tokens, provider secrets, database dumps or customer data.
- Use a Gmail App Password rather than an account password; use a dedicated account for production email.
- Keep `PAYMENT_MOCK_ENABLED` disabled in production.
- Apply migrations with a backup and a rollback plan.

## Additional hardening in this patch

- The MOCK payment provider is unavailable when `NODE_ENV=production`, even if `PAYMENT_MOCK_ENABLED=true` is accidentally set.
- Payment completion compares provider minor units using ISO-4217 currency precision (for example, JPY has zero fractional digits), rather than multiplying every currency by 100.
- JSON-LD serialization escapes HTML parser metacharacters before embedding structured data in a script element.
- Private account, auth, checkout, order-success, and token-bearing tracking pages are marked `noindex`/`noarchive`.
- Reservation dates are interpreted using `RESTAURANT_TIME_ZONE`; invalid time zones and non-existent DST wall-clock times fail closed. Set the environment variable to the actual restaurant zone.
- Admin audit persistence is awaited in the scoped mutation actions; audit failures remain logged and do not throw into the user-facing operation.
- IP-based rate limiting assumes a trusted reverse proxy overwrites `x-real-ip` / `x-forwarded-for`. Do not expose the app directly to untrusted traffic while trusting arbitrary forwarding headers.
