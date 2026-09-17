'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {LogIn} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';

type SessionUser = {name: string; email: string; role: string};

export function AuthButton() {
  const t = useTranslations('nav');
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/session', {cache: 'no-store'})
      .then((r) => r.json())
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!loaded) {
    return <div className="size-9 animate-pulse rounded-full bg-muted" aria-hidden />;
  }

  return user ? (
    <Link href="/account" title={user.name}>
      <Button variant="ghost" size="icon" aria-label={t('account')}>
        <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {user.name.charAt(0).toUpperCase()}
        </span>
      </Button>
    </Link>
  ) : (
    <Link href="/login">
      <Button variant="ghost" size="sm" className="gap-1.5">
        <LogIn className="size-4" />
        <span className="hidden lg:inline">{t('login')}</span>
      </Button>
    </Link>
  );
}