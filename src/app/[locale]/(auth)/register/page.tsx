import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {RegisterForm} from '@/components/auth/register-form';
import {resolveLocaleParams} from '@/i18n/params';

type Props = {params: Promise<{locale: string}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await resolveLocaleParams(params);
  const t = await getTranslations({locale, namespace: 'auth'});
  return {title: t('registerCta')};
}

export default async function RegisterPage({params}: Props) {
  await resolveLocaleParams(params);
  const t = await getTranslations('auth');

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-black">{t('registerTitle')}</CardTitle>
        <CardDescription>{t('registerSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t('hasAccount')}{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            {t('loginCta')}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}