import {NextResponse} from 'next/server';
import QRCode from 'qrcode';
import {db} from '@/lib/db';
import {getSession} from '@/lib/auth/session';
import {generateTwoFactorSecret} from '@/lib/auth/two-factor';

export const dynamic = 'force-dynamic';

export async function POST() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({error: 'Forbidden'}, {status: 403});
  }

  const user = await db.user.findUnique({
    where: {id: session.userId},
    select: {twoFactorSecret: true},
  });

  // امنیت: اگر سکرت فعال وجود دارد، بازتولید آن فقط با سشنی که چالش را رد کرده مجاز است
  if (user?.twoFactorSecret && session.twoFactorOk !== true) {
    return NextResponse.json({error: 'Forbidden'}, {status: 403});
  }

  const {secret, uri} = generateTwoFactorSecret(session.email);

  // ذخیره سکرت — تا Verify نشود سشن همچنان گیت 2FA را رد نکرده حساب می‌شود
  await db.user.update({
    where: {id: session.userId},
    data: {twoFactorSecret: secret},
  });

  const qrDataUrl = await QRCode.toDataURL(uri);

  return NextResponse.json({secret, qrDataUrl});
}