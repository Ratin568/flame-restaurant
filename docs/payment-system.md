# Flame Payment System

Flame uses a provider-agnostic server-side payment engine. The application never requires the Flame owner/developer to own a bank account or PSP account. A customer deploying Flame supplies credentials for the payment provider they are eligible to use.

## Providers

- Stripe Checkout
- PayPal Checkout
- Adyen Payment Links
- Mollie hosted checkout
- ZarinPal
- Cash on delivery / pickup
- Mock provider for local development

## Security model

- Provider credentials are server-side environment secrets. They are never sent to the browser.
- Stripe webhooks use signed `Stripe-Signature` verification.
- PayPal webhooks are verified through PayPal's verification endpoint.
- Adyen webhooks use HMAC verification.
- Mollie classic webhooks receive only an object ID; Flame fetches the authoritative payment state from Mollie before changing an order.
- ZarinPal is verified server-side before an order becomes paid.
- Payment completion validates provider, amount and currency.
- Payment completion is concurrency-safe: only the request that changes the transaction to `PAID` applies coupon/loyalty side effects.
- Failed/canceled webhooks cannot overwrite a paid or refunded transaction.
- The Mock provider is development-only and must not be enabled in production.

## Checkout lifecycle

`Order -> PaymentTransaction(PENDING) -> PROCESSING -> provider hosted checkout -> webhook/return verification -> PAID`

The browser return URL is only a user-experience path. Provider webhooks/server-side verification are the authoritative payment confirmation paths.

## Dynamic payment methods

Flame does not hard-code card collection in the application. Hosted provider checkouts are used so the merchant's provider account, country, currency and enabled payment methods determine what the shopper can actually use. This is especially important for Stripe, Adyen and Mollie, where available methods depend on the merchant account and transaction context.

## Refunds

Refunds are executed server-side through the provider API. Partial refunds remain `PAID` until the cumulative refunded amount reaches the original transaction amount; only then is the transaction and order marked fully refunded.

## Customer deployment

The customer can use the example environment file as the configuration checklist. They need their own eligible merchant credentials. Flame does not bypass provider onboarding, geographic restrictions, KYC, sanctions controls or bank requirements.

Before going live, the customer should configure HTTPS, provider webhooks, live credentials, production callback URLs, and test each provider in its own sandbox/test environment.
