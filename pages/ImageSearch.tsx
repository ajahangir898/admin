import React, { useState, useEffect, useCallback } from 'react';
import { LayoutGrid, Code, Camera, Search, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import IntegrationGuide from '../components/IntegrationGuid';

// Types
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  tags?: string[];
}

interface SearchState {
  query: string;
  imagePreview: string | null;
  results: Product[];
  isSearching: boolean;
}

// Gemini Service - calls backend API
const analyzeImage = async (file: File): Promise<string[]> => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://systemnextit.com';
    const response = await fetch(`${apiBase}/api/gemini-image-search`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    // Return keyword as array of tags
    return data.keyword ? data.keyword.toLowerCase().split(' ') : [];
  } catch (error) {
    console.error('Image analysis error:', error);
    return [];
  }
};

// Search Bar Component
const VisualSearchBar: React.FC<{
  onSearch: (query: string) => void;
  onImageUpload: (file: File) => void;
  onClear: () => void;
  isLoading: boolean;
  imagePreview: string | null;
}> = ({ onSearch, onImageUpload, onClear, isLoading, imagePreview }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
    e.target.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center bg-white border-2 border-theme-primary rounded-full shadow-lg overflow-hidden">
          {imagePreview ? (
            <div className="relative ml-2">
              <img src={imagePreview} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />
              <button
                type="button"
                onClick={onClear}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          ) : null}
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={imagePreview ? "Searching by image..." : "Search products..."}
            className="flex-1 px-4 py-3 outline-none text-gray-700"
            disabled={isLoading}
          />

          <div className="flex items-center gap-2 pr-2">
            <label className="cursor-pointer p-2 text-gray-500 hover:text-theme-primary transition-colors">
              {isLoading ? (
                <Loader2 size={20} className="animate-spin text-theme-primary" />
              ) : (
                <Camera size={20} />
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-theme-primary text-white px-6 py-2 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Search size={18} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// Product Grid Component
const ProductGrid: React.FC<{ products: Product[]; isLoading: boolean }> = ({ products, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-2xl aspect-square mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
        <p className="text-gray-500">Try a different search or upload an image</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <a
          key={product.id}
          href={`/product/${product.id}`}
          className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
        >
          <div className="aspect-square overflow-hidden bg-gray-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 line-clamp-2 mb-1">{product.name}</h3>
            <p className="text-theme-primary font-bold">৳{product.price.toLocaleString()}</p>
            {product.category && (
              <span className="text-xs text-gray-500 mt-1 block">{product.category}</span>
            )}
          </div>
        </a>
      ))}
    </div>
  );
};

// Main Visual Search Page
const ImageSearchPage: React.FC = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [showGuide, setShowGuide] = useState(false);
  const [state, setState] = useState<SearchState>({
    query: '',
    imagePreview: null,
    results: [],
    isSearching: true,
  });

  // Fetch products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://systemnextit.com';
        // Get tenant from URL or use default
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];
        const tenantId = subdomain !== 'www' && subdomain !== 'systemnextit' ? subdomain : 'tenant-demo';
        
        const response = await fetch(`${apiBase}/api/tenant-data/${tenantId}/products`);
        const data = await response.json();
        
        const products = (data.data || []).map((p: any) => ({
          id: p.id || p._id,
          name: p.name,
          price: p.price,
          image: p.image || p.images?.[0] || '/placeholder.png',
          category: p.category,
          tags: p.tags || p.searchTags || [],
        }));

        setAllProducts(products);
        setState(prev => ({ ...prev, results: products, isSearching: false }));
      } catch (error) {
        console.error('Failed to load products:', error);
        setState(prev => ({ ...prev, isSearching: false }));
      }
    };

    loadProducts();
  }, []);

  const performSearch = useCallback((query: string, imageTags: string[] = []) => {
    setState(prev => ({ ...prev, isSearching: true }));

    setTimeout(() => {
      let filtered = allProducts;

      if (imageTags.length > 0) {
        filtered = allProducts.filter(product =>
          imageTags.some(tag =>
            product.tags?.some(t => t.toLowerCase().includes(tag)) ||
            product.name.toLowerCase().includes(tag) ||
            product.category?.toLowerCase().includes(tag)
          )
        );
      } else if (query.trim()) {
        const lowerQuery = query.toLowerCase();
        filtered = allProducts.filter(product =>
          product.name.toLowerCase().includes(lowerQuery) ||
          product.category?.toLowerCase().includes(lowerQuery) ||
          product.tags?.some(t => t.toLowerCase().includes(lowerQuery))
        );
      }

      setState(prev => ({
        ...prev,
        results: filtered.length > 0 ? filtered : allProducts,
        isSearching: false,
      }));

      if (filtered.length === 0) {
        toast('No exact matches found, showing all products', { icon: 'ℹ️' });
      }
    }, 300);
  }, [allProducts]);

  const handleTextSearch = (query: string) => {
    setState(prev => ({ ...prev, query, imagePreview: null }));
    performSearch(query);
  };

  const handleImageUpload = async (file: File) => {
    // Create preview
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setState(prev => ({
        ...prev,
        imagePreview: base64,
        isSearching: true,
        query: '',
      }));

      toast.loading('Analyzing image with AI...', { id: 'image-search' });
      const tags = await analyzeImage(file);
      toast.dismiss('image-search');

      if (tags.length > 0) {
        toast.success(`Found: ${tags.join(', ')}`);
        performSearch('', tags);
      } else {
        toast.error('Could not identify product');
        setState(prev => ({ ...prev, isSearching: false }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setState({
      query: '',
      imagePreview: null,
      results: allProducts,
      isSearching: false,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-theme-primary rounded-lg flex items-center justify-center text-white font-bold">
              VS
            </div>
            <span className="text-xl font-bold text-gray-900">Visual Search</span>
          </a>

          <button
            onClick={() => setShowGuide(!showGuide)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              showGuide ? 'bg-theme-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Code size={16} />
            Integration Guide
          </button>
        </div>
      </header>

      {/* Integration Guide */}
      {showGuide && <IntegrationGuide />}

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-theme-primary/5 to-transparent pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-6 text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Search with <span className="text-theme-primary italic">Vision AI</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Upload an image to find similar products instantly using AI-powered visual search
          </p>
        </div>

        <VisualSearchBar
          onSearch={handleTextSearch}
          onImageUpload={handleImageUpload}
          onClear={handleClear}
          isLoading={state.isSearching}
          imagePreview={state.imagePreview}
        />
      </section>

      {/* Results */}
      <main className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <LayoutGrid size={24} className="text-theme-primary" />
            <h2 className="text-2xl font-bold text-gray-900">
              {state.imagePreview
                ? 'Visual Matches'
                : state.query
                ? `Results for "${state.query}"`
                : 'All Products'}
            </h2>
          </div>
          <span className="text-gray-500">{state.results.length} products</span>
        </div>

        <ProductGrid products={state.results} isLoading={state.isSearching} />
      </main>
    </div>
  );
};

export default ImageSearchPage;
