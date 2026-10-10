# QA Matrix — Flame v14 hardening patch (revision 2)

Status definitions: `PASS` means the named local check ran successfully; `IMPLEMENTED` means code is present; `CI-GATED` means the check is wired into GitHub Actions but has not run in this local session; `MANUAL` means browser/provider/production validation remains necessary. This report intentionally does not equate implementation with production certification.

| # | Track | Current status | Evidence / remaining gate |
|---:|---|---|---|
| 6 | Testing Foundation | IMPLEMENTED / CI-GATED | 15 unit tests pass locally. A PostgreSQL integration smoke test is wired into CI and checks migrated columns plus atomic coupon-cap behavior; it cannot run locally here because dependencies/services were unavailable. E2E browser tests still need a browser harness. |
| 7 | Reservation Hardening | IMPLEMENTED / CI-GATED | Strict IANA-zone date/time parsing, DST-gap rejection, branch duration/capacity columns, exact-slot protection, overlap capacity calculation, Serializable transaction and index migration are implemented. DB race test remains to run in CI. Set `RESTAURANT_TIME_ZONE` to the restaurant's actual IANA zone. |
| 8 | i18n Audit | PASS | All 12 locales have 291 leaf keys; missing=0, extra=0. |
| 9 | SEO Preservation | IMPLEMENTED / PASS (unit) | Absolute locale-specific canonical URLs, `hreflang` plus `x-default`, localized sitemap alternates, published blog entries, social images, noindex for private/token pages, safe JSON-LD serialization and factual `llms.txt` are implemented. URL/JSON-LD unit tests pass; live crawler validation remains manual. |
| 10 | Accessibility | IMPLEMENTED / MANUAL | Skip link, visible keyboard focus, reduced-motion CSS, accessible loading/error boundaries, labeled tracking-token input and mobile touch/table safeguards are present. Full keyboard, contrast and screen-reader audit still requires browser/human testing. |
| 11 | Performance Pass | IMPLEMENTED / MANUAL | Decorative hero image uses Next Image; product/blog sitemap filters have supporting indexes; loading boundaries and parallel sitemap queries are present. No bundle, Core Web Vitals, database-load or production profile was run. |
| 12 | Animation Architecture | IMPLEMENTED / MANUAL | Existing animation modules retained, `Reveal` uses `useReducedMotion`, and global reduced-motion styles exist. No full motion-library bundle comparison was possible. |
| 13 | Observability | IMPLEMENTED / MANUAL | Health endpoint hides infrastructure details; audit failures log safely; scoped admin mutation audits are awaited. External error tracking/metrics provider remains unconfigured. |
| 14 | Email / Notifications | IMPLEMENTED / MANUAL | Gmail/Resend provider abstraction and order/payment/reservation lifecycle notifications remain in code. No live provider delivery or bounce/retry test ran; SMTP idempotency is not guaranteed. |
| 15 | Admin Hardening | IMPLEMENTED / MANUAL | Server-side ADMIN/2FA gate retained, scoped admin mutations are audited, order status updates avoid duplicate same-status logs/notifications. Full role-matrix and CSRF/session review still needs live testing. |
| 16 | Database / Transactions | IMPLEMENTED / CI-GATED | Additive migration includes contact emails, branch reservation controls and query indexes. Serializable reservation guard and atomic coupon update remain implemented. Migration and integration test are wired into CI but were not run locally. |
| 17 | Docker / Deployment | IMPLEMENTED / CI-GATED | Compose, health checks, loopback service bindings, env template, migration/CI workflow and deployment/rollback docs exist. GitHub Actions itself has not run from this session; production secret and restore drill remain operator gates. |
| 18 | Documentation | PASS (files present) | README, architecture, database, security, deployment, API, contributing and update logs included. |
| 19 | QA Matrix | PASS (documented) | This matrix records implementation and validation separately. |
| 20 | Flame + FlameBasic merge | REMOVED FROM SCOPE | Explicitly excluded by user decision. |
| 21 | Production Readiness Per Page | IMPLEMENTED / MANUAL | Locale-wide and admin loading/error boundaries now cover route failures; several pages already provide empty/not-found/unauthorized states. Route-by-route browser inspection is still required to certify every state. |
| 22 | UX Improvements | IMPLEMENTED / MANUAL | Server-side form validation, notification flows, accessible loading/error feedback and reservation capacity rules added. Full checkout-to-order browser journey not run. |
| 23 | Mobile-First Improvements | IMPLEMENTED / MANUAL | Responsive layout rules, scrollable tables, touch targets and optimized decorative image are present. Required viewport sweep at 375/390/414/768/1024/1440 still needs a browser. |
| 24 | AI / Search Readiness | IMPLEMENTED / PASS (unit) | Locale-correct canonical/hreflang, sitemap content, safe JSON-LD and non-fabricated `llms.txt` implemented. Live crawler/search-console validation not run. |
| 25 | Final Security Audit | IMPLEMENTED / NOT CERTIFIED | Review fixes include private-route noindex, safe JSON-LD serialization, role check, audit logging, currency-minor-unit verification and proxy-header trust notes. No penetration test, full SAST or production config audit was run. |
| 26 | Portfolio proof / marketing | REMOVED FROM SCOPE | Explicitly excluded by user decision. |
| 27 | Feature Breadth Freeze | PASS | No unrelated feature track added. |
| 28 | Definition of Done | IMPLEMENTED / CI-GATED | Explicit acceptance checks and honest validation status documented; production DoD remains blocked until CI and browser/provider checks pass. |
| 29 | Release Candidate | IMPLEMENTED / NOT CERTIFIED | Updated patch archive can be applied to v14; not production-certified. |
| 30 | Freeze | PASS (scope) | Scope remains frozen; only work in the agreed hardening tracks was changed. |
