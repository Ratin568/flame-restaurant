'use client';

import {useState} from 'react';
import Image from 'next/image';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';

type Step = 'idle' | 'scanning' | 'done';

export function TwoFactorSetup({email, hasSecret}: {email: string; hasSecret: boolean}) {
  const [step, setStep] = useState<Step>('idle');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [manualSecret, setManualSecret] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(hasSecret);
  const [pending, setPending] = useState(false);

  async function startSetup() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/2fa/setup', {method: 'POST'});
      const data = await res.json();
      if (!data.qrDataUrl) throw new Error(data.error ?? 'failed');
      setQrDataUrl(data.qrDataUrl);
      setManualSecret(data.secret);
      setStep('scanning');
    } catch {
      setError('Could not start setup');
    } finally {
      setPending(false);
    }
  }

  async function verify() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/2fa/verify', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({token}),
      });
      const data = await res.json();
      if (!data.ok) throw new Error();
      setEnabled(true);
      setStep('done');
    } catch {
      setError('Invalid code — try again');
    } finally {
      setPending(false);
    }
  }

  async function disable() {
    setPending(true);
    try {
      await fetch('/api/admin/2fa/disable', {method: 'POST'});
      setEnabled(false);
      setStep('idle');
    } finally {
      setPending(false);
    }
  }

  if (enabled) {
    return (
      <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-5">
        <p className="font-semibold text-green-600">✓ Two-factor authentication is enabled</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Your admin account is protected with a TOTP authenticator app.
        </p>
        <Button variant="outline" className="mt-4" onClick={disable} disabled={pending}>
          Disable 2FA
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-bold">Set up 2FA</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Protect the admin panel with a rotating 6-digit code from Google Authenticator (or any TOTP app).
      </p>

      {step === 'idle' && (
        <Button className="mt-4" onClick={startSetup} disabled={pending}>
          {pending ? '...' : 'Start Setup'}
        </Button>
      )}

      {step === 'scanning' && qrDataUrl && (
        <div className="mt-4 space-y-4">
          <Image src={qrDataUrl} alt="2FA QR code" width={180} height={180} unoptimized />
          <p className="text-xs text-muted-foreground">
            Can&apos;t scan? Enter this key manually: <code className="rounded bg-muted px-1.5 py-0.5" dir="ltr">{manualSecret}</code>
          </p>
          <div>
            <label className="text-sm font-medium">Enter the 6-digit code from the app</label>
            <Input
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              dir="ltr"
              inputMode="numeric"
              placeholder="000000"
              className="mt-1.5 w-40 text-center text-lg font-mono tracking-widest"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={verify} disabled={pending || token.length !== 6}>
            {pending ? 'Verifying...' : 'Verify & Enable'}
          </Button>
        </div>
      )}

      {step === 'done' && (
        <p className="mt-4 rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-600">
          ✓ 2FA enabled successfully!
        </p>
      )}
    </div>
  );
}