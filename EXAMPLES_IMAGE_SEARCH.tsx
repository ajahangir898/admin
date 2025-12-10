/**
 * Image Search - Integration Examples & Usage Patterns
 * Shows how to integrate image search throughout the application
 */

import React from 'react';
import { ImageIcon } from 'lucide-react';
import { Dialog } from '@radix-ui/react-dialog';
import { ImageSearch } from '@/components/ImageSearch';
import { Product } from '@/types';
import { DataService } from '@/services/DataService';
import { imageSearchService } from '@/services/ImageSearchService';

// ============================================================================
// EXAMPLE 1: Add Image Search Button to Header
// ============================================================================

export const HeaderWithImageSearch = () => {
  const handleImageSearch = () => {
    // Navigate to image search page
    window.location.href = '/?page=image-search';
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search products..."
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button
          onClick={handleImageSearch}
          className="p-2 hover:bg-gray-100 rounded-lg"
          title="Search by image"
          aria-label="Search by image"
        >
          <ImageIcon size={20} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// EXAMPLE 2: Add Image Search to Product Detail Page
// ============================================================================

// Note: Import StoreProductDetail from your pages
// import { StoreProductDetail } from '@/pages/StoreProductDetail';

export const ProductDetailWithImageSearch = (props: any) => {
  const handleSimilarImageSearch = () => {
    // Start image search with current product image
    const params = new URLSearchParams({
      page: 'image-search',
      seedImage: props.product.image
    });
    window.location.href = `/?${params}`;
  };

  return (
    <div>
      <StoreProductDetail {...props} />
      
      {/* Add "Find Similar by Image" button */}
      <button
        onClick={handleSimilarImageSearch}
        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
      >
        <ImageIcon size={18} />
        Find Similar Products
      </button>
    </div>
  );
};

// ============================================================================
// EXAMPLE 3: Image Search in Modal/Drawer
// ============================================================================

export const ImageSearchModal = ({ isOpen, onClose }: any) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
          <h2 className="text-2xl font-bold mb-4">Search by Image</h2>
          
          <ImageSearch
            onSearch={async (imageId, imageUrl) => {
              return await imageSearchService.searchByImageUrl(imageUrl);
            }}
            variant="full"
          />
        </div>
      </div>
    </Dialog>
  );
};

// ============================================================================
// EXAMPLE 4: Image Search with Product Service Integration
// ============================================================================

export class ImageSearchProductService {
  /**
   * Get product details for search results
   */
  static async enrichSearchResults(
    results: any[],
    tenantId: string
  ): Promise<Product[]> {
    const products = await DataService.getProducts(tenantId);
    
    return results.map(result => {
      const product = products.find(p => p.id === result.productId);
      return {
        ...result,
        ...product,
        relevancyScore: result.relevancyScore
      };
    });
  }

  /**
   * Index all products for image search
   */
  static async indexAllProducts(tenantId: string): Promise<void> {
    const products = await DataService.getProducts(tenantId);
    const productIds = products.map(p => p.id);
    
    try {
      const result = await imageSearchService.indexProductEmbeddings(
        productIds
      );
      console.log(`Indexed ${result.indexed} products`);
    } catch (error) {
      console.error('Indexing failed:', error);
    }
  }

  /**
   * Handle image search result click
   */
  static async handleResultClick(
    productId: number,
    onProductClick: (product: Product) => void,
    tenantId: string
  ): Promise<void> {
    const products = await DataService.getProducts(tenantId);
    const product = products.find(p => p.id === productId);
    
    if (product) {
      onProductClick(product);
    }
  }
}

// ============================================================================
// EXAMPLE 5: Image Search Analytics
// ============================================================================

export interface ImageSearchAnalytics {
  searchId: string;
  imageUrl: string;
  resultCount: number;
  userClicks: number;
  addToCartCount: number;
  conversionCount: number;
  topRelevanceScores: number[];
  timestamp: Date;
}

export class ImageSearchAnalyticsService {
  private static events: ImageSearchAnalytics[] = [];

  /**
   * Track image search event
   */
  static trackSearch(
    searchId: string,
    imageUrl: string,
    resultCount: number
  ): void {
    const event: ImageSearchAnalytics = {
      searchId,
      imageUrl,
      resultCount,
      userClicks: 0,
      addToCartCount: 0,
      conversionCount: 0,
      topRelevanceScores: [],
      timestamp: new Date()
    };

    this.events.push(event);
    
    // Send to analytics service
    this.sendToAnalytics(event);
  }

  /**
   * Track product click from image search
   */
  static trackResultClick(searchId: string, productId: number): void {
    const event = this.events.find(e => e.searchId === searchId);
    if (event) {
      event.userClicks++;
    }
  }

  /**
   * Track add to cart from image search
   */
  static trackAddToCart(searchId: string, productId: number): void {
    const event = this.events.find(e => e.searchId === searchId);
    if (event) {
      event.addToCartCount++;
    }
  }

  /**
   * Get analytics report
   */
  static getReport(startDate: Date, endDate: Date): any {
    const filtered = this.events.filter(
      e => e.timestamp >= startDate && e.timestamp <= endDate
    );

    const count = filtered.length || 1; // Prevent division by zero

    return {
      totalSearches: filtered.length,
      avgResultCount: filtered.reduce((sum, e) => sum + e.resultCount, 0) / count,
      avgClickRate: filtered.reduce((sum, e) => sum + e.userClicks, 0) / count,
      totalAddToCarts: filtered.reduce((sum, e) => sum + e.addToCartCount, 0),
      conversionRate: (
        filtered.reduce((sum, e) => sum + e.conversionCount, 0) / count
      ) * 100
    };
  }

