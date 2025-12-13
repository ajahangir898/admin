import React, { useState, useCallback, useEffect } from 'react';
import { StoreHeader, StoreFooter } from '../components/StoreComponents';
import { ImageSearch, ImageSearchResult } from '../components/ImageSearch';
import { ImageSearchResults } from '../components/ImageSearchResults';
import { SkeletonImageGrid } from '../components/SkeletonLoaders';
import { imageSearchService } from '../services/ImageSearchService';
import { Product, WebsiteConfig, User, Order } from '../types';
import { ArrowLeft } from 'lucide-react';

interface StoreImageSearchProps {
  products: Product[];
  websiteConfig?: WebsiteConfig;
  user?: User;
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onCheckout?: (product: Product, quantity: number) => void;
  onNavigate?: (page: string) => void;
}

export const StoreImageSearch: React.FC<StoreImageSearchProps> = ({
  products,
  websiteConfig,
  user,
  onProductClick,
  onAddToCart,
  onCheckout,
  onNavigate
}) => {
  const [searchResults, setSearchResults] = useState<ImageSearchResult | null>(null);
  const [searchImage, setSearchImage] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleImageSearch = useCallback(
    async (imageId: string, imageUrl: string): Promise<ImageSearchResult> => {
      setIsSearching(true);
      setSearchImage(imageUrl);

      try {
        // Call backend API
        const results = await imageSearchService.searchByImageUrl(imageUrl, {
          topK: 50,
          filters: {
            minStock: 1
          }
        });

        // Map results to include more product details
        const enrichedResults = results.map(result => {
          const fullProduct = products.find(p => p.id === result.productId);
          return {
            ...result,
            image: fullProduct?.image || result.image,
            category: fullProduct?.category || result.category,
            stock: fullProduct?.stock || result.stock
          };
        });

        const searchResult: ImageSearchResult = {
          imageId,
          imageUrl,
          uploadedAt: new Date().toISOString(),
          results: enrichedResults
        };

        setSearchResults(searchResult);
        return searchResult;
      } catch (error) {
        console.error('Image search failed:', error);
        throw error;
      } finally {
        setIsSearching(false);
      }
    },
    [products]
  );

  const handleProductClick = useCallback(
    (productId: number) => {
      const product = products.find(p => p.id === productId);
      if (product && onProductClick) {
        onProductClick(product);
      }
    },
    [products, onProductClick]
  );

  const handleAddToCart = useCallback(
    (productId: number) => {
      const product = products.find(p => p.id === productId);
      if (product && onAddToCart) {
        onAddToCart(product);
      }
    },
    [products, onAddToCart]
  );

  const handleBackToSearch = useCallback(() => {
    setSearchResults(null);
    setSearchImage('');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <StoreHeader websiteConfig={websiteConfig} user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {isLoading && (
          <div className="space-y-6">
            <SkeletonImageGrid columns={3} count={6} darkMode={false} />
          </div>
        )}
        {!isLoading && (
          <>
        {searchResults ? (
          // Results view
          <div className="space-y-6">
            {/* Back button */}
            <button
              onClick={handleBackToSearch}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition"
            >
              <ArrowLeft size={20} />
              Back to search
            </button>

            {/* Results component */}
            <ImageSearchResults
              uploadedImage={searchImage}
              searchResults={searchResults.results}
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
              onClose={handleBackToSearch}
              allProducts={products}
            />
          </div>
        ) : (
          // Search input view
          <div className="space-y-8">
            {/* Page header */}
            <div className="text-center space-y-4 mb-12">
              <h1 className="text-4xl font-bold text-gray-900">Search by Image</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Find visually similar products by uploading a photo or pasting an image URL from social media
              </p>
            </div>

            {/* Search component */}
            <ImageSearch
              onSearch={handleImageSearch}
              onResultsReceived={setSearchResults}
              variant="full"
            />

            {/* Examples section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">How to use Image Search</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-orange-600 font-bold text-xl">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Upload or Paste</h3>
                  <p className="text-gray-600 text-sm">
                    Upload a photo from your device or paste an image URL from Pinterest, Instagram, or other sources
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-orange-600 font-bold text-xl">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
                  <p className="text-gray-600 text-sm">
                    Our AI analyzes the visual characteristics of your image to find matching products in our catalog
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-orange-600 font-bold text-xl">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Browse Results</h3>
                  <p className="text-gray-600 text-sm">
                    View all matching products with relevance scores, filter by price/category, and add to cart
                  </p>
                </div>
              </div>
            </div>

            {/* Features section */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-8 border border-orange-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Why use Image Search?</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-orange-500 font-bold">✓</span>
                  <span>Find products that look similar to images you like</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-orange-500 font-bold">✓</span>
                  <span>Discover alternatives when you see a product you want elsewhere</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-orange-500 font-bold">✓</span>
                  <span>Get instant visual recommendations using AI</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-orange-500 font-bold">✓</span>
                  <span>Filter results by price, category, brand, and more</span>
                </li>
              </ul>
            </div>
          </div>
        )}
        </>
        )}
      </main>

      <StoreFooter websiteConfig={websiteConfig} />
    </div>
  );
};

export default StoreImageSearch;
