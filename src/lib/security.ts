import 'server-only';

/**
 * Content-Security-Policy سخت‌گیرانه:
 * - default-src 'self' → همه‌چیز فقط از خود سایت
 * - img-src اجازه Cloudinary/S3 برای عکس‌های محصول
 * - frame-ancestors 'none' → کلیک‌جکینگ غیرممکن
 *
 * در حالت dev:
 * - 'unsafe-eval' برای React DevTools (فقط dev — production هرگز eval استفاده نمی‌کند)
 * - ws://localhost برای HMR (Hot Module Replacement) تربوپک
 */
export function buildCsp(): string {
  const isDev = process.env.NODE_ENV === 'development';
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  const scriptSources = ["'self'", "'unsafe-inline'"];
  const connectSources = ["'self'"];

  if (isDev) {
    // فقط برای dev — در production وجود نخواهد داشت
    scriptSources.push("'unsafe-eval'");
    connectSources.push('ws://localhost:*', 'ws://127.0.0.1:*');
  }

  if (gaId) {
    scriptSources.push('https://www.googletagmanager.com', 'https://www.google-analytics.com');
    connectSources.push(
      'https://www.google-analytics.com',
      'https://region1.google-analytics.com',
    );
  }

  const directives: string[] = [
    `default-src 'self'`,
    `script-src ${scriptSources.join(' ')}`,
    `style-src 'self' 'unsafe-inline'`, // Tailwind inline style ها
    `img-src 'self' data: blob: https://res.cloudinary.com`,
    `font-src 'self' data:`,
    `connect-src ${connectSources.join(' ')}`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
  ];

  return directives.join('; ');
}