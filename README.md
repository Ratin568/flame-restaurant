# 🔥 Flame — Restaurant Ordering Platform

**Flame** is a full-stack restaurant ordering platform built with Next.js, TypeScript and PostgreSQL. Deployment readiness depends on environment configuration and passing the release checks below.

It simulates the complete workflow of a modern online restaurant — from browsing and customizing menu items to placing orders and tracking them — together with a comprehensive administration platform for managing the restaurant.

## 🌐 Live Preview

**Production Demo:**  
https://flame-restaurant-ruby.vercel.app/

> 🚧 This Hugging Face Space provides a deployment environment for the Flame application.

---

## ✨ Features

### 🛒 Customer Experience

- 🍔 Browse the restaurant menu
- ⚙️ Customize products with sizes and extras
- 🛍️ Shopping cart
- 🎟️ Coupon and discount system
- 📦 Order placement
- 🚚 Live order tracking
- 📅 Restaurant reservations
- ⭐ Customer reviews
- 💬 Customer messaging
- 📝 Restaurant blog

### 🛠️ Admin Dashboard

The built-in administration platform provides management tools for:

- Orders
- Products
- Categories
- Coupons
- Reservations
- Customer messages
- Reviews and moderation
- Blog content
- Audit logs

---

## 🌍 Internationalization

Flame supports **12 languages**:

🇬🇧 English · 🇮🇷 Persian · 🇸🇦 Arabic · 🇨🇳 Chinese · 🇪🇸 Spanish · 🇫🇷 French · 🇩🇪 German · 🇷🇺 Russian · 🇹🇷 Turkish · 🇵🇹 Portuguese · 🇮🇹 Italian · 🇯🇵 Japanese

Internationalization includes:

- Full RTL support for Persian and Arabic
- Locale-aware currency formatting
- Locale-aware date formatting
- Localized routes and content
- Multilingual SEO metadata
- Dynamic sitemap generation
- `hreflang` support

The platform also supports persistent **dark and light themes**.

---

## 🔐 Security

Security is treated as a core part of the application architecture.

Flame includes:

- **Argon2id** password hashing
- Signed **JWT** authentication
- **HttpOnly** session cookies
- **TOTP** two-factor authentication for administrators
- Redis-based rate limiting
- Honeypot protection against automated submissions
- Security headers
- Zod-based input validation
- Administrative audit logging

Sensitive administrative operations are recorded in an audit log for traceability.

---

## 🔎 SEO & AI Search

The application was designed with modern search engines and AI-powered discovery in mind.

It includes:

- Static generation
- Incremental revalidation
- Multilingual sitemap generation
- `hreflang` metadata
- Schema.org JSON-LD
- `Restaurant` structured data
- `Product` structured data
- `FAQ` structured data
- `LocalBusiness` structured data
- `BreadcrumbList` structured data
- `robots.txt` crawler policies
- `llms.txt` for generative search systems

---

## 🧱 Technology Stack

| Technology | Role |
|---|---|
| Next.js 16 | Full-stack React framework |
| App Router | Application architecture |
| Turbopack | Development bundler |
| TypeScript | Type safety |
| PostgreSQL | Primary database |
| Prisma 7 | ORM |
| Redis | Rate limiting |
| Tailwind CSS v4 | Styling |
| shadcn/ui | UI components |
| next-intl | Internationalization |
| Zustand | Cart state management |
| Zod | Validation |
| jose | JWT handling |
| Gmail SMTP / Resend | Transactional email |
| React Email | Email templates |
| Docker | Containerized deployment |

---

## 🖥️ Preview

### Restaurant Storefront

The customer-facing application provides a modern restaurant experience with product customization, cart management, checkout, reservations, reviews, and order tracking.

**Live preview:**  
https://flame-restaurant-ruby.vercel.app/

### Administration

The administration interface provides centralized management of restaurant operations, content, customers, orders, and security-sensitive actions.

---

## 🚀 How to Run

### Requirements

Make sure the following are available:

- Node.js
- npm
- Docker
- PostgreSQL
- Redis

### 1. Start PostgreSQL and Redis

```bash
docker compose up -d postgres redis
```

### 2. Configure environment variables

Create `.env` from `.env.example` and set a valid `DATABASE_URL` before installing dependencies (Prisma generation reads it). Configure Redis, authentication, email and payment variables as needed. Do not use placeholder credentials in a deployed environment.

### 3. Install dependencies

```bash
npm ci
```

### 4. Apply database migrations

For local development, use `npm run db:migrate` when creating/applying development migrations. For an existing environment with committed migrations, use:

```bash
npx prisma migrate deploy
```

### 5. Seed the database

```bash
npm run db:seed
```

### 6. Start the development server

```bash
npm run dev
```

The application will be available on:

```text
http://localhost:3000
```

---


## 🧪 Quality Checks and Technical Docs

