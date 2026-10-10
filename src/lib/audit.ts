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
  } catch (error) {
    // Keep the main operation available, but make audit persistence failures observable.
    console.error('[audit] event persistence failed', {
      action,
      error: error instanceof Error ? error.message : 'unknown error',
    });
  }
}