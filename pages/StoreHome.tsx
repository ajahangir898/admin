
import React, { useState, useEffect, useRef } from 'react';
import { StoreHeader, StoreFooter, HeroSection, CategoryCircle, SectionHeader, ProductCard, TrackOrderModal, AIStudioModal } from '../components/StoreComponents';
import { CATEGORIES, PRODUCTS as INITIAL_PRODUCTS } from '../constants';
import { Smartphone, Watch, BatteryCharging, Headphones, Zap, Bluetooth, Gamepad2, Camera } from 'lucide-react';
import { Product, User, WebsiteConfig, Order } from '../types';

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
      
      {/* Hero Section */}
      <HeroSection carouselItems={websiteConfig?.carouselItems} />

      <main className="max-w-7xl mx-auto px-4 space-y-12 pb-12">
        
        {/* Categories */}
        {websiteConfig?.categorySectionStyle === 'style2' ? (
           <div className="mt-8 mb-8">
              <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-2">
                 <div className="relative">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white pb-2">Categories</h2>
                    <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-pink-500"></div>
                    <div className="absolute bottom-0 left-8 w-16 h-0.5 bg-blue-400"></div>
                 </div>
                 <a href="#" className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-blue-600 flex items-center gap-2 transition mb-2">
                    View All <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-blue-500 border-b-[5px] border-b-transparent"></div>
                 </a>
              </div>
              
              {/* Auto Scrolling Container */}
              <div 
                 ref={categoryScrollRef}
                 className="flex gap-4 overflow-x-hidden pb-4 whitespace-nowrap scrollbar-hide"
                 style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}
              >
                 {/* Render multiple times for infinite seamless loop */}
                 {[...CATEGORIES, ...CATEGORIES, ...CATEGORIES].map((cat, idx) => (
                    <div key={`${cat.name}-${idx}`} className="inline-flex items-center gap-3 p-1.5 pr-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full min-w-max cursor-pointer hover:border-blue-400 transition group flex-shrink-0">
                       <div className="w-10 h-10 rounded-full bg-white border border-blue-100 dark:bg-slate-700 dark:border-slate-600 flex items-center justify-center text-blue-500 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition shadow-sm">
                          {React.cloneElement(iconMap[cat.icon] as React.ReactElement<any>, { size: 20, strokeWidth: 1.5 })}
                       </div>
                       <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400">{cat.name}</span>
                    </div>
                 ))}
              </div>
           </div>
        ) : (
           <div className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
               <SectionHeader title="Categories" />
               <div className="flex flex-wrap gap-4 md:gap-8 justify-center md:justify-between overflow-x-auto pb-4 scrollbar-hide">
               {CATEGORIES.map((cat, idx) => (
                   <CategoryCircle key={idx} name={cat.name} icon={iconMap[cat.icon]} />
               ))}
               </div>
           </div>
        )}

        {/* Flash Deals */}
        <section>
          <div className="flex items-center gap-3 mb-6">
             <div className="h-8 w-1.5 bg-pink-500 rounded-full"></div>
             <SectionHeader title="Flash Deals" />
             <div className="bg-pink-100 text-pink-600 px-3 py-1 rounded text-xs font-bold animate-pulse">Ends in 24h</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayProducts.map((product) => (
              <ProductCard 
                key={`flash-${product.id}`} 
                product={product} 
                onClick={onProductClick} 
                variant={websiteConfig?.productCardStyle}
              />
            ))}
            {/* Add a duplicate if few products to fill grid */}
            {displayProducts.length > 0 && displayProducts.length < 5 && 
              <ProductCard product={{...displayProducts[0], id: 99}} onClick={onProductClick} variant={websiteConfig?.productCardStyle} />
            }
          </div>
        </section>

        {/* Best Sale Products */}
        <section>
            <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1.5 bg-green-500 rounded-full"></div>
                <SectionHeader title="Best Sale Products" />
            </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
             {displayProducts.slice().reverse().map((product) => (
              <ProductCard key={`best-${product.id}`} product={product} onClick={onProductClick} variant={websiteConfig?.productCardStyle} />
            ))}
             {/* Add a duplicate if few products to fill grid */}
             {displayProducts.length > 0 && displayProducts.length < 5 && 
               <ProductCard product={{...displayProducts[1], id: 98}} onClick={onProductClick} variant={websiteConfig?.productCardStyle} />
             }
          </div>
        </section>

         {/* OMG Fashion Banner */}
        <section className="bg-purple-900 rounded-2xl overflow-hidden relative h-48 md:h-64 flex items-center px-8 md:px-16 text-white shadow-xl">
             <div className="z-10 relative max-w-lg">
                 <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded mb-2 inline-block">NEW ARRIVAL</span>
                 <h2 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight">OMG FASHION</h2>
                 <p className="mb-6 text-purple-200 text-sm md:text-base">Get up to 70% off on all fashion accessories. Limited time offer.</p>
                 <button className="bg-white text-purple-900 px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-100 transition shadow-lg">Explore Collection</button>
             </div>
             <div className="absolute right-0 top-0 h-full w-2/3 bg-gradient-to-l from-purple-600 to-transparent opacity-60"></div>
             <div className="absolute -right-20 -bottom-40 w-80 h-80 bg-pink-500 rounded-full blur-[100px] opacity-50"></div>
        </section>

        {/* Popular Products */}
        <section>
            <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1.5 bg-purple-500 rounded-full"></div>
                <SectionHeader title="Popular products" />
            </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayProducts.map((product) => (
              <ProductCard key={`pop-${product.id}`} product={product} onClick={onProductClick} variant={websiteConfig?.productCardStyle} />
            ))}
             {/* Add a duplicate if few products to fill grid */}
             {displayProducts.length > 0 && displayProducts.length < 5 && 
               <ProductCard product={{...displayProducts[2], id: 97}} onClick={onProductClick} variant={websiteConfig?.productCardStyle} />
             }
          </div>
        </section>

      </main>

      <StoreFooter websiteConfig={websiteConfig} />
    </div>
  );
};

export default StoreHome;
