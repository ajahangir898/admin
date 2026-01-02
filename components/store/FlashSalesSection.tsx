import { useState, useEffect, RefObject } from 'react';
import { ChevronRight } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../StoreProductComponents';

interface Props { 
  products: Product[]; 
  showCounter: boolean; 
  countdown: { label: string; value: string }[]; 
  onProductClick: (p: Product) => void; 
  onBuyNow: (p: Product) => void; 
  onQuickView: (p: Product) => void; 
  onAddToCart: (p: Product) => void; 
  productCardStyle?: string; 
  sectionRef?: RefObject<HTMLElement>;
  onViewAll?: () => void;
}

export const FlashSalesSection = ({ products, showCounter, countdown, onProductClick, onBuyNow, onQuickView, onAddToCart, productCardStyle, sectionRef, onViewAll }: Props) => {
  const initCount = () => typeof window === 'undefined' ? Math.min(4, products.length) : Math.min(window.innerWidth >= 1024 ? 6 : 4, products.length);
  const [visible, setVisible] = useState(initCount);

  useEffect(() => { setVisible(initCount()); }, [products.length]);
  useEffect(() => {
    if (typeof window === 'undefined' || visible >= products.length) return;
    const t = setTimeout(() => setVisible(c => Math.min(products.length, c + 2)), 180);
    return () => clearTimeout(t);
  }, [products.length, visible]);

  return (
    <section ref={sectionRef} className="py-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-4">
        {/* Left: Title + Timer */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Flash Sale Title */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <h2 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-red-600 via-orange-500 to-red-600 bg-clip-text text-transparent">
              ⚡ Flash Sale
            </h2>
          </div>
          
          {/* Countdown Timer */}
          {showCounter && (
            <div className="flex items-center gap-1">
              {countdown.map((s, idx) => (
                <div key={s.label} className="flex items-center">
                  <div className="flex flex-col items-center bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 rounded-lg px-2.5 py-1.5 min-w-[42px] shadow-md">
                    <span className="text-base font-bold text-white tabular-nums leading-none">{s.value}</span>
                    <span className="text-[9px] text-white/80 uppercase tracking-wider mt-0.5">{s.label}</span>
                  </div>
                  {idx < countdown.length - 1 && (
                    <span className="text-fuchsia-500 font-bold mx-0.5 text-lg animate-pulse">:</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: View All */}
        <button 
          onClick={onViewAll}
          className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
          View All
          <ChevronRight size={16} className="text-blue-600" />
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {products.slice(0, visible).map(p => (
          <ProductCard 
            key={`flash-${p.id}`} 
            product={p} 
            onClick={onProductClick} 
            onBuyNow={onBuyNow} 
            variant={productCardStyle} 
            onQuickView={onQuickView} 
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  );
};

export default FlashSalesSection;
