
import React, { useState, useEffect, useRef } from 'react';
import { StoreHeader, StoreFooter, HeroSection, CategoryCircle, CategoryPill, SectionHeader, ProductCard, TrackOrderModal, AIStudioModal } from '../components/StoreComponents';
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

      <main className="max-w-7xl mx-auto px-4 space-y-8 pb-12">
        
        {/* Categories */}
        {websiteConfig?.categorySectionStyle === 'style2' ? (
           <div className="mt-6 mb-8">
              <div className="flex justify-between items-end mb-2 border-b border-gray-100 pb-2">
                 <div className="relative pb-2">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Categories</h2>
                    <div className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
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
          <div className="flex items-center gap-3 mb-6">
             <div className="h-8 w-1.5 bg-pink-500 rounded-full"></div>
             <SectionHeader title="Flash Deals" />
             <div className="bg-pink-100 text-pink-600 px-3 py-1 rounded text-xs font-bold animate-pulse">Ends in 24h</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
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
        <section className="bg-purple-900 rounded-2xl overflow-hidden relative h-48 md:h-72 flex items-center px-8 md:px-16 text-white shadow-2xl my-8 transform hover:scale-[1.01] transition-transform duration-500">
             <div className="z-10 relative max-w-lg">
                 <span className="bg-white/20 text-xs font-bold px-3 py-1.5 rounded-full mb-3 inline-block backdrop-blur-sm border border-white/10">NEW ARRIVAL</span>
                 <h2 className="text-3xl md:text-6xl font-black mb-4 tracking-tight leading-tight">OMG FASHION</h2>
                 <p className="mb-8 text-purple-100 text-sm md:text-lg font-medium">Get up to 70% off on all fashion accessories. Limited time offer.</p>
                 <button className="bg-white text-purple-900 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-1">Explore Collection</button>
             </div>
             <div className="absolute right-0 top-0 h-full w-2/3 bg-gradient-to-l from-purple-600/80 to-transparent"></div>
             <div className="absolute -right-20 -bottom-40 w-96 h-96 bg-pink-500 rounded-full blur-[120px] opacity-60 animate-pulse"></div>
             <div className="absolute left-20 -top-20 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-40"></div>
        </section>

        {/* Popular Products */}
        <section>
            <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1.5 bg-purple-500 rounded-full"></div>
                <SectionHeader title="Popular products" />
            </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
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
