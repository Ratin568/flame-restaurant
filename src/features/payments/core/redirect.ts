import {redirect} from '@/lib/redirects';
import type {Locale} from '@/i18n/routing';

export function paymentSuccess(
  locale: Locale,
  trackingToken: string,
): never {
  return redirect(
    `/order/success?token=${encodeURIComponent(
      trackingToken,
    )}`,
    locale,
  );
}

export function paymentFailure(
  locale: Locale,
  kind = 'failed',
): never {
  return redirect(
    `/checkout?payment=${encodeURIComponent(kind)}`,
    locale,
  );
}