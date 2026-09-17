import 'server-only';
import Redis from 'ioredis';

// ─── اتصال Redis (اگر تنظیم نشده باشد، limiter غیرفعال اما بی‌خطا) ───
let redis: Redis | null = null;

function getRedis(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  if (!redis) {
    redis = new Redis(url, {lazyConnect: false, maxRetriesPerRequest: 2});
    redis.on('error', () => {
      // Redis پایین باشد → limiter fail-open (سایت نمی‌شکند)
    });
  }
  return redis;
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetInSec: number;
};

/**
 * پنجره ثابت (Fixed Window) — ساده، سریع، دقیق برای نیاز ما
 * fail-open: اگر Redis در دسترس نبود، اجازه بده (اولویت با availability)
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  const client = getRedis();
  if (!client) return {allowed: true, remaining: limit, resetInSec: 0};

  const windowKey = `rl:${key}:${Math.floor(Date.now() / (windowSec * 1000))}`;

  try {
    const count = await client.incr(windowKey);
    if (count === 1) {
      await client.expire(windowKey, windowSec);
    }
    const ttl = await client.ttl(windowKey);

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      resetInSec: ttl > 0 ? ttl : windowSec,
    };
  } catch {
    return {allowed: true, remaining: limit, resetInSec: 0};
  }
}

/** IP واقعی پشت پراکسی/CDN */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  );
}