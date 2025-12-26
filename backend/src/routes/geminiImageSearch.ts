import { Router, Request, Response } from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

// Configure multer for memory storage (no file saved to disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
    }
  }
});

// Initialize Gemini AI
const getGeminiClient = () => {
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * POST /api/gemini-image-search
 * Analyzes an image using Google Gemini and returns a search keyword
 * 
 * Request: multipart/form-data with 'image' field
 * Response: { keyword: string, confidence: string }
 */
router.post('/', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ 
        error: 'No image provided',
        message: 'Please upload an image file'
      });
    }

    // Convert buffer to base64
    const base64Image = file.buffer.toString('base64');
    const mimeType = file.mimetype;

    // Initialize Gemini
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Create the prompt for product identification
    const prompt = `You are a product identification expert for an e-commerce platform. Analyze this image and identify the main product shown.

IMPORTANT RULES:
1. Return ONLY the most relevant search keyword (1-4 words maximum)
2. Focus on the specific product name, brand, or model if visible
3. If it's a well-known brand product, include the brand name
4. Be specific but concise (e.g., "iPhone 15 Pro", "Nike Air Max", "Samsung Galaxy Watch")
5. If you cannot identify the product, return a general category (e.g., "smartphone", "sneakers", "watch")
6. Do NOT include any explanations, punctuation, or extra text
7. Return the keyword in English

Examples of good responses:
- "iPhone 15 Pro Max"
- "Nike Air Jordan 1"
- "Samsung Galaxy S24"
- "Wireless Earbuds"
- "Leather Wallet"

Analyze the image and respond with ONLY the search keyword:`;

    // Send to Gemini
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64Image
        }
      }
    ]);

    const response = result.response;
    const keyword = response.text().trim();

    // Clean up the response - remove any quotes, periods, or extra whitespace
    const cleanKeyword = keyword
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/\.$/, '') // Remove trailing period
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    if (!cleanKeyword || cleanKeyword.length < 2) {
      return res.status(422).json({
        error: 'Could not identify product',
        message: 'Unable to identify the product in the image. Please try a clearer image.'
      });
    }

    console.log(`[Gemini Image Search] Identified: "${cleanKeyword}" from ${mimeType} image (${file.size} bytes)`);

    res.json({
      keyword: cleanKeyword,
      confidence: 'high',
      originalSize: file.size,
      mimeType: file.mimetype
    });

  } catch (error: any) {
    console.error('[Gemini Image Search] Error:', error);

    // Handle specific error types
    if (error.message?.includes('API key')) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'Image search service is not properly configured'
      });
    }

    if (error.message?.includes('SAFETY')) {
      return res.status(422).json({
        error: 'Content blocked',
        message: 'The image could not be processed. Please try a different image.'
      });
    }

    res.status(500).json({
      error: 'Processing failed',
      message: 'Failed to analyze the image. Please try again.'
    });
  }
});

/**
 * GET /api/gemini-image-search/health
 * Check if the Gemini service is configured and working
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    
    res.json({
      status: apiKey ? 'configured' : 'not_configured',
      model: 'gemini-2.0-flash-exp',
      maxFileSize: '10MB',
      supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed'
    });
  }
});

export default router;
