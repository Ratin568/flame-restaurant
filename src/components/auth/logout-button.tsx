'use client';

import {useLocale, useTranslations} from 'next-intl';
import {useTransition} from 'react';
import {LogOut} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {logoutAction} from '@/features/auth/actions';

export function LogoutButton() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() => startTransition(() => logoutAction(locale))}
    >
      <LogOut className="size-4" />
      {pending ? '...' : t('logout')}
    </Button>
  );
}