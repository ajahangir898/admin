import { Router, Request } from 'express';
import { z } from 'zod';
import { getTenantData, setTenantData } from '../services/tenantDataService';
import { Server as SocketIOServer } from 'socket.io';

const paramsSchema = z.object({
  tenantId: z.string().min(1, 'tenantId is required'),
  key: z.string().min(1, 'key is required')
});

const updateSchema = z.object({
  data: z.any()
});

export const tenantDataRouter = Router();

// Helper to emit Socket.IO events
const emitDataUpdate = (req: Request, tenantId: string, key: string, data: unknown) => {
  const io = req.app.get('io') as SocketIOServer | undefined;
  if (io) {
    // Emit to tenant-specific room
    io.to(`tenant:${tenantId}`).emit('data-update', { tenantId, key, data, timestamp: Date.now() });
    // Also emit globally for cross-tenant admins
    io.emit('data-update-global', { tenantId, key, timestamp: Date.now() });
    console.log(`[Socket.IO] Emitted data-update for ${tenantId}/${key}`);
  }
};

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
    
    // Emit real-time update via Socket.IO
    emitDataUpdate(req, tenantId, key, payload.data);
    
    console.log(`[TenantData] Saved ${key} for tenant ${tenantId}`);
    res.json({ data: { tenantId, key, success: true } });
  } catch (error) {
    console.error(`[TenantData] Error saving ${req.params.key} for ${req.params.tenantId}:`, error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});
