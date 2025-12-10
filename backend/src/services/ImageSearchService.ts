import { v4 as uuidv4 } from 'uuid';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import axios from 'axios';
import path from 'path';
import fs from 'fs/promises';

/**
 * Backend Image Search Service
 * Handles feature extraction, vector embeddings, and similarity searches
 */

interface StoredEmbedding {
  id: string;
  productId?: number;
  imageId?: string;
  embedding: number[];
  type: 'product' | 'image';
  createdAt: Date;
  metadata?: Record<string, any>;
}

interface ProductRecord {
  id: number;
  name: string;
  price: number;
  image: string;
  category?: string;
  stock?: number;
}

interface SimilarityResult {
  productId: number;
  name: string;
  price: number;
  image: string;
  relevancyScore: number;
  distance: number;
  category?: string;
  stock?: number;
}

/**
 * In-memory vector store (for demo/development)
 * In production, use Pinecone, Milvus, or similar
 */
class VectorStore {
  private embeddings: Map<string, StoredEmbedding> = new Map();
  private indexedProducts: Set<number> = new Set();

  store(id: string, embedding: StoredEmbedding): void {
    this.embeddings.set(id, embedding);
    if (embedding.productId) {
      this.indexedProducts.add(embedding.productId);
    }
  }

  get(id: string): StoredEmbedding | undefined {
    return this.embeddings.get(id);
  }

  getByProductId(productId: number): StoredEmbedding | undefined {
    for (const embedding of this.embeddings.values()) {
      if (embedding.productId === productId) {
        return embedding;
      }
    }
    return undefined;
  }

  delete(id: string): boolean {
    const embedding = this.embeddings.get(id);
    const deleted = this.embeddings.delete(id);
    if (deleted && embedding?.productId) {
      this.indexedProducts.delete(embedding.productId);
    }
    return deleted;
  }

  getAllProductEmbeddings(): StoredEmbedding[] {
    return Array.from(this.embeddings.values()).filter(e => e.productId !== undefined);
  }

  getIndexedProductCount(): number {
    return this.indexedProducts.size;
  }

  clear(): void {
    this.embeddings.clear();
    this.indexedProducts.clear();
  }
}

export class ImageSearchService {
  private static instance: ImageSearchService;
  private vectorStore: VectorStore = new VectorStore();
  private model: mobilenet.MobileNet | null = null;
  private modelLoading: Promise<void> | null = null;
  private products: Map<number, ProductRecord> = new Map();
  private embeddingCache: Map<string, number[]> = new Map();

  private constructor() {}

  static getInstance(): ImageSearchService {
    if (!this.instance) {
      this.instance = new ImageSearchService();
    }
    return this.instance;
  }

  /**
   * Initialize the model (MobileNet for feature extraction)
   */
  async initializeModel(): Promise<void> {
    if (this.model) return;
    if (this.modelLoading) return this.modelLoading;

    this.modelLoading = (async () => {
      try {
        console.log('[ImageSearch] Loading MobileNet model...');
        this.model = await mobilenet.load();
        console.log('[ImageSearch] MobileNet model loaded successfully');
      } catch (error) {
        console.error('[ImageSearch] Model initialization failed:', error);
        throw error;
      }
    })();

    return this.modelLoading;
  }

  /**
   * Extract feature vector from image
   * Returns 2048-dimensional embedding
   */
  async extractEmbedding(imageUrl: string): Promise<number[]> {
    // Check cache first
    const cached = this.embeddingCache.get(imageUrl);
    if (cached) {
      return cached;
    }

    await this.initializeModel();
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    try {
      // Load image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      // Extract features using MobileNet
      const features = this.model.infer(img, true) as tf.Tensor;
      const embedding = await features.data();
      const embeddingArray: number[] = Array.from(embedding as unknown as Iterable<number>);

      // Cache result
      this.embeddingCache.set(imageUrl, embeddingArray);

      // Cleanup
      features.dispose();

      return embeddingArray;
    } catch (error) {
      console.error('[ImageSearch] Embedding extraction error:', error);
      throw error;
    }
  }

