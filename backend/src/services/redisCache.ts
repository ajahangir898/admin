import { Redis } from '@upstash/redis';

// Initialize Redis client (lazy - only when first used)
let redis: Redis | null = null;

const getRedis = (): Redis | null => {
  if (redis) return redis;
  
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!url || !token) {
    console.warn('[Redis] Upstash credentials not configured, falling back to in-memory cache');
    return null;
  }
  
  try {
    redis = new Redis({ url, token });
    console.log('[Redis] Upstash Redis connected');
    return redis;
  } catch (error) {
    console.error('[Redis] Failed to connect:', error);
    return null;
  }
};

// Cache TTL in seconds
const CACHE_TTL_SECONDS = 300; // 5 minutes (longer than in-memory since Redis is persistent)

// In-memory fallback cache
type CacheEntry = { data: unknown; timestamp: number };
const memoryCache = new Map<string, CacheEntry>();
const MEMORY_CACHE_TTL_MS = 60 * 1000; // 1 minute for in-memory

/**
 * Get cached data from Redis (with in-memory fallback)
 */
export const getCached = async <T>(key: string): Promise<T | null> => {
  const client = getRedis();
  
  if (client) {
    try {
      const startTime = Date.now();
      const data = await client.get<T>(key);
      const duration = Date.now() - startTime;
      
      if (data !== null) {
        console.log(`[Redis] HIT for ${key} (${duration}ms)`);
        return data;
      }
      console.log(`[Redis] MISS for ${key} (${duration}ms)`);
      return null;
    } catch (error) {
      console.error('[Redis] Get error:', error);
      // Fall through to memory cache
    }
  }
  
  // Fallback to memory cache
  const entry = memoryCache.get(key);
  if (entry && Date.now() - entry.timestamp <= MEMORY_CACHE_TTL_MS) {
    console.log(`[MemCache] HIT for ${key}`);
    return entry.data as T;
  }
  if (entry) memoryCache.delete(key);
  console.log(`[MemCache] MISS for ${key}`);
  return null;
};

/**
 * Set cached data in Redis (with in-memory fallback)
 */
export const setCached = async <T>(key: string, data: T): Promise<void> => {
  const client = getRedis();
  
  if (client) {
    try {
      await client.set(key, data, { ex: CACHE_TTL_SECONDS });
      console.log(`[Redis] SET ${key} (TTL: ${CACHE_TTL_SECONDS}s)`);
      return;
    } catch (error) {
      console.error('[Redis] Set error:', error);
      // Fall through to memory cache
    }
  }
  
  // Fallback to memory cache
  memoryCache.set(key, { data, timestamp: Date.now() });
  console.log(`[MemCache] SET ${key}`);
};

/**
 * Invalidate cached data by pattern
 */
export const invalidateCache = async (pattern: string): Promise<number> => {
  const client = getRedis();
  let count = 0;
  
  if (client) {
    try {
      // Upstash doesn't support KEYS command well, so we use SCAN
      // For now, just delete the specific key pattern we know
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
        count = keys.length;
        console.log(`[Redis] Invalidated ${count} keys matching ${pattern}`);
      }
    } catch (error) {
      console.error('[Redis] Invalidate error:', error);
    }
  }
  
  // Also clear memory cache entries matching pattern
  const regex = new RegExp(pattern.replace('*', '.*'));
  for (const key of memoryCache.keys()) {
    if (regex.test(key)) {
      memoryCache.delete(key);
      count++;
    }
  }
  
  return count;
};

/**
 * Invalidate all cache for a tenant
 */
export const invalidateTenantCache = async (tenantId: string): Promise<void> => {
  const count = await invalidateCache(`bootstrap:${tenantId}*`);
  console.log(`[Cache] Invalidated ${count} entries for tenant ${tenantId}`);
};
