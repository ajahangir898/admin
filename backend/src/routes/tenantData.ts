import { Router } from 'express';
import { z } from 'zod';
import { getTenantData, setTenantData } from '../services/tenantDataService';

const paramsSchema = z.object({
  tenantId: z.string().min(1, 'tenantId is required'),
  key: z.string().min(1, 'key is required')
});

const updateSchema = z.object({
  data: z.any()
});

export const tenantDataRouter = Router();

// Bootstrap endpoint - returns all critical data in ONE request
tenantDataRouter.get('/:tenantId/bootstrap', async (req, res, next) => {
  try {
    const tenantId = req.params.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }
    
    // Fetch all critical data in parallel
    const [products, theme_config, website_config] = await Promise.all([
      getTenantData(tenantId, 'products'),
      getTenantData(tenantId, 'theme_config'),
      getTenantData(tenantId, 'website_config')
    ]);
    
    // Allow short caching for bootstrap data (30 seconds)
    res.set({
      'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
    });
    
    res.json({
      data: {
        products: products || [],
        theme_config: theme_config || null,
        website_config: website_config || null
      }
    });
  } catch (error) {
    next(error);
  }
});

tenantDataRouter.get('/:tenantId/:key', async (req, res, next) => {
  try {
    const { tenantId, key } = paramsSchema.parse(req.params);
    const data = await getTenantData(tenantId, key);
    
    // Prevent browser/CDN caching for dynamic tenant data
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

tenantDataRouter.put('/:tenantId/:key', async (req, res, next) => {
  try {
    const { tenantId, key } = paramsSchema.parse(req.params);
    const payload = updateSchema.parse(req.body ?? {});
    await setTenantData(tenantId, key, payload.data);
    res.json({ data: { tenantId, key } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});
