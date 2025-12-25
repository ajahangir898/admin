import { Redis } from '@upstash/redis';
import { gzipSync, gunzipSync } from 'zlib';

// Initialize Redis client (lazy - only when first used)
let redis: Redis | null = null;

const getRedis = (): Redis | null => {
  if (redis) return redis;
  
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!url || !token) {
    console.warn('[Redis] Upstash credentials not configured, using in-memory only');
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

// Compression helpers for large data
const compress = (data: unknown): string => {
  const json = JSON.stringify(data);
  return gzipSync(json).toString('base64');
};

const decompress = <T>(data: string): T => {
  const buffer = Buffer.from(data, 'base64');
  return JSON.parse(gunzipSync(buffer).toString('utf-8')) as T;
};

// Cache TTL
const REDIS_TTL_SECONDS = 300; // 5 minutes in Redis
const MEMORY_TTL_MS = 5 * 60 * 1000; // 5 minutes in-memory (L1 cache)

// L1 In-memory cache (instant, same process)
type CacheEntry = { data: unknown; timestamp: number };
const memoryCache = new Map<string, CacheEntry>();

/**
 * Get cached data - L1 memory first (instant), then L2 Redis
 */
export const getCached = async <T>(key: string): Promise<T | null> => {
  // L1: Check in-memory cache first (instant - no network)
  const memEntry = memoryCache.get(key);
  if (memEntry && Date.now() - memEntry.timestamp <= MEMORY_TTL_MS) {
    console.log(`[L1] HIT ${key}`);
    return memEntry.data as T;
  }
  if (memEntry) memoryCache.delete(key);

  // L2: Check Redis (network call - slower but persistent)
  const client = getRedis();
  if (client) {
    try {
      const startTime = Date.now();
      const compressed = await client.get<string>(key);
      const duration = Date.now() - startTime;
      
      if (compressed !== null) {
        let data: T;
        try {
          data = decompress<T>(compressed);
        } catch {
          data = compressed as unknown as T; // backward compatibility
        }
        
        // Populate L1 cache for instant next request
        memoryCache.set(key, { data, timestamp: Date.now() });
        console.log(`[L2] HIT ${key} (${duration}ms) -> cached in L1`);
        return data;
      }
      console.log(`[L2] MISS ${key} (${duration}ms)`);
    } catch (error) {
      console.error('[Redis] Get error:', error);
    }
  }
  
  return null;
};

/**
 * Set cached data in both L1 memory and L2 Redis
 */
export const setCached = async <T>(key: string, data: T): Promise<void> => {
  // Always set L1 memory cache (instant access)
  memoryCache.set(key, { data, timestamp: Date.now() });
  
  // Also set L2 Redis (persistent, shared across restarts)
  const client = getRedis();
  if (client) {
    try {
      const compressed = compress(data);
      const originalSize = JSON.stringify(data).length;
      const compressedSize = compressed.length;
      const ratio = Math.round((1 - compressedSize/originalSize) * 100);
      await client.set(key, compressed, { ex: REDIS_TTL_SECONDS });
      console.log(`[Cache] SET ${key} (${originalSize}→${compressedSize} bytes, -${ratio}%)`);
    } catch (error) {
      console.error('[Redis] Set error:', error);
    }
  }
};

/**
 * Invalidate cached data by pattern
 */
export const invalidateCache = async (pattern: string): Promise<number> => {
  let count = 0;
  
  // Clear L1 memory cache
  const regex = new RegExp(pattern.replace(/\*/g, '.*'));
  for (const key of memoryCache.keys()) {
    if (regex.test(key)) {
      memoryCache.delete(key);
      count++;
    }
  }
  
  // Clear L2 Redis cache
  const client = getRedis();
  if (client) {
    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
        count += keys.length;
      }
    } catch (error) {
      console.error('[Redis] Invalidate error:', error);
    }
  }
  
  console.log(`[Cache] Invalidated ${count} keys for ${pattern}`);
  return count;
};

/**
 * Invalidate all cache for a tenant
 */
export const invalidateTenantCache = async (tenantId: string): Promise<void> => {
  await invalidateCache(`bootstrap:${tenantId}*`);
};
