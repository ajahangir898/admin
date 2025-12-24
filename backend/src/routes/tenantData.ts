import { Router, Request } from 'express';
import { z } from 'zod';
import { getTenantData, setTenantData, getTenantDataBatch } from '../services/tenantDataService';
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
    
    // Emit specific event for chat messages for real-time chat
    if (key === 'chat_messages') {
      io.to(`tenant:${tenantId}`).emit('chat-update', { tenantId, data, timestamp: Date.now() });
      console.log(`[Socket.IO] Emitted chat-update for ${tenantId}`);
    }
    
    // Also emit globally for cross-tenant admins
    io.emit('data-update-global', { tenantId, key, timestamp: Date.now() });
    console.log(`[Socket.IO] Emitted data-update for ${tenantId}/${key}`);
  }
};

// Bootstrap endpoint - returns all critical data in ONE database query
tenantDataRouter.get('/:tenantId/bootstrap', async (req, res, next) => {
  try {
    const tenantId = req.params.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }
    
    // Fetch all critical data in ONE database query (not 3 parallel queries)
    const data = await getTenantDataBatch<{
      products: unknown;
      theme_config: unknown;
      website_config: unknown;
    }>(tenantId, ['products', 'theme_config', 'website_config']);
    
    // Allow short caching for bootstrap data (30 seconds)
    res.set({
      'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
    });
    
    res.json({
      data: {
        products: data.products || [],
        theme_config: data.theme_config || null,
        website_config: data.website_config || null
      }
    });
  } catch (error) {
    next(error);
  }
});

// Secondary data endpoint - returns all secondary data in ONE database query
tenantDataRouter.get('/:tenantId/secondary', async (req, res, next) => {
  try {
    const tenantId = req.params.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }
    
    // Fetch all secondary data in ONE database query (not 10 parallel queries)
    const data = await getTenantDataBatch<{
      orders: unknown;
      logo: unknown;
      delivery_config: unknown;
      chat_messages: unknown;
      landing_pages: unknown;
      categories: unknown;
      subcategories: unknown;
      childcategories: unknown;
      brands: unknown;
      tags: unknown;
    }>(tenantId, [
      'orders', 'logo', 'delivery_config', 'chat_messages', 'landing_pages',
      'categories', 'subcategories', 'childcategories', 'brands', 'tags'
    ]);
    
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    
    res.json({
      data: {
        orders: data.orders || [],
        logo: data.logo || null,
        delivery_config: data.delivery_config || [],
        chat_messages: data.chat_messages || [],
        landing_pages: data.landing_pages || [],
        categories: data.categories || [],
        subcategories: data.subcategories || [],
        childcategories: data.childcategories || [],
        brands: data.brands || [],
        tags: data.tags || []
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