Use Node.js 22 for the built-in TypeScript test runner used by the unit test script. After installing dependencies, run:

```bash
npm run qa:i18n
npm run qa:static
npm run test:unit
npm run test:integration
npm run typecheck
npm run lint
npm run build
npm run test:smoke
```

The technical guides are in `docs/`:

- `ARCHITECTURE.md` — request and service boundaries
- `DATABASE.md` — schema, transactions and migrations
- `SECURITY.md` — current controls and review limitations
- `DEPLOYMENT.md` — environment variables, migration and rollback sequence
- `API.md` — route and Server Action inventory
- `CONTRIBUTING.md` — code and testing conventions
- `updates/v14/QA_MATRIX.md` — status of the integrated update tracks

`EMAIL_PROVIDER` selects `gmail` or `resend`. Email delivery is reported as failed when the selected provider is not configured. Set `REDIS_URL` for shared rate limiting in multi-instance deployments; the in-process fallback is not distributed.

A successful unit-test or locale audit does not certify the whole application as production-ready. Run the complete typecheck, lint, build, migration, browser, email and payment-sandbox checks in the target environment before release.

---

## 🤗 Running in a Hugging Face Space

This Space uses the **Docker SDK**.

The application listens on port `3000`:

```yaml
sdk: docker
app_port: 3000
```

The Docker environment is responsible for building and running the application.

For a production deployment, the required environment variables and external services such as PostgreSQL and Redis must be configured separately.

---

## 🗄️ Database

Flame uses **PostgreSQL with Prisma 7**.

The repository contains the complete database architecture, including:

```text
prisma/
├── schema.prisma
├── seed.ts
└── migrations/
```

This allows the application to recreate its database structure and initial restaurant data.

---

## 🏗️ Architecture

Flame is structured as a modern full-stack Next.js application using the App Router.

Major application concerns are separated across:

- Customer storefront
- Administration platform
- Server-side business logic
- Database layer
- Authentication and authorization
- Validation
- Internationalization
- Email delivery
- Rate limiting
- SEO and structured data

The architecture is intended to represent a realistic production application rather than a simple demonstration or CRUD project.

---

## 🧪 Local Payment Testing

Flame includes a development-only `MOCK` payment provider so the complete checkout lifecycle can be tested without a bank account or a live PSP account.

Enable it only in development:

```env
PAYMENT_MOCK_ENABLED=true
MOCK_WEBHOOK_SECRET=flame-local-test-secret
```

The mock flow simulates provider-hosted checkout and webhook outcomes: successful payment, failed payment, and canceled payment. It never moves real money and should remain disabled in production.

For real deployments, customers connect their own supported PSP credentials (for example Stripe, PayPal, Adyen, Mollie, or ZarinPal where applicable).

## ✉️ Email Delivery

Flame supports two interchangeable transactional-email providers behind the same `sendEmail()` interface:

- `gmail` — Gmail SMTP using a Google App Password.
- `resend` — Resend Email API.

Set `EMAIL_PROVIDER` to select the active provider. The inactive provider is not removed from the project, so a buyer can switch providers through environment variables without changing application code.

For Gmail SMTP, enable 2-Step Verification on the Gmail account and create an App Password. Google documents App Passwords as 16-digit credentials available when 2-Step Verification is enabled.

For Resend, keep the existing `RESEND_API_KEY` and `EMAIL_FROM` variables.

## 📜 License

This project is released under the **MIT License**.

See the [`LICENSE`](LICENSE) file for details.

---

## Author

**Ratin Karami**

Designed, built, and deployed end-to-end.

**Live Demo:**  
https://flame-restaurant-ruby.vercel.app/


## 💳 International Payment Engine

Flame uses a provider-agnostic payment architecture. A merchant can enable the payment provider(s) available to their own legal entity and account without changing checkout business logic. Supported adapters include Stripe, PayPal, Adyen, Mollie, ZarinPal and Cash.

Configure credentials in `.env` / deployment secrets. Secrets stay server-side and are never exposed to the browser. Checkout uses provider-hosted payment flows where appropriate, idempotency keys, server-side verification and provider webhooks.

### Supported provider configuration

- `FLAME_DEFAULT_CURRENCY`: merchant checkout currency, for example `EUR`, `USD`, `GBP`, `CAD`, `CHF`.
- Stripe: secret key + webhook secret.
- PayPal: client ID + client secret + webhook ID.
- Adyen: API key + merchant account + webhook HMAC key.
- Mollie: API key.
- ZarinPal: merchant ID + configured USD→IRR conversion.
- Cash: optional manual payment method.

The merchant remains responsible for having an eligible account with the selected payment provider and for configuring the provider-side webhook URL. Flame supplies the integration code; it does not turn Flame itself into a regulated payment institution.

Reservation dates use `RESTAURANT_TIME_ZONE` (IANA identifier, e.g. `Europe/Rome`); the code default is UTC, so set it to the restaurant location before accepting reservations.
