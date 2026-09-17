import createProxy from 'next-intl/middleware';
import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {routing} from './i18n/routing';
import {buildCsp} from '@/lib/security';

const intlProxy = createProxy(routing);

export default function proxy(request: NextRequest) {
  const response = intlProxy(request);

  // 🔐 CSP روی همه پاسخ‌های عمومی (api/admin خارج از matcher هستند)
  response.headers.set('Content-Security-Policy', buildCsp());

  return response;
}

export const config = {
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
};