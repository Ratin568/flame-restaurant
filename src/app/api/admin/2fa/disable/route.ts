import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {requireAdmin} from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export async function POST() {
  // requireAdmin = فقط کسی که چالش 2FA را رد کرده می‌تواند غیرفعالش کند (امن)
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({error: 'Forbidden'}, {status: 403});

  await db.user.update({
    where: {id: admin.userId},
    data: {twoFactorSecret: null},
  });

  return NextResponse.json({ok: true});
}