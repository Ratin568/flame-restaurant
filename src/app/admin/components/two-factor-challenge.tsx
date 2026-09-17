'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {ShieldCheck} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';

/**
 * چالش 2FA — توسط admin layout به‌جای محتوا رندر می‌شود.
 * بعد از موفقیت: API یک سشن تازه با twoFactorOk صادر می‌کند
 * و router.refresh() کل درخت ادمین را از سرور دوباره می‌گیرد → پوسته کامل ظاهر می‌شود.
 */
export function TwoFactorChallenge() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function verify() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/2fa/challenge', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({token}),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setError('Invalid or expired code — try again');
      setToken('');
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="grid size-16 place-items-center rounded-full bg-primary/10">
        <ShieldCheck className="size-8 text-primary" />
      </div>

      <div>
        <h1 className="text-xl font-bold">Two-Factor Verification</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the 6-digit code from your authenticator app to access the admin panel.
        </p>
      </div>

      <Input
        value={token}
        onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && token.length === 6) void verify();
        }}
        dir="ltr"
        inputMode="numeric"
        autoFocus
        placeholder="000000"
        className="w-44 text-center text-xl font-mono tracking-widest"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={verify} disabled={pending || token.length !== 6} size="lg" className="w-44">
        {pending ? 'Verifying...' : 'Verify'}
      </Button>
    </main>
  );
}