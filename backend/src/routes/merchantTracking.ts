import { Router, Request, Response, NextFunction } from 'express';
import { MerchantActivity } from '../models/MerchantActivity';
import { Notification } from '../models/Notification';
import { authenticateToken } from '../middleware/auth';
import { listTenants, getTenantStats } from '../services/tenantsService';

export const merchantTrackingRouter = Router();

// Risk criteria constants - easily configurable
const RISK_CRITERIA = {
  NO_LOGIN_DAYS: 14,
  NO_ORDER_DAYS: 30,
  REVENUE_DROP_PERCENTAGE: 80
};

// Helper function to calculate at-risk status
async function calculateAtRiskStatus(tenantId: string): Promise<{
  isAtRisk: boolean;
  riskReasons: string[];
  revenueDropPercentage: number;
}> {
  const riskReasons: string[] = [];
  let isAtRisk = false;
  let revenueDropPercentage = 0;

  try {
    // Get merchant activity
    let activity = await MerchantActivity.findOne({ tenantId });
    
    if (!activity) {
      // Create new activity record
      activity = new MerchantActivity({
        tenantId,
        lastCheckedAt: new Date()
      });
    }

    // Check for no login in 14+ days
    if (activity.lastLoginAt) {
      const daysSinceLogin = Math.floor((Date.now() - activity.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLogin >= RISK_CRITERIA.NO_LOGIN_DAYS) {
        isAtRisk = true;
        riskReasons.push(`No login for ${daysSinceLogin} days`);
      }
    } else {
      // No login recorded yet
      isAtRisk = true;
      riskReasons.push('No login recorded');
    }

    // Check for 80% revenue drop
    if (activity.previousRevenue > 0) {
      const currentRevenue = activity.totalRevenue;
      const dropAmount = activity.previousRevenue - currentRevenue;
      revenueDropPercentage = (dropAmount / activity.previousRevenue) * 100;
      
      if (revenueDropPercentage >= RISK_CRITERIA.REVENUE_DROP_PERCENTAGE) {
        isAtRisk = true;
        riskReasons.push(`Revenue dropped by ${revenueDropPercentage.toFixed(1)}%`);
      }
    }

    // Check for no orders recently
    if (activity.lastOrderAt) {
      const daysSinceOrder = Math.floor((Date.now() - activity.lastOrderAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceOrder >= RISK_CRITERIA.NO_ORDER_DAYS) {
        isAtRisk = true;
        riskReasons.push(`No orders for ${daysSinceOrder} days`);
      }
    }

    return {
      isAtRisk,
      riskReasons,
      revenueDropPercentage
    };
  } catch (error) {
    console.error('Error calculating at-risk status:', error);
    return {
      isAtRisk: false,
      riskReasons: [],
      revenueDropPercentage: 0
    };
  }
}

// GET /api/merchant-tracking/at-risk - Get list of at-risk merchants (super_admin only)
merchantTrackingRouter.get('/at-risk', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = (req as any).user;
    
    if (role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const atRiskMerchants = await MerchantActivity.find({ isAtRisk: true })
      .sort({ lastCheckedAt: -1 })
      .lean();

    // Get tenant details for each at-risk merchant
    const tenants = await listTenants();
    const tenantMap = new Map(tenants.map(t => [t._id.toString(), t]));

    const enrichedData = atRiskMerchants.map(activity => {
      const tenant = tenantMap.get(activity.tenantId);
      return {
        tenantId: activity.tenantId,
        tenantName: tenant?.name || 'Unknown',
        subdomain: tenant?.subdomain || 'unknown',
        status: tenant?.status || 'unknown',
        lastLoginAt: activity.lastLoginAt,
        lastOrderAt: activity.lastOrderAt,
        totalOrders: activity.totalOrders,
        totalRevenue: activity.totalRevenue,
        revenueDropPercentage: activity.revenueDropPercentage,
        riskReasons: activity.riskReasons,
        lastCheckedAt: activity.lastCheckedAt
      };
    });

    res.json({
      data: enrichedData,
      count: enrichedData.length
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/merchant-tracking/stats - Get merchant tracking statistics (super_admin only)
merchantTrackingRouter.get('/stats', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = (req as any).user;
    
    if (role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [totalMerchants, atRiskCount, activities] = await Promise.all([
      listTenants(),
      MerchantActivity.countDocuments({ isAtRisk: true }),
      MerchantActivity.find({}).lean()
    ]);

    // Calculate statistics
    const stats = {
      totalMerchants: totalMerchants.length,
      atRiskMerchants: atRiskCount,
      healthyMerchants: totalMerchants.length - atRiskCount,
      merchantsWithNoLogin14Days: activities.filter(a => {
        if (!a.lastLoginAt) return true;
        const days = Math.floor((Date.now() - a.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24));
        return days >= RISK_CRITERIA.NO_LOGIN_DAYS;
      }).length,
      merchantsWithRevenueDrop: activities.filter(a => a.revenueDropPercentage >= RISK_CRITERIA.REVENUE_DROP_PERCENTAGE).length,
      averageRevenueDrop: activities.length > 0 
        ? activities.reduce((sum, a) => sum + a.revenueDropPercentage, 0) / activities.length 
        : 0
    };

    res.json({ data: stats });
  } catch (error) {
    next(error);
  }
});

// POST /api/merchant-tracking/update - Update merchant activity (called by system)
merchantTrackingRouter.post('/update', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, lastLoginAt, lastOrderAt, totalOrders, totalRevenue, previousRevenue } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    let activity = await MerchantActivity.findOne({ tenantId });

    if (!activity) {
      activity = new MerchantActivity({ tenantId });
    }

    // Update fields if provided
    if (lastLoginAt) activity.lastLoginAt = new Date(lastLoginAt);
    if (lastOrderAt) activity.lastOrderAt = new Date(lastOrderAt);
    if (totalOrders !== undefined) activity.totalOrders = totalOrders;
    if (totalRevenue !== undefined) activity.totalRevenue = totalRevenue;
    if (previousRevenue !== undefined) activity.previousRevenue = previousRevenue;

    // Calculate at-risk status
    const riskStatus = await calculateAtRiskStatus(tenantId);
    activity.isAtRisk = riskStatus.isAtRisk;
    activity.riskReasons = riskStatus.riskReasons;
    activity.revenueDropPercentage = riskStatus.revenueDropPercentage;
    activity.lastCheckedAt = new Date();

    await activity.save();

    res.json({
      message: 'Merchant activity updated',
      data: activity
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/merchant-tracking/scan - Scan all merchants for at-risk status (super_admin only)
merchantTrackingRouter.post('/scan', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = (req as any).user;
    
    if (role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const tenants = await listTenants();
    const results = {
      scanned: 0,
      atRisk: 0,
      healthy: 0,
      errors: 0
    };

    for (const tenant of tenants) {
      try {
        const tenantId = tenant._id.toString();
        
        // Get or create activity record
        let activity = await MerchantActivity.findOne({ tenantId });
        if (!activity) {
          activity = new MerchantActivity({ tenantId });
        }

        // Get tenant stats to update revenue and orders
        const stats = await getTenantStats(tenantId);
        if (stats) {
          // Store previous revenue before updating
          if (activity.totalRevenue > 0 && stats.totalRevenue !== activity.totalRevenue) {
            activity.previousRevenue = activity.totalRevenue;
          }
          activity.totalRevenue = stats.totalRevenue || 0;
          activity.totalOrders = stats.totalOrders || 0;
        }

        // Calculate at-risk status
        const riskStatus = await calculateAtRiskStatus(tenantId);
        const wasAtRisk = activity.isAtRisk;
        
        activity.isAtRisk = riskStatus.isAtRisk;
        activity.riskReasons = riskStatus.riskReasons;
        activity.revenueDropPercentage = riskStatus.revenueDropPercentage;
        activity.lastCheckedAt = new Date();

        await activity.save();

        results.scanned++;
        if (activity.isAtRisk) {
          results.atRisk++;
          
          // Send notification if newly at risk
          if (!wasAtRisk) {
            await Notification.create({
              tenantId: 'super_admin', // Notification for super admin
              type: 'system',
              title: 'Merchant At Risk Alert',
              message: `${tenant.name} (${tenant.subdomain}) is now at risk: ${riskStatus.riskReasons.join(', ')}`,
              data: {
                tenantId,
                tenantName: tenant.name,
                riskReasons: riskStatus.riskReasons
              }
            });
          }
        } else {
          results.healthy++;
        }
      } catch (error) {
        console.error(`Error scanning tenant ${tenant._id}:`, error);
        results.errors++;
      }
    }

    res.json({
      message: 'Merchant scan completed',
      results
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/merchant-tracking/:tenantId/track-login - Track login activity
merchantTrackingRouter.post('/:tenantId/track-login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId } = req.params;

    let activity = await MerchantActivity.findOne({ tenantId });
    
    if (!activity) {
      activity = new MerchantActivity({ tenantId });
    }

    activity.lastLoginAt = new Date();
    
    // Recalculate at-risk status
    const riskStatus = await calculateAtRiskStatus(tenantId);
    activity.isAtRisk = riskStatus.isAtRisk;
    activity.riskReasons = riskStatus.riskReasons;
    activity.revenueDropPercentage = riskStatus.revenueDropPercentage;
    activity.lastCheckedAt = new Date();

    await activity.save();

    res.json({ message: 'Login tracked' });
  } catch (error) {
    next(error);
  }
});

export default merchantTrackingRouter;
