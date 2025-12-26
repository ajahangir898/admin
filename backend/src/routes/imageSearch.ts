import { Router, Request, Response } from 'express';
import multer, { StorageEngine, FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import ImageSearchService from '../services/ImageSearchService';

/**
 * Image Search Routes
 * Handles image uploads, vector embeddings, and similarity searches
 */

const router = Router();

// Configure multer for image uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: async (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
      const uploadDir = path.join(process.cwd(), 'uploads', 'images');
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      const id = uuidv4();
      const ext = path.extname(file.originalname);
      cb(null, `${id}${ext}`);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

/**
 * POST /api/image-search/upload
 * Upload image file or download from URL
 * Returns: { imageId, imageUrl, size, uploadedAt }
 */
router.post('/upload', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const type = req.body.type || 'file';
    let imageId: string;
    let imageUrl: string;
    let fileSize: number;

    if (type === 'url' && req.body.url) {
      // Download image from URL
      const url = req.body.url;
      imageId = uuidv4();
      const uploadDir = path.join(process.cwd(), 'uploads', 'images');
      const filePath = path.join(uploadDir, `${imageId}.jpg`);

      try {
        const response = await axios.get(url, {
          responseType: 'arraybuffer',
          timeout: 10000
        });

        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(filePath, Buffer.from(response.data));

        fileSize = response.data.length;
        imageUrl = `https://systemnextit.com/uploads/images/${imageId}.jpg`;
      } catch (error) {
        console.error('URL download error:', error);
        return res.status(400).json({ error: 'Failed to download image from URL' });
      }
    } else if (type === 'file' && (req as any).file) {
      // File uploaded via multipart
      const file = (req as any).file as Express.Multer.File;
      imageId = path.parse(file.filename).name;
      fileSize = file.size;
      imageUrl = `https://systemnextit.com/uploads/images/${file.filename}`;
    } else {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Trigger embedding extraction (async)
    ImageSearchService.extractAndStoreEmbedding(imageId, imageUrl).catch((error: Error) => {
      console.error('Embedding extraction error:', error);
    });

    res.json({
      imageId,
      imageUrl,
      size: fileSize,
      uploadedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

/**
 * GET /api/image-search/query
 * Search for similar products based on image embedding
 * Query params: imageId, topK=50, minStock, categories, maxPrice, minPrice
 * Returns: [{ productId, name, price, image, relevancyScore, ... }]
 */
router.get('/query', async (req: Request, res: Response) => {
  try {
    const { imageId, topK = '50', minStock, categories, maxPrice, minPrice } = req.query;

    if (!imageId) {
      return res.status(400).json({ error: 'imageId is required' });
    }

    // Get image embedding
    const imageEmbedding = await ImageSearchService.getImageEmbedding(imageId as string);
    if (!imageEmbedding) {
      return res.status(404).json({ error: 'Image not found or embedding not ready' });
    }

    // Search for similar products
    const k = Math.min(parseInt(topK as string) || 50, 500);
    const filters = {
      minStock: minStock ? parseInt(minStock as string) : undefined,
      categories: categories ? (categories as string).split(',') : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice as string) : undefined,
      minPrice: minPrice ? parseInt(minPrice as string) : undefined
    };

    const results = await ImageSearchService.findSimilarProducts(
      imageEmbedding.embedding,
      k,
      filters
    );

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * POST /api/image-search/index
 * Index products with vector embeddings
 * Admin endpoint to pre-compute and store embeddings
 */
router.post('/index', async (req: Request, res: Response) => {
  try {
    const { productIds = [] } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'productIds array is required' });
    }

    // Trigger async indexing
    const result = await ImageSearchService.indexProducts(productIds);

    res.json({
      indexed: result.indexed,
      failed: result.failed,
      message: `${result.indexed} products indexed, ${result.failed} failed`
    });
  } catch (error) {
    console.error('Indexing error:', error);
    res.status(500).json({ error: 'Indexing failed' });
  }
});

/**
 * GET /api/image-search/embeddings/:productId
 * Get embedding vector for a specific product
 * For debugging/analytics
 */
router.get('/embeddings/:productId', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);
    const embedding = await ImageSearchService.getProductEmbedding(productId);

    if (!embedding) {
      return res.status(404).json({ error: 'Product embedding not found' });
    }

    res.json(embedding);
  } catch (error) {
    console.error('Embedding fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch embedding' });
  }
});

/**
 * DELETE /api/image-search/images/:imageId
 * Clean up uploaded image
 */
router.delete('/images/:imageId', async (req: Request, res: Response) => {
  try {
    const { imageId } = req.params;

    // Delete from storage
    const uploadDir = path.join(process.cwd(), 'uploads', 'images');
    const files = await fs.readdir(uploadDir);
    const fileToDelete = files.find(f => f.startsWith(imageId));

    if (fileToDelete) {
      await fs.unlink(path.join(uploadDir, fileToDelete));
    }

    // Delete from vector DB
    await ImageSearchService.deleteImageEmbedding(imageId);

    res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    console.error('Deletion error:', error);
    res.status(500).json({ error: 'Deletion failed' });
  }
});

/**
 * GET /api/image-search/health
 * Service health and status
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const stats = await ImageSearchService.getServiceStats();

    res.json({
      status: stats.healthy ? 'healthy' : 'degraded',
      version: '1.0.0',
      indexedProducts: stats.indexedProductCount,
      vectorDimensions: 2048,
      model: 'ResNet-50 CNN',
      lastUpdated: stats.lastUpdated
    });
  } catch (error) {
    res.status(500).json({
      status: 'offline',
      version: '1.0.0',
      error: 'Service unavailable'
    });
  }
});

export default router;
