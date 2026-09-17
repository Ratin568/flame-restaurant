import 'server-only';
import {Prisma} from '@/generated/prisma/client';
import {db} from '@/lib/db';
import {getSession} from '@/lib/auth/session';

/**
 * ثبت عملیات ادمین — ساده و مطمئن؛ هرگز مسیر اصلی را نمی‌شکند
 */
export async function auditLog(
  action: string,
  detail?: Prisma.InputJsonValue,
): Promise<void> {
  try {
    const session = await getSession();
    await db.auditLog.create({
      data: {
        userId: session?.userId ?? null,
        action,
        detail: detail ?? undefined,
      },
    });
  } catch {
    // audit مهم است ولی نباید عملیات اصلی را بشکند
  }
}