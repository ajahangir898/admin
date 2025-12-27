import React, { useState, useMemo, Suspense, lazy } from 'react';
import { ChevronRight, ChevronLeft, Package, Tag, X, SlidersHorizontal } from 'lucide-react';
import { Product, Category, Brand, WebsiteConfig, User, Order } from '../types';
import { ProductCard } from './StoreProductComponents';
import { normalizeImageUrl } from '../utils/imageUrlHelper';
import { ProductFilter, SortOption } from './ProductFilter';
import { CATEGORIES } from '../constants';
// Skeleton loaders removed for faster initial render

// Lazy load header and footer from individual files
const StoreHeader = lazy(() => import('./StoreHeader').then(m => ({ default: m.StoreHeader })));
const StoreFooter = lazy(() => import('./store/StoreFooter').then(m => ({ default: m.StoreFooter })));

interface StoreCategoryProductsProps {
  products: Product[];
  categories?: Category[];
  subCategories?: any[];
  childCategories?: any[];
  brands?: Brand[];
  tags?: any[];
  selectedCategory: string;
  onCategoryChange: (category: string | null) => void;
  onBack: () => void;
  onProductClick: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  websiteConfig?: WebsiteConfig;
  // Header/Footer props
  logo?: string | null;
  user?: User | null;
  wishlistCount?: number;
  wishlist?: number[];
  onToggleWishlist?: (id: number) => void;
  cart?: number[];
  onToggleCart?: (id: number) => void;
  onCheckoutFromCart?: (productId: number) => void;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onProfileClick?: () => void;
  onOpenChat?: () => void;
  onImageSearchClick?: () => void;
  orders?: Order[];
}



