import 'server-only';
import {cookies, headers} from 'next/headers';
import {SignJWT, jwtVerify} from 'jose';
import {db} from '@/lib/db';
import {randomUUID} from 'node:crypto';

const SESSION_COOKIE = 'flame-session';
const MAX_AGE = 60 * 60 * 24 * 7;

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  sessionId: string;
  twoFactorOk?: boolean;
};

function getDeviceLabel(userAgent: string | null): string | null {
  if (!userAgent) return null;
  if (/iPhone|iPad/i.test(userAgent)) return 'iPhone / iPad';
  if (/Android/i.test(userAgent)) return 'Android';
  if (/Windows/i.test(userAgent)) return 'Windows';
  if (/Mac OS X|Macintosh/i.test(userAgent)) return 'macOS';
  if (/Linux/i.test(userAgent)) return 'Linux';
  return 'Unknown device';
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error('AUTH_SECRET is missing or too short (min 32 chars) — check .env');
  return new TextEncoder().encode(secret);
}

async function requestContext() {
  const hdrs = await headers();
  return {
    ipAddress: hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() || hdrs.get('x-real-ip') || null,
    userAgent: hdrs.get('user-agent') || null,
  };
}

export async function createSession(payload: Omit<SessionPayload, 'sessionId'>): Promise<void> {
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + MAX_AGE * 1000);
  const ctx = await requestContext();
  await db.session.create({data: {id: sessionId, userId: payload.userId, ipAddress: ctx.ipAddress, userAgent: ctx.userAgent, deviceLabel: getDeviceLabel(ctx.userAgent), expiresAt}});
  const token = await new SignJWT({...payload, sessionId})
    .setProtectedHeader({alg: 'HS256'})
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret());
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: MAX_AGE, path: '/'});
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const {payload} = await jwtVerify<SessionPayload>(token, getSecret());
    if (!payload.sessionId || !payload.userId) return null;
    const session = await db.session.findUnique({where: {id: payload.sessionId}});
    if (!session || session.userId !== payload.userId || session.revokedAt || session.expiresAt <= new Date()) return null;
    await db.session.update({where: {id: session.id}, data: {lastUsedAt: new Date()}});
    return payload;
  } catch { return null; }
}

export async function revokeCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      const {payload} = await jwtVerify<SessionPayload>(token, getSecret(), {clockTolerance: '5s'});
      if (payload.sessionId) await db.session.updateMany({where: {id: payload.sessionId}, data: {revokedAt: new Date()}});
    } catch {}
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
  await db.session.updateMany({where: {userId, revokedAt: null}, data: {revokedAt: new Date()}});
  (await cookies()).delete(SESSION_COOKIE);
}

export async function revokeSessionById(userId: string, sessionId: string): Promise<void> {
  await db.session.updateMany({where: {id: sessionId, userId, revokedAt: null}, data: {revokedAt: new Date()}});
}
