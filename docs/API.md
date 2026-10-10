# API and Server Action Notes

Flame uses Next.js App Router Server Actions for most form mutations. They are not public REST contracts unless explicitly exposed as route handlers.

| Area | Entry point | Notes |
|---|---|---|
| Health | `GET /api/health` | Readiness-style database check; status only |
| Auth | `src/features/auth/actions.ts` | Registration, login, verification, password reset, session revocation |
| Checkout | `src/features/checkout/actions.ts` | Validates input, derives prices from database records, creates order and payment transaction |
| Reservation | `src/features/reservations/actions.ts` | Validates date/time and checks slot conflicts in a serializable transaction |
| Admin orders | `src/app/admin/orders/actions.ts` | Requires admin session and records status history |
| Admin reservations | `src/app/admin/reservations/actions.ts` | Requires admin session and records an audit event |

All actions must treat FormData, JSON and query parameters as untrusted input. Additions to public route handlers should document authentication, rate limiting, validation, response shape and error behavior.
