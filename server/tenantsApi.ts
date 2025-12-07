import { randomUUID } from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';
import { DEMO_TENANTS } from '../constants';
import type { CreateTenantPayload, Tenant } from '../types';
import { getAdminAuth } from './firebaseAdmin';

const normalizeSubdomain = (value = '') => value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '') || 'tenant';

const sendJson = (res: ServerResponse, statusCode: number, payload: Record<string, unknown>) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

const readBody = (req: IncomingMessage) => new Promise<string>((resolve, reject) => {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
    if (body.length > 1_000_000) {
      reject(new Error('Payload too large'));
      req.destroy();
    }
  });
  req.on('end', () => resolve(body));
  req.on('error', reject);
});

export const createTenantApiMiddleware = () => {
  let tenants: Tenant[] = [...DEMO_TENANTS];
  const adminAuth = getAdminAuth();

  const ensureAdminAuthUser = async (payload: { email: string; password: string; displayName: string }) => {
    if (!adminAuth) return undefined;
    try {
      const record = await adminAuth.createUser({
        email: payload.email,
        password: payload.password,
        displayName: payload.displayName,
      });
      return record.uid;
    } catch (error: any) {
      if (error?.code === 'auth/email-already-exists') {
        const existing = await adminAuth.getUserByEmail(payload.email);
        return existing.uid;
      }
      console.warn('[tenant-api] Failed to create admin auth user', error);
      return undefined;
    }
  };

  return async (req, res, next) => {
    if (!req.url?.startsWith('/api/tenants')) {
      return next();
    }

    if (req.method === 'GET') {
      return sendJson(res, 200, { data: tenants });
    }

    if (req.method === 'POST') {
      try {
        const rawBody = await readBody(req);
        const payload: Partial<CreateTenantPayload> = rawBody ? JSON.parse(rawBody) : {};
        const requiredFields: Array<keyof CreateTenantPayload> = ['name', 'subdomain', 'contactEmail', 'adminEmail', 'adminPassword'];
        const missingField = requiredFields.find((field) => !payload[field]);
        if (missingField) {
          return sendJson(res, 400, { error: 'Missing required tenant fields' });
        }

        const subdomain = normalizeSubdomain(payload.subdomain || '');
        if (tenants.some((tenant) => tenant.subdomain === subdomain)) {
          return sendJson(res, 409, { error: 'Subdomain already taken' });
        }

        const adminEmail = (payload.adminEmail || '').trim().toLowerCase();
        if (!/\S+@\S+\.\S+/.test(adminEmail)) {
          return sendJson(res, 400, { error: 'Provide a valid admin email' });
        }
        const adminPassword = (payload.adminPassword || '').trim();
        if (adminPassword.length < 6) {
          return sendJson(res, 400, { error: 'Admin password must be at least 6 characters' });
        }

        const timestamp = new Date().toISOString();
        const tenant: Tenant = {
          id: randomUUID(),
          name: (payload.name || '').trim(),
          subdomain,
          contactEmail: (payload.contactEmail || '').trim().toLowerCase(),
          contactName: payload.contactName?.trim(),
          adminEmail,
          adminPassword,
          adminAuthUid: undefined,
          plan: payload.plan || 'starter',
          status: 'trialing',
          onboardingCompleted: false,
          createdAt: timestamp,
          updatedAt: timestamp,
          branding: {},
          settings: {}
        };

        if (adminAuth) {
          tenant.adminAuthUid = await ensureAdminAuthUser({
            email: adminEmail,
            password: adminPassword,
            displayName: `${tenant.name} Admin`,
          });
        }

        tenants = [...tenants, tenant];
        return sendJson(res, 201, { data: tenant });
      } catch (error) {
        console.error('[tenant-api] Failed to seed tenant', error);
        return sendJson(res, 500, { error: 'Unable to create tenant' });
      }
    }

    if (req.method === 'DELETE') {
      const tenantId = req.url?.split('/api/tenants/')[1]?.split('?')[0];
      if (!tenantId) {
        return sendJson(res, 400, { error: 'Tenant id required' });
      }
      const target = tenants.find((tenant) => tenant.id === tenantId);
      if (!target) {
        return sendJson(res, 404, { error: 'Tenant not found' });
      }

      tenants = tenants.filter((tenant) => tenant.id !== tenantId);

      if (adminAuth && target.adminAuthUid) {
        try {
          await adminAuth.deleteUser(target.adminAuthUid);
        } catch (error) {
          console.warn('[tenant-api] Failed to delete admin auth user', error);
        }
      }

      return sendJson(res, 200, { data: { id: tenantId } });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  };
};
