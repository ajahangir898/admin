// Lazy load Google AI to reduce initial bundle size (~94kB)
let GoogleGenAIModule: typeof import('@google/genai') | null = null;
const getGoogleGenAI = async () => {
  if (!GoogleGenAIModule) {
    GoogleGenAIModule = await import('@google/genai');
  }
  return GoogleGenAIModule;
};

export interface VisualSearchResult {
  productName: string;
  brand: string | null;
  estimatedPrice: string | null;
  category: string | null;
  description: string | null;
}

const PROMPT = `You are a retail product expert assisting visual product search. Analyze the provided product photo and respond ONLY with valid JSON matching this TypeScript interface:
{
  "productName": string;
  "brand": string | null;
  "estimatedPrice": string | null;
  "category": string | null;
  "description": string | null;
}
Guidelines:
- productName should be concise and human readable.
- brand should be null if unknown.
- estimatedPrice should be a single currency-formatted string or null.
- category should be null if you cannot infer it confidently.
- description should be a short marketing style summary (max 45 words).
- Never include extra keys, markdown, or commentary.`;

const resolveApiKey = () => {
  const metaEnv =
    typeof import.meta !== 'undefined'
      ? (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {}
      : {};

  const nodeEnv = typeof process !== 'undefined' ? process.env ?? {} : {};

  const key =
    metaEnv.VITE_GEMINI_API_KEY ||
    metaEnv.VITE_GOOGLE_AI_API_KEY ||
    nodeEnv.VITE_GEMINI_API_KEY ||
    nodeEnv.VITE_GOOGLE_AI_API_KEY ||
    nodeEnv.GEMINI_API_KEY ||
    nodeEnv.GOOGLE_AI_API_KEY ||
    '';

  return key?.trim() || '';
};

const ensureClient = async (apiKey: string) => {
  if (!apiKey) {
    throw new Error(
      'Gemini API key is missing. Add VITE_GEMINI_API_KEY (or VITE_GOOGLE_AI_API_KEY) to your environment configuration.'
    );
  }

  const { GoogleGenAI } = await getGoogleGenAI();
  return new GoogleGenAI({
    apiKey,
    apiVersion: 'v1alpha',
  });
};

const sanitizeBase64 = (dataUrl: string) => {
  if (!dataUrl) throw new Error('No image data provided for visual search.');
  const [, payload] = dataUrl.split(',');
  return payload || dataUrl;
};

const normalizeResult = (raw: Partial<Record<keyof VisualSearchResult, unknown>>): VisualSearchResult => ({
  productName: typeof raw.productName === 'string' && raw.productName.trim().length
    ? raw.productName.trim()
    : 'Unknown Product',
  brand:
    typeof raw.brand === 'string' && raw.brand.trim().length
      ? raw.brand.trim()
      : null,
  estimatedPrice:
    typeof raw.estimatedPrice === 'string' && raw.estimatedPrice.trim().length
      ? raw.estimatedPrice.trim()
      : null,
  category:
    typeof raw.category === 'string' && raw.category.trim().length
      ? raw.category.trim()
      : null,
  description:
    typeof raw.description === 'string' && raw.description.trim().length
      ? raw.description.trim()
      : null,
});

export const identifyProduct = async (base64Image: string): Promise<VisualSearchResult> => {
  const apiKey = resolveApiKey();
  const client = await ensureClient(apiKey);
  const encodedImage = sanitizeBase64(base64Image);

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: PROMPT },
            { inlineData: { mimeType: 'image/jpeg', data: encodedImage } },
          ],
        },
      ],
      config: { responseMimeType: 'application/json' },
    });

    const textResponse = response.text || '';

    if (!textResponse) {
      throw new Error('Gemini returned an empty response.');
    }

    const parsed = JSON.parse(textResponse);
    return normalizeResult(parsed);
  } catch (error: any) {
    if (error?.message?.includes('API key')) throw error;
    console.error('Visual search failed', error);
    throw new Error(error?.message || 'Unable to identify product from the provided image.');
  }
};
