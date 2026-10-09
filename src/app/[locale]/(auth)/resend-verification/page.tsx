import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import { ResendVerificationForm } from '@/components/auth/resend-verification-form';


export default async function VerifyPage({searchParams}: {searchParams?: Promise<{token?: string}>}) {
  const t = await getTranslations('auth');
  return (
    <section className="mx-auto w-full max-w-md">
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#111111]/95 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.035] via-transparent to-white/[0.015]" />
        <div className="relative z-10 p-8 sm:p-9">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t('verifyTitle')}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t('verifySubtitle')}</p>
          </div>
          <ResendVerificationForm />
          <p className="mt-8 text-center text-sm text-muted-foreground">
            <Link href="/login" className="font-semibold text-foreground underline-offset-4 transition-colors hover:text-white hover:underline">{t('backToSignIn')}</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
