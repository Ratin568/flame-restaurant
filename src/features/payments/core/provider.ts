import type {PaymentProviderName, PaymentContext, PaymentResult} from './types';
import {createStripePayment} from '../providers/stripe';
import {createPayPalPayment} from '../providers/paypal';
import {createAdyenPayment} from '../providers/adyen';
import {createMolliePayment} from '../providers/mollie';
import {createZarinPalPayment} from '../providers/zarinpal';
import {createMockPayment} from '../providers/mock';

export async function createProviderPayment(provider: PaymentProviderName, ctx: PaymentContext): Promise<PaymentResult> {
  switch(provider) {
    case 'MOCK': return createMockPayment(ctx);
    case 'STRIPE': return createStripePayment(ctx);
    case 'PAYPAL': return createPayPalPayment(ctx);
    case 'ADYEN': return createAdyenPayment(ctx);
    case 'MOLLIE': return createMolliePayment(ctx);
    case 'ZARINPAL': return createZarinPalPayment(ctx);
    case 'CASH': return {kind:'cash'};
  }
}
