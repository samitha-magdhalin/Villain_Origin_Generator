import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export const isRedisConfigured = Boolean(redisUrl && redisToken);

const redis = isRedisConfigured
  ? new Redis({
      url: redisUrl!,
      token: redisToken!,
    })
  : null;

// Fallback in-memory cache for local development without Upstash config
const localCache = new Map<string, { count: number; resetTime: number }>();

export async function checkRateLimit(
  ip: string,
  limit = 5,
  windowMs = 60000
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const now = Date.now();

  if (redis) {
    try {
      const key = `rate_limit:${ip}`;
      const current = await redis.get<number>(key);

      if (current === null) {
        await redis.set(key, 1, { ex: Math.ceil(windowMs / 1000) });
        return {
          success: true,
          limit,
          remaining: limit - 1,
          reset: now + windowMs,
        };
      }

      if (current >= limit) {
        const ttl = await redis.ttl(key);
        return {
          success: false,
          limit,
          remaining: 0,
          reset: now + (ttl > 0 ? ttl * 1000 : windowMs),
        };
      }

      const newValue = await redis.incr(key);
      const ttl = await redis.ttl(key);
      return {
        success: true,
        limit,
        remaining: Math.max(0, limit - newValue),
        reset: now + (ttl > 0 ? ttl * 1000 : windowMs),
      };
    } catch (error) {
      console.warn("Upstash Redis rate-limit failure, switching to memory fallback:", error);
    }
  }

  // Memory-based rate limiter fallback
  const record = localCache.get(ip);

  if (!record || now > record.resetTime) {
    localCache.set(ip, { count: 1, resetTime: now + windowMs });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: now + windowMs,
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: record.resetTime,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    reset: record.resetTime,
  };
}
