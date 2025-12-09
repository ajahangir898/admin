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
