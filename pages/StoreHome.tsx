
import React, { useState, useEffect, useRef } from 'react';
import { StoreHeader, StoreFooter, HeroSection, CategoryCircle, CategoryPill, SectionHeader, ProductCard, TrackOrderModal, AIStudioModal, ProductQuickViewModal } from '../components/StoreComponents';
import { CATEGORIES, PRODUCTS as INITIAL_PRODUCTS } from '../constants';
import { Smartphone, Watch, BatteryCharging, Headphones, Zap, Bluetooth, Gamepad2, Camera } from 'lucide-react';
import { Product, User, WebsiteConfig, Order, ProductVariantSelection } from '../types';
import { ProductFilter, SortOption } from '../components/ProductFilter';
import { EmptySearchState } from '../components/EmptyStates';
import { SkeletonCard, SkeletonImageGrid } from '../components/SkeletonLoaders';

// Helper map for dynamic icons
const iconMap: Record<string, React.ReactNode> = {
  smartphone: <Smartphone size={28} strokeWidth={1.5} />,
  watch: <Watch size={28} strokeWidth={1.5} />,
  'battery-charging': <BatteryCharging size={28} strokeWidth={1.5} />,
  headphones: <Headphones size={28} strokeWidth={1.5} />,
  zap: <Zap size={28} strokeWidth={1.5} />,
  bluetooth: <Bluetooth size={28} strokeWidth={1.5} />,
  'gamepad-2': <Gamepad2 size={28} strokeWidth={1.5} />,
  camera: <Camera size={28} strokeWidth={1.5} />,
};

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
  searchValue,
  onSearchChange,
  onImageSearchClick,
  onOpenChat
}: StoreHomeProps) => {
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isAIStudioOpen, setIsAIStudioOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('relevance');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial data loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);
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
    return false;
  };
  const filteredProducts = normalizedSearch ? displayProducts.filter(matchesSearch) : displayProducts;
  
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

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
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
        onCategorySelect={(categoryName) => updateSearchTerm(categoryName)}
      />
      
      {isTrackOrderOpen && <TrackOrderModal onClose={() => setIsTrackOrderOpen(false)} orders={orders} />}
      {isAIStudioOpen && <AIStudioModal onClose={() => setIsAIStudioOpen(false)} />}
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
      <HeroSection carouselItems={websiteConfig?.carouselItems} />

      <main className="max-w-7xl mx-auto px-4 space-y-4 pb-12">
        {hasSearchQuery ? (
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Search</p>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white break-words">
                  {sortedProducts.length} {sortedProducts.length === 1 ? 'result' : 'results'} for "{searchTerm.trim()}".
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-300">Matching product titles, categories, brands, and tags.</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <ProductFilter value={sortOption} onChange={setSortOption} />
                <button
                  onClick={() => {
                    updateSearchTerm('');
                    setSortOption('relevance');
                  }}
                  className="rounded-full border border-gray-200 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-600 transition hover:border-rose-400 hover:text-rose-500 dark:border-slate-700 dark:text-gray-300 h-10 min-w-[80px] sm:min-w-[100px]"
                  aria-label="Clear search filters"
                >
                  Clear
                </button>
              </div>
            </div>
            {sortedProducts.length ? (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5 auto-rows-max">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={`search-${product.id}`}
                    product={product}
                    onClick={onProductClick}
                    onBuyNow={handleBuyNow}
                    variant={websiteConfig?.productCardStyle}
                    onQuickView={setQuickViewProduct}
                    onAddToCart={handleAddProductToCartFromCard}
                  />
                ))}
              </div>
            ) : (
              <EmptySearchState searchTerm={searchTerm.trim()} onClearSearch={() => updateSearchTerm('')} />
            )}
          </section>
        ) : (
          <>
            {/* Categories */}
            <div ref={categoriesSectionRef}>
            {websiteConfig?.categorySectionStyle === 'style2' ? (
              <div className="mt-1 -mb-1">
                <div className="flex items-end justify-between border-b border-gray-100 pb-2 md:pb-1">
                  <div className="relative pb-1">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Categories</h2>
                  </div>
                  <a
                    href="#"
                    className="group mb-1 flex items-center gap-2 text-xs md:text-sm font-bold text-gray-600 px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition dark:text-gray-400"
                    role="button"
                    aria-label="View all categories"
                  >
                    View All
                    <div className="h-0 w-0 border-b-[4px] border-l-[6px] border-t-[4px] border-b-transparent border-l-blue-500 border-t-transparent transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
                <div
                  ref={categoryScrollRef}
                  className="flex gap-6 overflow-x-hidden whitespace-nowrap scrollbar-hide"
                  style={{ maskImage: 'linear-gradient(to right, transparent, black 2%, black 98%, transparent)' }}
                >
                  {[...CATEGORIES, ...CATEGORIES, ...CATEGORIES].map((cat, idx) => (
                    <CategoryPill
                      key={`${cat.name}-${idx}`}
                      name={cat.name}
                      icon={React.cloneElement(iconMap[cat.icon] as React.ReactElement<any>, { size: 20, strokeWidth: 2 })}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <SectionHeader title="Categories" />
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-8 overflow-x-auto pb-4 pt-2 scrollbar-hide md:justify-between">
                  {CATEGORIES.map((cat, idx) => (
                    <CategoryCircle
                      key={idx}
                      name={cat.name}
                      icon={React.cloneElement(iconMap[cat.icon] as React.ReactElement<any>, { size: 32, strokeWidth: 1.5 })}
                    />
                  ))}
                </div>
              </div>
            )}
            </div>

            {/* Flash Deals */}
            <section ref={productsSectionRef}>
              <div className="mb-1 flex items-center gap-3">
                <SectionHeader title="⚡Flash Sales" className="text-xl text-red-600" />
                {showFlashSaleCounter && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-100 via-white to-violet-100 px-2.5 py-0.5 text-[11px] font-semibold text-pink-900 shadow-[0_4px_12px_rgba(244,114,182,0.25)]">
                    <div className="flex items-center gap-1 text-sky-700">
                      {flashSaleCountdown.map((segment) => (
                        <span
                          key={segment.label}
                          className="flex min-w-[44px] flex-col items-center justify-center rounded-md border border-sky-200 bg-white px-2 py-0.5 text-sky-700 shadow-sm leading-tight"
                        >
                          <span className="text-[11px] font-black">{segment.value}</span>
                          <span className="text-[7px] font-semibold uppercase tracking-tight text-sky-500">{segment.label}</span>
                        </span>
                      ))}
                    </div>
                    <span className="relative flex items-center gap-2 text-pink-700">
                      <span className="h-2 w-2 animate-ping rounded-full bg-rose-500" />
                    </span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5">
                {isLoading ? (
                  // Show skeletons while loading
                  [...Array(5)].map((_, i) => <SkeletonCard key={`skeleton-${i}`} />)
                ) : (
                  displayProducts.map((product) => (
                    <ProductCard
                      key={`flash-${product.id}`}
                      product={product}
                      onClick={onProductClick}
                      onBuyNow={handleBuyNow}
                      variant={websiteConfig?.productCardStyle}
                      onQuickView={setQuickViewProduct}
                      onAddToCart={handleAddProductToCartFromCard}
                    />
                  ))
                )}
                {displayProducts.length > 0 && displayProducts.length < 5 && (
                  <ProductCard
                    product={{ ...displayProducts[0], id: 99 }}
                    onClick={onProductClick}
                    onBuyNow={handleBuyNow}
                    variant={websiteConfig?.productCardStyle}
                    onQuickView={setQuickViewProduct}
                    onAddToCart={handleAddProductToCartFromCard}
                  />
                )}
              </div>
            </section>

            {/* Best Sale Products */}
            <section>
              <div className="mb-1 flex items-center gap-3">
                <div className="h-8 w-1.5 rounded-full bg-green-500"></div>
                <SectionHeader title="Best Sale Products" className="text-xl text-red-600" />
              </div>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5">
                {displayProducts
                  .slice()
                  .reverse()
                  .map((product) => (
                    <ProductCard
                      key={`best-${product.id}`}
                      product={product}
                      onClick={onProductClick}
                      onBuyNow={handleBuyNow}
                      variant={websiteConfig?.productCardStyle}
                      onQuickView={setQuickViewProduct}
                      onAddToCart={handleAddProductToCartFromCard}
                    />
                  ))}
                {displayProducts.length > 0 && displayProducts.length < 5 && (
                  <ProductCard
                    product={{ ...displayProducts[1], id: 98 }}
                    onClick={onProductClick}
                    onBuyNow={handleBuyNow}
                    variant={websiteConfig?.productCardStyle}
                    onQuickView={setQuickViewProduct}
                    onAddToCart={handleAddProductToCartFromCard}
                  />
                )}
              </div>
            </section>

            {/* OMG Fashion Banner */}
            <section className="relative mt-4 mb-8 overflow-hidden rounded-3xl px-6 py-10 text-white shadow-2xl sm:px-10">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-[#150c2e] via-[#5b21b6] to-[#f472b6] opacity-95" />
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), transparent 45%), radial-gradient(circle at 80% 0%, rgba(249,168,212,0.4), transparent 40%)'
              }}
            />
          </div>
          <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-1.5 text-xs font-semibold rounded-full border border-white/20">
                <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" /> NEW ARRIVAL
              </span>
              <h2 className="text-3xl md:text-5xl font-black mt-5 leading-tight tracking-tight">
                OMG Fashion Weekend
              </h2>
              <p className="mt-4 text-sm md:text-base text-white/80 max-w-xl">
                Curated accessories, bold statements, and capsule outfits ready to ship worldwide. Save up to 70% on
                limited drops while stock lasts.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
                <div className="bg-white/15 rounded-2xl px-5 py-3 border border-white/20">
                  <p className="text-xs text-white/60 uppercase">Exclusive</p>
                  <p className="text-lg">Limited Drops</p>
                </div>
                <div className="bg-white/15 rounded-2xl px-5 py-3 border border-white/20">
                  <p className="text-xs text-white/60 uppercase">Up to</p>
                  <p className="text-lg">70% OFF</p>
                </div>
                <div className="bg-white/15 rounded-2xl px-5 py-3 border border-white/20">
                  <p className="text-xs text-white/60 uppercase">Ships</p>
                  <p className="text-lg">48h Express</p>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <button className="btn-order px-8 py-3 rounded-full font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                  Explore Collection
                </button>
                <button className="px-8 py-3 rounded-full font-bold border-2 border-white/60 text-white hover:bg-white/10">
                  Watch Lookbook
                </button>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative w-72 h-72">
                <div className="absolute -inset-6 bg-gradient-to-br from-pink-500/40 to-purple-700/40 blur-3xl" aria-hidden />
                <div className="relative bg-white/10 border border-white/20 rounded-[32px] h-full w-full backdrop-blur-md p-6 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-white/60">Feature Drop</p>
                    <p className="text-2xl font-bold">Neon Bloom Set</p>
                    <p className="text-sm text-white/70">Starting at ৳2,990</p>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div
                      className="w-40 h-40 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl"
                      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=960')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-xs text-white/60">Colorways</p>
                      <p className="font-semibold">6 curated</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Sizes</p>
                      <p className="font-semibold">XS - XL</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Stock</p>
                      <p className="font-semibold text-emerald-300">In stock</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-8 -bottom-6 bg-white/10 border border-white/20 backdrop-blur rounded-2xl px-4 py-3 text-sm font-semibold">
                  <p className="text-xs text-white/60">Early Access</p>
                  <p>500 VIP slots</p>
                </div>
              </div>
            </div>
          </div>
        </section>

            {/* Popular Products */}
            <section>
              <div className="mb-1 flex items-center gap-3">
                <div className="h-8 w-1.5 rounded-full bg-purple-500"></div>
                <SectionHeader title="Popular products" className="text-xl text-red-600" />
              </div>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5">
                {displayProducts.map((product) => (
                  <ProductCard
                    key={`pop-${product.id}`}
                    product={product}
                    onClick={onProductClick}
                    onBuyNow={handleBuyNow}
                    variant={websiteConfig?.productCardStyle}
                    onQuickView={setQuickViewProduct}
                    onAddToCart={handleAddProductToCartFromCard}
                  />
                ))}
                {displayProducts.length > 0 && displayProducts.length < 5 && (
                  <ProductCard
                    product={{ ...displayProducts[2], id: 97 }}
                    onClick={onProductClick}
                    onBuyNow={handleBuyNow}
                    variant={websiteConfig?.productCardStyle}
                    onQuickView={setQuickViewProduct}
                    onAddToCart={handleAddProductToCartFromCard}
                  />
                )}
              </div>
            </section>
          </>
        )}
      </main>

      <StoreFooter websiteConfig={websiteConfig} logo={logo} onOpenChat={onOpenChat} />
    </div>
  );
};

export default StoreHome;