  private static sendToAnalytics(event: ImageSearchAnalytics): void {
    // Send to your analytics service (Google Analytics, Mixpanel, etc.)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'image_search', {
        search_id: event.searchId,
        result_count: event.resultCount,
        timestamp: event.timestamp.toISOString()
      });
    }
  }
}

// ============================================================================
// EXAMPLE 6: Image Search in Admin Dashboard
// ============================================================================

export const AdminImageSearchDashboard = () => {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Image Search Analytics</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Total Searches"
          value="1,234"
          change="+12%"
        />
        <StatCard
          title="Avg Results"
          value="48.5"
          change="+5%"
        />
        <StatCard
          title="Click Rate"
          value="62%"
          change="+8%"
        />
        <StatCard
          title="Conversion"
          value="8.2%"
          change="+3%"
        />
      </div>

      {/* Index management */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-lg font-bold mb-4">Product Indexing</h2>
        <div className="space-y-4">
          <p className="text-gray-600">
            Indexed Products: <span className="font-bold">2,547 / 3,000</span>
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full"
              style={{ width: '84.9%' }}
            ></div>
          </div>
          <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            Index Missing Products
          </button>
        </div>
      </div>

      {/* Recent searches */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-lg font-bold mb-4">Recent Searches</h2>
        <div className="space-y-2">
          {/* Search history table */}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change }: any) => (
  <div className="bg-white rounded-lg p-4 border border-gray-200">
    <p className="text-gray-600 text-sm mb-2">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-green-600 text-xs mt-2">{change} from last week</p>
  </div>
);

// ============================================================================
// EXAMPLE 7: Batch Index Products (Admin Task)
// ============================================================================

export async function batchIndexProducts(
  productIds: number[],
  onProgress?: (current: number, total: number) => void
): Promise<{ indexed: number; failed: number }> {
  const batchSize = 10;
  let indexedCount = 0;
  let failedCount = 0;
  
  if (!productIds || productIds.length === 0) {
    console.warn('No product IDs provided for indexing');
    return { indexed: 0, failed: 0 };
  }
  
  for (let i = 0; i < productIds.length; i += batchSize) {
    const batch = productIds.slice(i, i + batchSize);
    
    try {
      const result = await imageSearchService.indexProductEmbeddings(batch);
      indexedCount += result.indexed;
      failedCount += result.failed;
      onProgress?.(i + batch.length, productIds.length);
    } catch (error) {
      console.error(`Failed to index batch ${i}-${i + batchSize}:`, error);
      failedCount += batch.length;
    }
  }
  
  return { indexed: indexedCount, failed: failedCount };
}

// Usage:
// batchIndexProducts([1, 2, 3, ..., 3000], (current, total) => {
//   console.log(`Progress: ${current}/${total}`);
// });

// ============================================================================
// EXAMPLE 8: Error Handling Wrapper
// ============================================================================

export async function safeImageSearch(
  imageUrl: string,
  onError?: (error: Error) => void
) {
  try {
    if (!imageUrl) {
      const err = new Error('Image URL is required');
      onError?.(err);
      throw err;
    }
    return await imageSearchService.searchByImageUrl(imageUrl);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    
    if (err.message.includes('timeout')) {
      onError?.(new Error('Search took too long. Please try again.'));
    } else if (err.message.includes('Invalid') || err.message.includes('invalid')) {
      onError?.(new Error('Invalid image format or URL.'));
    } else {
      onError?.(new Error('Search failed. Please try again later.'));
    }
    
    throw error;
  }
}

// ============================================================================
// EXAMPLE 9: Feature Flag for Image Search
// ============================================================================

// Mock function - replace with your actual auth service
const getCurrentUser = () => {
  // Example: return from context, Redux, or API
  return typeof window !== 'undefined' 
    ? (window as any).__currentUser 
    : null;
};

export const isImageSearchEnabled = (): boolean => {
  // Check environment variable
  if (process.env.REACT_APP_IMAGE_SEARCH_ENABLED === 'false') {
    return false;
  }

  // Check user feature access
  const user = getCurrentUser();
  if (!user) return true; // Default to true if no user data
  return user?.features?.includes('image-search') ?? true;
};

// Usage in components:
// {isImageSearchEnabled() && <ImageSearchButton />}

// ============================================================================
// EXAMPLE 10: Mobile-Specific Implementation
// ============================================================================

export const MobileImageSearch = () => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleCameraCapture = async () => {
    // Use device camera if available
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        // Stop all tracks and cleanup
        stream.getTracks().forEach(track => track.stop());
        // Process captured stream here
      } catch (error) {
        console.error('Camera access denied or not available:', error);
        // Fallback to file upload
        fileInputRef.current?.click();
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleCameraCapture}
        className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg font-semibold"
      >
        📷 Take Photo
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full px-4 py-3 bg-gray-500 text-white rounded-lg font-semibold"
      >
        📁 Choose from Gallery
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
      />
    </div>
  );
};

// ============================================================================
// Export all examples
// ============================================================================

export {
  ProductDetailWithImageSearch,
  ImageSearchModal,
  ImageSearchProductService,
  ImageSearchAnalyticsService,
  AdminImageSearchDashboard,
  MobileImageSearch,
  batchIndexProducts,
  safeImageSearch,
  isImageSearchEnabled
};
