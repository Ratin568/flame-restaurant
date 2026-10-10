import 'server-only';
import Redis from 'ioredis';

// Redis provides distributed limits. A process-local fallback is used when it is unavailable;
// production deployments with multiple instances must configure REDIS_URL for shared limits.
let redis: Redis | null = null;
const localWindows = new Map<string, {count: number; expiresAt: number}>();
let redisWarningLogged = false;

function localRateLimit(key: string, limit: number, windowSec: number): RateLimitResult {
  const now = Date.now();
  const current = localWindows.get(key);
  if (!current || current.expiresAt <= now) {
    localWindows.set(key, {count: 1, expiresAt: now + windowSec * 1000});
    if (localWindows.size > 5000) {
      for (const [k, v] of localWindows) if (v.expiresAt <= now) localWindows.delete(k);
      while (localWindows.size > 5000) {
        const oldest = localWindows.keys().next().value as string | undefined;
        if (!oldest) break;
        localWindows.delete(oldest);
      }
    }
    return {allowed: true, remaining: Math.max(0, limit - 1), resetInSec: windowSec};
  }
  current.count += 1;
  return {allowed: current.count <= limit, remaining: Math.max(0, limit - current.count), resetInSec: Math.max(1, Math.ceil((current.expiresAt - now) / 1000))};
}

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
 * اگر Redis در دسترس نباشد، محدودسازی محلی همان process به‌عنوان دفاع محدود استفاده می‌شود.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  const client = getRedis();
  if (!client) {
    if (!redisWarningLogged) { console.warn('[rate-limit] REDIS_URL missing; using process-local limits only'); redisWarningLogged = true; }
    return localRateLimit(key, limit, windowSec);
  }

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
    if (!redisWarningLogged) { console.error('[rate-limit] Redis unavailable; using process-local limits only'); redisWarningLogged = true; }
    return localRateLimit(key, limit, windowSec);
  }
}

/**
 * Client IP forwarded by the trusted reverse proxy. The application must not be
 * directly exposed with arbitrary client-controlled forwarding headers; configure
 * the hosting proxy to overwrite these headers before enabling IP-based limits.
 */
export function getClientIp(headers: Headers): string {
  const realIp = headers.get('x-real-ip')?.trim();
  if (realIp) return realIp.slice(0, 128);
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const addresses = forwarded.split(',').map((part) => part.trim()).filter(Boolean);
    // Many reverse proxies append the observed client address to the chain.
    const candidate = addresses.at(-1);
    if (candidate) return candidate.slice(0, 128);
  }
  return 'unknown';
}