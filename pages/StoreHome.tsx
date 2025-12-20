
import React, { useState, useEffect, useRef, lazy, Suspense, useMemo, useCallback } from 'react';
import { HeroSection } from '../components/StoreProductComponents';
import { StorePopup } from '../components/StorePopup';
import { CATEGORIES, PRODUCTS as INITIAL_PRODUCTS } from '../constants';
import { Product, User, WebsiteConfig, Order, ProductVariantSelection, Popup, Category, Brand } from '../types';
import { DataService } from '../services/DataService';
import { SortOption } from '../components/ProductFilter';
import { StoreHeaderSkeleton, StoreFooterSkeleton } from '../components/SkeletonLoaders';
import { slugify } from '../services/slugify';

// Import store sections
import { FlashSalesSection } from '../components/store/FlashSalesSection';
import { ProductGridSection } from '../components/store/ProductGridSection';
import { PromoBanner } from '../components/store/PromoBanner';
import { CategoriesSection } from '../components/store/CategoriesSection';
import { SearchResultsSection } from '../components/store/SearchResultsSection';

// Lazy load heavy components (StoreHeader, StoreFooter, modals)
const StoreHeader = lazy(() => import('../components/StoreHeader').then(m => ({ default: m.StoreHeader })));
const StoreFooter = lazy(() => import('../components/StoreComponents').then(m => ({ default: m.StoreFooter })));
const ProductQuickViewModal = lazy(() => import('../components/StoreComponents').then(m => ({ default: m.ProductQuickViewModal })));
const TrackOrderModal = lazy(() => import('../components/StoreComponents').then(m => ({ default: m.TrackOrderModal })));
const AIStudioModal = lazy(() => import('../components/StoreComponents').then(m => ({ default: m.AIStudioModal })));
const StoreCategoryProducts = lazy(() => import('../components/StoreCategoryProducts'));

const getNextFlashSaleReset = () => {
  const now = new Date();
  const reset = new Date(now);
  reset.setHours(24, 0, 0, 0);
  return reset.getTime();
};

const getTimeSegments = (milliseconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
};

const formatSegment = (value: number) => value.toString().padStart(2, '0');

interface StoreHomeProps {
  products?: Product[];
  orders?: Order[];
  onProductClick: (p: Product) => void;
  onQuickCheckout?: (p: Product, quantity: number, variant: ProductVariantSelection) => void;
  wishlistCount: number;
  wishlist: number[];
  onToggleWishlist: (id: number) => void;
  cart?: number[];
  onToggleCart?: (id: number) => void;
  onCheckoutFromCart?: (productId: number) => void;
  onAddToCart?: (product: Product, quantity: number, variant: ProductVariantSelection) => void;
  user?: User | null;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onProfileClick?: () => void;
  logo?: string | null;
  websiteConfig?: WebsiteConfig;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onImageSearchClick?: () => void;
  onOpenChat?: () => void;
  categories?: any[];
  subCategories?: any[];
  childCategories?: any[];
  brands?: any[];
  tags?: any[];
  initialCategoryFilter?: string | null;
  onCategoryFilterChange?: (categorySlug: string | null) => void;
}

