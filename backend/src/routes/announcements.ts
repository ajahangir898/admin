import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Announcement } from '../models/Announcement';
import { Notification } from '../models/Notification';
import { authenticateToken } from '../middleware/auth';
import mongoose from 'mongoose';

export const announcementsRouter = Router();

// Validation schemas
const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: z.enum(['maintenance', 'feature', 'update', 'alert', 'general']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  targetTenants: z.union([z.literal('all'), z.array(z.string())]).optional(),
  scheduledFor: z.string().optional() // ISO date string
});

const updateAnnouncementSchema = z.object({
  title: z.string().min(1).optional(),
  message: z.string().min(1).optional(),
  type: z.enum(['maintenance', 'feature', 'update', 'alert', 'general']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  targetTenants: z.union([z.literal('all'), z.array(z.string())]).optional(),
  status: z.enum(['draft', 'scheduled', 'sent']).optional(),
  scheduledFor: z.string().optional()
});

// GET /api/announcements - List announcements (super_admin only)
announcementsRouter.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    
    // Only super_admin can view announcements
    if (user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { status, type, page = '1', limit = '20' } = req.query;

    const query: any = {};
    
    if (status && ['draft', 'scheduled', 'sent'].includes(status as string)) {
      query.status = status;
    }
    
    if (type && ['maintenance', 'feature', 'update', 'alert', 'general'].includes(type as string)) {
      query.type = type;
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [announcements, total] = await Promise.all([
      Announcement.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Announcement.countDocuments(query)
    ]);

    res.json({
      data: announcements.map(a => ({
        id: a._id.toString(),
        ...a,
        _id: undefined
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/announcements/active - Get active announcements for tenants
announcementsRouter.get('/active', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId } = (req as any).user;

    // Get sent announcements that target this tenant or all tenants
    const announcements = await Announcement.find({
      status: 'sent',
      $or: [
        { targetTenants: 'all' },
        { targetTenants: tenantId }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({
      data: announcements.map(a => ({
        id: a._id.toString(),
        title: a.title,
        message: a.message,
        type: a.type,
        priority: a.priority,
        sentAt: a.sentAt,
        createdAt: a.createdAt,
        isRead: a.readBy?.includes(tenantId) || false
      }))
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/announcements/:id - Get single announcement
announcementsRouter.get('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid announcement ID' });
    }

    const announcement = await Announcement.findById(id).lean();
    
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    // Only super_admin can view all details, others can view sent announcements
    if (user.role !== 'super_admin' && announcement.status !== 'sent') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      data: {
        id: announcement._id.toString(),
        ...announcement,
        _id: undefined
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/announcements - Create new announcement (super_admin only)
announcementsRouter.post('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, email, role, name } = (req as any).user;
    
    if (role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can create announcements' });
    }

    const userName = name || email.split('@')[0];
    const validatedData = createAnnouncementSchema.parse(req.body);

    const announcement = new Announcement({
      title: validatedData.title,
      message: validatedData.message,
      type: validatedData.type || 'general',
      priority: validatedData.priority || 'medium',
      targetTenants: validatedData.targetTenants || 'all',
      createdBy: {
        userId,
        name: userName,
        email
      },
      scheduledFor: validatedData.scheduledFor ? new Date(validatedData.scheduledFor) : undefined,
      status: 'draft'
    });

    await announcement.save();

    res.status(201).json({
      message: 'Announcement created successfully',
      data: {
        id: announcement._id.toString(),
        ...announcement.toObject(),
        _id: undefined
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    next(error);
  }
});

// PATCH /api/announcements/:id - Update announcement (super_admin only)
announcementsRouter.patch('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = (req as any).user;
    const { id } = req.params;

    if (role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can update announcements' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid announcement ID' });
    }

    const announcement = await Announcement.findById(id);
    
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    const validatedData = updateAnnouncementSchema.parse(req.body);

    // Update fields
    if (validatedData.title !== undefined) announcement.title = validatedData.title;
    if (validatedData.message !== undefined) announcement.message = validatedData.message;
    if (validatedData.type !== undefined) announcement.type = validatedData.type;
    if (validatedData.priority !== undefined) announcement.priority = validatedData.priority;
    if (validatedData.targetTenants !== undefined) announcement.targetTenants = validatedData.targetTenants;
    if (validatedData.status !== undefined) announcement.status = validatedData.status;
    if (validatedData.scheduledFor !== undefined) {
      announcement.scheduledFor = new Date(validatedData.scheduledFor);
    }

    await announcement.save();

    res.json({
      message: 'Announcement updated successfully',
      data: {
        id: announcement._id.toString(),
        ...announcement.toObject(),
        _id: undefined
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    next(error);
  }
});

// POST /api/announcements/:id/send - Send announcement (super_admin only)
announcementsRouter.post('/:id/send', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = (req as any).user;
    const { id } = req.params;

    if (role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can send announcements' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid announcement ID' });
    }

    const announcement = await Announcement.findById(id);
    
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    if (announcement.status === 'sent') {
      return res.status(400).json({ error: 'Announcement already sent' });
    }

    // Update announcement status
    announcement.status = 'sent';
    announcement.sentAt = new Date();
    await announcement.save();

    // Create notifications for target tenants
    const io = req.app.get('io');
    
    if (announcement.targetTenants === 'all') {
      // Get all tenants from the database
      const { listTenants } = await import('../services/tenantsService');
      const tenants = await listTenants();
      
      // Create notifications for all tenants
      const notifications = tenants.map(tenant => ({
        tenantId: tenant._id.toString(),
        type: 'system' as const,
        title: announcement.title,
        message: announcement.message,
        data: {
          announcementId: announcement._id.toString(),
          announcementType: announcement.type,
          priority: announcement.priority
        },
        isRead: false
      }));

      await Notification.insertMany(notifications);

      // Emit socket events for real-time notifications
      if (io) {
        for (const tenant of tenants) {
          io.to(`tenant:${tenant._id.toString()}`).emit('new-announcement', {
            id: announcement._id.toString(),
            title: announcement.title,
            message: announcement.message,
            type: announcement.type,
            priority: announcement.priority
          });
        }
      }
    } else if (Array.isArray(announcement.targetTenants)) {
      // Create notifications for specific tenants
      const notifications = announcement.targetTenants.map(tenantId => ({
        tenantId,
        type: 'system' as const,
        title: announcement.title,
        message: announcement.message,
        data: {
          announcementId: announcement._id.toString(),
          announcementType: announcement.type,
          priority: announcement.priority
        },
        isRead: false
      }));

      await Notification.insertMany(notifications);

      // Emit socket events
      if (io) {
        for (const tenantId of announcement.targetTenants) {
          io.to(`tenant:${tenantId}`).emit('new-announcement', {
            id: announcement._id.toString(),
            title: announcement.title,
            message: announcement.message,
            type: announcement.type,
            priority: announcement.priority
          });
        }
      }
    }

    res.json({
      message: 'Announcement sent successfully',
      data: {
        id: announcement._id.toString(),
        ...announcement.toObject(),
        _id: undefined
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/announcements/:id/mark-read - Mark announcement as read
announcementsRouter.post('/:id/mark-read', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId } = (req as any).user;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid announcement ID' });
    }

    const announcement = await Announcement.findById(id);
    
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    // Add tenantId to readBy array if not already present
    if (!announcement.readBy.includes(tenantId)) {
      announcement.readBy.push(tenantId);
      await announcement.save();
    }

    res.json({ message: 'Announcement marked as read' });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/announcements/:id - Delete announcement (super_admin only)
announcementsRouter.delete('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = (req as any).user;
    const { id } = req.params;

    if (role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can delete announcements' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid announcement ID' });
    }

    const announcement = await Announcement.findById(id);
    
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    await Announcement.deleteOne({ _id: id });

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default announcementsRouter;
