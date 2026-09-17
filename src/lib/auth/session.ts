import 'server-only'; // اگر کسی در کامپوننت کلاینتی import کند، build ارور می‌دهد
import {cookies} from 'next/headers';
import {SignJWT, jwtVerify} from 'jose';

const SESSION_COOKIE = 'flame-session';
const MAX_AGE = 60 * 60 * 24 * 7; // ۷ روز (ثانیه)

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  /** آیا در این سشن، چالش 2FA با موفقیت رد شده؟ (فقط برای ادمین‌های 2FA دار معنا دارد) */
  twoFactorOk?: boolean;
};

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('AUTH_SECRET is missing or too short (min 32 chars) — check .env');
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({alg: 'HS256'})
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,   // JS مرورگر به آن دسترسی ندارد (ضد XSS)
    sameSite: 'lax',  // ضده CSRF پایه
    secure: process.env.NODE_ENV === 'production', // فقط HTTPS در production
    maxAge: MAX_AGE,
    path: '/',
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const {payload} = await jwtVerify<SessionPayload>(token, getSecret());
    return payload;
  } catch {
    return null; // توکن منقضی/دستکاری‌شده = بدون سشن
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}