export const StoreCategoryProducts: React.FC<StoreCategoryProductsProps> = ({
  products,
  categories,
  subCategories,
  childCategories,
  brands,
  tags,
  selectedCategory,
  onCategoryChange,
  onBack,
  onProductClick,
  onBuyNow,
  onQuickView,
  onAddToCart,
  websiteConfig,
  // Header/Footer props
  logo,
  user,
  wishlistCount = 0,
  wishlist = [],
  onToggleWishlist,
  cart = [],
  onToggleCart,
  onCheckoutFromCart,
  onLoginClick,
  onLogoutClick,
  onProfileClick,
  onOpenChat,
  onImageSearchClick,
  orders
}) => {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('relevance');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Get active categories - use passed categories or fallback to constants
  const activeCategories = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.filter(c => c.status === 'Active');
    }
    return CATEGORIES.map((c, i) => ({ 
      id: String(i), 
      name: c.name, 
      icon: c.icon, 
      image: undefined, 
      status: 'Active' as const 
    }));
  }, [categories]);

  // Get active brands
  const activeBrands = useMemo(() => {
    if (brands && brands.length > 0) {
      return brands.filter(b => b.status === 'Active');
    }
    return [];
  }, [brands]);

  // Check if showing all products or brand filter
  const isShowingAll = selectedCategory === '__all__';
  const isBrandFilter = selectedCategory.startsWith('brand:');
  const brandFromFilter = isBrandFilter ? selectedCategory.replace('brand:', '') : null;

  // Filter products by category and brand
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // If showing all products, only filter by selected brand
      if (isShowingAll) {
        const brandMatch = !selectedBrand || product.brand?.toLowerCase() === selectedBrand.toLowerCase();
        return brandMatch;
      }
      // If brand filter from URL
      if (isBrandFilter && brandFromFilter) {
        const brandMatch = product.brand?.toLowerCase() === brandFromFilter.toLowerCase();
        const extraBrandMatch = !selectedBrand || product.brand?.toLowerCase() === selectedBrand.toLowerCase();
        return brandMatch || extraBrandMatch;
      }
      // Normal category filter
      const categoryMatch = product.category?.toLowerCase() === selectedCategory.toLowerCase();
      const brandMatch = !selectedBrand || product.brand?.toLowerCase() === selectedBrand.toLowerCase();
      return categoryMatch && brandMatch;
    });
  }, [products, selectedCategory, selectedBrand, isShowingAll, isBrandFilter, brandFromFilter]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortOption) {
      case 'price-low':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-high':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'newest':
        return sorted.sort((a, b) => (b.id || 0) - (a.id || 0));
      default:
        return sorted;
    }
  }, [filteredProducts, sortOption]);

  // Get brands available in current category (or all brands if showing all)
  const brandsInCategory = useMemo(() => {
    if (isShowingAll) {
      return activeBrands;
    }
    const categoryProducts = products.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
    const brandNames = new Set(categoryProducts.map(p => p.brand).filter(Boolean));
    return activeBrands.filter(b => brandNames.has(b.name));
  }, [products, selectedCategory, activeBrands, isShowingAll]);

  // Get display title
  const displayTitle = useMemo(() => {
    if (isShowingAll) return 'All Products';
    if (isBrandFilter && brandFromFilter) return brandFromFilter;
    return selectedCategory;
  }, [selectedCategory, isShowingAll, isBrandFilter, brandFromFilter]);

  const handleBrandSelect = (brandName: string) => {
    setSelectedBrand(prev => prev === brandName ? null : brandName);
  };

  const clearFilters = () => {
    setSelectedBrand(null);
    setSortOption('relevance');
  };

  // Sidebar content (shared between desktop and mobile)
  const SidebarContent = () => (
    <>
      {/* Categories */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3">
          <h3 className="text-white font-bold text-sm">Categories</h3>
        </div>
        <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
          {activeCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                onCategoryChange(category.name);
                setSelectedBrand(null);
                setIsMobileFilterOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-all hover:bg-orange-50 group ${
                selectedCategory.toLowerCase() === category.name.toLowerCase() 
                  ? 'bg-orange-50 text-orange-600 font-semibold' 
                  : 'text-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                {category.image ? (
                  <img 
                    src={normalizeImageUrl(category.image)} 
                    alt={category.name} 
                    className="w-8 h-8 rounded-lg object-cover border border-gray-100"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Package size={16} className="text-gray-400" />
                  </div>
                )}
                <span className="truncate">{category.name}</span>
              </div>
              <ChevronRight 
                size={16} 
                className={`text-gray-400 flex-shrink-0 transition-transform ${
                  selectedCategory.toLowerCase() === category.name.toLowerCase() 
                    ? 'rotate-90 text-orange-500' 
                    : 'group-hover:translate-x-1'
                }`} 
              />
            </button>
          ))}
        </div>
      </div>

      {/* Brands in Category */}
      {brandsInCategory.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-4 py-3">
            <h3 className="text-white font-bold text-sm">Brands</h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
            {brandsInCategory.map((brand) => (
              <button
                key={brand.id}
                onClick={() => {
                  handleBrandSelect(brand.name);
                  setIsMobileFilterOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all hover:bg-gray-50 ${
                  selectedBrand === brand.name 
                    ? 'bg-blue-50 text-blue-600 font-semibold' 
                    : 'text-gray-700'
                }`}
              >
                {brand.logo ? (
                  <img 
                    src={normalizeImageUrl(brand.logo)} 
                    alt={brand.name} 
                    className="w-8 h-8 rounded-lg object-contain border border-gray-100 bg-white p-1"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Tag size={16} className="text-gray-400" />
                  </div>
                )}
                <span className="truncate">{brand.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {selectedBrand && (
        <button
          onClick={() => {
            clearFilters();
            setIsMobileFilterOpen(false);
          }}
          className="w-full py-2 px-4 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition"
        >
          Clear Brand Filter
        </button>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Store Header */}
      <Suspense fallback={null}>
        <StoreHeader 
          onTrackOrder={() => {}}
          onImageSearchClick={onImageSearchClick}
          productCatalog={products}
          wishlistCount={wishlistCount}
          wishlist={wishlist}
          onToggleWishlist={onToggleWishlist}
          cart={cart}
          onToggleCart={onToggleCart}
          onCheckoutFromCart={onCheckoutFromCart}
          user={user}
          onLoginClick={onLoginClick}
          onLogoutClick={onLogoutClick}
          onProfileClick={onProfileClick}
          logo={logo}
          websiteConfig={websiteConfig}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          onCategoriesClick={onBack}
          onProductsClick={onBack}
          categoriesList={CATEGORIES.map((cat) => cat.name)}
          onCategorySelect={(categoryName) => onCategoryChange(categoryName)}
          onProductClick={onProductClick}
          categories={categories}
          subCategories={subCategories}
          childCategories={childCategories}
          brands={brands}
          tags={tags}
        />
      </Suspense>

      {/* Category Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-[60px] z-20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
              >
                <ChevronLeft size={20} />
                <span className="text-sm font-medium hidden sm:inline">Back</span>
              </button>
              <div className="h-6 w-px bg-gray-200" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">{displayTitle}</h1>
                <p className="text-xs text-gray-500">{sortedProducts.length} products</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ProductFilter value={sortOption} onChange={setSortOption} />
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
              >
                <SlidersHorizontal size={16} />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0 space-y-4">
              <SidebarContent />
          </aside>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {/* Active Filters */}
            {selectedBrand && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500">Filters:</span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {selectedBrand}
                  <button 
                    onClick={() => setSelectedBrand(null)} 
                    className="ml-1 hover:text-blue-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              </div>
            )}

            {/* Products */}
            {sortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={`cat-${product.id}`}
                    product={product}
                    onClick={onProductClick}
                    onBuyNow={onBuyNow}
                    variant={websiteConfig?.productCardStyle}
                    onQuickView={onQuickView}
                    onAddToCart={onAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <Package size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium text-lg">No products found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {selectedBrand 
                    ? `No ${selectedBrand} products in ${displayTitle}` 
                    : `No products in ${displayTitle}`}
                </p>
                {selectedBrand && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition"
                  >
                    Clear Brand Filter
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setIsMobileFilterOpen(false)} 
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-gray-50 shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Filters</h2>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}

      {/* Store Footer */}
      <Suspense fallback={null}>
        <StoreFooter websiteConfig={websiteConfig} logo={logo} onOpenChat={onOpenChat} />
      </Suspense>
    </div>
  );
};

export default StoreCategoryProducts;
