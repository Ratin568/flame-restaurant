import 'server-only';
import {Resend} from 'resend';
import type {ReactNode} from 'react';

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM ?? 'Flame <onboarding@resend.dev>';

/** آیا سرویس ایمیل تنظیم شده؟ */
export const emailEnabled = Boolean(apiKey);

/**
 * ارسال ایمیل — هرگز throw نمی‌کند.
 * ایمیل «nice to have» است؛ نباید سفارش/ثبت‌نام را بشکند.
 */
export async function sendEmail({
  to,
  subject,
  content,
}: {
  to: string;
  subject: string;
  content: ReactNode;
}): Promise<boolean> {
  if (!apiKey) {
    console.log(`📧 [email disabled] to=${to} subject="${subject}"`);
    return true;
  }

  try {
    const resend = new Resend(apiKey);
    const {error} = await resend.emails.send({
      from,
      to,
      subject,
      react: content,
    });
    if (error) {
      console.error('📧 Email send error:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('📧 Email failed:', e);
    return false;
  }
}