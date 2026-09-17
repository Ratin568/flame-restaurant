'use client';

import {useActionState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {registerAction, type AuthFormState} from '@/features/auth/actions';

const initialState: AuthFormState = {};

export function RegisterForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  const errorMap: Record<string, string> = {
    emailTaken: t('errors.emailTaken'),
    passwordMismatch: t('errors.passwordMismatch'),
    passwordTooShort: t('errors.passwordTooShort'),
    nameTooShort: t('errors.nameTooShort'),
    invalidEmail: t('errors.invalidEmail'),
    tooManyAttempts: t('errors.tooManyAttempts'),
    generic: t('errors.generic'),
  };

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="text-sm font-medium">{t('name')}</label>
        <Input id="name" name="name" required autoComplete="name" className="mt-1.5" />
      </div>
      <div>
        <label htmlFor="email" className="text-sm font-medium">{t('email')}</label>
        <Input id="email" name="email" type="email" required autoComplete="email" className="mt-1.5" dir="ltr" />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-medium">{t('password')}</label>
        <Input id="password" name="password" type="password" required autoComplete="new-password" className="mt-1.5" dir="ltr" />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="text-sm font-medium">{t('confirmPassword')}</label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" className="mt-1.5" dir="ltr" />
      </div>

      {state?.error && <p className="text-sm text-destructive">{errorMap[state.error] ?? t('errors.generic')}</p>}

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? '...' : t('registerCta')}
      </Button>

      <input type="hidden" name="locale" value={locale} />
    </form>
  );
}