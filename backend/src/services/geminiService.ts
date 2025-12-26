
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Ensure your environment variable is set as API_KEY
const getAIClient = () => {
  const apiKey = process.env.API_KEY || "";
  if (!apiKey) {
    console.warn("Gemini API Key is missing. Please check your environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Analyzes an image and returns descriptive tags for matching with your product database.
 */
export async function analyzeImage(base64Image: string): Promise<string[]> {
  const ai = getAIClient();
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image.split(',')[1] || base64Image,
    },
  };
  const textPart = {
    text: "Extract 5-7 core product search keywords from this image (e.g., 'vintage leather brown bag'). Provide only the keywords separated by commas."
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, textPart] },
    });

    const text = response.text || "";
    return text.split(',').map(tag => tag.trim().toLowerCase());
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return [];
  }
}

/**
 * Powerful AI editing for customer engagement - let users see products in different contexts.
 */
export async function editImageWithAI(base64Image: string, prompt: string): Promise<string | null> {
  const ai = getAIClient();
  const contents = {
    parts: [
      {
        inlineData: {
          data: base64Image.split(',')[1] || base64Image,
          mimeType: 'image/jpeg',
        },
      },
      { text: prompt },
    ],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: contents,
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Editing Error:", error);
    return null;
  }
}
