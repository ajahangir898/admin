
import React, { useState } from 'react';
import { StoreHeader, StoreFooter, HeroSection, CategoryCircle, SectionHeader, ProductCard, TrackOrderModal, AIStudioModal } from '../components/StoreComponents';
import { CATEGORIES, PRODUCTS as INITIAL_PRODUCTS } from '../constants';
import { Smartphone, Watch, BatteryCharging, Headphones, Zap, Bluetooth, Gamepad2, Camera } from 'lucide-react';
import { Product, User, WebsiteConfig } from '../types';

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
      
      {isTrackOrderOpen && <TrackOrderModal onClose={() => setIsTrackOrderOpen(false)} />}
      {isAIStudioOpen && <AIStudioModal onClose={() => setIsAIStudioOpen(false)} />}
      
      {/* Hero Section */}
      <HeroSection carouselItems={websiteConfig?.carouselItems} />

      <main className="container mx-auto px-4 space-y-12 pb-12">
        
        {/* Categories */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <SectionHeader title="Categories" />
            <div className="flex flex-wrap gap-4 md:gap-8 justify-center md:justify-between overflow-x-auto pb-4 scrollbar-hide">
            {CATEGORIES.map((cat, idx) => (
                <CategoryCircle key={idx} name={cat.name} icon={iconMap[cat.icon]} />
            ))}
            </div>
        </div>

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
