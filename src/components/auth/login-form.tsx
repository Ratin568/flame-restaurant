'use client';

import {useActionState, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {Eye, EyeOff, Loader2} from 'lucide-react';
import {motion} from 'framer-motion';
import {Input} from '@/components/ui/input';
import {Link} from '@/i18n/navigation';
import {loginAction, type AuthFormState} from '@/features/auth/actions';

const initialState: AuthFormState = {};

export function LoginForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  const errorMap: Record<string, string> = {
    invalidCredentials: t('errors.invalidCredentials'),
    invalidEmail: t('errors.invalidEmail'),
    tooManyAttempts: t('errors.tooManyAttempts'),
    generic: t('errors.generic'),
    emailNotVerified: t('errors.emailNotVerified'),
  };

  return (
    <motion.form
      action={formAction}
      initial={{opacity: 0, y: 18}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.3, ease: 'easeOut'}}
      className="space-y-6"
    >
      {state?.error && (
        <motion.div
          initial={{opacity: 0, height: 0, y: -8}}
          animate={{opacity: 1, height: 'auto', y: 0}}
          className="rounded-lg border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive"
          role="alert"
        >
          {errorMap[state.error] ?? t('errors.generic')}
        </motion.div>
      )}

      <div className="space-y-2">
        <label htmlFor="login-email" className="text-sm font-medium text-foreground">
          {t('email')}
        </label>
        <Input
          id="login-email"
          name="email"
          type="email"
          placeholder="name@example.com"
          required
          autoComplete="email"
          disabled={pending}
          dir="ltr"
          className="h-12 rounded-lg border-border/60 bg-background/60 px-3 text-sm placeholder:text-muted-foreground/60 focus-visible:border-white focus-visible:ring-2 focus-visible:ring-white/25"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="login-password" className="text-sm font-medium text-foreground">
            {t('password')}
          </label>
          <Link href="/forgot-password" className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Forgot password?</Link>
        </div>

        <div className="relative">
          <Input
            id="login-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            required
            minLength={1}
            maxLength={100}
            autoComplete="current-password"
            disabled={pending}
            dir="ltr"
            className="h-12 rounded-lg border-border/60 bg-background/60 px-3 pr-11 text-sm placeholder:text-muted-foreground/60 focus-visible:border-white focus-visible:ring-2 focus-visible:ring-white/25"
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            disabled={pending}
            onClick={() => setShowPassword((value) => !value)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <input type="hidden" name="locale" value={locale} />

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#f4f0e8] bg-[#f4f0e8] px-6 text-sm font-bold tracking-[-0.02em] text-[#090909] shadow-[0_5px_0_0_#aaa7a1] transition-all duration-150 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_7px_0_0_#aaa7a1] active:translate-y-1 active:shadow-[0_1px_0_0_#aaa7a1] disabled:pointer-events-none disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : t('loginCta')}
      </button>
    </motion.form>
  );
}
