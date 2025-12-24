
import React, { useState, useEffect, useRef, lazy, Suspense, useCallback, useMemo } from 'react';
import { CATEGORIES, PRODUCTS as INITIAL_PRODUCTS } from '../constants';
import type { Product, User, WebsiteConfig, Order, ProductVariantSelection, Popup, Category, Brand } from '../types';
import type { SortOption } from '../components/ProductFilter';

// Lazy load utilities - only import when needed
const getSlugify = () => import('../services/slugify').then(m => m.slugify);
const getDataService = () => import('../services/DataService').then(m => m.DataService);

// Critical above-the-fold component - loaded eagerly (smallest possible)
import { StoreHeader } from '../components/StoreHeader';

// Below-the-fold - lazy loaded
const HeroSection = lazy(() => import('../components/store/HeroSection').then(m => ({ default: m.HeroSection })));
const CategoriesSection = lazy(() => import('../components/store/CategoriesSection').then(m => ({ default: m.CategoriesSection })));
const StorePopup = lazy(() => import('../components/StorePopup').then(m => ({ default: m.StorePopup })));

// Below-the-fold components - lazy loaded from individual files for smaller chunks
const StoreFooter = lazy(() => import('../components/store/StoreFooter').then(m => ({ default: m.StoreFooter })));
const ProductQuickViewModal = lazy(() => import('../components/store/ProductQuickViewModal').then(m => ({ default: m.ProductQuickViewModal })));
const TrackOrderModal = lazy(() => import('../components/store/TrackOrderModal').then(m => ({ default: m.TrackOrderModal })));
const StoreCategoryProducts = lazy(() => import('../components/StoreCategoryProducts'));
const FlashSalesSection = lazy(() => import('../components/store/FlashSalesSection').then(m => ({ default: m.FlashSalesSection })));
const ProductGridSection = lazy(() => import('../components/store/ProductGridSection').then(m => ({ default: m.ProductGridSection })));
const PromoBanner = lazy(() => import('../components/store/PromoBanner').then(m => ({ default: m.PromoBanner })));
const SearchResultsSection = lazy(() => import('../components/store/SearchResultsSection').then(m => ({ default: m.SearchResultsSection })));

const POPUP_CACHE_KEY = 'ds_cache_public::popups';
const LOCAL_CACHE_TTL_MS = 5 * 60 * 1000;

// Deferred utility functions - only called when needed
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

const formatSegment = (value: number) => String(value).padStart(2, '0');

