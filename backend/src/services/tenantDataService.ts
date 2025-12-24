import { getDatabase } from '../db/mongo';
import type { TenantDataDocument } from '../types/tenantData';

const collectionName = 'tenant_data';

// In-memory cache for bootstrap data (super fast second visits)
type CacheEntry = { data: unknown; timestamp: number };
const bootstrapCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

const getCacheKey = (tenantId: string, keys: string[]) => `${tenantId}:${keys.sort().join(',')}`;

const getCachedBootstrap = <T>(cacheKey: string): T | null => {
  const entry = bootstrapCache.get(cacheKey);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    bootstrapCache.delete(cacheKey);
    return null;
  }
  return entry.data as T;
};

const setCachedBootstrap = <T>(cacheKey: string, data: T): void => {
  bootstrapCache.set(cacheKey, { data, timestamp: Date.now() });
};

// Invalidate cache when data is updated
export const invalidateBootstrapCache = (tenantId: string): void => {
  const keysToDelete: string[] = [];
  for (const key of bootstrapCache.keys()) {
    if (key.startsWith(`${tenantId}:`)) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach(k => bootstrapCache.delete(k));
  console.log(`[Cache] Invalidated ${keysToDelete.length} cache entries for tenant ${tenantId}`);
};

export const getTenantData = async <T = unknown>(tenantId: string, key: string): Promise<T | null> => {
  const db = await getDatabase();
  const document = await db
    .collection<TenantDataDocument<T>>(collectionName)
    .findOne({ tenantId, key });
  return document?.data ?? null;
};

// Batch fetch multiple keys in ONE database query (much faster than parallel individual queries)
export const getTenantDataBatch = async <T extends Record<string, unknown>>(
  tenantId: string, 
  keys: string[]
): Promise<T> => {
  // Check cache first for super fast response
  const cacheKey = getCacheKey(tenantId, keys);
  const cached = getCachedBootstrap<T>(cacheKey);
  if (cached) {
    console.log(`[Cache] HIT for ${tenantId} bootstrap`);
    return cached;
  }
  
  console.log(`[Cache] MISS for ${tenantId} bootstrap - fetching from DB`);
  const startTime = Date.now();
  
  const db = await getDatabase();
  const documents = await db
    .collection<TenantDataDocument<unknown>>(collectionName)
    .find({ tenantId, key: { $in: keys } })
    .toArray();
  
  // Build result object from documents
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    const doc = documents.find(d => d.key === key);
    result[key] = doc?.data ?? null;
  }
  
  console.log(`[DB] Fetched ${keys.length} keys in ${Date.now() - startTime}ms`);
  
  // Cache the result for fast subsequent requests
  setCachedBootstrap(cacheKey, result);
  
  return result as T;
};

export const setTenantData = async <T = unknown>(tenantId: string, key: string, data: T): Promise<void> => {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db
    .collection<TenantDataDocument<T>>(collectionName)
    .updateOne(
      { tenantId, key },
      {
        $set: {
          data,
          updatedAt: now
        },
        $setOnInsert: { tenantId, key }
      },
      { upsert: true }
    );
  
  // Invalidate cache when data is updated
  invalidateBootstrapCache(tenantId);
};
