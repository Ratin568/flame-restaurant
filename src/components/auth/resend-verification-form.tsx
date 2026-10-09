'use client';

import {useActionState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {resendVerificationAction, type AuthFormState} from '@/features/auth/actions';
import {Input} from '@/components/ui/input';

export function ResendVerificationForm() {
  const locale = useLocale();
  const t = useTranslations('auth');
  const [state, action, pending] = useActionState(resendVerificationAction, {} as AuthFormState);
  const errorMap: Record<string, string> = {
    tooManyAttempts: t('errors.tooManyAttempts'),
    emailDeliveryFailed: t('errors.emailDeliveryFailed'),
    invalidEmail: t('errors.invalidEmail'),
    generic: t('errors.generic'),
  };

  return (
    <form action={action} className="space-y-6">
      {state.error && <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive" role="alert">{errorMap[state.error] ?? t('errors.generic')}</div>}
      {state.success && <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-400" role="status">{state.success === 'resetEmailSent' ? t('errors.resetEmailSent') : state.success === 'passwordReset' ? t('errors.passwordReset') : t('errors.verificationSent')}</div>}
      <Input name="email" type="email" required maxLength={255} placeholder="name@example.com" autoComplete="email" dir="ltr" className="h-12 rounded-lg border-border/60 bg-background/60 px-3 text-sm placeholder:text-muted-foreground/60 focus-visible:border-white focus-visible:ring-2 focus-visible:ring-white/25" />
      <input type="hidden" name="locale" value={locale} />
      <button disabled={pending} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#f4f0e8] bg-[#f4f0e8] px-6 text-sm font-bold tracking-[-0.02em] text-[#090909] shadow-[0_5px_0_0_#aaa7a1] transition-all duration-150 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_7px_0_0_#aaa7a1] active:translate-y-1 active:shadow-[0_1px_0_0_#aaa7a1] disabled:pointer-events-none disabled:opacity-50">
        {pending ? t('sending') : t('sendVerification')}
      </button>
    </form>
  );
}
