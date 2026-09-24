import crypto from 'node:crypto';

import {
  completePaymentTransaction,
  markPaymentFailed,
} from '@/features/payments/core/complete';

type AdyenAmount = {
  value?: number;
  currency?: string;
};

type AdyenNotificationItem = {
  pspReference?: string;
  originalReference?: string;
  merchantAccountCode?: string;
  merchantReference?: string;
  amount?: AdyenAmount;
  eventCode?: string;
  success?: string;
  reason?: string;
  additionalData?: {
    hmacSignature?: string;
  };
};

type AdyenNotificationWrapper = {
  NotificationRequestItem?: AdyenNotificationItem;
};

type AdyenWebhookBody = {
  notificationItems?: AdyenNotificationWrapper[];
};

function hmac(item: AdyenNotificationItem, key: string) {
  const amount = item.amount ?? {};

  const raw = [
    item.pspReference ?? '',
    item.originalReference ?? '',
    item.merchantAccountCode ?? '',
    item.merchantReference ?? '',
    amount.value ?? '',
    amount.currency ?? '',
    item.eventCode ?? '',
    item.success ?? '',
  ].join(':');

  return crypto
    .createHmac('sha256', Buffer.from(key, 'hex'))
    .update(raw, 'utf8')
    .digest('base64');
}

export async function POST(req: Request) {
  const body: AdyenWebhookBody = await req.json();

  const items = body.notificationItems ?? [];
  const key = process.env.ADYEN_HMAC_KEY;

  if (!key) {
    return new Response('Adyen HMAC key is not configured', {
      status: 503,
    });
  }

  for (const wrapper of items) {
    const item = wrapper.NotificationRequestItem;
    const signature = item?.additionalData?.hmacSignature;

    if (!item || !signature || hmac(item, key) !== signature) {
      return new Response('Invalid HMAC', {
        status: 401,
      });
    }
  }

  for (const wrapper of items) {
    const item = wrapper.NotificationRequestItem;

    if (!item) {
      continue;
    }

    const transactionId = item.merchantReference;

    if (!transactionId) {
      continue;
    }

    if (
      item.eventCode === 'AUTHORISATION' &&
      item.success === 'true'
    ) {
      await completePaymentTransaction({
        transactionId,
        provider: 'ADYEN',
        providerPaymentId: item.pspReference,
        providerTransactionId: item.pspReference,
        amountMinor: item.amount?.value,
        currency: item.amount?.currency,
      });
    } else if (
      item.eventCode === 'AUTHORISATION' &&
      item.success === 'false'
    ) {
      await markPaymentFailed(
        transactionId,
        item.reason || 'Adyen authorization failed',
      );
    }
  }

  return Response.json({
    notificationResponse: '[accepted]',
  });
}