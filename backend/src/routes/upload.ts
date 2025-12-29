import express, { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const uploadDir = path.join(process.cwd(), 'uploads', 'images');
const ALLOWED_FOLDERS = new Set(['carousel']);

// Ensure upload directory exists
fs.mkdirSync(uploadDir, { recursive: true });

// Helpers
const sanitizeFolder = (value: unknown): string | null => {
  const folder = typeof value === 'string' ? value.trim() : '';
  return ALLOWED_FOLDERS.has(folder) ? folder : null;
};

const buildPath = (folder: string | null, tenantId: string, filename: string) => {
  const parts = folder ? [uploadDir, folder, tenantId] : [uploadDir, tenantId];
  return { dir: path.join(...parts), url: `/${parts.join('/')}/${filename}`.replace(process.cwd().replace(/\\/g, '/'), '') };
};

const getImageUrl = (folder: string | null, tenantId: string, filename: string) =>
  folder ? `/uploads/images/${folder}/${tenantId}/${filename}` : `/uploads/images/${tenantId}/${filename}`;

// Multer config
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    cb(null, allowed.includes(file.mimetype));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Error handler
const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'File too large. Maximum size is 5MB.' : err.message || 'Upload failed';
    return res.status(400).json({ success: false, error: msg });
  }
  next();
};

// POST /api/upload - Upload image
router.post('/api/upload', upload.single('file'), handleMulterError, (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

    const tenantId = req.body.tenantId || 'default';
    const folder = sanitizeFolder(req.body.folder);
    const tenantDir = folder ? path.join(uploadDir, folder, tenantId) : path.join(uploadDir, tenantId);
    
    fs.mkdirSync(tenantDir, { recursive: true });
    
    const filename = `${uuidv4()}${path.extname(req.file.originalname) || '.jpg'}`;
    fs.writeFileSync(path.join(tenantDir, filename), req.file.buffer);
    
    const imageUrl = getImageUrl(folder, tenantId, filename);
    console.log(`[upload] Image saved: ${imageUrl}`);
    
    res.json({ success: true, imageUrl, imageId: filename });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Upload failed' });
  }
});

// DELETE /api/upload - Delete image
router.delete('/api/upload', (req: Request, res: Response) => {
  try {
    const { imageUrl, tenantId = 'default' } = req.body;
    if (!imageUrl) return res.status(400).json({ success: false, error: 'Image URL is required' });

    const relative = String(imageUrl).replace(/^https?:\/\/[^/]+/i, '').trim();
    if (!relative.startsWith('/uploads/images/')) return res.status(400).json({ success: false, error: 'Invalid image URL' });

    const parts = relative.split('/').filter(Boolean);
    const hasFolder = ALLOWED_FOLDERS.has(parts[2]);
    const [resolvedTenantId, filename] = hasFolder ? [parts[3], parts[4]] : [parts[2], parts[3]];

    if (!resolvedTenantId || !filename) return res.status(400).json({ success: false, error: 'Invalid image URL' });
    if (resolvedTenantId !== tenantId) return res.status(403).json({ success: false, error: 'Tenant mismatch' });

    const filePath = hasFolder
      ? path.join(uploadDir, parts[2], resolvedTenantId, filename)
      : path.join(uploadDir, resolvedTenantId, filename);

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Delete failed' });
  }
});

// POST /api/upload/fix-base64 - Convert base64 to file
router.post('/api/upload/fix-base64', express.json({ limit: '50mb' }), (req: Request, res: Response) => {
  try {
    const { base64Data, tenantId, folder, filename } = req.body;
    if (!base64Data || !tenantId) return res.status(400).json({ success: false, error: 'base64Data and tenantId are required' });

    const match = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!match) return res.status(400).json({ success: false, error: 'Invalid base64 image format' });

    const validatedFolder = sanitizeFolder(folder);
    const tenantDir = validatedFolder ? path.join(uploadDir, validatedFolder, tenantId) : path.join(uploadDir, tenantId);
    fs.mkdirSync(tenantDir, { recursive: true });

    const extMap: Record<string, string> = { webp: '.webp', png: '.png' };
    const ext = extMap[match[1] as string] || '.jpg';
    const finalFilename = filename || `${uuidv4()}${ext}`;
    fs.writeFileSync(path.join(tenantDir, finalFilename), Buffer.from(match[2], 'base64'));

    const imageUrl = getImageUrl(validatedFolder, tenantId, finalFilename);
    console.log(`[upload] Base64 converted: ${imageUrl}`);
    
    res.json({ success: true, imageUrl, imageId: finalFilename });
  } catch (error) {
    console.error('Base64 conversion error:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Conversion failed' });
  }
});

export default router;
