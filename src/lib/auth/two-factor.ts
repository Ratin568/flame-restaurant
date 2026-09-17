import 'server-only';
import {TOTP, Secret} from 'otpauth';

export function generateTwoFactorSecret(email: string): {secret: string; uri: string} {
  const totp = new TOTP({
    issuer: 'Flame',
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: new Secret({size: 20}),
  });
  return {secret: totp.secret.base32, uri: totp.toString()};
}

export function verifyTwoFactorToken(secret: string, token: string): boolean {
  const totp = new TOTP({
    issuer: 'Flame',
    label: 'Flame',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secret),
  });
  // پنجره ±۱ یعنی کد ۳۰ ثانیه قبل/بعد هم قبول (اختلاف ساعت کاربر)
  return totp.validate({token, window: 1}) !== null;
}