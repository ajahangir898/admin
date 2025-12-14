import { ImageSearchResult } from '../components/ImageSearch';

/**
 * Image Search Service
 * Handles all image search API calls and vector embedding operations
 */

export interface ImageUploadResponse {
  imageId: string;
  imageUrl: string;
  size: number;
  uploadedAt: string;
}

export interface VectorEmbedding {
  productId: number;
  embedding: number[];
  dimensions: number;
}

export interface SimilarityMatch {
  productId: number;
  name: string;
  price: number;
  image: string;
  category?: string;
  stock?: number;
  relevancyScore: number;
  distance?: number; // Raw similarity distance
}

export interface ImageSearchServiceConfig {
  apiBaseUrl: string;
  uploadEndpoint: string;
  searchEndpoint: string;
  timeoutMs: number;
}

const DEFAULT_CONFIG: ImageSearchServiceConfig = {
  apiBaseUrl: 'https://systemnextit.com',
  uploadEndpoint: '/api/image-search/upload',
  searchEndpoint: '/api/image-search/query',
  timeoutMs: 30000
};

/**
 * ImageSearchService - Handles image search operations with vector embeddings
 */
export class ImageSearchService {
  private config: ImageSearchServiceConfig;

  constructor(config: Partial<ImageSearchServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Upload an image (file or URL) and get an image ID
   */
  async uploadImage(imageData: {
    file?: File;
    url?: string;
  }): Promise<ImageUploadResponse> {
    const formData = new FormData();

    if (imageData.file) {
      formData.append('image', imageData.file);
      formData.append('type', 'file');
    } else if (imageData.url) {
      formData.append('url', imageData.url);
      formData.append('type', 'url');
    } else {
      throw new Error('Either file or URL must be provided');
    }

    try {
      const response = await this.fetchWithTimeout(
        `${this.config.apiBaseUrl}${this.config.uploadEndpoint}`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  }

  /**
   * Query for similar products based on image
   * Uses k-NN vector similarity search
   */
  async searchSimilarProducts(
    imageId: string,
    options: {
      topK?: number;
      filters?: {
        minStock?: number;
        categories?: string[];
        maxPrice?: number;
        minPrice?: number;
      };
    } = {}
  ): Promise<SimilarityMatch[]> {
    const { topK = 50, filters = {} } = options;

    try {
      const queryParams = new URLSearchParams({
        imageId,
        topK: String(topK),
        ...(filters.minStock !== undefined && { minStock: String(filters.minStock) }),
        ...(filters.maxPrice !== undefined && { maxPrice: String(filters.maxPrice) }),
        ...(filters.minPrice !== undefined && { minPrice: String(filters.minPrice) }),
        ...(filters.categories && { categories: filters.categories.join(',') })
      });

      const response = await this.fetchWithTimeout(
        `${this.config.apiBaseUrl}${this.config.searchEndpoint}?${queryParams}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Image search error:', error);
      throw error;
    }
  }

  /**
   * One-shot search: Upload image and search in one call
   */
  async searchByImageFile(
    file: File,
    options?: Parameters<typeof this.searchSimilarProducts>[1]
  ): Promise<SimilarityMatch[]> {
    const uploadResponse = await this.uploadImage({ file });
    return this.searchSimilarProducts(uploadResponse.imageId, options);
  }

  /**
   * Search by image URL
   */
  async searchByImageUrl(
    url: string,
    options?: Parameters<typeof this.searchSimilarProducts>[1]
  ): Promise<SimilarityMatch[]> {
    const uploadResponse = await this.uploadImage({ url });
    return this.searchSimilarProducts(uploadResponse.imageId, options);
  }

  /**
   * Extract and store vector embeddings for products
   * Called by admin to index products for search
   */
  async indexProductEmbeddings(
    productIds: number[]
  ): Promise<{ indexed: number; failed: number }> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.config.apiBaseUrl}/api/image-search/index`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productIds })
        }
      );

      if (!response.ok) {
        throw new Error(`Indexing failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Indexing error:', error);
      throw error;
    }
  }

  /**
   * Get embedding for a specific product (for debugging/analytics)
   */
  async getProductEmbedding(productId: number): Promise<VectorEmbedding> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.config.apiBaseUrl}/api/image-search/embeddings/${productId}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch embedding: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Embedding fetch error:', error);
      throw error;
    }
  }

  /**
   * Delete uploaded image (cleanup)
   */
  async deleteUploadedImage(imageId: string): Promise<void> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.config.apiBaseUrl}/api/image-search/images/${imageId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Image deletion error:', error);
      throw error;
    }
  }

  /**
   * Get service health status
   */
  async getServiceStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'offline';
    version: string;
    indexedProducts: number;
  }> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.config.apiBaseUrl}/api/image-search/health`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('Service unavailable');
      }

      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      return {
        status: 'offline',
        version: 'unknown',
        indexedProducts: 0
      };
    }
  }

  /**
   * Fetch with timeout wrapper
   */
  private fetchWithTimeout(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    return Promise.race([
      fetch(url, options),
      new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), this.config.timeoutMs)
      )
    ]);
  }
}

// Global instance
export const imageSearchService = new ImageSearchService();

export default ImageSearchService;
