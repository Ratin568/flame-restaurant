export type PaymentProviderName = 'MOCK' | 'STRIPE' | 'PAYPAL' | 'ADYEN' | 'MOLLIE' | 'ZARINPAL' | 'CASH';
export type PaymentResult = { kind: 'redirect'; url: string; sessionId?: string } | { kind: 'cash' };
export type PaymentContext = { transactionId: string; orderId: string; orderNumber: string; amount: number; currency: string; locale: string; customerName?: string; customerPhone?: string; customerEmail?: string; };
export type ProviderCapabilities = { currencies: string[]; paymentMethods: string[]; refunds: boolean; hostedCheckout: boolean; };
