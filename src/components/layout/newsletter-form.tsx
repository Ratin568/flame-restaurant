'use client';

import {useActionState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {subscribeAction, type NewsletterState} from '@/features/marketing/actions';

const initialState: NewsletterState = {};

export function NewsletterForm() {
  const t = useTranslations('footer');
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(subscribeAction, initialState);

  if (state?.status === 'ok' || state?.status === 'already') {
    return (
      <p className={`rounded-md px-3 py-2 text-sm ${state.status === 'ok' ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>
        {state.status === 'ok' ? '🔥 Subscribed!' : 'You are already subscribed ✓'}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex gap-2">
      <Input type="email" name="email" required placeholder="you@email.com" dir="ltr" className="min-w-0" />
      <input type="hidden" name="locale" value={locale} />
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? '...' : t('newsletterCta')}
      </Button>
      {state?.status === 'error' && <span className="sr-only">error</span>}
    </form>
  );
}