'use client';

import {useActionState} from 'react';
import {useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';
import {sendMessageAction, type NewsletterState} from '@/features/marketing/actions';

const initialState: NewsletterState = {};

const inputCls =
  'mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary';

export function ContactForm() {
  const t = useTranslations('contact');
  const [state, formAction, pending] = useActionState(sendMessageAction, initialState);

  if (state?.status === 'ok') {
    return (
      <p className="rounded-lg bg-green-500/10 px-4 py-6 text-center text-sm font-medium text-green-600">
        🔥 {t('success')}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-border bg-card p-6">
      <div>
        <label className="text-sm font-medium">{t('name')}</label>
        <input name="name" required minLength={2} maxLength={80} className={inputCls} />
      </div>
      <div>
        <label className="text-sm font-medium">{t('email')}</label>
        <input name="email" type="email" required dir="ltr" className={inputCls} />
      </div>
      <div>
        <label className="text-sm font-medium">{t('message')}</label>
        <textarea name="message" required rows={5} minLength={10} maxLength={2000} className={inputCls} />
      </div>

      {/* 🍯 Honeypot — مخفی از انسان؛ بات‌ها پرش می‌کنند */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state?.status === 'error' && <p className="text-sm text-destructive">{t('error')}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? '...' : `🔥 ${t('send')}`}
      </Button>
    </form>
  );
}