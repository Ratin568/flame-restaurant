import type {PaymentProviderName, ProviderCapabilities} from './types';

export const DEFAULT_CURRENCY = (process.env.FLAME_DEFAULT_CURRENCY || 'EUR').toUpperCase();
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const PROVIDER_CAPABILITIES: Record<PaymentProviderName, ProviderCapabilities> = {
  MOCK: {currencies: ['EUR','USD','GBP','CAD','AUD','CHF','JPY','IRR'], paymentMethods: ['test_card','test_wallet'], refunds: true, hostedCheckout: true},
  STRIPE: {currencies: ['EUR','USD','GBP','CAD','AUD','CHF','JPY'], paymentMethods: ['card','apple_pay','google_pay','ideal','sepa_debit'], refunds: true, hostedCheckout: true},
  PAYPAL: {currencies: ['EUR','USD','GBP','CAD','AUD','CHF','JPY'], paymentMethods: ['paypal','cards'], refunds: true, hostedCheckout: true},
  ADYEN: {currencies: ['EUR','USD','GBP','CAD','AUD','CHF','JPY'], paymentMethods: ['card','apple_pay','google_pay','ideal','paypal','klarna','sepa'], refunds: true, hostedCheckout: true},
  MOLLIE: {currencies: ['EUR','USD','GBP','CHF','CAD','AUD'], paymentMethods: ['creditcard','paypal','applepay','ideal','bancontact','klarna','twint','wero','banktransfer'], refunds: true, hostedCheckout: true},
  ZARINPAL: {currencies: ['IRR'], paymentMethods: ['local_gateway'], refunds: false, hostedCheckout: true},
  CASH: {currencies: ['EUR','USD','GBP','CAD','AUD','CHF','JPY','IRR'], paymentMethods: ['cash'], refunds: false, hostedCheckout: false},
};

export function providerEnabled(p: PaymentProviderName): boolean {
  switch (p) {
    case 'MOCK': return process.env.NODE_ENV !== 'production' && process.env.PAYMENT_MOCK_ENABLED === 'true';
    case 'STRIPE': return Boolean(process.env.STRIPE_SECRET_KEY);
    case 'PAYPAL': return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
    case 'ADYEN': return Boolean(process.env.ADYEN_API_KEY && process.env.ADYEN_MERCHANT_ACCOUNT);
    case 'MOLLIE': return Boolean(process.env.MOLLIE_API_KEY);
    case 'ZARINPAL': return Boolean(process.env.ZARINPAL_MERCHANT_ID);
    case 'CASH': return process.env.PAYMENT_CASH_ENABLED !== 'false';
  }
}

export function enabledProviders(): PaymentProviderName[] {
  return (Object.keys(PROVIDER_CAPABILITIES) as PaymentProviderName[]).filter(providerEnabled);
}

export function assertSupportedCurrency(provider: PaymentProviderName, currency: string) {
  if (!PROVIDER_CAPABILITIES[provider].currencies.includes(currency.toUpperCase())) throw new Error(`${provider} does not support ${currency}`);
}
