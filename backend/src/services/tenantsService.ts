import { ObjectId } from 'mongodb';
import { getDatabase } from '../db/mongo.js';
import type { CreateTenantPayload, Tenant } from '../types/tenant.js';

const sanitizeSubdomain = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63);

const collectionName = 'tenants';

export const listTenants = async (): Promise<Tenant[]> => {
  const db = await getDatabase();
  return db.collection<Tenant>(collectionName).find({}).sort({ createdAt: -1 }).toArray();
};

export const getTenantById = async (id: string) => {
  const db = await getDatabase();
  return db.collection<Tenant>(collectionName).findOne({ _id: new ObjectId(id) });
};

export const getTenantBySubdomain = async (subdomain: string) => {
  const db = await getDatabase();
  return db.collection<Tenant>(collectionName).findOne({ subdomain: sanitizeSubdomain(subdomain) });
};

export const createTenant = async (payload: CreateTenantPayload): Promise<Tenant> => {
  const now = new Date().toISOString();
  const subdomain = sanitizeSubdomain(payload.subdomain);
  if (!subdomain) {
    throw new Error('Invalid subdomain');
  }

  const db = await getDatabase();
  const collection = db.collection<Tenant>(collectionName);
  const existing = await collection.findOne({ subdomain });
  if (existing) {
    throw new Error('Subdomain already in use');
  }

  const tenant: Tenant = {
    name: payload.name.trim(),
    subdomain,
    contactEmail: payload.contactEmail.trim().toLowerCase(),
    contactName: payload.contactName?.trim(),
    adminEmail: payload.adminEmail.trim().toLowerCase(),
    plan: (payload.plan || 'starter') as Tenant['plan'],
    status: 'trialing',
    onboardingCompleted: false,
    createdAt: now,
    updatedAt: now,
    branding: {},
    settings: {}
  };

  const result = await collection.insertOne(tenant);
  return { ...tenant, _id: result.insertedId.toHexString() };
};

export const deleteTenant = async (id: string) => {
  const db = await getDatabase();
  await db.collection<Tenant>(collectionName).deleteOne({ _id: new ObjectId(id) });
};

export const ensureTenantIndexes = async () => {
  const db = await getDatabase();
  await db.collection<Tenant>(collectionName).createIndex({ subdomain: 1 }, { unique: true });
  await db.collection<Tenant>(collectionName).createIndex({ adminEmail: 1 });
};
