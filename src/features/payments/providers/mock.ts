import {APP_URL} from '../core/config';
import type {PaymentContext} from '../core/types';

/** Development-only payment provider. It never contacts a real PSP. */
export async function createMockPayment(ctx: PaymentContext) {
  const qs = new URLSearchParams({transaction: ctx.transactionId, locale: ctx.locale});
  return {kind: 'redirect' as const, url: `${APP_URL}/api/payments/mock/checkout?${qs.toString()}`, sessionId: `mock_${ctx.transactionId}`};
}
