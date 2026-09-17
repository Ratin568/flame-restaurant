import {redirect as intlRedirect} from '@/i18n/navigation';
import type {Locale} from '@/i18n/routing';

/**
 * redirect با تایپ never
 *
 * چرا؟ تابع redirect خود next-intl تایپش void است، پس TypeScript
 * نمی‌فهمد اجرای تابع بعد از آن تمام می‌شود. نتیجه: ارورهای
 * «possibly undefined» بعد از هر if (!success) redirect(...)
 *
 * این wrapper تایپ never دارد → TS می‌داند جریان کد همین‌جا تمام می‌شود.
 */
export function redirect(href: string, locale: Locale): never {
  intlRedirect({href, locale});
  // intlRedirect درون خودش redirect مربوط به Next.js را throw می‌کند؛
  // این خط فقط برای TypeScript است و هرگز اجرا نمی‌شود.
  throw new Error('UNREACHABLE: redirect should have thrown');
}