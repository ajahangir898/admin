import React, { useState, useEffect } from 'react';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, CarouselItem, WebsiteConfig } from '../types';
import { LazyImage } from '../utils/performanceOptimization';
import { normalizeImageUrl } from '../utils/imageUrlHelper';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  variant?: string;
  onQuickView?: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

const getImage = (p: Product) => normalizeImageUrl(p.galleryImages?.[0] || p.image);

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, onBuyNow, onAddToCart }) => {
  const handleBuyNow = (e?: React.MouseEvent) => { e?.stopPropagation(); onBuyNow ? onBuyNow(product) : onClick(product); };
  const handleCart = (e: React.MouseEvent) => { e.stopPropagation(); onAddToCart?.(product); };

  const discountPercent = product.originalPrice && product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div 
      className="bg-white rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 group overflow-hidden flex flex-col relative"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
    >
      {/* Discount Badge */}
      {(product.discount || discountPercent) && (
        <div className="absolute top-2.5 left-2.5 z-10">
          <span 
            className="inline-flex items-center text-white text-[11px] font-bold px-2.5 py-1 rounded-md"
            style={{ background: 'linear-gradient(to right, #ef4444, #f97316)' }}
          >
            {product.discount || `-${discountPercent}%`}
          </span>
        </div>
      )}

      {/* Product Image */}
      <div 
        className="relative aspect-square p-4 cursor-pointer overflow-hidden" 
        style={{ background: 'linear-gradient(to bottom, #f9fafb, #ffffff)' }}
        onClick={() => onClick(product)}
      >
        <LazyImage 
          src={getImage(product)} 
          alt={product.name} 
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" 
        />
      </div>

      {/* Product Details */}
      <div className="px-3.5 pb-3.5 pt-2 flex-1 flex flex-col border-t border-gray-100">
        <h3 
          className="font-semibold text-gray-800 text-[13px] leading-tight mb-2 line-clamp-2 cursor-pointer hover:text-orange-500 transition-colors"
          style={{ minHeight: '36px' }}
          onClick={() => onClick(product)}
        >
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold text-orange-500">৳{product.price?.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">৳{product.originalPrice?.toLocaleString()}</span>
          )}
        </div>

        <div className="flex gap-2 mt-auto">
          <button 
            className="flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50 transition-all"
            onClick={handleCart}
          >
            <ShoppingCart size={16} /> Cart
          </button>
          <button 
            className="flex-1 text-white text-sm font-bold py-2 px-4 rounded-lg transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(to right, #f97316, #fb923c)' }}
            onClick={handleBuyNow}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

const normalizeCarouselStatus = (value: unknown): string => String(value ?? '').trim().toLowerCase();

export const HeroSection: React.FC<{ carouselItems?: CarouselItem[]; websiteConfig?: WebsiteConfig }> = ({ carouselItems }) => {
  const items = carouselItems
    ?.filter(i => normalizeCarouselStatus(i.status) === 'publish')
    .sort((a, b) => Number(a.serial ?? 0) - Number(b.serial ?? 0)) || [];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => setCurrentIndex(p => (p + 1) % items.length), 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (!items.length) return null;

  const navigate = (dir: number) => (e: React.MouseEvent) => { e.preventDefault(); setCurrentIndex(p => (p + dir + items.length) % items.length); };

  return (
    <div className="max-w-7xl mx-auto px-4 mt-4">
      <div className="relative w-full aspect-[5/2] sm:aspect-[3/1] md:aspect-[7/2] lg:aspect-[4/1] rounded-xl overflow-hidden shadow-lg group bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
        {items.map((item, index) => (
          <a key={item.id} href={item.url || '#'} className={`absolute inset-0 transition-opacity duration-700 ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <LazyImage src={normalizeImageUrl(item.image)} alt={item.name} className="absolute inset-0" size="full" priority={index === currentIndex} optimizationOptions={{ width: 1600, quality: 85 }} />
          </a>
        ))}
        {items.length > 1 && (
          <>
            <button onClick={navigate(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 w-9 h-9 rounded-full shadow-lg z-20 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center hover:scale-110">
              <ChevronLeft size={20} />
            </button>
            <button onClick={navigate(1)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 w-9 h-9 rounded-full shadow-lg z-20 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center hover:scale-110">
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
              {items.map((_, i) => (
                <button key={i} onClick={e => { e.preventDefault(); setCurrentIndex(i); }} className={`h-2 rounded-full transition-all duration-300 shadow-sm ${i === currentIndex ? 'bg-white w-6' : 'bg-white/50 w-2 hover:bg-white/80'}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
