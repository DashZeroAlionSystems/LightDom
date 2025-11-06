import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import IORedis from 'ioredis';
import { RequestHandler } from 'express';

export interface RateLimiterOptions {
  windowMs?: number;
  max?: number;
  message?: any;
  legacyHeaders?: boolean;
}

const DEFAULT_OPTIONS: RateLimiterOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  },
  legacyHeaders: false
};

function createRedisClient(): IORedis.Redis | null {
  const url = process.env.REDIS_URL || process.env.REDIS_URI;
  if (!url) return null;
  try {
    return new IORedis(url);
  } catch (err) {
    // If Redis initialization fails, fall back to in-memory store
    // and let the app run.
    // eslint-disable-next-line no-console
    console.warn('Redis rate limiter disabled - failed to connect to Redis:', err);
    return null;
  }
}

export function getRateLimiter(opts: RateLimiterOptions = {}): RequestHandler {
  const options = { ...DEFAULT_OPTIONS, ...opts };

  const redisClient = createRedisClient();

  if (redisClient) {
    const store = new RedisStore({ sendCommand: (...args: any[]) => (redisClient as any).call(...args) });
    return rateLimit({
      windowMs: options.windowMs,
      max: options.max,
      message: options.message,
      legacyHeaders: options.legacyHeaders,
      store
    });
  }

  // Fallback to in-memory store (not recommended for clustered environments)
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message,
    legacyHeaders: options.legacyHeaders
  });
}

// Default/global limiter (can be imported and used by the app)
export const globalRateLimiter = getRateLimiter();

export default getRateLimiter;
