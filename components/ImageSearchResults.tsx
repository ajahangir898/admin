import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { X, Filter, Star, ShoppingCart, Heart, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/format';

interface ImageSearchResultsProps {
  uploadedImage: string;
  searchResults: Array<{
    productId: number;
    name: string;
    price: number;
    image: string;
    relevancyScore: number;
    category?: string;
    stock?: number;
  }>;
  onProductClick?: (productId: number) => void;
  onAddToCart?: (productId: number) => void;
  onClose?: () => void;
  allProducts?: Product[];
}

interface FilterState {
  priceRange: [number, number];
  categories: string[];
  sortBy: 'relevance' | 'price-asc' | 'price-desc' | 'newest';
}

export const ImageSearchResults: React.FC<ImageSearchResultsProps> = ({
  uploadedImage,
  searchResults,
  onProductClick,
  onAddToCart,
  onClose,
  allProducts = []
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 100000],
    categories: [],
    sortBy: 'relevance'
  });

  // Get unique categories from results
  const categories = useMemo(() => {
    const unique = new Set(searchResults.map(r => r.category).filter(Boolean));
    return Array.from(unique);
  }, [searchResults]);

  // Get price range from results
  const priceRange = useMemo(() => {
    if (searchResults.length === 0) return [0, 100000];
    const prices = searchResults.map(r => r.price);
    return [Math.min(...prices), Math.max(...prices)];
  }, [searchResults]);

  // Filter and sort results
  const filteredResults = useMemo(() => {
    let filtered = [...searchResults];

    // Apply price filter
    filtered = filtered.filter(
      r => r.price >= filters.priceRange[0] && r.price <= filters.priceRange[1]
    );

    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(r => r.category && filters.categories.includes(r.category));
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => b.productId - a.productId);
        break;
      case 'relevance':
      default:
        filtered.sort((a, b) => b.relevancyScore - a.relevancyScore);
    }

    return filtered;
  }, [searchResults, filters]);

  const handleCategoryToggle = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handlePriceChange = (min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      priceRange: [min, max]
    }));
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header with search image */}
      <div className="flex items-start justify-between gap-6 mb-8 pb-6 border-b border-gray-200">
        <div className="flex gap-4">
          {/* Search image thumbnail */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-lg border-2 border-orange-500 overflow-hidden shadow-md">
              <img
                src={uploadedImage}
                alt="Search image"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">Your search image</p>
          </div>

          {/* Results info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Visually Similar Products
            </h1>
            <p className="text-gray-600 mb-4">
              Found {filteredResults.length} product{filteredResults.length !== 1 ? 's' : ''} matching your image
            </p>

            {/* Relevance info */}
            <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg w-fit">
              <AlertCircle size={16} />
              <span>Sorted by visual relevance - highest match first</span>
            </div>
          </div>
        </div>

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close search results"
          >
            <X size={24} className="text-gray-600" />
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <div className={`${showFilters ? 'block' : 'hidden'} md:block md:w-64 flex-shrink-0`}>
          <div className="sticky top-4 space-y-6">
            {/* Filter header */}
            <div className="flex items-center justify-between md:block">
              <h2 className="font-bold text-lg text-gray-900">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="md:hidden text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Sort option */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    sortBy: e.target.value as FilterState['sortBy']
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              >
                <option value="relevance">Best Match</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            {/* Price filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Price Range
              </label>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600">Min</label>
                  <input
                    type="number"
                    value={filters.priceRange[0]}
                    onChange={(e) =>
                      handlePriceChange(
                        parseInt(e.target.value) || 0,
                        filters.priceRange[1]
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    min={priceRange[0]}
                    max={filters.priceRange[1]}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Max</label>
                  <input
                    type="number"
                    value={filters.priceRange[1]}
                    onChange={(e) =>
                      handlePriceChange(
                        filters.priceRange[0],
                        parseInt(e.target.value) || 100000
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    min={filters.priceRange[0]}
                    max={priceRange[1]}
                  />
                </div>
              </div>
            </div>

            {/* Category filter */}
            {categories.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Category
                </label>
                <div className="space-y-2">
                  {categories.map(category => (
                    <label key={category} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Reset filters */}
            <button
              onClick={() =>
                setFilters({
                  priceRange: priceRange,
                  categories: [],
                  sortBy: 'relevance'
                })
              }
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Results Grid */}
        <div className="flex-1">
          {/* Mobile filter button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden mb-4 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Filter size={18} />
            Filters
          </button>

          {filteredResults.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredResults.map((result) => (
                <div
                  key={result.productId}
                  className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition cursor-pointer"
                  onClick={() => onProductClick?.(result.productId)}
                >
                  {/* Product image */}
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={result.image}
                      alt={result.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />

                    {/* Relevance score badge */}
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      {Math.round(result.relevancyScore * 100)}% match
                    </div>

                    {/* Stock status */}
                    {result.stock !== undefined && (
                      <div
                        className={`absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-semibold ${
                          result.stock > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {result.stock > 0 ? `${result.stock} in stock` : 'Out of stock'}
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="p-3 space-y-2">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition">
                      {result.name}
                    </h3>

                    {result.category && (
                      <p className="text-xs text-gray-500">{result.category}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-orange-600">
                        ৳ {formatCurrency(result.price)}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart?.(result.productId);
                        }}
                        className="flex-1 py-2 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-1"
                      >
                        <ShoppingCart size={14} />
                        Cart
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="py-2 px-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition"
                        aria-label="Add to wishlist"
                      >
                        <Heart size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">
                Try adjusting your filters or search with a different image
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageSearchResults;