const StoreHome = ({ 
  products,
  orders,
  onProductClick, 
  onQuickCheckout,
  wishlistCount, 
  wishlist, 
  onToggleWishlist,
  cart,
  onToggleCart,
  onCheckoutFromCart,
  onAddToCart,
  user,
  onLoginClick,
  onLogoutClick,
  onProfileClick,
  logo,
  websiteConfig,
  categories,
  subCategories,
  childCategories,
  brands,
  tags,
  searchValue,
  onSearchChange,
  onImageSearchClick,
  onOpenChat,
  initialCategoryFilter,
  onCategoryFilterChange
}: StoreHomeProps) => {
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isAIStudioOpen, setIsAIStudioOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('relevance');
  const [isLoading, setIsLoading] = useState(true);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [activePopup, setActivePopup] = useState<Popup | null>(null);
  const [popupIndex, setPopupIndex] = useState(0);
  
  // Category view state - shows category products page when a category is selected
  const [selectedCategoryView, setSelectedCategoryView] = useState<string | null>(null);

  // Sync category view with URL filter
  useEffect(() => {
    if (initialCategoryFilter) {
      // Find category by slug
      const category = categories?.find(c => slugify(c.name) === initialCategoryFilter);
      if (category) {
        setSelectedCategoryView(category.name);
      } else {
        // Check in default categories
        const defaultCat = CATEGORIES.find(c => slugify(c.name) === initialCategoryFilter);
        if (defaultCat) {
          setSelectedCategoryView(defaultCat.name);
        }
      }
    } else {
      setSelectedCategoryView(null);
    }
  }, [initialCategoryFilter, categories]);

  // Simulate initial data loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Load popups
  useEffect(() => {
    const loadPopups = async () => {
      const allPopups = await DataService.get<Popup[]>('popups', []);
      const publishedPopups = allPopups
        .filter((p) => p.status?.toLowerCase() === 'publish')
        .sort((a, b) => (a.priority || 0) - (b.priority || 0));
      setPopups(publishedPopups);
      
      // Show first popup after a delay
      if (publishedPopups.length > 0) {
        setTimeout(() => {
          setActivePopup(publishedPopups[0]);
          setPopupIndex(0);
        }, 1500);
      }
    };
    loadPopups();
  }, []);

  const handleClosePopup = () => {
    setActivePopup(null);
    // Show next popup if available
    const nextIndex = popupIndex + 1;
    if (nextIndex < popups.length) {
      setTimeout(() => {
        setActivePopup(popups[nextIndex]);
        setPopupIndex(nextIndex);
      }, 30000); // Show next popup after 30 seconds
    }
  };

  const handlePopupNavigate = (url: string) => {
    updateSearchTerm(url.replace('/', ''));
  };
  const searchTerm = typeof searchValue === 'string' ? searchValue : internalSearchTerm;
  const updateSearchTerm = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setInternalSearchTerm(value);
    }
  };
  const categoriesSectionRef = useRef<HTMLElement | null>(null);
  const productsSectionRef = useRef<HTMLElement | null>(null);

  // Use passed products or fallback to initial constants
  const displayProducts = products && products.length > 0 ? products : INITIAL_PRODUCTS;

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const matchesSearch = (product: Product) => {
    if (!normalizedSearch) return true;
    const contains = (value?: string) => Boolean(value && value.toLowerCase().includes(normalizedSearch));
    if (
      contains(product.name) ||
      contains(product.description) ||
      contains(product.brand) ||
      contains(product.category) ||
      contains(product.subCategory) ||
      contains(product.childCategory)
    ) {
      return true;
    }
    if (product.tags && product.tags.length) {
      return product.tags.some((tag) => contains(tag));
    }
    // Include searchTags for deep search
    if (product.searchTags && product.searchTags.length) {
      return product.searchTags.some((tag) => contains(tag));
    }
    return false;
  };
  
  const filteredProducts = normalizedSearch ? displayProducts.filter(matchesSearch) : displayProducts;
  
  // Handler for category click - navigates to category URL
  const handleCategoryClick = (categoryName: string) => {
    const categorySlug = slugify(categoryName);
    if (onCategoryFilterChange) {
      onCategoryFilterChange(categorySlug);
    }
    setSelectedCategoryView(categoryName);
  };

  // Handler for clearing category filter
  const handleClearCategoryFilter = () => {
    if (onCategoryFilterChange) {
      onCategoryFilterChange(null);
    }
    setSelectedCategoryView(null);
  };
  
  const sortedProducts = (() => {
    const products = [...filteredProducts];
    switch (sortOption) {
      case 'price-low':
        return products.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-high':
        return products.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'rating':
        return products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'newest':
        return products.sort((a, b) => (b.id || 0) - (a.id || 0));
      case 'relevance':
      default:
        return products;
    }
  })();
  
  const hasSearchQuery = Boolean(normalizedSearch);

  // Category Auto Scroll Logic for Style 2
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const flashSaleEndRef = useRef<number>(getNextFlashSaleReset());
  const [flashTimeLeft, setFlashTimeLeft] = useState(() => getTimeSegments(flashSaleEndRef.current - Date.now()));

  useEffect(() => {
    if (websiteConfig?.categorySectionStyle === 'style2') {
      const el = categoryScrollRef.current;
      if (!el) return;
      
      let animationId: number;
      const speed = 0.8; // Scroll speed
      
      const scroll = () => {
        // If scrolled past half the width (since we duplicated content), reset to 0
        if (el.scrollLeft >= (el.scrollWidth / 2)) {
          el.scrollLeft = 0;
        } else {
          el.scrollLeft += speed;
        }
        animationId = requestAnimationFrame(scroll);
      };
      
      animationId = requestAnimationFrame(scroll);
      
      const stop = () => cancelAnimationFrame(animationId);
      const start = () => { stop(); animationId = requestAnimationFrame(scroll); };
      
      el.addEventListener('mouseenter', stop);
      el.addEventListener('mouseleave', start);
      
      return () => {
        stop();
        if (el) {
            el.removeEventListener('mouseenter', stop);
            el.removeEventListener('mouseleave', start);
        }
      };
    }
  }, [websiteConfig?.categorySectionStyle]);

  const showFlashSaleCounter = websiteConfig?.showFlashSaleCounter ?? true;

  useEffect(() => {
    if (!showFlashSaleCounter) {
      return;
    }

    flashSaleEndRef.current = getNextFlashSaleReset();
    setFlashTimeLeft(getTimeSegments(flashSaleEndRef.current - Date.now()));

    const timer = setInterval(() => {
      const diff = flashSaleEndRef.current - Date.now();
      if (diff <= 0) {
        flashSaleEndRef.current = getNextFlashSaleReset();
        setFlashTimeLeft(getTimeSegments(flashSaleEndRef.current - Date.now()));
      } else {
        setFlashTimeLeft(getTimeSegments(diff));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [showFlashSaleCounter]);

  const handleQuickViewOrder = (product: Product, quantity: number, variant: ProductVariantSelection) => {
    if (onQuickCheckout) {
      onQuickCheckout(product, quantity, variant);
    } else {
      onProductClick(product);
    }
    setQuickViewProduct(null);
  };

  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    if (typeof window === 'undefined' || !ref.current) return;
    const headerOffset = 80;
    const top = ref.current.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  };

  const performScroll = (ref: React.RefObject<HTMLElement | null>) => {
    if (hasSearchQuery) {
      updateSearchTerm('');
      setTimeout(() => scrollToSection(ref), 120);
    } else {
      scrollToSection(ref);
    }
  };

  const handleCategoriesNav = () => performScroll(categoriesSectionRef);
  const handleProductsNav = () => performScroll(productsSectionRef);

  const selectInstantVariant = (product: Product): ProductVariantSelection => ({
    color: product.variantDefaults?.color || product.colors?.[0] || 'Default',
    size: product.variantDefaults?.size || product.sizes?.[0] || 'Standard'
  });

  const handleBuyNow = (product: Product) => {
    if (onQuickCheckout) {
      onQuickCheckout(product, 1, selectInstantVariant(product));
    } else {
      onProductClick(product);
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAddProductToCartFromCard = (product: Product) => {
    if (onAddToCart) {
      onAddToCart(product, 1, selectInstantVariant(product));
    } else {
      onProductClick(product);
    }
  };

  const flashSaleCountdown = [
    { label: 'Hours', value: formatSegment(flashTimeLeft.hours) },
    { label: 'Mins', value: formatSegment(flashTimeLeft.minutes) },
    { label: 'Sec', value: formatSegment(flashTimeLeft.seconds) }
  ];

  // If a category is selected, show the category products view
  if (selectedCategoryView) {
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" />
        </div>
      }>
        <StoreCategoryProducts
          products={displayProducts}
          categories={categories}
          subCategories={subCategories}
          childCategories={childCategories}
          brands={brands}
          tags={tags}
          selectedCategory={selectedCategoryView}
          onCategoryChange={(category) => {
            if (category) {
              handleCategoryClick(category);
            } else {
              handleClearCategoryFilter();
            }
          }}
          onBack={handleClearCategoryFilter}
          onProductClick={onProductClick}
          onBuyNow={handleBuyNow}
          onQuickView={setQuickViewProduct}
          onAddToCart={handleAddProductToCartFromCard}
          websiteConfig={websiteConfig}
          // Header/Footer props
          logo={logo}
          user={user}
          wishlistCount={wishlistCount}
          wishlist={wishlist}
          onToggleWishlist={onToggleWishlist}
          cart={cart}
          onToggleCart={onToggleCart}
          onCheckoutFromCart={onCheckoutFromCart}
          onLoginClick={onLoginClick}
          onLogoutClick={onLogoutClick}
          onProfileClick={onProfileClick}
          onOpenChat={onOpenChat}
          onImageSearchClick={onImageSearchClick}
          orders={orders}
        />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
      <Suspense fallback={<StoreHeaderSkeleton />}>
        <StoreHeader 
          onTrackOrder={() => setIsTrackOrderOpen(true)} 
          onOpenAIStudio={() => setIsAIStudioOpen(true)}
          onImageSearchClick={onImageSearchClick}
          productCatalog={displayProducts}
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
          onSearchChange={updateSearchTerm}
          onCategoriesClick={handleCategoriesNav}
          onProductsClick={handleProductsNav}
          categoriesList={CATEGORIES.map((cat) => cat.name)}
          onCategorySelect={(categoryName) => handleCategoryClick(categoryName)}
          onProductClick={onProductClick}
          categories={categories}
          subCategories={subCategories}
          childCategories={childCategories}
          brands={brands}
          tags={tags}
        />
      </Suspense>
      
      {isTrackOrderOpen && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" /></div>}>
          <TrackOrderModal onClose={() => setIsTrackOrderOpen(false)} orders={orders} />
        </Suspense>
      )}
      {isAIStudioOpen && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" /></div>}>
          <AIStudioModal onClose={() => setIsAIStudioOpen(false)} />
        </Suspense>
      )}
      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onCompleteOrder={handleQuickViewOrder}
          onViewDetails={(product) => {
            setQuickViewProduct(null);
            onProductClick(product);
          }}
        />
      )}
      
      {/* Hero Section */}
      <HeroSection carouselItems={websiteConfig?.carouselItems} websiteConfig={websiteConfig} />

      <main className="max-w-7xl mx-auto px-4 space-y-4 pb-4">
        {hasSearchQuery ? (
          <SearchResultsSection
            searchTerm={searchTerm.trim()}
            products={sortedProducts}
            sortOption={sortOption}
            onSortChange={setSortOption}
            onClearSearch={() => {
              updateSearchTerm('');
              setSortOption('relevance');
            }}
            onProductClick={onProductClick}
            onBuyNow={handleBuyNow}
            onQuickView={setQuickViewProduct}
            onAddToCart={handleAddProductToCartFromCard}
            productCardStyle={websiteConfig?.productCardStyle}
          />
        ) : (
          <>
            {/* Categories */}
            <CategoriesSection
              style={websiteConfig?.categorySectionStyle as 'style1' | 'style2' | undefined}
              categories={categories}
              onCategoryClick={handleCategoryClick}
              categoryScrollRef={categoryScrollRef}
              sectionRef={categoriesSectionRef as React.RefObject<HTMLDivElement>}
            />

            {/* Flash Deals */}
            <FlashSalesSection
              products={displayProducts}
              isLoading={isLoading}
              showCounter={showFlashSaleCounter}
              countdown={flashSaleCountdown}
              onProductClick={onProductClick}
              onBuyNow={handleBuyNow}
              onQuickView={setQuickViewProduct}
              onAddToCart={handleAddProductToCartFromCard}
              productCardStyle={websiteConfig?.productCardStyle}
              sectionRef={productsSectionRef}
            />

            {/* Best Sale Products */}
            <ProductGridSection
              title="Best Sale Products"
              products={displayProducts}
              accentColor="green"
              keyPrefix="best"
              maxProducts={10}
              reverseOrder={true}
              onProductClick={onProductClick}
              onBuyNow={handleBuyNow}
              onQuickView={setQuickViewProduct}
              onAddToCart={handleAddProductToCartFromCard}
              productCardStyle={websiteConfig?.productCardStyle}
            />

            {/* OMG Fashion Banner */}
            <PromoBanner />

            {/* Popular Products */}
            <ProductGridSection
              title="Popular products"
              products={displayProducts}
              accentColor="purple"
              keyPrefix="pop"
              maxProducts={10}
              reverseOrder={false}
              onProductClick={onProductClick}
              onBuyNow={handleBuyNow}
              onQuickView={setQuickViewProduct}
              onAddToCart={handleAddProductToCartFromCard}
              productCardStyle={websiteConfig?.productCardStyle}
            />
          </>
        )}
      </main>

      <Suspense fallback={<StoreFooterSkeleton />}>
        <StoreFooter websiteConfig={websiteConfig} logo={logo} onOpenChat={onOpenChat} />
      </Suspense>
      
      {/* Popup Display */}
      {activePopup && (
        <StorePopup
          popup={activePopup}
          onClose={handleClosePopup}
          onNavigate={handlePopupNavigate}
        />
      )}
    </div>
  );
};

export default StoreHome;
