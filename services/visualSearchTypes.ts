// Visual Search types - separate file to avoid bundling Google AI
export interface VisualSearchResult {
  productName: string;
  brand: string | null;
  estimatedPrice: string | null;
  category: string | null;
  description: string | null;
}
