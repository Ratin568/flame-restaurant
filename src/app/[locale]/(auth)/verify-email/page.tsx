import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {verifyEmailAction} from '@/features/auth/actions';

export const dynamic = 'force-dynamic';

export default async function VerifyEmailPage({searchParams}:{searchParams:Promise<{token?:string}>}) {
  const {token} = await searchParams;
  const result = token ? await verifyEmailAction(token) : 'invalid';
  const t = await getTranslations('auth');

  const title = result === 'verified' ? t('emailVerified') : result === 'already' ? t('alreadyVerified') : t('invalidVerification');
  const message = result === 'verified' ? t('accountReady') : result === 'already' ? t('alreadyVerified') : t('requestNewVerification');

  return (
    <section className="mx-auto w-full max-w-md">
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#111111]/95 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.035] via-transparent to-white/[0.015]" />
        <div className="relative z-10 p-8 text-center sm:p-9">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{message}</p>
          <Link
            href="/login"
            className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#f4f0e8] bg-[#f4f0e8] px-6 text-sm font-bold tracking-[-0.02em] text-[#090909] shadow-[0_5px_0_0_#aaa7a1] transition-all duration-150 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_7px_0_0_#aaa7a1] active:translate-y-1 active:shadow-[0_1px_0_0_#aaa7a1]">
            {t('backToSignIn')}
          </Link>
        </div>
      </div>
    </section>
  );
}
