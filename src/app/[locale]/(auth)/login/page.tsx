import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {LoginForm} from '@/components/auth/login-form';
import {resolveLocaleParams} from '@/i18n/params';

type Props = {params: Promise<{locale: string}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await resolveLocaleParams(params);
  const t = await getTranslations({locale, namespace: 'auth'});
  return {title: t('loginCta')};
}

export default async function LoginPage({params}: Props) {
  await resolveLocaleParams(params);
  const t = await getTranslations('auth');

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-black">{t('loginTitle')}</CardTitle>
        <CardDescription>{t('loginSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t('noAccount')}{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            {t('registerCta')}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}