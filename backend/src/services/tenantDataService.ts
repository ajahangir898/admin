import { getDatabase } from '../db/mongo';
import type { TenantDataDocument } from '../types/tenantData';

const collectionName = 'tenant_data';

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
};