// Inline slugify for critical path - avoids import
const slugify = (text: string) => text?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || '';

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
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('relevance');
  const [isLoading] = useState(false);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [activePopup, setActivePopup] = useState<Popup | null>(null);
  const [popupIndex, setPopupIndex] = useState(0);
  const showPopupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextPopupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialPopupShownRef = useRef(false);
  
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

  // Defer popup loading until after initial render for faster TTI
  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const loadAndShowPopups = async () => {
      if (!isMounted) return;
      
      // Read from cache first
      let popupList: Popup[] = [];
      try {
        const cached = localStorage.getItem(POPUP_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as { data?: Popup[]; timestamp?: number };
          if (parsed?.data?.length && Date.now() - (parsed.timestamp || 0) < LOCAL_CACHE_TTL_MS) {
            popupList = parsed.data.filter((p: Popup) => p.status?.toLowerCase() === 'publish');
          }
        }
      } catch {}

      // Fetch fresh data in background
      try {
        const DataService = await getDataService();
        const allPopups = await DataService.get<Popup[]>('popups', []);
        popupList = allPopups.filter(p => p.status?.toLowerCase() === 'publish');
      } catch {}

      if (!isMounted || popupList.length === 0) return;
      
      popupList.sort((a, b) => (a.priority || 0) - (b.priority || 0));
      setPopups(popupList);
      
      // Show first popup after delay
      timeoutId = setTimeout(() => {
        if (isMounted && !initialPopupShownRef.current) {
          initialPopupShownRef.current = true;
          setActivePopup(popupList[0]);
        }
      }, 2000);
    };

    // Defer popup loading to idle time
    const idleCallback = typeof window !== 'undefined' && 'requestIdleCallback' in window
      ? (window as any).requestIdleCallback
      : (fn: () => void) => setTimeout(fn, 100);
    
    const idleId = idleCallback(loadAndShowPopups, { timeout: 3000 });

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (showPopupTimerRef.current) clearTimeout(showPopupTimerRef.current);
      if (nextPopupTimerRef.current) clearTimeout(nextPopupTimerRef.current);
      if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(idleId);
      }
    };
  }, []);

  const handleClosePopup = () => {
    setActivePopup(null);
    if (nextPopupTimerRef.current) {
      clearTimeout(nextPopupTimerRef.current);
      nextPopupTimerRef.current = null;
    }
    // Show next popup if available
    const nextIndex = popupIndex + 1;
    if (nextIndex < popups.length) {
      nextPopupTimerRef.current = setTimeout(() => {
        setActivePopup(popups[nextIndex]);
        setPopupIndex(nextIndex);
        nextPopupTimerRef.current = null;
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

  const initialProductSlice = useMemo(() => {
    const total = displayProducts.length;
    if (total <= 12) return displayProducts;
    if (typeof window === 'undefined') {
      return displayProducts.slice(0, Math.min(16, total));
    }
    const width = window.innerWidth;
    const sliceTarget = width >= 1536 ? 28 : width >= 1280 ? 22 : width >= 768 ? 16 : 12;
    return displayProducts.slice(0, Math.min(sliceTarget, total));
  }, [displayProducts]);

  const [activeProducts, setActiveProducts] = useState<Product[]>(initialProductSlice);

  useEffect(() => {
    setActiveProducts(initialProductSlice);
    if (displayProducts.length <= initialProductSlice.length) {
      return;
    }

    let cancelled = false;
    const hydrate = () => {
      if (!cancelled) {
        setActiveProducts(displayProducts);
      }
    };

    if (typeof window === 'undefined') {
      const fallbackTimer = setTimeout(() => hydrate(), 320);
      return () => {
        cancelled = true;
        clearTimeout(fallbackTimer);
      };
    }

    const idleCallback = (window as any).requestIdleCallback;
    if (typeof idleCallback === 'function') {
      const idleId = idleCallback(hydrate, { timeout: 900 });
      return () => {
        cancelled = true;
        const cancelIdle = (window as any).cancelIdleCallback;
        if (typeof cancelIdle === 'function') {
          cancelIdle(idleId);
        }
      };
    }

    const timer = window.setTimeout(() => hydrate(), 320);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [displayProducts, initialProductSlice]);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    if (!normalizedSearch) {
      return activeProducts;
    }
    return activeProducts.filter((product) => {
      const needle = normalizedSearch;
      const contains = (value?: string) => Boolean(value && value.toLowerCase().includes(needle));
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
        if (product.tags.some((tag) => contains(tag))) {
          return true;
        }
      }
      if (product.searchTags && product.searchTags.length) {
        if (product.searchTags.some((tag) => contains(tag))) {
          return true;
        }
      }
      return false;
    });
  }, [activeProducts, normalizedSearch]);
  
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
  
  const sortedProducts = useMemo(() => {
    const productsClone = [...filteredProducts];
    switch (sortOption) {
      case 'price-low':
        return productsClone.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-high':
        return productsClone.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'rating':
        return productsClone.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'newest':
        return productsClone.sort((a, b) => (b.id || 0) - (a.id || 0));
      case 'relevance':
      default:
        return productsClone;
    }
  }, [filteredProducts, sortOption]);
  
  const hasSearchQuery = Boolean(normalizedSearch);

  // Category Auto Scroll Logic for Style 2
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  // Defer flash sale calculation - not critical for initial render
  const flashSaleEndRef = useRef<number>(0);
  const [flashTimeLeft, setFlashTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (websiteConfig?.categorySectionStyle !== 'style2') {
      return;
    }

    const el = categoryScrollRef.current;
    if (!el || typeof window === 'undefined') return;

    const motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    if (motionQuery?.matches) {
      return;
    }

    let isActive = false;
    let animationId: number | null = null;
    const speed = 1.0;

    const stop = () => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    };

    const tick = () => {
      if (!el) return;
      if (el.scrollLeft >= el.scrollWidth / 2) {
        el.scrollLeft = 0;
      } else {
        el.scrollLeft += speed;
      }
      animationId = requestAnimationFrame(tick);
    };

    const start = () => {
      if (!isActive || animationId !== null) return;
      animationId = requestAnimationFrame(tick);
    };

    const handleVisibility: IntersectionObserverCallback = ([entry]) => {
      isActive = entry.isIntersecting;
      if (isActive) {
        start();
      } else {
        stop();
      }
    };

    const observer = new IntersectionObserver(handleVisibility, { threshold: 0.2 });
    observer.observe(el);

    const handleMouseEnter = () => stop();
    const handleMouseLeave = () => start();

    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);

    const handleMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        stop();
        observer.disconnect();
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      }
    };

    if (motionQuery?.addEventListener) {
      motionQuery.addEventListener('change', handleMotionChange);
    } else if (motionQuery?.addListener) {
      motionQuery.addListener(handleMotionChange);
    }

    return () => {
      stop();
      observer.disconnect();
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
      if (motionQuery?.removeEventListener) {
        motionQuery.removeEventListener('change', handleMotionChange);
      } else if (motionQuery?.removeListener) {
        motionQuery.removeListener(handleMotionChange);
      }
    };
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
      <StoreHeader 
        onTrackOrder={() => setIsTrackOrderOpen(true)} 
        onImageSearchClick={onImageSearchClick}
        productCatalog={activeProducts}
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
      
      {isTrackOrderOpen && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" /></div>}>
          <TrackOrderModal onClose={() => setIsTrackOrderOpen(false)} orders={orders} />
        </Suspense>
      )}
     
      {quickViewProduct && (
        <Suspense fallback={null}>
          <ProductQuickViewModal
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
            onCompleteOrder={handleQuickViewOrder}
            onViewDetails={(product) => {
              setQuickViewProduct(null);
              onProductClick(product);
            }}
          />
        </Suspense>
      )}
      
      {/* Hero Section - lazy loaded but high priority */}
      <Suspense fallback={<div className="h-48 md:h-64 bg-gradient-to-r from-pink-100 to-purple-100 animate-pulse" />}>
        <HeroSection carouselItems={websiteConfig?.carouselItems} websiteConfig={websiteConfig} />
      </Suspense>

      <main className="max-w-7xl mx-auto px-4 space-y-4 pb-4">
        {hasSearchQuery ? (
          <Suspense fallback={null}>
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
          </Suspense>
        ) : (
          <>
            {/* Categories - lazy loaded */}
            <Suspense fallback={<div className="h-24 bg-gray-100 rounded-lg animate-pulse" />}>
              <CategoriesSection
                style={websiteConfig?.categorySectionStyle as 'style2'}
                categories={categories}
                onCategoryClick={handleCategoryClick}
                categoryScrollRef={categoryScrollRef}
                sectionRef={categoriesSectionRef as React.RefObject<HTMLDivElement>}
              />
            </Suspense>

            {/* Flash Deals */}
            <Suspense fallback={null}>
              <FlashSalesSection
                products={activeProducts}
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
            </Suspense>

            {/* Best Sale Products */}
            <Suspense fallback={null}>
              <ProductGridSection
                title="Best Sale Products"
                products={activeProducts}
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
            </Suspense>

            {/* OMG Fashion Banner */}
            <Suspense fallback={null}>
              <PromoBanner />
            </Suspense>

            {/* Popular Products */}
            <Suspense fallback={null}>
              <ProductGridSection
                title="Popular products"
                products={activeProducts}
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
            </Suspense>
          </>
        )}
      </main>

      <Suspense fallback={null}>
        <StoreFooter websiteConfig={websiteConfig} logo={logo} onOpenChat={onOpenChat} />
      </Suspense>
      
      {/* Popup Display - lazy loaded */}
      {activePopup && (
        <Suspense fallback={null}>
          <StorePopup
            popup={activePopup}
            onClose={handleClosePopup}
            onNavigate={handlePopupNavigate}
          />
        </Suspense>
      )}
    </div>
  );
};

export default StoreHome;
