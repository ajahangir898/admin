
import React, { useState, useEffect, useRef } from 'react';
import { StoreHeader, StoreFooter, HeroSection, CategoryCircle, CategoryPill, SectionHeader, ProductCard, TrackOrderModal, AIStudioModal, ProductQuickViewModal } from '../components/StoreComponents';
import { CATEGORIES, PRODUCTS as INITIAL_PRODUCTS } from '../constants';
import { Smartphone, Watch, BatteryCharging, Headphones, Zap, Bluetooth, Gamepad2, Camera } from 'lucide-react';
import { Product, User, WebsiteConfig, Order, ProductVariantSelection } from '../types';

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

interface StoreHomeProps {
  products?: Product[];
  orders?: Order[];
  onProductClick: (p: Product) => void;
  onQuickCheckout?: (p: Product, quantity: number, variant: ProductVariantSelection) => void;
  wishlistCount: number;
  wishlist: number[];
  onToggleWishlist: (id: number) => void;
  user?: User | null;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onProfileClick?: () => void;
  logo?: string | null;
  websiteConfig?: WebsiteConfig;
}

const StoreHome = ({ 
  products,
  orders,
  onProductClick, 
  onQuickCheckout,
  wishlistCount, 
  wishlist, 
  onToggleWishlist,
  user,
  onLoginClick,
  onLogoutClick,
  onProfileClick,
  logo,
  websiteConfig
}: StoreHomeProps) => {
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isAIStudioOpen, setIsAIStudioOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Use passed products or fallback to initial constants
  const displayProducts = products && products.length > 0 ? products : INITIAL_PRODUCTS;

  // Category Auto Scroll Logic for Style 2
  const categoryScrollRef = useRef<HTMLDivElement>(null);

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

  const handleQuickViewOrder = (product: Product, quantity: number, variant: ProductVariantSelection) => {
    if (onQuickCheckout) {
      onQuickCheckout(product, quantity, variant);
    } else {
      onProductClick(product);
    }
    setQuickViewProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
      <StoreHeader 
        onTrackOrder={() => setIsTrackOrderOpen(true)} 
        onOpenAIStudio={() => setIsAIStudioOpen(true)}
        wishlistCount={wishlistCount}
        user={user}
        onLoginClick={onLoginClick}
        onLogoutClick={onLogoutClick}
        onProfileClick={onProfileClick}
        logo={logo}
        websiteConfig={websiteConfig}
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

      <main className="max-w-7xl mx-auto px-4 space-y-8 pb-12">
        
        {/* Categories */}
        {websiteConfig?.categorySectionStyle === 'style2' ? (
           <div className="mt-2 mb-2">
              <div className="flex justify-between items-end mb-2 border-b border-gray-100 pb-2">
                 <div className="relative pb-2">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Categories</h2>
      
                 </div>
                 <a href="#" className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-blue-600 flex items-center gap-1 transition mb-2 group">
                    View All <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-blue-500 border-b-[5px] border-b-transparent transform group-hover:translate-x-1 transition-transform"></div>
                 </a>
              </div>
              
              {/* Auto Scrolling Container */}
              <div 
                 ref={categoryScrollRef}
                 className="flex gap-6 overflow-x-hidden py-1 whitespace-nowrap scrollbar-hide"
                 style={{ maskImage: 'linear-gradient(to right, transparent, black 2%, black 98%, transparent)' }}
              >
                 {/* Render multiple times for infinite seamless loop */}
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
           <div className="mt-6 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
               <SectionHeader title="Categories" />
               <div className="flex flex-wrap gap-x-8 gap-y-8 justify-center md:justify-between overflow-x-auto pb-4 scrollbar-hide pt-2">
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

        {/* Flash Deals */}
        <section>
          <div className="flex items-center gap-3 mb-1">
          
             <SectionHeader title="⚡Flash Sales" className="text-xl text-red-600" />
             <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full text-xs font-semibold text-pink-900 bg-gradient-to-r from-rose-100 via-white to-violet-100 border border-pink-200 shadow-[0_6px_20px_rgba(244,114,182,0.25)]">
               <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-rose-500">
                 Ends in
                 <span className="inline-flex h-4 w-10 items-center justify-center rounded-full bg-white text-rose-600 border border-rose-200">24h</span>
               </span>
               <span className="relative flex items-center gap-2 text-pink-700">
                 <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                 
               </span>
             </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {displayProducts.map((product) => (
              <ProductCard 
                key={`flash-${product.id}`} 
                product={product} 
                onClick={onProductClick} 
                variant={websiteConfig?.productCardStyle}
                onQuickView={setQuickViewProduct}
              />
            ))}
            {/* Add a duplicate if few products to fill grid */}
            {displayProducts.length > 0 && displayProducts.length < 5 && 
              <ProductCard product={{...displayProducts[0], id: 99}} onClick={onProductClick} variant={websiteConfig?.productCardStyle} onQuickView={setQuickViewProduct} />
            }
          </div>
        </section>

        {/* Best Sale Products */}
        <section>
            <div className="flex items-center gap-3 mb-1">
                <div className="h-8 w-1.5 bg-green-500 rounded-full"></div>
                <SectionHeader title="Best Sale Products" className="text-xl text-red-600" />
            </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
             {displayProducts.slice().reverse().map((product) => (
              <ProductCard key={`best-${product.id}`} product={product} onClick={onProductClick} variant={websiteConfig?.productCardStyle} onQuickView={setQuickViewProduct} />
            ))}
             {/* Add a duplicate if few products to fill grid */}
             {displayProducts.length > 0 && displayProducts.length < 5 && 
               <ProductCard product={{...displayProducts[1], id: 98}} onClick={onProductClick} variant={websiteConfig?.productCardStyle} onQuickView={setQuickViewProduct} />
             }
          </div>
        </section>

        {/* OMG Fashion Banner */}
        <section className="relative overflow-hidden rounded-3xl text-white shadow-2xl my-8 px-6 sm:px-10 py-10">
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
                      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=400&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}
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
            <div className="flex items-center gap-3 mb-1">
                <div className="h-8 w-1.5 bg-purple-500 rounded-full"></div>
                <SectionHeader title="Popular products" className="text-xl text-red-600" />
            </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={`pop-${product.id}`} product={product} onClick={onProductClick} variant={websiteConfig?.productCardStyle} onQuickView={setQuickViewProduct} />
            ))}
             {/* Add a duplicate if few products to fill grid */}
             {displayProducts.length > 0 && displayProducts.length < 5 && 
               <ProductCard product={{...displayProducts[2], id: 97}} onClick={onProductClick} variant={websiteConfig?.productCardStyle} onQuickView={setQuickViewProduct} />
             }
          </div>
        </section>

      </main>

      <StoreFooter websiteConfig={websiteConfig} logo={logo} />
    </div>
  );
};

export default StoreHome;
