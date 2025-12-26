import { Router, Request, Response } from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Initialize Gemini AI
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  if (!apiKey) {
    throw new Error('Gemini API Key is missing');
  }
  return new GoogleGenerativeAI(apiKey);
};

interface ProductDetails {
  name: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  brand: string;
  color: string;
  material: string;
  tags: string[];
  condition: string;
  specifications: Record<string, string>;
}

/**
 * POST /api/gemini-image-search
 * Analyzes an uploaded image and extracts comprehensive product details
 */
router.post('/', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Convert image to base64
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';

    const prompt = `You are an expert product analyst. Analyze this product image and extract detailed information.

Return ONLY a valid JSON object with these exact fields (no markdown, no code blocks, just pure JSON):
{
  "name": "Full product name based on what you see",
  "category": "Main category (e.g., Electronics, Clothing, Shoes, Bags, Jewelry, Home & Garden, Sports, Beauty)",
  "subcategory": "More specific subcategory",
  "description": "Detailed 2-3 sentence product description highlighting key features and appeal",
  "estimatedPrice": {
    "min": minimum estimated price in BDT,
    "max": maximum estimated price in BDT,
    "suggested": suggested selling price in BDT
  },
  "brand": "Brand name if visible, otherwise 'Unbranded'",
  "color": "Primary color(s)",
  "material": "Main material(s) if identifiable",
  "size": "Size if applicable or 'N/A'",
  "condition": "New/Used/Refurbished based on appearance",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "specifications": {
    "key1": "value1",
    "key2": "value2"
  },
  "searchKeywords": "comma separated keywords for search optimization",
  "targetAudience": "Who would buy this product",
  "sellingPoints": ["point1", "point2", "point3"]
}

Be accurate with price estimates for Bangladesh market (BDT). Analyze carefully and provide realistic details.`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image,
        },
      },
      { text: prompt },
    ]);

    const responseText = result.response.text();
    
    // Clean up the response - remove markdown code blocks if present
    let cleanJson = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Parse the JSON response
    let productDetails;
    try {
      productDetails = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Raw response:', responseText);
      // Fallback: try to extract basic info
      productDetails = {
        name: 'Unknown Product',
        category: 'General',
        description: 'Product detected from image',
        estimatedPrice: { min: 500, max: 5000, suggested: 1500 },
        brand: 'Unbranded',
        color: 'Unknown',
        material: 'Unknown',
        tags: ['product'],
        searchKeywords: 'product',
      };
    }

    // Also extract a simple keyword for backward compatibility
    const keyword = productDetails.name || productDetails.tags?.[0] || 'product';

    res.json({
      success: true,
      keyword: keyword,
      productDetails: productDetails,
      message: 'Product analyzed successfully',
    });

  } catch (error: any) {
    console.error('Gemini Image Search Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze image',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined,
    });
  }
});

export default router;
