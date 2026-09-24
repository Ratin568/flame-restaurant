import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Webhook,
} from 'lucide-react';

import {
  enabledProviders,
  DEFAULT_CURRENCY,
  PROVIDER_CAPABILITIES,
} from '@/features/payments/core/config';
import type {PaymentProviderName} from '@/features/payments/core/types';

export const dynamic = 'force-dynamic';

const configs = [
  [
    'MOCK',
    'PAYMENT_MOCK_ENABLED + MOCK_WEBHOOK_SECRET',
    '/api/payments/mock/webhook',
  ],
  [
    'STRIPE',
    'STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET',
    '/api/payments/stripe/webhook',
  ],
  [
    'PAYPAL',
    'PAYPAL_CLIENT_ID + PAYPAL_CLIENT_SECRET + PAYPAL_WEBHOOK_ID',
    '/api/payments/paypal/webhook',
  ],
  [
    'ADYEN',
    'ADYEN_API_KEY + ADYEN_MERCHANT_ACCOUNT + ADYEN_HMAC_KEY',
    '/api/payments/adyen/webhook',
  ],
  [
    'MOLLIE',
    'MOLLIE_API_KEY',
    '/api/payments/mollie/webhook',
  ],
  [
    'ZARINPAL',
    'ZARINPAL_MERCHANT_ID + ZARINPAL_BASE_TO_IRR',
    '/api/payments/zarinpal/callback',
  ],
  [
    'CASH',
    'PAYMENT_CASH_ENABLED',
    '—',
  ],
] as const satisfies readonly [
  PaymentProviderName,
  string,
  string,
][];

export default function AdminPaymentsPage() {
  const enabled = enabledProviders();

  return (
    <div>
      <div className="flex items-center gap-3">
        <CreditCard className="size-7 text-primary" />

        <div>
          <h1 className="text-2xl font-black">Payments</h1>

          <p className="text-sm text-muted-foreground">
            International, provider-agnostic checkout configuration.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <p className="text-sm">
          <span className="font-semibold">Default currency:</span>{' '}
          {DEFAULT_CURRENCY}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Credentials are deployment secrets. Flame never displays or sends
          secret values to the browser.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {configs.map(([name, required, webhook]) => {
          const on = enabled.includes(name);

          const caps = PROVIDER_CAPABILITIES[name];

          return (
            <section
              key={name}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold">{name}</h2>

                  {on ? (
                    <CheckCircle2 className="size-4 text-green-500" />
                  ) : (
                    <XCircle className="size-4 text-muted-foreground" />
                  )}
                </div>

                <span className="text-xs text-muted-foreground">
                  {on ? 'Configured' : 'Not configured'}
                </span>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                Required: {required}
              </p>

              <div className="mt-3 flex items-start gap-2 rounded-lg bg-muted p-3 text-xs">
                <Webhook className="mt-0.5 size-4 shrink-0" />

                <span>
                  Webhook/callback: <code>{webhook}</code>
                </span>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                Methods: {caps.paymentMethods.join(', ')} · Refunds:{' '}
                {caps.refunds ? 'Yes' : 'No'}
              </p>
            </section>
          );
        })}
      </div>
    </div>
  );
}