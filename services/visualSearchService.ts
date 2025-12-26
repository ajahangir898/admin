/**
 * Visual Search Service using Google Gemini AI
 * Lazy-loaded to avoid affecting initial page load
 */

export interface VisualSearchResult {
  searchTerms: string[];
  description: string;
  categories: string[];
  colors: string[];
  confidence: number;
}

// Lazy-load the API key only when needed
const getApiKey = (): string => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not configured');
  }
  return apiKey;
};

/**
 * Convert file to base64 for Gemini API
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Analyze image using Gemini Vision API
 * Returns search terms and product attributes
 */
export const analyzeImage = async (imageFile: File): Promise<VisualSearchResult> => {
  const apiKey = getApiKey();
  const base64Image = await fileToBase64(imageFile);
  
  const prompt = `Analyze this product image and provide:
1. Search terms (5-8 keywords that would help find similar products)
2. A brief product description (1-2 sentences)
3. Product categories it might belong to (e.g., electronics, clothing, accessories)
4. Main colors visible in the product
5. Confidence score (0-100) for your analysis

Respond in JSON format:
{
  "searchTerms": ["term1", "term2", ...],
  "description": "brief description",
  "categories": ["category1", "category2"],
  "colors": ["color1", "color2"],
  "confidence": 85
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: imageFile.type,
                  data: base64Image,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textContent) {
    throw new Error('No response from Gemini API');
  }

  // Parse JSON from response (handle markdown code blocks)
  const jsonMatch = textContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                    textContent.match(/```\s*([\s\S]*?)\s*```/) ||
                    [null, textContent];
  
  const jsonStr = jsonMatch[1] || textContent;
  
  try {
    const result = JSON.parse(jsonStr.trim());
    return {
      searchTerms: result.searchTerms || [],
      description: result.description || '',
      categories: result.categories || [],
      colors: result.colors || [],
      confidence: result.confidence || 0,
    };
  } catch {
    // If JSON parsing fails, extract what we can
    return {
      searchTerms: textContent.split(/[,\n]/).slice(0, 5).map((s: string) => s.trim()).filter(Boolean),
      description: textContent.slice(0, 200),
      categories: [],
      colors: [],
      confidence: 50,
    };
  }
};

/**
 * Search products by visual search results
 */
export const searchProductsByVisualResult = <T extends { 
  name: string; 
  description?: string; 
  category?: string; 
  tags?: string[];
  searchTags?: string[];
  colors?: string[];
}>(
  products: T[],
  visualResult: VisualSearchResult
): T[] => {
  const { searchTerms, categories, colors } = visualResult;
  
  // Create search terms set for faster lookup
  const searchSet = new Set(searchTerms.map(t => t.toLowerCase()));
  const categorySet = new Set(categories.map(c => c.toLowerCase()));
  const colorSet = new Set(colors.map(c => c.toLowerCase()));
  
  // Score each product
  const scoredProducts = products.map(product => {
    let score = 0;
    const productText = [
      product.name,
      product.description || '',
      product.category || '',
      ...(product.tags || []),
      ...(product.searchTags || []),
    ].join(' ').toLowerCase();
    
    // Match search terms
    for (const term of searchSet) {
      if (productText.includes(term)) {
        score += 10;
      }
    }
    
    // Match categories
    const productCategory = (product.category || '').toLowerCase();
    for (const cat of categorySet) {
      if (productCategory.includes(cat) || cat.includes(productCategory)) {
        score += 15;
      }
    }
    
    // Match colors
    const productColors = (product.colors || []).map(c => c.toLowerCase());
    for (const color of colorSet) {
      if (productColors.some(pc => pc.includes(color) || color.includes(pc))) {
        score += 5;
      }
    }
    
    return { product, score };
  });
  
  // Filter and sort by score
  return scoredProducts
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ product }) => product);
};
