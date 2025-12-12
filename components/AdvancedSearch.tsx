import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, X, Filter, TrendingUp, Clock, Tag, DollarSign, Star, Loader2 } from 'lucide-react';
import { Product } from '../types';

interface SearchSuggestion {
  text: string;
  type: 'recent' | 'trending' | 'product' | 'category' | 'correction';
  product?: Product;
  score?: number;
}

interface SearchFilter {
  priceRange?: { min: number; max: number };
  categories?: string[];
  brands?: string[];
  minRating?: number;
  inStock?: boolean;
}

interface AdvancedSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string, filters?: SearchFilter) => void;
  products?: Product[];
  placeholder?: string;
  showFilters?: boolean;
  className?: string;
}

// Simple typo correction using Levenshtein distance
const levenshteinDistance = (a: string, b: string): number => {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
};

// Find typo corrections
const findCorrections = (query: string, keywords: string[]): string[] => {
  if (query.length < 3) return [];
  
  const corrections = keywords
    .map(keyword => ({
      keyword,
      distance: levenshteinDistance(query.toLowerCase(), keyword.toLowerCase())
    }))
    .filter(item => item.distance > 0 && item.distance <= 2)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map(item => item.keyword);
  
  return corrections;
};

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  value,
  onChange,
  onSearch,
  products = [],
  placeholder = 'Search products...',
  showFilters = true,
  className = ''
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState<SearchFilter>({});
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  // Save search to recent searches
  const saveRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  }, [recentSearches]);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  }, []);

  // Extract keywords from products for typo correction
  const keywords = useMemo(() => {
    const words = new Set<string>();
    products.forEach(product => {
      product.name?.split(/\s+/).forEach(word => {
        if (word.length > 2) words.add(word.toLowerCase());
      });
      if (product.category) words.add(product.category.toLowerCase());
      if (product.brand) words.add(product.brand.toLowerCase());
      product.tags?.forEach(tag => words.add(tag.toLowerCase()));
    });
    return Array.from(words);
  }, [products]);

  // Get search suggestions
  const suggestions = useMemo<SearchSuggestion[]>(() => {
    if (!value.trim()) {
      return recentSearches.map(text => ({ text, type: 'recent' as const }));
    }

    const query = value.toLowerCase();
    const results: SearchSuggestion[] = [];

    // Add typo corrections
    const corrections = findCorrections(query, keywords);
    corrections.forEach(correction => {
      if (!results.some(s => s.text.toLowerCase() === correction.toLowerCase())) {
        results.push({ text: correction, type: 'correction' });
      }
    });

    // Add matching products
    const matchingProducts = products
      .filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.tags?.some(tag => tag.toLowerCase().includes(query))
      )
      .slice(0, 5);

    matchingProducts.forEach(product => {
      results.push({
        text: product.name || '',
        type: 'product',
        product
      });
    });

    // Add category suggestions
    const matchingCategories = Array.from(
      new Set(products.map(p => p.category).filter(c => c?.toLowerCase().includes(query)))
    ).slice(0, 3);

    matchingCategories.forEach(category => {
      if (category && !results.some(s => s.text.toLowerCase() === category.toLowerCase())) {
        results.push({ text: category, type: 'category' });
      }
    });

    return results.slice(0, 8);
  }, [value, products, keywords, recentSearches]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setShowFilterPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    saveRecentSearch(suggestion.text);
    setShowSuggestions(false);
    onSearch?.(suggestion.text, filters);
  };

  const handleSearch = () => {
    if (value.trim()) {
      saveRecentSearch(value);
      onSearch?.(value, filters);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const clearSearch = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'recent': return <Clock size={16} className="text-gray-400" />;
      case 'trending': return <TrendingUp size={16} className="text-orange-500" />;
      case 'product': return <Tag size={16} className="text-blue-500" />;
      case 'category': return <Filter size={16} className="text-purple-500" />;
      case 'correction': return <Search size={16} className="text-green-500" />;
      default: return <Search size={16} className="text-gray-400" />;
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div 
        className={`
          relative flex items-center bg-white dark:bg-slate-800 
          border rounded-lg transition-all duration-200
          ${isFocused 
            ? 'border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900' 
            : 'border-gray-200 dark:border-slate-700'
          }
          ${showSuggestions ? 'rounded-b-none' : ''}
        `}
      >
        <Search size={18} className="absolute left-3 text-gray-400" />
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="
            w-full pl-10 pr-20 py-2.5 
            bg-transparent border-none outline-none
            text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
          "
        />

        <div className="absolute right-2 flex items-center gap-1">
          {value && (
            <button
              onClick={clearSearch}
              className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors btn-press"
              aria-label="Clear search"
            >
              <X size={16} className="text-gray-400" />
            </button>
          )}
          
          {showFilters && (
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`
                p-1.5 rounded transition-colors btn-press
                ${showFilterPanel 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' 
                  : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500'
                }
              `}
              aria-label="Toggle filters"
            >
              <Filter size={16} />
            </button>
          )}

          <button
            onClick={handleSearch}
            className="
              px-3 py-1.5 bg-blue-600 hover:bg-blue-700 
              text-white rounded text-sm font-medium
              transition-colors btn-press
            "
          >
            Search
          </button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="
          absolute top-full left-0 right-0 z-50
          bg-white dark:bg-slate-800 
          border border-t-0 border-gray-200 dark:border-slate-700
          rounded-b-lg shadow-lg max-h-96 overflow-y-auto
          animate-fadeInDown
        ">
          <div className="py-2">
            {/* Recent searches header */}
            {value === '' && recentSearches.length > 0 && (
              <div className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                <span>Recent Searches</span>
                <button
                  onClick={clearRecentSearches}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 normal-case font-medium"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Typo correction header */}
            {value && suggestions.some(s => s.type === 'correction') && (
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Did you mean?
              </div>
            )}

            {/* Suggestion items */}
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="
                  w-full flex items-center gap-3 px-4 py-2.5
                  hover:bg-gray-50 dark:hover:bg-slate-700
                  transition-colors text-left
                  animate-fadeInUp
                "
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                {getSuggestionIcon(suggestion.type)}
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {suggestion.text}
                  </div>
                  
                  {suggestion.product && (
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {suggestion.product.category && (
                        <span>{suggestion.product.category}</span>
                      )}
                      {suggestion.product.price && (
                        <>
                          <span>•</span>
                          <span>৳{suggestion.product.price}</span>
                        </>
                      )}
                      {suggestion.product.rating && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-0.5">
                            <Star size={10} fill="currentColor" className="text-yellow-400" />
                            <span>{suggestion.product.rating}</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {suggestion.type === 'correction' && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Suggested
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="
          absolute top-full left-0 right-0 z-40 mt-1
          bg-white dark:bg-slate-800 
          border border-gray-200 dark:border-slate-700
          rounded-lg shadow-lg p-4
          animate-fadeInDown
        ">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Filters
            </h3>
            <button
              onClick={() => setFilters({})}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Price Range */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange?.min || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    priceRange: { ...filters.priceRange, min: Number(e.target.value), max: filters.priceRange?.max || 0 }
                  })}
                  className="
                    w-full px-2 py-1.5 text-sm
                    bg-gray-50 dark:bg-slate-700
                    border border-gray-200 dark:border-slate-600
                    rounded focus:ring-2 focus:ring-blue-500 outline-none
                  "
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange?.max || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    priceRange: { min: filters.priceRange?.min || 0, max: Number(e.target.value) }
                  })}
                  className="
                    w-full px-2 py-1.5 text-sm
                    bg-gray-50 dark:bg-slate-700
                    border border-gray-200 dark:border-slate-600
                    rounded focus:ring-2 focus:ring-blue-500 outline-none
                  "
                />
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Rating
              </label>
              <select
                value={filters.minRating || ''}
                onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
                className="
                  w-full px-2 py-1.5 text-sm
                  bg-gray-50 dark:bg-slate-700
                  border border-gray-200 dark:border-slate-600
                  rounded focus:ring-2 focus:ring-blue-500 outline-none
                "
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>

            {/* In Stock */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="inStock"
                checked={filters.inStock || false}
                onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                className="
                  w-4 h-4 text-blue-600 
                  bg-gray-100 border-gray-300 
                  rounded focus:ring-blue-500 focus:ring-2
                "
              />
              <label htmlFor="inStock" className="text-sm text-gray-700 dark:text-gray-300">
                In Stock Only
              </label>
            </div>
          </div>

          <button
            onClick={() => {
              setShowFilterPanel(false);
              onSearch?.(value, filters);
            }}
            className="
              w-full mt-4 px-4 py-2 
              bg-blue-600 hover:bg-blue-700 
              text-white rounded font-medium text-sm
              transition-colors btn-press
            "
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
