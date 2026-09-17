import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {getSession} from '@/lib/auth/session';
import {createSession} from '@/lib/auth/session';
import {verifyTwoFactorToken} from '@/lib/auth/two-factor';
import {rateLimit} from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({error: 'Forbidden'}, {status: 403});
  }

  const {token} = (await request.json()) as {token?: string};
  if (!token) return NextResponse.json({ok: false}, {status: 400});

  const user = await db.user.findUnique({
    where: {id: session.userId},
    select: {twoFactorSecret: true},
  });
  if (!user?.twoFactorSecret) return NextResponse.json({ok: false}, {status: 400});

  // 🚦 ۵ تلاش در ۵ دقیقه
  const rl = await rateLimit(`2fa:${session.userId}`, 5, 300);
  if (!rl.allowed) return NextResponse.json({ok: false}, {status: 429});

  const ok = verifyTwoFactorToken(user.twoFactorSecret, token);
  if (!ok) return NextResponse.json({ok: false}, {status: 400});

  // ✨ مهم: سشن تازه با تیک twoFactorOk — کاربر بدون وارد کردن مجدد کد، داخل ادمین می‌ماند
  await createSession({
    userId: session.userId,
    email: session.email,
    name: session.name,
    role: session.role,
    twoFactorOk: true,
  });

  return NextResponse.json({ok: true});
}