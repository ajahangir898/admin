import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import { createTenant, deleteTenant, listTenants } from '../services/tenantsService.js';

const createTenantSchema = z.object({
  name: z.string().min(2),
  subdomain: z.string().min(2),
  contactEmail: z.string().email(),
  contactName: z.string().optional(),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(6),
  plan: z.string().optional()
});

export const tenantsRouter = Router();

// Attach auth middleware if required
tenantsRouter.use(authMiddleware);

// GET /api/tenants
tenantsRouter.get('/', async (_req, res, next) => {
  try {
    const tenants = await listTenants();
    res.json({ data: tenants });
  } catch (error) {
    next(error);
  }
});

// POST /api/tenants
tenantsRouter.post('/', async (req, res, next) => {
  try {
    const payload = createTenantSchema.parse(req.body);
    const tenant = await createTenant(payload);
    res.status(201).json({ data: tenant });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// DELETE /api/tenants/:id
tenantsRouter.delete('/:id', async (req, res, next) => {
  try {
    await deleteTenant(req.params.id);
    res.json({ data: { id: req.params.id } });
  } catch (error) {
    next(error);
  }
});
