import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {CheckoutForm} from '@/features/checkout/checkout-form';
import {resolveLocaleParams} from '@/i18n/params';

type Props = {params: Promise<{locale: string}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await resolveLocaleParams(params);
  const t = await getTranslations({locale, namespace: 'checkout'});
  return {title: t('title')};
}

export default async function CheckoutPage({params}: Props) {
  await resolveLocaleParams(params);
  return <CheckoutForm />;
}