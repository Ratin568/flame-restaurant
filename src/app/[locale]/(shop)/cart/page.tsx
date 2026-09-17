import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {CartView} from '@/features/cart/cart-view';
import {resolveLocaleParams} from '@/i18n/params';

type Props = {params: Promise<{locale: string}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await resolveLocaleParams(params);
  const t = await getTranslations({locale, namespace: 'cart'});
  return {title: t('title')};
}

export default async function CartPage({params}: Props) {
  await resolveLocaleParams(params);
  return <CartView />;
}