import { Redis } from '@upstash/redis';

// Singleton Redis client
let redis: Redis | null = null;

const getRedis = (): Redis | null => {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  
  redis = new Redis({ url, token });
  return redis;
};

// Cache configuration
const TTL = {
  MEMORY_MS: 60 * 1000,      // 1 min L1 (in-memory)
  REDIS_SEC: 10 * 60,        // 10 min L2 (Redis)
};

// L1: In-memory cache (instant, no network)
const L1 = new Map<string, { data: unknown; expires: number }>();

// Cleanup expired L1 entries every 30 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of L1) {
    if (entry.expires < now) L1.delete(key);
  }
}, 30000);

/**
 * GET: L1 memory → L2 Redis → null
 */
export async function getCached<T>(key: string): Promise<T | null> {
  // L1: Check memory (instant)
  const l1 = L1.get(key);
  if (l1 && l1.expires > Date.now()) {
    return l1.data as T;
  }
  L1.delete(key);

  // L2: Check Redis
  const client = getRedis();
  if (!client) return null;

  try {
    const data = await client.get<T>(key);
    if (data !== null) {
      // Warm L1 cache
      L1.set(key, { data, expires: Date.now() + TTL.MEMORY_MS });
      return data;
    }
  } catch (e) {
    console.error('[Redis] GET error:', e);
  }
  
  return null;
}

/**
 * SET: Write to both L1 and L2
 */
export async function setCached<T>(key: string, data: T): Promise<void> {
  // L1: Always set memory
  L1.set(key, { data, expires: Date.now() + TTL.MEMORY_MS });

  // L2: Set Redis (fire and forget for speed)
  const client = getRedis();
  if (client) {
    client.set(key, data, { ex: TTL.REDIS_SEC }).catch(e => console.error('[Redis] SET error:', e));
  }
}

/**
 * DELETE: Clear from both L1 and L2
 */
export async function deleteCached(key: string): Promise<void> {
  L1.delete(key);
  const client = getRedis();
  if (client) {
    await client.del(key).catch(e => console.error('[Redis] DEL error:', e));
  }
}

/**
 * Invalidate all cache for a tenant (by pattern)
 */
export async function invalidateTenantCache(tenantId: string): Promise<void> {
  const pattern = `bootstrap:${tenantId}`;
  
  // Clear L1
  for (const key of L1.keys()) {
    if (key.startsWith(pattern)) L1.delete(key);
  }

  // Clear L2
  const client = getRedis();
  if (client) {
    try {
      const keys = await client.keys(`${pattern}*`);
      if (keys.length) await client.del(...keys);
    } catch (e) {
      console.error('[Redis] Invalidate error:', e);
    }
  }
}

// Legacy export for compatibility
export const invalidateCache = invalidateTenantCache;
