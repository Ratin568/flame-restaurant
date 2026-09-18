# 🔥 Flame — Restaurant Ordering Platform

**Flame** is a production-grade, full-stack restaurant ordering platform designed and built from scratch.

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
- Strict Content Security Policy
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
| Resend | Transactional email |
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

### 1. Install dependencies

```bash
npm install
```

### 2. Start PostgreSQL and Redis

```bash
docker compose up -d
```

### 3. Configure environment variables

Create a `.env` file containing the required environment variables for:

- PostgreSQL
- Redis
- Authentication
- Email delivery
- Application configuration

### 4. Push the database schema

```bash
npm run db:push
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

## 📜 License

This project is released under the **MIT License**.

See the [`LICENSE`](LICENSE) file for details.

---

## Author

**Ratin Karami**

Designed, built, and deployed end-to-end.

**Live Demo:**  
https://flame-restaurant-ruby.vercel.app/