  /**
   * Store extracted embedding with metadata
   */
  async storeEmbedding(
    embedding: number[],
    type: 'product' | 'image',
    metadata?: {
      productId?: number;
      imageId?: string;
      name?: string;
      price?: number;
      category?: string;
    }
  ): Promise<string> {
    const id = uuidv4();

    this.vectorStore.store(id, {
      id,
      productId: metadata?.productId,
      imageId: metadata?.imageId,
      embedding,
      type,
      createdAt: new Date(),
      metadata
    });

    return id;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vector dimensions must match');
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      magnitudeA += vecA[i] * vecA[i];
      magnitudeB += vecB[i] * vecB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Find similar products using k-NN search
   * Returns top k most similar products sorted by relevance
   */
  async findSimilarProducts(
    queryEmbedding: number[],
    k: number = 50,
    filters?: {
      minStock?: number;
      categories?: string[];
      maxPrice?: number;
      minPrice?: number;
    }
  ): Promise<SimilarityResult[]> {
    const productEmbeddings = this.vectorStore.getAllProductEmbeddings();

    if (productEmbeddings.length === 0) {
      return [];
    }

    // Calculate similarity scores
    const similarities = productEmbeddings.map(embedding => {
      const similarity = this.cosineSimilarity(queryEmbedding, embedding.embedding);
      return {
        embedding,
        similarity,
        distance: 1 - similarity // Convert to distance
      };
    });

    // Sort by similarity (descending)
    similarities.sort((a, b) => b.similarity - a.similarity);

    // Apply filters
    let filtered = similarities.filter(({ embedding, similarity }) => {
      if (!embedding.metadata) return true;

      // Stock filter
      if (filters?.minStock !== undefined && (embedding.metadata.stock || 0) < filters.minStock) {
        return false;
      }

      // Category filter
      if (
        filters?.categories &&
        embedding.metadata.category &&
        !filters.categories.includes(embedding.metadata.category)
      ) {
        return false;
      }

      // Price filters
      if (
        filters?.maxPrice !== undefined &&
        (embedding.metadata.price || 0) > filters.maxPrice
      ) {
        return false;
      }

      if (
        filters?.minPrice !== undefined &&
        (embedding.metadata.price || 0) < filters.minPrice
      ) {
        return false;
      }

      return true;
    });

    // Return top k with formatted results
    return filtered.slice(0, k).map(({ embedding, similarity }) => ({
      productId: embedding.productId || 0,
      name: embedding.metadata?.name || 'Unknown Product',
      price: embedding.metadata?.price || 0,
      image: '', // Should come from product DB
      relevancyScore: similarity,
      distance: 1 - similarity,
      category: embedding.metadata?.category,
      stock: embedding.metadata?.stock
    }));
  }

  /**
   * Index all products with embeddings (bulk operation)
   */
  async indexProducts(productIds: number[]): Promise<{ indexed: number; failed: number }> {
    let indexed = 0;
    let failed = 0;

    for (const productId of productIds) {
      try {
        const product = this.products.get(productId);
        if (product) {
          const embedding = await this.extractEmbedding(product.image);
          await this.storeEmbedding(embedding, 'product', {
            productId,
            name: product.name,
            price: product.price,
            category: product.category
          });
          indexed++;
        }
      } catch (error) {
        console.error(`Failed to index product ${productId}:`, error);
        failed++;
      }
    }

    return { indexed, failed };
  }

  /**
   * Get service statistics
   */
  async getServiceStats(): Promise<{
    healthy: boolean;
    indexedProductCount: number;
    lastUpdated: Date;
  }> {
    return {
      healthy: this.model !== null,
      indexedProductCount: this.vectorStore.getIndexedProductCount(),
      lastUpdated: new Date()
    };
  }

  /**
   * Static methods for route handlers
   */
  static async extractAndStoreEmbedding(imageId: string, imageUrl: string): Promise<string> {
    const service = ImageSearchService.getInstance();
    const embedding = await service.extractEmbedding(imageUrl);
    return service.storeEmbedding(embedding, 'image', { imageId });
  }

  static async getImageEmbedding(imageId: string): Promise<StoredEmbedding | undefined> {
    const service = ImageSearchService.getInstance();
    // In production, lookup imageId in vector DB
    // For now, return a mock
    return undefined;
  }

  static async findSimilarProducts(
    queryEmbedding: number[],
    k: number,
    filters?: any
  ): Promise<SimilarityResult[]> {
    const service = ImageSearchService.getInstance();
    return service.findSimilarProducts(queryEmbedding, k, filters);
  }

  static async indexProducts(productIds: number[]): Promise<{ indexed: number; failed: number }> {
    const service = ImageSearchService.getInstance();
    return service.indexProducts(productIds);
  }

  static async getProductEmbedding(productId: number): Promise<StoredEmbedding | undefined> {
    const service = ImageSearchService.getInstance();
    return service.vectorStore.getByProductId(productId);
  }

  static async deleteImageEmbedding(imageId: string): Promise<void> {
    const service = ImageSearchService.getInstance();
    service.vectorStore.delete(imageId);
  }

  static async getServiceStats(): Promise<{
    healthy: boolean;
    indexedProductCount: number;
    lastUpdated: Date;
  }> {
    const service = ImageSearchService.getInstance();
    return service.getServiceStats();
  }

  /**
   * Register products for indexing
   */
  static registerProducts(products: ProductRecord[]): void {
    const service = ImageSearchService.getInstance();
    for (const product of products) {
      service.products.set(product.id, product);
    }
  }
}

export default ImageSearchService;
