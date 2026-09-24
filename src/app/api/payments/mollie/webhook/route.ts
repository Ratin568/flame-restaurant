import {getMolliePayment} from '@/features/payments/providers/mollie';
import {
  completePaymentTransaction,
  markPaymentFailed,
} from '@/features/payments/core/complete';

type MollieMetadata = {
  transactionId?: unknown;
};

function getTransactionId(metadata: unknown): string {
  if (
    typeof metadata !== 'object' ||
    metadata === null ||
    !('transactionId' in metadata)
  ) {
    return '';
  }

  const value = (metadata as MollieMetadata).transactionId;

  return typeof value === 'string' ? value : '';
}

export async function POST(req: Request) {
  const form = await req.formData();
  const id = String(form.get('id') || '');

  if (!id) {
    return new Response('OK');
  }

  const payment = await getMolliePayment(id);
  const transactionId = getTransactionId(payment.metadata);

  if (transactionId) {
    if (['paid', 'authorized'].includes(payment.status)) {
      await completePaymentTransaction({
        transactionId,
        provider: 'MOLLIE',
        providerPaymentId: payment.id,
        providerTransactionId: payment.id,
        amountMinor: Math.round(Number(payment.amount.value) * 100),
        currency: payment.amount.currency,
      });
    } else if (
      ['failed', 'canceled', 'expired'].includes(payment.status)
    ) {
      await markPaymentFailed(
        transactionId,
        `Mollie payment ${payment.status}`,
        payment.status === 'canceled' || payment.status === 'expired',
      );
    }
  }

  return new Response('OK');
}