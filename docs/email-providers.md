# Flame Email Providers

Flame has one email interface with two interchangeable providers:

- `gmail` — Gmail SMTP with a Google App Password.
- `resend` — Resend Email API.

The application code does not need to change when switching providers. Change `EMAIL_PROVIDER` and supply the credentials for that provider.

## Local / current setup: Gmail SMTP

1. Open the Gmail account that Flame will use.
2. Enable Google 2-Step Verification.
3. Open Google Account → Security → App passwords.
4. Create a new App Password for Flame.
5. Put the generated 16-character App Password in `GMAIL_SMTP_APP_PASSWORD`.
6. Set `GMAIL_SMTP_USER` to the Gmail address.
7. Set `GMAIL_FROM` to the same Gmail address unless a verified Gmail alias is intentionally configured.
8. Set `EMAIL_PROVIDER=gmail`.
9. Restart the Next.js server.

Example:

```env
EMAIL_PROVIDER="gmail"
GMAIL_SMTP_HOST="smtp.gmail.com"
GMAIL_SMTP_PORT="465"
GMAIL_SMTP_SECURE="true"
GMAIL_SMTP_USER="your-account@gmail.com"
GMAIL_SMTP_APP_PASSWORD="xxxx xxxx xxxx xxxx"
GMAIL_FROM="Flame <your-account@gmail.com>"
```

## Resend setup

Keep the existing Resend variables and set:

```env
EMAIL_PROVIDER="resend"
RESEND_API_KEY="re_xxxxxxxxx"
EMAIL_FROM="Flame <hello@your-verified-domain>"
```

For a Resend production domain, the sending domain must be verified in Resend.

## Important

Never commit `.env`, Gmail App Passwords, or Resend API keys to Git.

The provider selector is intentionally configuration-driven. A buyer can use Gmail or Resend without changing application source code.
