import express, { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Create upload directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'uploads', 'images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_FOLDERS = new Set(['carousel']);

const sanitizeFolder = (value: unknown): string | null => {
  const folder = typeof value === 'string' ? value.trim() : '';
  if (!folder) return null;
  if (!ALLOWED_FOLDERS.has(folder)) return null;
  return folder;
};

// Configure multer for image uploads - use memory storage first, then save to disk
const memoryStorage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow only image files
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Error handling middleware for multer
const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 5MB.',
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      error: err.message || 'Upload failed',
    });
  }
  next();
};

/**
 * POST /api/upload
 * Upload a single image
 */
router.post('/api/upload', upload.single('file'), handleMulterError, (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    // Get tenant ID from body (now available after multer parses form data)
    const tenantId = req.body.tenantId || 'default';

    // Optional folder for special asset buckets (e.g., carousel)
    const folder = sanitizeFolder(req.body.folder);
    
    // Create tenant directory if it doesn't exist
    const tenantDir = folder
      ? path.join(uploadDir, folder, tenantId)
      : path.join(uploadDir, tenantId);
    if (!fs.existsSync(tenantDir)) {
      fs.mkdirSync(tenantDir, { recursive: true });
    }

    // Generate unique filename
    const ext = path.extname(req.file.originalname) || '.jpg';
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(tenantDir, filename);

    // Write file to disk
    fs.writeFileSync(filePath, req.file.buffer);

    const imageUrl = folder
      ? `/uploads/images/${folder}/${tenantId}/${filename}`
      : `/uploads/images/${tenantId}/${filename}`;

    console.log(`[upload] Image saved: ${imageUrl}`);

    res.json({
      success: true,
      imageUrl,
      imageId: filename,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    });
  }
});

/**
 * DELETE /api/upload
 * Delete an uploaded image
 */
router.delete('/api/upload', (req: Request, res: Response) => {
  try {
    const { imageUrl, tenantId } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Image URL is required',
      });
    }

    // Resolve to local filesystem path.
    // Expecting paths like:
    //   /uploads/images/<tenantId>/<file>
    //   /uploads/images/carousel/<tenantId>/<file>
    const relative = String(imageUrl)
      .replace(/^https?:\/\/[^/]+/i, '')
      .trim();

    if (!relative.startsWith('/uploads/images/')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image URL',
      });
    }

    const expectedTenantId = tenantId || 'default';
    const parts = relative.split('/').filter(Boolean); // [uploads, images, ...]

    // parts[0]=uploads parts[1]=images
    const maybeFolder = parts[2];
    const hasFolder = ALLOWED_FOLDERS.has(maybeFolder);
    const resolvedTenantId = hasFolder ? parts[3] : parts[2];
    const filename = parts[hasFolder ? 4 : 3];

    if (!resolvedTenantId || !filename) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image URL',
      });
    }

    // Enforce tenant scoping: only allow deleting within the provided tenant
    if (resolvedTenantId !== expectedTenantId) {
      return res.status(403).json({
        success: false,
        error: 'Tenant mismatch',
      });
    }

    const filePath = hasFolder
      ? path.join(uploadDir, maybeFolder, resolvedTenantId, filename)
      : path.join(uploadDir, resolvedTenantId, filename);

    // Check if file exists and delete it
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    });
  }
});

/**
 * POST /api/upload/fix-base64
 * Convert a base64 image to a file and upload it
 * Used to fix carousel images that were incorrectly stored as base64
 */
router.post('/api/upload/fix-base64', express.json({ limit: '50mb' }), async (req: Request, res: Response) => {
  try {
    const { base64Data, tenantId, folder, filename } = req.body;

    if (!base64Data || !tenantId) {
      return res.status(400).json({
        success: false,
        error: 'base64Data and tenantId are required',
      });
    }

    // Validate base64 data format
    const base64Match = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      return res.status(400).json({
        success: false,
        error: 'Invalid base64 image format',
      });
    }

    const imageType = base64Match[1];
    const base64Content = base64Match[2];
    const buffer = Buffer.from(base64Content, 'base64');

    // Validate folder if provided
    const validatedFolder = sanitizeFolder(folder);

    // Create tenant directory if it doesn't exist
    const tenantDir = validatedFolder
      ? path.join(uploadDir, validatedFolder, tenantId)
      : path.join(uploadDir, tenantId);
    if (!fs.existsSync(tenantDir)) {
      fs.mkdirSync(tenantDir, { recursive: true });
    }

    // Generate unique filename
    const ext = imageType === 'webp' ? '.webp' : imageType === 'png' ? '.png' : '.jpg';
    const finalFilename = filename || `${uuidv4()}${ext}`;
    const filePath = path.join(tenantDir, finalFilename);

    // Write file to disk
    fs.writeFileSync(filePath, buffer);

    const imageUrl = validatedFolder
      ? `/uploads/images/${validatedFolder}/${tenantId}/${finalFilename}`
      : `/uploads/images/${tenantId}/${finalFilename}`;

    console.log(`[upload] Base64 image converted and saved: ${imageUrl}`);

    res.json({
      success: true,
      imageUrl,
      imageId: finalFilename,
    });
  } catch (error) {
    console.error('Base64 conversion error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Conversion failed',
    });
  }
});

export default router;
