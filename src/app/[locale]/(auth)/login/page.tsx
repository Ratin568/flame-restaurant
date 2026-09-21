import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
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
    <section className="mx-auto w-full max-w-md">
      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card/80 shadow-xl backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
        <div className="relative z-10 p-8 sm:p-9">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t('loginTitle')}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t('loginSubtitle')}</p>
          </div>

          <LoginForm />

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t('noAccount')}{' '}
            <Link href="/register" className="font-semibold text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline">
              {t('registerCta')}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
