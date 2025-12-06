import { randomUUID } from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';
import { DEMO_TENANTS } from '../constants';
import type { CreateTenantPayload, Tenant } from '../types';

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
          plan: payload.plan || 'starter',
          status: 'trialing',
          onboardingCompleted: false,
          createdAt: timestamp,
          updatedAt: timestamp,
          branding: {},
          settings: {}
        };

        tenants = [...tenants, tenant];
        return sendJson(res, 201, { data: tenant });
      } catch (error) {
        console.error('[tenant-api] Failed to seed tenant', error);
        return sendJson(res, 500, { error: 'Unable to create tenant' });
      }
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  };
};
