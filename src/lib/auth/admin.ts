import 'server-only';
import {db} from '@/lib/db';
import {getSession, type SessionPayload} from './session';

/**
 * سشن ادمین را برمی‌گرداند فقط اگر:
 * 1) نقش ADMIN باشد
 * 2) اگر 2FA فعال دارد، در این سشن چالش 2FA رد شده باشد
 */
export async function requireAdmin(): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return null;

  // ادمینی که 2FA فعال دارد ولی این سشن هنوز 2FA را رد نکرده → null
  // (layout ادمین او را به صفحه verify هدایت می‌کند)
  if (session.twoFactorOk !== true) {
    const user = await db.user.findUnique({
      where: {id: session.userId},
      select: {twoFactorSecret: true},
    });
    if (user?.twoFactorSecret) return null;
  }

  return session;
}